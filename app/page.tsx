"use client";
import { HoleBackground } from "@/components/animate-ui/components/backgrounds/hole";
import { BlueTitle, GrayTitle, SectionHeading, SectionLabel } from "@/components/reusables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING_PLANS } from "@/lib/constants";
import { FEATURES, PLACEHOLDERS, STEPS, SUGGESTIONS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowRight, Check, ChevronRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CheckoutButton } from "@clerk/nextjs/experimental";

export default function Home() {
  const { isSignedIn ,has} = useAuth();
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || prompt) return;
    const t = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(t);
  }, [isFocused, prompt]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || !isSignedIn) return;
    router.push(`/workspace?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  const handlekeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const handleSuggestion = (s: string) => {
    setPrompt(s);
    textareaRef.current?.focus();
  };
  return (
    <main className="min-h-screen bg-[#0a0a0a] selection:bg-white/20">
      <section className="relative flex flex-col items-center overflow-hidden px-4 pb-24 pt-40 text-center">
        <HoleBackground
          strokeColor="rgba(255,255,255,0.05)"
          style={{
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",
          }}
          className="absolute inset-0 h-full w-full"
        />
        <Badge variant={"outline"} className="gap-2 p-4 backdrop-blur-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Powered by Gemini 3.5 Flash
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance font-serif text-5xl leading-tight tracking-tight sm:text-5xl lg:text-7xl z-10">
          <GrayTitle>Forge your dream</GrayTitle>
          <br />
          <BlueTitle>from a single prompt.</BlueTitle>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-white/40 z-10">
          Describe what you want to build. AI writes the code, picks the
          packages, and renders a live preview all inside your browser.
        </p>

        {/* Prompt Box */}
        <div className="relative mx-auto mt-12 w-full max-w-2xl">
          <div
            className={cn(
              "rounded-2xl border bg-[#111111] duration-200",
              isFocused
                ? "border-white/20 ring-1 ring-white/8"
                : "border-white/8",
            )}
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handlekeyDown}
              rows={1}
              className="w-full resize-none bg-transparent px-5 pb-4 pt-5 text-sm placeholder:text-white/20 focus:outline-none sm:text-base"
              placeholder={PLACEHOLDERS[placeholderIndex]}
              style={{ minHeight: 56, maxHeight: 200 }}
            />
            <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5">
              <span className="text-xs text-white/20">
                Press ⏎ to generate · Shift+⏎ for new line
              </span>

              {isSignedIn ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim()}
                  className="h-8 rounded-full px-5 font-semibold"
                  variant={prompt.trim() ? "default" : "secondary"}
                >
                  Generate
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button className="h-8 rounded-full bg-white px-5 font-semibold">
                    Generate
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </SignInButton>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/40 hover:border-white/15 hover:bg-white/8 hover:text-white/70"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-10 text-xs text-white/20">
          No credit card required · 10 free generations on sign up
        </p>
      </section>

      {/* BROWSER MOCKUP */}
<section className="px-4 pb-32">
  <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0d0d0d] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
    {/* Browser Header */}
    <div className="flex items-center gap-3 border-b border-white/[0.04] bg-[#111111] px-4 py-3">
      <div className="flex gap-2">
        <div className="h-3 w-3 rounded-full bg-red-500/70" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
        <div className="h-3 w-3 rounded-full bg-green-500/70" />
      </div>

      <div className="mx-auto flex h-8 w-80 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.03]">
        <span className="text-xs text-white/40">
          forge.app/workspace
        </span>
      </div>
    </div>

    <div className="flex h-[560px]">
      {/* CHAT PANEL */}
      <div className="flex w-[340px] flex-col border-r border-white/[0.04] bg-[#0c0c0c]">
        <div className="border-b border-white/[0.04] px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-white/30">
            Chat
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-hidden px-4 py-5">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-[240px] rounded-2xl rounded-br-md bg-gradient-to-b from-white/[0.12] to-white/[0.06] px-4 py-3 shadow-lg shadow-black/20">
              <p className="text-xs leading-relaxed text-white/85">
                Build a Kanban board with 3 columns and drag-and-drop support.
              </p>
            </div>
          </div>

          {/* AI Message */}
          <div className="flex gap-3">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-violet-500">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>

            <div className="rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-3 backdrop-blur-sm">
              <p className="text-xs leading-relaxed text-white/65">
                I'll create Todo, In Progress and Done columns using
                <code className="mx-1 text-blue-400">
                  @dnd-kit/core
                </code>
                for drag-and-drop interactions...
              </p>
            </div>
          </div>

          {/* Thinking */}
          <div className="flex gap-3">
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-violet-500">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>

            <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-white/[0.04] px-4 py-3">
              {[0, 0.15, 0.3].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.04] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-3 backdrop-blur-md">
            <span className="flex-1 text-xs text-white/25">
              Ask AI to modify...
            </span>

            <ArrowRight className="h-4 w-4 text-white/30" />
          </div>
        </div>
      </div>

      {/* PREVIEW PANEL */}
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-center border-b border-white/[0.04] px-4">
          <button className="relative px-4 py-3 text-xs text-white">
            Preview
            <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-blue-400" />
          </button>

          <button className="px-4 py-3 text-xs text-white/30">
            Code
          </button>
        </div>

        <div className="relative flex flex-1 overflow-hidden bg-[#121212] p-6">
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_70%)]" />

          <div className="relative flex w-full gap-4">
            {["Todo", "In Progress", "Done"].map((col, ci) => (
              <div
                key={col}
                className="flex w-1/3 flex-col rounded-2xl border border-white/[0.04] bg-black/20 p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-white/40">
                    {col}
                  </span>

                  <span className="rounded-full bg-white/[0.06] px-2 py-1 text-xs text-white/40">
                    {[3, 2, 1][ci]}
                  </span>
                </div>

                <div className="space-y-3">
                  {Array.from({
                    length: [3, 2, 1][ci],
                  }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-white/[0.05] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-3 shadow-lg shadow-black/20 transition-all"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-400" />

                        <div
                          className="h-2 rounded-full bg-white/15"
                          style={{
                            width: `${60 + i * 15}%`,
                          }}
                        />
                      </div>

                      <div className="h-1.5 w-3/4 rounded-full bg-white/8" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-32">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <SectionLabel>Everything you need</SectionLabel>
          <SectionHeading gray="From prompt" blue="to production." />
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/6 bg-white/6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group bg-[#0a0a0a] p-7 hover:bg-[#0f0f0f]"
            >
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/8 bg-white/4 group-hover:border-white/15 group-hover:bg-white/8">
                <Icon className="h-4 w-4 text-white/60 group-hover:text-blue-400/70" />
              </div>
              <p className="mb-2 text-sm font-semibold">{label}</p>
              <p className="text-sm leading-relaxed text-white/40">{desc}</p>
            </div>
          ))}
        </div>
      </section>
       {/* HOW IT WORKS */}
      <section className="px-4 pb-32">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <SectionLabel>How it works</SectionLabel>
          <SectionHeading gray="Four steps" blue="to a working app." />
        </div>

        <div className="mx-auto max-w-3xl">
          {STEPS.map((step, i) => (
            <div key={step.number} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4">
                  <span className="font-mono text-xs font-semibold text-white/50">
                    {step.number}
                  </span>
                </div>

                {i < STEPS.length - 1 && (
                  <div className="mt-2 h-full w-px bg-white/6" />
                )}
              </div>

              <div className="pb-10 pt-1.5">
                <p className="mb-1.5 text-sm font-semibold sm:text-base">
                  {step.label}
                </p>

                <p className="text-sm leading-relaxed text-white/40">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

        {/* PRICING */}
      <section className="px-4 pb-32">
        <div className="mx-auto mb-14 max-w-5xl text-center">
          <SectionLabel>Simple pricing</SectionLabel>
          <SectionHeading gray="Start free," blue="scale when ready." />

          <p className="mx-auto mt-4 max-w-sm text-sm text-white/35">
            No credit card required. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const planOrder: Record<string, number> = {
              free: 0,
              starter: 1,
              pro: 2,
            };
            const activePlanKey = isSignedIn
              ? has?.({ plan: "pro" })
                ? "pro"
                : has?.({ plan: "starter" })
                ? "starter"
                : "free"
              : null;

            const isActive = isSignedIn && activePlanKey === plan.key;
            const isDowngrade =
              isSignedIn &&
              activePlanKey !== null &&
              !isActive &&
              planOrder[plan.key] < planOrder[activePlanKey];

            return (
              <div
                key={plan.key}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 transition-colors",
                  plan.featured
                    ? "border-blue-500/25 bg-blue-500/4"
                    : "border-white/8 bg-[#0f0f0f]"
                )}
              >
                {/* Most popular pill */}
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full border border-blue-500/20 bg-[#0a0a0a] px-3 py-1 text-[11px] font-medium text-blue-400">
                      Most popular
                    </span>
                  </div>
                )}

                {/* Plan name + active badge */}
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-white/90">
                    {plan.label}
                  </p>
                  {isActive && (
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                      Active
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mb-6 text-xs leading-relaxed text-white/35">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="font-serif text-4xl">
                    {plan.price === 0 ? (
                      <GrayTitle>$0</GrayTitle>
                    ) : (
                      <BlueTitle>${plan.price}</BlueTitle>
                    )}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-white/30">/mo</span>
                  )}
                </div>
                <p className="mb-6 text-xs text-white/25">
                  {plan.price === 0 ? "Always free" : "Only billed monthly"}
                </p>

                {/* Feature list */}
                <div className="mb-8 space-y-3 border-t border-white/6 pt-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          plan.featured ? "bg-blue-500/15" : "bg-white/8"
                        )}
                      >
                        <Check
                          className={cn(
                            "h-2.5 w-2.5",
                            plan.featured ? "text-blue-400" : "text-white/50"
                          )}
                        />
                      </div>
                      <span className="text-xs text-white/55">{f}</span>
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <div className="mt-auto">
                  {isActive ? (
                    <Button
                      disabled
                      className="w-full rounded-full text-sm font-semibold opacity-50 cursor-not-allowed border border-white/10 bg-transparent text-white/60"
                      variant="ghost"
                    >
                      ✓ Current plan
                    </Button>
                  ) : plan.price === 0 ? (
                    isSignedIn ? (
                      <Button
                        disabled
                        className="w-full rounded-full text-sm font-semibold opacity-50 cursor-not-allowed border border-white/10 bg-transparent text-white/60"
                        variant="ghost"
                      >
                        Default plan
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button
                          className="w-full rounded-full text-sm font-semibold border border-white/10 bg-transparent text-white/60 hover:bg-white/6 hover:text-white/90"
                          variant="ghost"
                        >
                          Get started free
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </SignInButton>
                    )
                  ) : isSignedIn ? (
                    <CheckoutButton
                      planId={plan.planId}
                      planPeriod="month"
                      checkoutProps={{
                        appearance: {
                          elements: {
                            drawerRoot: {
                              zIndex: 2000,
                            },
                          },
                        },
                      }}
                    >
                      <Button
                        className={cn(
                          "w-full rounded-full text-sm font-semibold transition-all",
                          plan.featured
                            ? "bg-blue-500 text-white hover:bg-blue-400 active:scale-95"
                            : "border border-white/10 bg-transparent text-white/60 hover:bg-white/6 hover:text-white/90"
                        )}
                        variant="ghost"
                      >
                        {isDowngrade ? "Downgrade" : "Get started"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </CheckoutButton>
                  ) : (
                    <SignInButton mode="modal">
                      <Button
                        className={cn(
                          "w-full rounded-full text-sm font-semibold transition-all",
                          plan.featured
                            ? "bg-blue-500 text-white hover:bg-blue-400 active:scale-95"
                            : "border border-white/10 bg-transparent text-white/60 hover:bg-white/6 hover:text-white/90"
                        )}
                        variant="ghost"
                      >
                        Get started
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </SignInButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
       {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto mb-32 max-w-5xl overflow-hidden rounded-2xl border border-white/8 px-10 py-24 text-center">
        <HoleBackground
          strokeColor="rgba(255,255,255,0.05)" // blur
          numberOfLines={36}
          numberOfDiscs={36}
          particleRGBColor={[147, 197, 253]}
          className="absolute inset-0 h-full w-full"
          style={{
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }}
        />

        <SectionHeading gray="Start building," blue="for free." />

        <p className="mb-8 text-sm leading-relaxed text-white/40">
          Get 10 free generations on sign up. No credit card required.
          <br />
          Upgrade when you&apos;re ready.
        </p>

        <SignInButton mode="modal">
          <Button
            size="lg"
            className="relative h-11 rounded-full bg-white px-8"
          >
            Get started free
            <ChevronRight className="h-4 w-4" />
          </Button>
        </SignInButton>
      </section>

      <footer className="relative z-10 border-t border-white/7 py-12 mx-auto px-6 flex flex-wrap items-center justify-center text-stone-400">
        Made with ❤️
      </footer>
    </main>
  );
}
