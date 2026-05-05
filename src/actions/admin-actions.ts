"use server";

import prisma, { getBranchPrisma } from "@/lib/prisma";
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
  const db = getBranchPrisma(session.user.tenantSlug);
  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter =
    session.user.role === "superadmin" && !tenantId
      ? {}
      : { tenant_id: tenantId };

  const members = await db.user.findMany({
    where: {
      ...tenantFilter,
    },
    include: {
      profile: true,
      tenant: {
        select: {
          name: true,
        },
      },
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
          is_recovery_loan: true,
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
  const db = getBranchPrisma(session.user.tenantSlug);
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
  const pendingLoans = await db.loan.findMany({
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
  const pendingVerifications = await db.user.findMany({
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

  const approvedLoans = await db.loan.findMany({
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

  // CompassionAction is accessed via Prisma client directly as it is a known model
  const pendingCompassionActions = await prisma.compassionAction.findMany({
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
      is_recovery_loan: true,
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
      status: "active",
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
    recoveryLoans,
    overdueLoans,
    compassion: pendingCompassionActions,
  };
}

export async function getDashboardMetrics() {
  const session = await requireTanawSession();
  const db = getBranchPrisma(session.user.tenantSlug);

  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter = tenantId ? { tenant_id: tenantId } : {};
  const loanRelationFilter = tenantId ? { loan: { tenant_id: tenantId } } : {};

  await runAutomatedDefaultEnforcement({
    tenantId,
    actorUserId: session.user.user_id,
  });

  // 1. Total Liquidity (Total Savings Pool)
  const liquidity = await db.savingsAccount.aggregate({
    where: {
      ...tenantFilter,
      account_type: {
        in: ["regular_savings", "share_capital"],
      },
    },
    _sum: { balance: true },
  });

  // 2. Active Loans Count
  const activeLoansCount = await db.loan.count({
    where: { ...tenantFilter, status: "active" },
  });

  // 3. Repayment Rate (Verified Payments vs Total Due)
  const totalPaid = await db.payment.aggregate({
    where: {
      ...loanRelationFilter,
      status: "verified",
    },
    _sum: { amount_paid: true },
  });

  const totalDue = await db.loanSchedule.aggregate({
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
  const riskExposure = await db.loan.aggregate({
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
  const db = getBranchPrisma(session.user.tenantSlug);
  const tenantId = session.user.tenantId ?? undefined;
  const tenantFilter = tenantId ? { tenant_id: tenantId } : {};

  const memberWhere = {
    ...tenantFilter,
    role: Role.member,
  };

  const [t1Count, t2Count, t3Count, t4Count, t5Count, overdueCount] =
    await Promise.all([
      db.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T1_5_PERCENT",
        },
      }),
      db.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T2_4_5_PERCENT",
        },
      }),
      db.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T3_4_PERCENT",
        },
      }),
      db.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T4_3_5_PERCENT",
        },
      }),
      db.user.count({
        where: {
          ...memberWhere,
          interest_tier: "T5_3_PERCENT",
        },
      }),
      db.user.count({
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

export async function createStaffAccount(values: {
  username: string;
  email: string;
  passwordHash: string; // pre-hashed client/intermediate, actually we should hash it server side. Let's accept plain password here.
  plainPassword?: string;
  firstName: string;
  lastName: string;
  role: "admin" | "lender";
  tenantId: number;
}) {
  const session = await requireTanawSession();
  if (session.user.role !== "superadmin") {
    return {
      success: false,
      error: "Only global superadmins can create branch staff accounts.",
    };
  }

  try {
    const db = getBranchPrisma(session.user.tenantSlug);
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(
      values.plainPassword || values.passwordHash,
      10,
    );

    const existingUser = await db.user.findFirst({
      where: { email: values.email.toLowerCase() },
    });
    if (existingUser)
      return { success: false, error: "Email already exists in the system." };

    const existingUsername = await db.user.findFirst({
      where: { username: values.username, tenant_id: values.tenantId },
    });
    if (existingUsername)
      return { success: false, error: "Username taken in this branch." };

    const result = await db.$transaction(async (tx: any) => {
      // 1. Generate Member Code for Staff (AGP-YYYY-[ROLE]-SERIAL)
      const year = new Date().getFullYear();
      const count = await tx.user.count({
        where: { tenant_id: values.tenantId, role: values.role },
      });
      const serial = (count + 1).toString().padStart(3, "0");
      const roleSub = values.role === "admin" ? "ADM" : "LND";
      const member_code = `AGP-${year}-${roleSub}-${serial}`;

      const user = await tx.user.create({
        data: {
          email: values.email.toLowerCase(),
          username: values.username,
          phone: "0000000000",
          member_code,
          password_hash: hashedPassword,
          tenant_id: values.tenantId,
          role: values.role,
          interest_tier: "T1_5_PERCENT", // N/A for staff but required by schema
          status: "active",
        },
      });

      await tx.userProfile.create({
        data: {
          user_id: user.user_id,
          first_name: values.firstName,
          last_name: values.lastName,
          gender: "Prefer not to say",
          marital_status: "single",
          region: "N/A",
          province: "N/A",
          city: "N/A",
          barangay: "N/A",
          address: "N/A",
        },
      });

      // Audit log it
      await tx.auditLog.create({
        data: {
          tenant_id: values.tenantId,
          user_id: session.user.user_id,
          action: "CREATE_STAFF_ACCOUNT",
          entity_type: "User",
          entity_id: user.user_id,
          new_values: { username: user.username, role: user.role } as any,
        },
      });

      return user;
    });

    revalidatePath("/agapay-tanaw");
    return {
      success: true,
      user: result,
      message: "Staff account created successfully!",
    };
  } catch (err: any) {
    console.error("Staff creation error:", err);
    return {
      success: false,
      error: err.message || "Failed to create staff account",
    };
  }
}

export async function manuallyDeclareDefault(loanId: number) {
  const session = await requireTanawSession();

  try {
    const db = getBranchPrisma(session.user.tenantSlug);
    await db.$transaction(async (tx: any) => {
      return await enforceLoanDefault(tx, loanId, session.user.user_id);
    });

    revalidatePath("/agapay-tanaw");
    return {
      success: `Matagumpay na na-enforce ang default para sa loan #${loanId}.`,
    };
  } catch (error) {
    console.error("manuallyDeclareDefault failed:", error);
    const message =
      error instanceof Error ? error.message : "Failed to enforce default.";
    return { error: message };
  }
}
