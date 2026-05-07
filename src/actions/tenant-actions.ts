"use server";

import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/authorization";

// Get tenant overview data for Tenant Admin dashboard
export async function getTenantOverview() {
  const session = await requireAdminSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    return { success: false, error: "No tenant context" };
  }

  try {
    // Get tenant-specific data using $withTenant for proper isolation
    const [
      totalFunds,
      totalActiveLoans,
      totalMembers,
      totalLenders,
      tenantTrustScore,
      paymentScore,
      businessScore,
      peerScore,
      guarantorScore,
      interestTier,
      recentLogs,
      aiSnapshot,
      fundsGrowth,
      loansGrowth,
      membersGrowth,
      lendersGrowth,
    ] = await prisma.$withTenant(tenantId, async (tx) => {
      return await tx.$transaction([
        // Total funds (sum of wallet balances)
        tx.$queryRaw`
          SELECT COALESCE(SUM(balance), 0) as total
          FROM wallets
        `,

        // Total active loans
        tx.$queryRaw`
          SELECT COUNT(*) as count
          FROM loans WHERE status = 'active'
        `,

        // Total members
        tx.$queryRaw`
          SELECT COUNT(*) as count
          FROM users WHERE role = 'member'
        `,

        // Total lenders
        tx.$queryRaw`
          SELECT COUNT(*) as count
          FROM users WHERE role = 'lender'
        `,

        // Tenant trust score (average)
        tx.$queryRaw`
          SELECT AVG(trust_score) as avg_score
          FROM users WHERE trust_score IS NOT NULL
        `,

        // Payment score (simplified - based on repayment rate)
        tx.$queryRaw`
          SELECT 
            CASE 
              WHEN COUNT(ls.id) = 0 THEN 100
              ELSE ROUND(
                (SUM(CASE WHEN ps.status = 'verified' THEN 1 ELSE 0 END) * 100.0) / 
                COUNT(ls.id)
              )
            END as score
          FROM loan_schedules ls
          LEFT JOIN payments ps ON ps.loan_schedule_id = ls.schedule_id AND ps.status = 'verified'
          JOIN loans l ON l.loan_id = ls.loan_id
          WHERE l.status IN ('active', 'delinquent', 'defaulted', 'paid')
        `,

        // Business score (simplified - based on loan portfolio health)
        tx.$queryRaw`
          SELECT 
            CASE 
              WHEN COUNT(l.loan_id) = 0 THEN 100
              ELSE ROUND(
                (COUNT(CASE WHEN l.status = 'active' THEN 1 END) * 100.0) / 
                COUNT(l.loan_id)
              )
            END as score
          FROM loans l
        `,

        // Peer score (simplified - based on member activity)
        tx.$queryRaw`
          SELECT 
            CASE 
              WHEN COUNT(DISTINCT u.user_id) = 0 THEN 100
              ELSE LEAST(100, 
                ROUND(
                  (COUNT(DISTINCT CASE WHEN u.last_login >= NOW() - INTERVAL '30 days' THEN u.user_id END) * 100.0) / 
                  COUNT(DISTINCT u.user_id)
                )
              )
            END as score
          FROM users u
          WHERE u.role = 'member'
        `,

        // Guarantor score (simplified - based on guarantor fulfillment)
        tx.$queryRaw`
          SELECT 
            CASE 
              WHEN COUNT(g.id) = 0 THEN 100
              ELSE ROUND(
                (COUNT(CASE WHEN g.status = 'fulfilled' THEN 1 ELSE 0 END) * 100.0) / 
                COUNT(g.id)
              )
            END as score
          FROM guarantees g
          JOIN loans l ON l.loan_id = g.loan_id
        `,

        // Interest tier (most common among members)
        tx.$queryRaw`
          SELECT interest_tier
          FROM users 
          WHERE role = 'member' AND interest_tier IS NOT NULL
          GROUP BY interest_tier
          ORDER BY COUNT(*) DESC
          LIMIT 1
        `,

        // Recent activity logs (last 20)
        tx.auditLog.findMany({
          orderBy: { created_at: "desc" },
          take: 20,
          include: {
            user: {
              select: { username: true },
            },
          },
        }),

        // AI-generated tenant snapshot summary (placeholder - would integrate with AI service)
        tx.aiSnapshot.findFirst({
          where: { tenant_id: tenantId },
          orderBy: { created_at: "desc" },
          take: 1,
        }),

        // Funds growth percentage (placeholder - would compare with previous period)
        tx.$queryRaw`
          SELECT 12.5 as growth
        `,

        // Loans growth percentage (placeholder)
        tx.$queryRaw`
          SELECT 8.2 as growth
        `,

        // Members growth percentage (placeholder)
        tx.$queryRaw`
          SELECT 15.3 as growth
        `,

        // Lenders growth percentage (placeholder)
        tx.$queryRaw`
          SELECT 5.7 as growth
        `,
      ]);
    });

    // Process raw query results
    const fundsResult = Array.isArray(totalFunds) ? totalFunds[0] : totalFunds;
    const loansResult = Array.isArray(totalActiveLoans)
      ? totalActiveLoans[0]
      : totalActiveLoans;
    const membersResult = Array.isArray(totalMembers)
      ? totalMembers[0]
      : totalMembers;
    const lendersResult = Array.isArray(totalLenders)
      ? totalLenders[0]
      : totalLenders;
    const trustResult = Array.isArray(tenantTrustScore)
      ? tenantTrustScore[0]
      : tenantTrustScore;
    const paymentResult = Array.isArray(paymentScore)
      ? paymentScore[0]
      : paymentScore;
    const businessResult = Array.isArray(businessScore)
      ? businessScore[0]
      : businessScore;
    const peerResult = Array.isArray(peerScore) ? peerScore[0] : peerScore;
    const guarantorResult = Array.isArray(guarantorScore)
      ? guarantorScore[0]
      : guarantorScore;
    const tierResult = Array.isArray(interestTier)
      ? interestTier[0]
      : interestTier;
    const fundsGrowthResult = Array.isArray(fundsGrowth)
      ? fundsGrowth[0]
      : fundsGrowth;
    const loansGrowthResult = Array.isArray(loansGrowth)
      ? loansGrowth[0]
      : loansGrowth;
    const membersGrowthResult = Array.isArray(membersGrowth)
      ? membersGrowth[0]
      : membersGrowth;
    const lendersGrowthResult = Array.isArray(lendersGrowth)
      ? lendersGrowth[0]
      : lendersGrowth;

    return {
      success: true,
      data: {
        totalFunds: fundsResult?.total || 0,
        totalActiveLoans: Number(loansResult?.count || 0),
        totalMembers: Number(membersResult?.count || 0),
        totalLenders: Number(lendersResult?.count || 0),
        tenantTrustScore: trustResult?.avg_score
          ? Number(trustResult.avg_score)
          : 0,
        paymentScore: paymentResult?.score ? Number(paymentResult.score) : 100,
        businessScore: businessResult?.score
          ? Number(businessResult.score)
          : 100,
        peerScore: peerResult?.score ? Number(peerResult.score) : 100,
        guarantorScore: guarantorResult?.score
          ? Number(guarantorResult.score)
          : 100,
        interestTier: (tierResult?.interest_tier as any) || "T1_5_PERCENT",
        recentLogs: recentLogs.map((log: any) => ({
          ...log,
          username: log.user?.username || "System",
        })),
        aiSnapshot: aiSnapshot || null,
        fundsGrowth: Number(fundsGrowthResult?.growth || 0),
        loansGrowth: Number(loansGrowthResult?.growth || 0),
        membersGrowth: Number(membersGrowthResult?.growth || 0),
        lendersGrowth: Number(lendersGrowthResult?.growth || 0),
      },
    };
  } catch (error) {
    console.error("Failed to fetch tenant overview:", error);
    return {
      success: false,
      error: "Failed to load overview data",
    };
  }
}
