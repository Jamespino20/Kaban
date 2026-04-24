"use server";

import prisma from "@/lib/prisma";
import { requireTanawSession } from "@/lib/authorization";
import { Role, UserStatus } from "@prisma/client";
import {
  runAutomatedDefaultEnforcement,
  enforceLoanDefault,
} from "@/lib/default-enforcement";
import { revalidatePath } from "next/cache";
import { determineInterestTierFromScore } from "@/lib/microfinance-policy";

export async function getTenantMembers() {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter =
    session.user.role === "superadmin" && !tenantId
      ? {}
      : { tenant_id: tenantId };

  const members = await prisma.user.findMany({
    where: {
      ...tenantFilter,
      role: Role.member,
    },
    include: {
      profile: true,
      savings_accounts: {
        select: {
          account_type: true,
          balance: true,
        },
      },
      loans: {
        select: {
          loan_id: true,
          status: true,
          is_recovery_loan: true as any,
          balance_remaining: true,
        },
      },
      guarantees: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return members;
}

export async function getPendingApprovals() {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter =
    session.user.role === "superadmin" && !tenantId
      ? {}
      : { tenant_id: tenantId };
  const loanTenantFilter =
    session.user.role === "superadmin" && !tenantId
      ? {}
      : { tenant_id: tenantId };

  // Fetch pending loans
  const pendingLoans = await prisma.loan.findMany({
    where: {
      ...loanTenantFilter,
      status: "pending",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      product: true,
    },
    orderBy: {
      applied_at: "asc",
    },
  });

  // Fetch users with pending verification documents
  const pendingVerifications = await prisma.user.findMany({
    where: {
      ...tenantFilter,
      status: UserStatus.pending,
      documents: {
        some: {
          verification_status: "pending",
        },
      },
    },
    include: {
      profile: true,
      documents: true,
    },
  });

  const approvedLoans = await prisma.loan.findMany({
    where: {
      ...loanTenantFilter,
      status: "approved",
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      product: true,
      tenant: {
        include: {
          payment_methods: {
            where: { is_active: true },
            orderBy: { provider_name: "asc" },
          },
        },
      },
    },
    orderBy: {
      approved_at: "asc",
    },
  });

  const pendingPayments = await prisma.payment.findMany({
    where: {
      status: "pending",
      loan: loanTenantFilter,
    },
    include: {
      loan: {
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: true,
        },
      },
      payment_method: true,
    },
    orderBy: {
      submitted_at: "asc",
    },
  });

  const pendingCompassionActions = await (
    prisma as any
  ).compassionAction.findMany({
    where: {
      status: "pending",
      loan: loanTenantFilter,
    },
    include: {
      loan: {
        include: {
          user: { include: { profile: true } },
          product: true,
        },
      },
      requester: { include: { profile: true } },
    },
    orderBy: { requested_at: "asc" },
  });

  const recoveryLoans = await prisma.loan.findMany({
    where: {
      ...loanTenantFilter,
      is_recovery_loan: true as any,
      status: { in: ["active", "defaulted"] },
    },
    include: {
      user: { include: { profile: true } },
      recovery_parent: { include: { user: { include: { profile: true } } } },
    },
    orderBy: { applied_at: "desc" },
  });

  const overdueLoans = await prisma.loan.findMany({
    where: {
      ...loanTenantFilter,
      status: "active" as any,
      schedules: {
        some: {
          status: "overdue" as any,
          due_date: {
            lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7+ days overdue
          },
        },
      },
    },
    include: {
      user: { include: { profile: true } },
      product: true,
    },
    orderBy: { applied_at: "asc" },
  });

  return {
    loans: pendingLoans,
    verifications: pendingVerifications,
    approvedLoans,
    pendingPayments,
    recoveryLoans: recoveryLoans as any,
    overdueLoans: overdueLoans as any,
    compassion: pendingCompassionActions as any,
  };
}

export async function getDashboardMetrics() {
  const session = await requireTanawSession();

  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter = tenantId ? { tenant_id: tenantId } : {};
  const loanRelationFilter = tenantId ? { loan: { tenant_id: tenantId } } : {};

  await runAutomatedDefaultEnforcement({
    tenantId,
    actorUserId: session.user.user_id,
  });

  // 1. Total Liquidity (Total Savings Pool)
  const liquidity = await prisma.savingsAccount.aggregate({
    where: {
      ...tenantFilter,
      account_type: {
        in: ["regular_savings", "share_capital"],
      },
    },
    _sum: { balance: true },
  });

  // 2. Active Loans Count
  const activeLoansCount = await prisma.loan.count({
    where: { ...tenantFilter, status: "active" },
  });

  // 3. Repayment Rate (Verified Payments vs Total Due)
  const totalPaid = await prisma.payment.aggregate({
    where: {
      ...loanRelationFilter,
      status: "verified",
    },
    _sum: { amount_paid: true },
  });

  const totalDue = await prisma.loanSchedule.aggregate({
    where: {
      ...loanRelationFilter,
      due_date: { lte: new Date() },
    },
    _sum: { total_due: true },
  });

  const paidVal = Number(totalPaid._sum.amount_paid || 0);
  const dueVal = Number(totalDue._sum.total_due || 0);
  const repaymentRate = dueVal > 0 ? (paidVal / dueVal) * 100 : 100;

  // 4. Risk Exposure (Sum of remaining balance on past-due/defaulted loans)
  const riskExposure = await prisma.loan.aggregate({
    where: {
      ...tenantFilter,
      OR: [
        { schedules: { some: { status: "overdue" } } },
        { status: "defaulted" },
      ],
    },
    _sum: { balance_remaining: true },
  });

  return {
    totalLiquidity: Number(liquidity._sum.balance || 0),
    activeLoans: activeLoansCount,
    repaymentRate: Math.min(100, repaymentRate),
    riskExposure: Number(riskExposure._sum.balance_remaining || 0),
  };
}

/**
 * Calculates the trust distribution of the entire cooperative population.
 */
export async function getTenantTrustMetrics() {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter = tenantId ? { tenant_id: tenantId } : {};

  const memberWhere = {
    ...tenantFilter,
    role: Role.member,
  };

  const [t1Count, t2Count, t3Count, t4Count, t5Count, overdueCount] =
    await Promise.all([
      prisma.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T1_5_PERCENT",
        },
      }),
      prisma.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T2_4_5_PERCENT",
        },
      }),
      prisma.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T3_4_PERCENT",
        },
      }),
      prisma.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T4_3_5_PERCENT",
        },
      }),
      prisma.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T5_3_PERCENT",
        },
      }),
      prisma.user.count({
        where: {
          ...memberWhere,
          loans: { some: { schedules: { some: { status: "overdue" } } } },
        },
      }),
    ]);

  const totalMembers = t1Count + t2Count + t3Count + t4Count + t5Count;
  const weightedSum =
    t1Count * 40 + t2Count * 60 + t3Count * 70 + t4Count * 80 + t5Count * 92;
  const avgScore = totalMembers > 0 ? weightedSum / totalMembers : 75;

  return {
    distribution: {
      t1_5Percent: t1Count,
      t2_4_5Percent: t2Count,
      t3_4Percent: t3Count,
      t4_3_5Percent: t4Count,
      t5_3Percent: t5Count,
      overdueMembers: overdueCount,
    },
    aggregateTrust: {
      score: Math.round(avgScore),
      paymentScore: 80,
      businessScore: 70,
      peerScore: 75,
      guarantorScore: 80,
      tier: determineInterestTierFromScore(avgScore),
    },
  };
}

export async function manuallyDeclareDefault(loanId: number) {
  const session = await requireTanawSession();

  try {
    await prisma.$transaction(async (tx) => {
      return await enforceLoanDefault(tx, loanId, session.user.user_id);
    });

    revalidatePath("/agapay-tanaw");
    return {
      success: `Matagumpay na na-enforce ang default para sa loan #${loanId}.`,
    };
  } catch (error: any) {
    console.error("manuallyDeclareDefault failed:", error);
    return { error: error.message || "Failed to enforce default." };
  }
}
