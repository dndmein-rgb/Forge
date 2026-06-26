import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { Agent, createTool } from "@cline/sdk";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { CREDIT_COST_PER_GENERATION } from "@/lib/constants";
import type { FileData } from "@/types/workspace";

function sseEvent(type: string, payload: object): string {
  return `data: ${JSON.stringify({ type, ...payload })}\n\n`;
}

export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return Response.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { userId, workspaceId, userRequest, fileData } = body as {
    userId: string;
    workspaceId: string;
    userRequest: string;
    fileData: FileData;
  };

  // 1. Initial Auth & Balance Check
  const user = await db.user.findUnique({
    where: { id: userId, clerkId },
    select: { id: true, credits: true, plan: true },
  });

  if (!user)
    return Response.json({ message: "User not found" }, { status: 404 });
  if (user.plan !== "pro")
    return Response.json({ message: "Upgrade required" }, { status: 403 });
  if (user.credits < CREDIT_COST_PER_GENERATION)
    return Response.json({ message: "Insufficient credits" }, { status: 402 });

  // 2. Upfront Credit Gate (Prevents concurrency exploits)
  await db.user.update({
    where: { id: userId },
    data: { credits: { decrement: CREDIT_COST_PER_GENERATION } },
  });

  let creditsRefunded = false;
  const encoder = new TextEncoder();
  let isAborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (chunk: string) => {
        if (!isAborted) controller.enqueue(encoder.encode(chunk));
      };

      // State shared across the fallback lifecycle
      let finalSummary = "";
      let finalPatchedFiles: Record<string, { code: string }> = {};
      let successfulAgentResult = null;

      // Waterfall models array
      const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash"];

      const fileContext = Object.entries(fileData.files)
        .map(([path, { code }]) => `// ${path}\n${code}`)
        .join("\n\n---\n\n");

      // ─── Fallback Execution Loop ───────────────────────────────────────────
      try {
        for (let i = 0; i < modelsToTry.length; i++) {
          if (isAborted) break;

          const currentModel = modelsToTry[i];

          try {
            if (i === 0) {
              enqueue(
                sseEvent("status", {
                  message: "Starting Cline agent (Gemini 3.5 Flash)…",
                }),
              );
            } else {
              enqueue(
                sseEvent("status", {
                  message:
                    "Primary model failed. Routing fallback to Gemini 2.5 Flash…",
                }),
              );
            }

            // Fresh mutation container per loop to avoid leaking partial corrupt edits
            const attemptPatchedFiles: Record<string, { code: string }> = {
              ...fileData.files,
            };

            // ── Tool 1: update_file ──────────────────────────────────────────────
            // The agent calls this once per file it wants to change.
            // We immediately emit a file_patch SSE event so Sandpack
            // updates live in the browser as each file is patched.
            const updateFileTool = createTool({
              name: "update_file",
              description: "Update or rewrite a file in the React sandbox.",
              inputSchema: z.object({
                path: z
                  .string()
                  .describe("File path exactly as it appears, e.g. /App.js"),
                code: z.string().describe("Complete new contents of the file"),
                reason: z
                  .string()
                  .describe("One sentence explaining what you changed and why"),
              }),
              async execute({ path, code, reason }) {
                attemptPatchedFiles[path] = { code };
                enqueue(sseEvent("file_patch", { path, code, reason }));
                return `Updated ${path}: ${reason}`;
              },
            });

            // ── Tool 2: done_improving ───────────────────────────────────────────
            // Agent calls this when all files are updated.
            // lifecycle.completesRun: true tells the Cline SDK loop to stop
            // immediately after this tool runs instead of continuing iterations.

            const doneImprovingTool = createTool({
              name: "done_improving",
              description:
                "Call this when you have finished making all improvements.",
              inputSchema: z.object({
                summary: z
                  .string()
                  .describe(
                    "A short friendly summary of all the improvements you made (1-3 sentences)",
                  ),
              }),
              lifecycle: { completesRun: true },
              async execute({ summary }) {
                finalSummary = summary;
                return "Done.";
              },
            });

            const agent = new Agent({
              providerId: "gemini",
              modelId: currentModel,
              apiKey: process.env.GEMINI_API_KEY!,
              maxIterations: 8,
                 systemPrompt: `You are an expert React developer improving a live browser preview app.

The app uses React (functional components), Tailwind CSS for styling, and runs in Sandpack.
You CANNOT use TypeScript, CSS modules, or real npm install — only what's already available.
Available packages: react, react-dom, tailwindcss (CDN), lucide-react, recharts, react-router-dom, framer-motion, date-fns, zod, react-hook-form.

Here are the current files:

${fileContext}

WORKFLOW:
1. Understand what the user wants improved.
2. Identify which files need to change.
3. Call update_file for each file that needs changes (always include the COMPLETE file, not just the diff).
4. Once all files are updated, call done_improving with a short summary.

RULES:
- Always write complete file contents — never partial snippets.
- Keep all existing functionality unless asked to remove it.
- The entry point is always /App.js with a default export.
- All imports must reference files you've updated or packages in the available list above.`, 
              tools: [updateFileTool, doneImprovingTool],
              toolPolicies: {
                update_file: { autoApprove: true },
                done_improving: { autoApprove: true },
              },
            });

            agent.subscribe((event) => {
              if (isAborted) return;
              if (event.type === "assistant-text-delta" && event.text) {
                enqueue(sseEvent("thinking", { text: event.text }));
              }
              if (event.type === "tool-started") {
                const name = event.toolCall?.toolName;
                enqueue(
                  sseEvent("thinking", {
                    text: `\n\nRunning tool: \`${name}\`…`,
                  }),
                );
              }
            });

            const result = await agent.run(userRequest);

            if (result.status === "failed") {
              throw new Error(
                result.error?.message ?? `Agent failed on ${currentModel}`,
              );
            }

            // Success! Save states out of loop and step out of waterfall
            successfulAgentResult = result;
            finalPatchedFiles = attemptPatchedFiles;
            break;
          } catch (modelError) {
            console.error(
              `[Fallback Engine] Model ${currentModel} failed:`,
              modelError,
            );

            // If the absolute last fallback model fails, throw the error out to trigger refunds
            if (i === modelsToTry.length - 1) {
              throw modelError;
            }
          }
        }

        // ─── Persistence Block ────────────────────────────────────────────────
        if (isAborted || !successfulAgentResult) return;

        const newFileData: FileData = {
          files: finalPatchedFiles,
          dependencies: fileData.dependencies,
          title: fileData.title,
        };

        await db.workspace.update({
          where: { id: workspaceId, userId },
          data: { fileData: newFileData as any },
        });

        const updatedUser = await db.user.findUnique({
          where: { id: userId },
          select: { credits: true },
        });

        enqueue(
          sseEvent("done", {
            fileData: newFileData,
            summary: finalSummary || successfulAgentResult.outputText,
            creditsRemaining:
              updatedUser?.credits ?? user.credits - CREDIT_COST_PER_GENERATION,
          }),
        );
      } catch (globalError) {
        console.error("[improve] Total workflow breakdown:", globalError);

        // Refund credits if ALL models completely fail out
        if (!creditsRefunded) {
          creditsRefunded = true;
          await db.user.update({
            where: { id: userId },
            data: { credits: { increment: CREDIT_COST_PER_GENERATION } },
          });
        }

        enqueue(
          sseEvent("error", {
            message:
              globalError instanceof Error
                ? globalError.message
                : "All generations failed.",
          }),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      console.log("Client connection closed. Signalling abort routine.");
      isAborted = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "nodejs";
export const maxDuration = 300;
