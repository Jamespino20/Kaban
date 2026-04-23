import prisma from "@/lib/prisma";
import { InterestTier } from "@prisma/client";

/**
 * Agapay Socio-Economic Trust Engine
 * Logic weightage based on AGAPAY.md 4.1:
 * - Payment Reliability: 40%
 * - Business Performance: 20%
 * - Peer Reviews (Social Vouch): 20%
 * - Guarantor Feedback: 20%
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
): Promise<TrustScoreBreakdown> {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    include: {
      loans: {
        where: tenantId ? { tenant_id: tenantId } : undefined,
        include: {
          schedules: true,
          payments: true,
        },
      },
      social_vouches_received: true,
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
    paymentScore = (onTimeCount / allSchedules.length) * 100 - overdueCount * 5;
  }
  paymentScore = Math.max(0, Math.min(100, paymentScore));

  // 2. Business Performance (20%)
  // Simplified for MVP: Boost if business_name exists, higher if they have active loans
  let businessScore = user.profile?.business_name ? 70 : 30;
  if (user.loans.some((l: any) => l.status === "active")) businessScore += 10;
  businessScore = Math.min(100, businessScore);

  // 3. Peer Reviews (Social Vouch) (20%)
  // Average score from SocialVouch model
  let peerScore = 50;
  if (user.social_vouches_received.length > 0) {
    const avgVouch =
      user.social_vouches_received.reduce(
        (acc: number, v: any) => acc + v.score,
        0,
      ) / user.social_vouches_received.length;
    peerScore = (avgVouch / 10) * 100; // Assuming 1-10 scale
  }

  // 4. Guarantor Feedback (20%)
  // How many people have vouched for them successfully vs defaults
  let guarantorScore = 60;
  const vouchedGuarantees = user.guarantees.filter(
    (g: any) => g.status === "vouched",
  );
  guarantorScore += vouchedGuarantees.length * 10;
  guarantorScore = Math.min(100, guarantorScore);

  // Final Weighted Calculation
  const finalScore =
    paymentScore * 0.4 +
    businessScore * 0.2 +
    peerScore * 0.2 +
    guarantorScore * 0.2;

  // Determine Tier (AGAPAY.md 3.3)
  let tier: InterestTier = InterestTier.T1_5_PERCENT;
  if (finalScore >= 85) tier = InterestTier.T5_3_PERCENT;
  else if (finalScore >= 70) tier = InterestTier.T4_3_5_PERCENT;

  return {
    score: Math.round(finalScore),
    paymentScore: Math.round(paymentScore),
    businessScore: Math.round(businessScore),
    peerScore: Math.round(peerScore),
    guarantorScore: Math.round(guarantorScore),
    tier,
  };
}

/**
 * Updates a user's interest tier in the database based on their current trust score.
 */
export async function syncUserTier(userId: number, tenantId?: number | null) {
  const breakdown = await calculateTrustScore(userId, tenantId);
  return await prisma.user.update({
    where: { user_id: userId },
    data: {
      interest_tier: breakdown.tier,
    },
  });
}
