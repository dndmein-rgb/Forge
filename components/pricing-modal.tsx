"use client";

import { useAuth, SignInButton, PricingTable } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlueTitle, GrayTitle } from "./reusables";
import { PRICING_PLANS } from "@/lib/constants";

interface PricingModalProps {
  children: React.ReactNode;
  reason?: "credits" | "upgrade";
}

export function PricingModal({
  children,
  reason = "upgrade",
}: PricingModalProps) {
  const { isSignedIn, has } = useAuth();

  const title =
    reason === "credits" ? "You're out of credits" : "Upgrade your plan";
  const description =
    reason === "credits"
      ? "You've used all your credits. Upgrade to keep building."
      : "Choose a plan that fits how much you build.";

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

  return (
    <Dialog>
      <DialogTrigger className={"cursor-pointer"}>{children}</DialogTrigger>
      <DialogContent className="border-white/8 bg-[#0f0f0f] p-0 text-white sm:max-w-6xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-serif text-xl tracking-tight text-white/90">
            <BlueTitle className="text-4xl">{title}</BlueTitle>
          </DialogTitle>
          <DialogDescription className="text-sm text-white/35">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 ">
          <PricingTable
            checkoutProps={{
              appearance: {
                elements: {
                  drawerRoot: {
                    zIndex: 2000,
                  },
                },
              },
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
