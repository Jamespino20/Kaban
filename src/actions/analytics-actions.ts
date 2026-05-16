"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { subDays, startOfDay, format } from "date-fns";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";

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
  if (shouldUseApiClient()) {
    return null;
  }
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;

  if (!tenantId && session.user.role !== "superadmin") {
    return null;
  }

  const startDate = startOfDay(subDays(new Date(), days));

  try {
    const query = async (db: any) => {
      // 1. Traffic Trends
      const traffic = await db.auditLog.findMany({
        where: {
          tenant_id: tenantId,
          log_type: "TRAFFIC",
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
      const interactionsRaw = await db.auditLog.groupBy({
        by: ["event_type"],
        where: {
          tenant_id: tenantId,
          log_type: "INTERACTION",
          created_at: { gte: startDate },
        },
        _count: { log_id: true },
      });
      const interactions = interactionsRaw
        .sort((a: any, b: any) => b._count.log_id - a._count.log_id)
        .slice(0, 10);

      // 3. Geo Distribution
      const geoRaw = await db.auditLog.groupBy({
        by: ["region", "city"],
        where: {
          tenant_id: tenantId,
          log_type: "TRAFFIC",
          created_at: { gte: startDate },
        },
        _count: { log_id: true },
      });
      const geoDistribution = geoRaw
        .sort((a: any, b: any) => b._count.log_id - a._count.log_id)
        .slice(0, 20);

      // 4. User Interaction Density
      const activeUsersRaw = await db.auditLog.groupBy({
        by: ["user_id"],
        where: {
          tenant_id: tenantId,
          log_type: "INTERACTION",
          user_id: { not: null },
          created_at: { gte: startDate },
        },
        _count: { log_id: true },
      });
      const activeUsers = activeUsersRaw
        .sort((a: any, b: any) => b._count.log_id - a._count.log_id)
        .slice(0, 5);

      return {
        trafficTrends: Object.entries(trafficByDay).map(([date, count]) => ({
          date,
          count: count as number,
        })),
        interactionHeatmap: interactions.map((i: any) => ({
          type: i.event_type as string,
          count: i._count.log_id as number,
        })),
        geoData: geoDistribution.map((g: any) => ({
          region: (g.region as string) || "Unknown",
          city: (g.city as string) || "Unknown",
          count: g._count.log_id as number,
        })),
        activeUserDensity: activeUsers.map((u: any) => ({
          userId: u.user_id as number,
          count: u._count.log_id as number,
        })),
      };
    };

    if (!tenantId) {
      return await query(prisma);
    }

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      return await query(tx);
    });
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
  if (shouldUseApiClient()) {
    return null;
  }
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;

  if (!tenantId && session.user.role !== "superadmin") {
    return null;
  }

  const startDate = startOfDay(subDays(new Date(), days));

  try {
    const query = async (db: any) => {
      // 1. Repayment Velocity
      const payments = await db.payment.findMany({
        where: {
          tenant_id: tenantId,
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
      const migration = await db.user.groupBy({
        by: ["interest_tier"],
        where: {
          tenant_id: tenantId,
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
      const concentration = await db.loan.groupBy({
        by: ["product_id"],
        where: {
          tenant_id: tenantId,
          status: { in: ["active", "defaulted"] },
        },
        _sum: { balance_remaining: true },
        _count: { loan_id: true },
      });

      const productNames = await db.loanProduct.findMany({
        where: { tenant_id: tenantId },
        select: { product_id: true, name: true },
      });

      const riskByProduct = concentration.map((c: any) => {
        const pName =
          productNames.find((p: any) => p.product_id === c.product_id)?.name ||
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
    };

    if (!tenantId) {
      return await query(prisma);
    }

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      return await query(tx);
    });
  } catch (error) {
    console.error("[ANALYTICS] Operational insights failed:", error);
    return null;
  }
}

/**
 * Health check: Treasury balance vs sum of all Member Deposits.
 */
export async function getFinancialIntegrityCheck(): Promise<FinancialIntegrity | null> {
  if (shouldUseApiClient()) {
    return null;
  }
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;

  if (!tenantId && session.user.role !== "superadmin") {
    return null;
  }

  try {
    const query = async (db: any) => {
      // 1. Treasury Ledger Balance (Asset)
      const treasuryLedger = await db.businessLedger.aggregate({
        where: {
          tenant_id: tenantId,
          account: {
            code: "CASH_EQUIVALENTS",
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
      const savingsPool = await db.$queryRaw<
        { total: number }[]
      >`SELECT COALESCE(SUM(balance), 0) as total FROM savings_accounts WHERE tenant_id = ${tenantId}`;

      const poolTotal = Number(savingsPool[0]?.total || 0);
      const variance = treasuryBalance - poolTotal;

      return {
        isBalanced: Math.abs(variance) < 0.01,
        variance,
        treasuryBalance,
        savingsPoolTotal: poolTotal,
        lastChecked: new Date(),
      };
    };

    if (!tenantId) {
      return await query(prisma);
    }

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      return await query(tx);
    });
  } catch (error) {
    console.error("[ANALYTICS] Integrity check failed:", error);
    return null;
  }
}

export interface GrowthAnalytics {
  fumTrend: { date: string; amount: number }[];
  memberGrowth: { date: string; count: number }[];
  defaultForecast: { label: string; value: number; trend: "up" | "down" | "stable" }[];
}

export async function getGrowthAnalytics(): Promise<GrowthAnalytics | null> {
  if (shouldUseApiClient()) return null;
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;
  if (!tenantId && session.user.role !== "superadmin") return null;

  try {
    const query = async (db: any) => {
      const now = new Date();
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        return { label: d.toLocaleString("default", { month: "short", year: "2-digit" }), start: d };
      }).reverse();

      // FUM trend: approximate from treasury + savings over time (use weekly snapshots from ledger)
      const ledger = await db.businessLedger.findMany({
        where: { tenant_id: tenantId, account: { code: { in: ["CASH_EQUIVALENTS", "MEMBER_SAVINGS"] } } },
        orderBy: { created_at: "asc" },
        select: { created_at: true, debit: true, credit: true, account: { select: { code: true } } },
      });

      const fumBuckets: Record<string, number> = {};
      for (const row of ledger) {
        const key = format(row.created_at, "MMM yy");
        const net = Number(row.debit) - Number(row.credit);
        fumBuckets[key] = (fumBuckets[key] || 0) + net;
      }
      const fumTrend: { date: string; amount: number }[] = months.map((m) => ({
        date: m.label,
        amount: fumBuckets[m.label] || 0,
      }));

      // Member growth
      const users = await db.user.findMany({
        where: { tenant_id: tenantId, role: "member" },
        orderBy: { created_at: "asc" },
        select: { created_at: true },
      });
      let running: number = 0;
      const memberBuckets: Record<string, number> = {};
      for (const u of users) {
        const key = format(new Date(u.created_at), "MMM yy");
        memberBuckets[key] = (memberBuckets[key] || 0) + 1;
      }
      const memberGrowth: { date: string; count: number }[] = months.map((m) => {
        running += memberBuckets[m.label] || 0;
        return { date: m.label, count: running };
      });

      // Default forecast: count overdue schedules and defaulted loans
      const overdueSchedules: number = await db.loanSchedule.count({
        where: { tenant_id: tenantId, status: "overdue" },
      });
      const defaultedLoans: number = await db.loan.count({
        where: { tenant_id: tenantId, status: "defaulted" },
      });
      const activeLoans: number = await db.loan.count({
        where: { tenant_id: tenantId, status: "active" },
      });
      const defaultRate: number = activeLoans > 0 ? (defaultedLoans / activeLoans) * 100 : 0;

      const trendDir = (v: number, thresholdUp: number, thresholdStable: number): "up" | "down" | "stable" =>
        v > thresholdUp ? "up" : v > thresholdStable ? "stable" : "down";
      const defaultForecast: GrowthAnalytics["defaultForecast"] = [
        { label: "Overdue Accounts", value: overdueSchedules, trend: trendDir(overdueSchedules, 5, 0) },
        { label: "Defaulted Loans", value: defaultedLoans, trend: trendDir(defaultedLoans, 3, 0) },
        { label: "Default Rate", value: Math.round(defaultRate), trend: trendDir(Math.round(defaultRate), 10, 3) },
      ];

      return { fumTrend, memberGrowth, defaultForecast };
    };

    if (!tenantId) return await query(prisma);
    return await prisma.$withTenant(tenantId, async (tx: any) => await query(tx));
  } catch (error) {
    console.error("[ANALYTICS] Growth analytics failed:", error);
    return null;
  }
}
