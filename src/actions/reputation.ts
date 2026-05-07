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
      select: {
        user_id: true,
        tenant_id: true,
        tenant: { select: { slug: true } },
      },
    });

    if (!targetUser || !targetUser.tenant_id) {
      throw new Error("User not found or no tenant associated");
    }

    const targetTenantId = targetUser.tenant_id;
    const targetSlug = targetUser.tenant?.slug || null;

    // Authorization checks
    if (session.user.role === "member") {
      if (
        session.user.user_id !== userId ||
        session.user.tenantId !== targetTenantId
      ) {
        throw new Error("Unauthorized reputation refresh");
      }
    } else if (
      session.user.role !== "superadmin" &&
      session.user.tenantId !== targetTenantId
    ) {
      throw new Error("Unauthorized reputation refresh");
    }

    const breakdown = await prisma.$withTenant(targetTenantId, async (tx) => {
      await syncUserTier(userId, targetTenantId, targetSlug, tx);
      return await calculateTrustScore(userId, targetTenantId, targetSlug, tx);
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");

    return { success: true, breakdown };
  } catch (error) {
    console.error("Failed to refresh reputation:", error);
    return { success: false, error: "Reputation sync failed" };
  }
}
