import prisma from "@/lib/prisma";
import { InterestTier } from "@prisma/client";
import { determineInterestTierFromScore } from "@/lib/microfinance-policy";

/**
 * Agapay Socio-Economic Trust Engine
 * Logic weightage based on AGAPAY.md 4.1:
 * - Payment Reliability: 50%
 * - Business & Savings: 25%
 * - Guarantor Feedback: 25%
 */

export interface TrustScoreBreakdown {
  score: number;
  paymentScore: number;
  businessScore: number;
  peerScore: number;
  guarantorScore: number;
  tier: InterestTier;
}

export async function calculateTrustScore(
  userId: number,
  tenantId?: number | null,
  tenantSlug?: string | null,
  dbClient?: any,
): Promise<TrustScoreBreakdown> {
  const db = dbClient || prisma;

  const user = await db.user.findUnique({
    where: { user_id: userId },
    include: {
      loans: {
        where: tenantId ? { tenant_id: tenantId } : undefined,
        include: {
          schedules: true,
          payments: true,
        },
      },
      guarantees: {
        where: tenantId ? { loan: { tenant_id: tenantId } } : undefined,
        include: {
          loan: true,
        },
      },
      profile: true,
    },
  });

  if (!user || (tenantId !== undefined && user.tenant_id !== tenantId)) {
    throw new Error("User not found");
  }

  // 1. Payment Reliability (40%)
  // Ratio of on-time payments vs total installments
  let paymentScore = 50; // Neutral start
  const allSchedules = user.loans.flatMap((l: any) => l.schedules);
  if (allSchedules.length > 0) {
    const onTimeCount = allSchedules.filter(
      (s: any) => s.status === "paid",
    ).length;
    const overdueCount = allSchedules.filter(
      (s: any) => s.status === "overdue",
    ).length;
    const defaultedLoanCount = user.loans.filter(
      (loan: any) => loan.status === "defaulted",
    ).length;
    paymentScore =
      (onTimeCount / allSchedules.length) * 100 -
      overdueCount * 5 -
      defaultedLoanCount * 20;
  }
  paymentScore = Math.max(0, Math.min(100, paymentScore));

  // 2. Business Performance (20%)
  // Simplified for MVP: Boost if business_name exists, higher if they have active loans
  let businessScore = user.profile?.business_name ? 70 : 30;
  if (user.loans.some((l: any) => l.status === "active")) businessScore += 10;
  businessScore = Math.min(100, businessScore);

  // 3. Guarantor Feedback (25%)
  let guarantorScore = 60;
  const chargedGuarantees = user.guarantees.filter(
    (g: any) => g.status === "charged" || g.loan?.status === "defaulted",
  );
  guarantorScore -= chargedGuarantees.length * 15;
  guarantorScore = Math.min(100, guarantorScore);
  guarantorScore = Math.max(0, guarantorScore);

  // Final Weighted Calculation (Peer reviews removed — weight redistributed)
  const finalScore =
    paymentScore * 0.50 +
    businessScore * 0.25 +
    guarantorScore * 0.25;

  // Determine Tier (AGAPAY.md 3.3)
  const tier = determineInterestTierFromScore(finalScore);

  return {
    score: Math.round(finalScore),
    paymentScore: Math.round(paymentScore),
    businessScore: Math.round(businessScore),
    peerScore: 50,
    guarantorScore: Math.round(guarantorScore),
    tier,
  };
}

/**
 * Updates a user's interest tier in the database based on their current trust score.
 */
export async function syncUserTier(
  userId: number,
  tenantId?: number | null,
  tenantSlug?: string | null,
  dbClient?: any,
) {
  const breakdown = await calculateTrustScore(
    userId,
    tenantId,
    tenantSlug,
    dbClient,
  );
  const db = dbClient || prisma;

  return await db.user.update({
    where: { user_id: userId },
    data: {
      interest_tier: breakdown.tier,
    },
  });
}
