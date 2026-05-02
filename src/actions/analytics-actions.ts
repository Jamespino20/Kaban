"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { subDays, startOfDay, format } from "date-fns";

export interface AnalyticsData {
  trafficTrends: { date: string; count: number }[];
  interactionHeatmap: { type: string; count: number }[];
  geoData: { region: string; city: string; count: number }[];
  activeUserDensity: { userId: number | null; count: number }[];
}

export interface OperationalInsights {
  repaymentVelocity: { date: string; amount: number }[];
  delinquencyMigration: {
    t1: number;
    t2: number;
    t3: number;
    t4: number;
    t5: number;
  };
  riskConcentration: { label: string; amount: number; count: number }[];
}

export interface FinancialIntegrity {
  isBalanced: boolean;
  variance: number;
  treasuryBalance: number;
  savingsPoolTotal: number;
  lastChecked: Date;
}

/**
 * Traffic and generic interaction analytics.
 */
export async function getTenantAnalytics(
  days: number = 7,
): Promise<AnalyticsData | null> {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId || null;
  const startDate = startOfDay(subDays(new Date(), days));

  try {
    // 1. Traffic Trends
    const traffic = await prisma.trafficLog.findMany({
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      orderBy: { created_at: "asc" },
    });

    const trafficByDay = traffic.reduce(
      (acc: Record<string, number>, log: any) => {
        const date = format(log.created_at, "MMM dd");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {},
    );

    // 2. Behavioral Heatmap
    const interactions = await prisma.interactionLog.groupBy({
      by: ["event_type"],
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // 3. Geo Distribution
    const geoDistribution = await prisma.trafficLog.groupBy({
      by: ["region", "city"],
      where: {
        tenant_id: tenantId,
        created_at: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 20,
    });

    // 4. User Interaction Density
    const activeUsers = await prisma.interactionLog.groupBy({
      by: ["user_id"],
      where: {
        tenant_id: tenantId,
        user_id: { not: null },
        created_at: { gte: startDate },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });

    return {
      trafficTrends: Object.entries(trafficByDay).map(([date, count]) => ({
        date,
        count: count as number,
      })),
      interactionHeatmap: interactions.map((i: any) => ({
        type: i.event_type as string,
        count: i._count.id as number,
      })),
      geoData: geoDistribution.map((g: any) => ({
        region: (g.region as string) || "Unknown",
        city: (g.city as string) || "Unknown",
        count: g._count.id as number,
      })),
      activeUserDensity: activeUsers.map((u: any) => ({
        userId: u.user_id as number,
        count: u._count.id as number,
      })),
    };
  } catch (error) {
    console.error("[ANALYTICS] Failed to fetch metrics:", error);
    return null;
  }
}

/**
 * Operational velocity and risk concentration.
 */
export async function getOperationalInsights(
  days: number = 30,
): Promise<OperationalInsights | null> {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId || null;
  const startDate = startOfDay(subDays(new Date(), days));

  try {
    // 1. Repayment Velocity
    const payments = await prisma.payment.findMany({
      where: {
        loan: { tenant_id: tenantId ?? undefined },
        status: "verified",
        verified_at: { gte: startDate },
      },
      orderBy: { verified_at: "asc" },
    });

    const repaymentsByDay = payments.reduce(
      (acc: Record<string, number>, p: any) => {
        const date = format(p.verified_at || p.submitted_at, "MMM dd");
        acc[date] = (acc[date] || 0) + Number(p.amount_paid);
        return acc;
      },
      {},
    );

    // 2. Trust Tier Distribution
    const migration = await prisma.user.groupBy({
      by: ["interest_tier"],
      where: {
        tenant_id: tenantId ?? undefined,
        role: "member",
      },
      _count: { user_id: true },
    });

    const tierCounts: any = migration.reduce((acc: any, m: any) => {
      const key = m.interest_tier.toLowerCase().split("_")[0]; // t1, t2...
      acc[key] = m._count.user_id;
      return acc;
    }, {});

    // 3. Risk Concentration
    const concentration = await prisma.loan.groupBy({
      by: ["product_id"],
      where: {
        tenant_id: tenantId ?? undefined,
        status: { in: ["active", "defaulted"] },
      },
      _sum: { balance_remaining: true },
      _count: { loan_id: true },
    });

    const productNames = await prisma.loanProduct.findMany({
      where: { tenant_id: tenantId ?? undefined },
      select: { product_id: true, name: true },
    });

    const riskByProduct = concentration.map((c: any) => {
      const pName =
        productNames.find((p) => p.product_id === c.product_id)?.name ||
        "Unknown";
      return {
        label: pName,
        amount: Number(c._sum.balance_remaining || 0),
        count: c._count.loan_id,
      };
    });

    return {
      repaymentVelocity: Object.entries(repaymentsByDay).map(
        ([date, amount]) => ({
          date,
          amount: amount as number,
        }),
      ),
      delinquencyMigration: {
        t1: tierCounts.t1 || 0,
        t2: tierCounts.t2 || 0,
        t3: tierCounts.t3 || 0,
        t4: tierCounts.t4 || 0,
        t5: tierCounts.t5 || 0,
      },
      riskConcentration: riskByProduct,
    };
  } catch (error) {
    console.error("[ANALYTICS] Operational insights failed:", error);
    return null;
  }
}

/**
 * Health check: Treasury balance vs sum of all Member Deposits.
 */
export async function getFinancialIntegrityCheck(): Promise<FinancialIntegrity | null> {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId || null;

  try {
    // 1. Treasury Ledger Balance (Asset)
    const treasuryLedger = await prisma.businessLedger.aggregate({
      where: {
        account: {
          tenant_id: tenantId,
          code: "TREASURY_VAULT",
        },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const treasuryBalance =
      Number(treasuryLedger._sum.debit || 0) -
      Number(treasuryLedger._sum.credit || 0);

    // 2. Member Savings Pool (Liability)
    const savingsPool = await prisma.savingsAccount.aggregate({
      where: {
        tenant_id: tenantId ?? undefined,
      },
      _sum: {
        balance: true,
      },
    });

    const poolTotal = Number(savingsPool?._sum?.balance || 0);
    const variance = treasuryBalance - poolTotal;

    return {
      isBalanced: Math.abs(variance) < 0.01,
      variance,
      treasuryBalance,
      savingsPoolTotal: poolTotal,
      lastChecked: new Date(),
    };
  } catch (error) {
    console.error("[ANALYTICS] Integrity check failed:", error);
    return null;
  }
}
