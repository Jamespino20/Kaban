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
      const interactions = await db.auditLog.groupBy({
        by: ["event_type"],
        where: {
          log_type: "INTERACTION",
          created_at: { gte: startDate },
        },
        _count: { log_id: true },
        orderBy: { _count: { log_id: "desc" } },
        take: 10,
      });

      // 3. Geo Distribution
      const geoDistribution = await db.auditLog.groupBy({
        by: ["region", "city"],
        where: {
          log_type: "TRAFFIC",
          created_at: { gte: startDate },
        },
        _count: { log_id: true },
        orderBy: { _count: { log_id: "desc" } },
        take: 20,
      });

      // 4. User Interaction Density
      const activeUsers = await db.auditLog.groupBy({
        by: ["user_id"],
        where: {
          log_type: "INTERACTION",
          user_id: { not: null },
          created_at: { gte: startDate },
        },
        _count: { log_id: true },
        orderBy: { _count: { log_id: "desc" } },
        take: 5,
      });

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
          status: { in: ["active", "defaulted"] },
        },
        _sum: { balance_remaining: true },
        _count: { loan_id: true },
      });

      const productNames = await db.loanProduct.findMany({
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
          account: {
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
      const savingsPool = await db.$queryRaw<
        { total: number }[]
      >`SELECT COALESCE(SUM(balance), 0) as total FROM savings_accounts`;

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
