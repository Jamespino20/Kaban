"use server";

import { syncUserTier, calculateTrustScore } from "@/lib/trust-engine";
import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";

/**
 * Server Action to recalculate and sync a user's reputation score.
 * Can be triggered by background jobs or admin manual refreshes.
 */
export async function refreshUserReputation(userId: number) {
  try {
    const session = await requireAuthenticatedSession();
    const targetUser = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { user_id: true, tenant_id: true },
    });

    if (!targetUser) {
      throw new Error("User not found");
    }

    if (session.user.role === "superadmin") {
      await syncUserTier(userId, targetUser.tenant_id);
      const breakdown = await calculateTrustScore(userId, targetUser.tenant_id);

      revalidatePath("/agapay-pintig");
      revalidatePath("/agapay-tanaw");

      return { success: true, breakdown };
    }

    if (session.user.role === "member") {
      if (
        session.user.user_id !== userId ||
        session.user.tenantId !== targetUser.tenant_id
      ) {
        throw new Error("Unauthorized reputation refresh");
      }
    } else if (session.user.tenantId !== targetUser.tenant_id) {
      throw new Error("Unauthorized reputation refresh");
    }

    await syncUserTier(userId, session.user.tenantId);
    const breakdown = await calculateTrustScore(userId, session.user.tenantId);

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");

    return { success: true, breakdown };
  } catch (error) {
    console.error("Failed to refresh reputation:", error);
    return { success: false, error: "Reputation sync failed" };
  }
}
