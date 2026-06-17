import WorkspaceClient from "@/components/workspace-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
interface WorkspacePageProps {
  searchParams: Promise<{
    prompt?: string;
    id?: string;
  }>;
}
const WorkSpacePage = async ({ searchParams }: WorkspacePageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { prompt, id } = await searchParams;
  return (
    <div>
      
        <WorkspaceClient initialPrompt={prompt ?? ""} userCredits={10} userId={userId} userPlan={"free"} />
    </div>
  );
};

export default WorkSpacePage;
