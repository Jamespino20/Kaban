"use server";

import { syncUserTier, calculateTrustScore } from "@/lib/trust-engine";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Server Action to recalculate and sync a user's reputation score.
 * Can be triggered by background jobs or admin manual refreshes.
 */
export async function refreshUserReputation(userId: number) {
  try {
    const session = await auth();
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "superadmin")
    ) {
      // Members can only refresh their OWN score
      const currentUserId = parseInt(session?.user?.id || "0");
      if (currentUserId !== userId) {
        throw new Error("Unauthorized reputation refresh");
      }
    }

    await syncUserTier(userId);
    const breakdown = await calculateTrustScore(userId);

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");

    return { success: true, breakdown };
  } catch (error) {
    console.error("Failed to refresh reputation:", error);
    return { success: false, error: "Reputation sync failed" };
  }
}
