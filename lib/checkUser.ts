import { Plan } from "@/types/plans";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { PLANS } from "./constants";

const getCurrentplan = async (): Promise<Plan> => {
  const { has } = await auth();
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
};

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return;
  try {
    const currentPlan = await getCurrentplan();
    const existing = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    if (existing) {
      // plan changed - top up new plans credits allocation
      // Does not reset existing credits ,give them new plan's amount

      if (existing.plan != currentPlan) {
        return await db.user.update({
          where: { clerkId: user.id },
          data: {
            plan: currentPlan,
            credits: existing.credits + PLANS[currentPlan].credits,
          },
        });
      }
      return existing;
    }
    // New user — create with free plan credits

    await db.user.create({
      data: {
        clerkId: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.emailAddresses[0].emailAddress,
        credits: PLANS["free"].credits,
        imageUrl: user.imageUrl ?? "",
        plan: "free",
      },
    });
  } catch (error) {
    console.error("CheckUser error", error);
    return null;
  }
};
