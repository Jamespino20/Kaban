import prisma from "@/lib/prisma";
import { postLedgerEntry } from "@/actions/ledger";
import { syncUserTier } from "@/lib/trust-engine";
import {
  GuaranteeStatus,
  LoanStatus,
  LoanProduct,
  RepaymentFrequency,
  ScheduleStatus,
  Loan,
  Prisma,
} from "@prisma/client";
import {
  buildRepaymentSchedule,
  MICROFINANCE_POLICY,
  roundMoney,
} from "@/lib/microfinance-policy";

const PERSONAL_WALLET = "personal_wallet";
const GUARANTEE_CHARGED = "charged";
const DEFAULT_RECOVERY_DEBIT = "default_recovery_debit";

type LoanClientCompat = {
  findFirst: (args: unknown) => Promise<Loan | null>;
  create: (args: unknown) => Promise<Loan>;
};

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

async function ensurePersonalWallet(
  tx: Prisma.TransactionClient,
  tenantId: number,
  userId: number,
) {
  const existing = await tx.savingsAccount.findFirst({
    where: {
      tenant_id: tenantId,
      user_id: userId,
      account_type: PERSONAL_WALLET as never,
    },
  });

  if (existing) {
    return existing;
  }

  return tx.savingsAccount.create({
    data: {
      tenant_id: tenantId,
      user_id: userId,
      account_type: PERSONAL_WALLET as never,
      balance: 0,
    },
  });
}

async function createRecoveryLoan(
  tx: Prisma.TransactionClient,
  params: {
    sourceLoan: {
      loan_id: number;
      tenant_id: number;
      user_id: number;
      product_id: number;
      approved_by: number | null;
      repayment_frequency: RepaymentFrequency;
      purpose: string;
    };
    uncoveredAmount: number;
  },
) {
  const { sourceLoan, uncoveredAmount } = params;
  const loanClient = tx.loan as unknown as LoanClientCompat;
  const existingRecoveryLoan = await loanClient.findFirst({
    where: {
      recovery_parent_loan_id: sourceLoan.loan_id,
      is_recovery_loan: true,
      status: {
        in: [LoanStatus.pending, LoanStatus.approved, LoanStatus.active],
      },
    },
  });

  if (existingRecoveryLoan) {
    return existingRecoveryLoan;
  }

  const approvedAt = new Date();
  const recoveryLoan = await loanClient.create({
    data: {
      tenant_id: sourceLoan.tenant_id,
      user_id: sourceLoan.user_id,
      product_id: sourceLoan.product_id,
      recovery_parent_loan_id: sourceLoan.loan_id,
      loan_reference: `RCV-${sourceLoan.tenant_id}-${sourceLoan.loan_id}-${Date.now()}`,
      principal_amount: uncoveredAmount,
      purpose: `Recovery Loan: ${sourceLoan.purpose}`,
      term_months: MICROFINANCE_POLICY.minTermMonths,
      repayment_frequency: sourceLoan.repayment_frequency,
      interest_applied: 0,
      principal_receivable: uncoveredAmount,
      interest_receivable: 0,
      fees_applied: 0,
      total_payable: uncoveredAmount,
      balance_remaining: uncoveredAmount,
      is_recovery_loan: true,
      status: LoanStatus.active,
      applied_at: approvedAt,
      approved_at: approvedAt,
      approved_by: sourceLoan.approved_by,
    },
  });

  await tx.loanSchedule.createMany({
    data: buildRepaymentSchedule({
      loanId: recoveryLoan.loan_id,
      approvedAt,
      termMonths: recoveryLoan.term_months,
      principalAmount: uncoveredAmount,
      totalInterest: 0,
      processingFee: 0,
      frequency: sourceLoan.repayment_frequency,
    }),
  });

  return recoveryLoan;
}

async function enforceLoanDefault(
  tx: Prisma.TransactionClient,
  loanId: number,
  actorUserId?: number,
) {
  const loan = await tx.loan.findUnique({
    where: { loan_id: loanId },
    include: {
      product: true,
      guarantees: {
        include: {
          guarantor: true,
        },
      },
      schedules: {
        where: {
          status: ScheduleStatus.overdue,
        },
      },
    },
  });

  if (!loan || loan.status === LoanStatus.paid || loan.status === LoanStatus.rejected) {
    return [];
  }

  const eligibleGuarantees = loan.guarantees.filter(
    (guarantee) =>
      guarantee.status === GuaranteeStatus.pending ||
      guarantee.status === GuaranteeStatus.vouched,
  );

  if (loan.status !== LoanStatus.defaulted) {
    await tx.loan.update({
      where: { loan_id: loan.loan_id },
      data: { status: LoanStatus.defaulted },
    });
  }

  if (eligibleGuarantees.length === 0) {
    return [loan.user_id];
  }

  let recoveredTotal = 0;
  const productWithLiability = loan.product as LoanProduct & {
    guarantor_liability_rate?: Prisma.Decimal | number | null;
  };
  const liabilityRate = Number(
    productWithLiability.guarantor_liability_rate ?? 25,
  );
  const borrowerExposure = Number(loan.balance_remaining);
  const touchedUserIds = new Set<number>([loan.user_id]);

  for (const guarantee of eligibleGuarantees) {
    const wallet = await ensurePersonalWallet(
      tx,
      loan.tenant_id,
      guarantee.guarantor_id,
    );
    const targetShare = roundMoney((borrowerExposure * liabilityRate) / 100);
    const walletBalance = Number(wallet.balance);
    const deductedAmount = roundMoney(Math.min(walletBalance, targetShare));

    touchedUserIds.add(guarantee.guarantor_id);

    await tx.loanGuarantee.update({
      where: { id: guarantee.id },
      data: {
        status: GUARANTEE_CHARGED as never,
        hard_freeze_at: new Date(),
      },
    });

    if (deductedAmount <= 0) {
      continue;
    }

    recoveredTotal += deductedAmount;

    await tx.savingsAccount.update({
      where: { account_id: wallet.account_id },
      data: {
        balance: roundMoney(walletBalance - deductedAmount),
      },
    });

    await tx.savingsTransaction.create({
      data: {
        account_id: wallet.account_id,
        transaction_type: DEFAULT_RECOVERY_DEBIT as never,
        amount: deductedAmount,
        reference: `DEFAULT-${loan.loan_reference}`,
        processed_by: actorUserId ?? null,
      },
    });

    await postLedgerEntry(tx, {
      description: `Guarantor wallet recovery for ${loan.loan_reference}`,
      createdBy: actorUserId,
      entries: [
        {
          accountCode: "MEMBER_SAVINGS",
          debit: deductedAmount,
          credit: 0,
        },
        {
          accountCode: "LOAN_RECEIVABLES",
          debit: 0,
          credit: deductedAmount,
        },
      ],
    });
  }

  const uncoveredAmount = roundMoney(Math.max(0, borrowerExposure - recoveredTotal));
  if (uncoveredAmount > 0) {
    await createRecoveryLoan(tx, {
      sourceLoan: {
        loan_id: loan.loan_id,
        tenant_id: loan.tenant_id,
        user_id: loan.user_id,
        product_id: loan.product_id,
        approved_by: loan.approved_by,
        repayment_frequency: loan.repayment_frequency,
        purpose: loan.purpose,
      },
      uncoveredAmount,
    });
  }

  await tx.auditLog.create({
    data: {
      tenant_id: loan.tenant_id,
      user_id: actorUserId ?? null,
      action: "LOAN_DEFAULT_ENFORCED",
      entity_type: "Loan",
      entity_id: loan.loan_id,
      new_values: {
        recovered_total: recoveredTotal,
        uncovered_amount: uncoveredAmount,
        guarantor_count: eligibleGuarantees.length,
      },
    },
  });

  return [...touchedUserIds];
}

export async function runAutomatedDefaultEnforcement(params: {
  tenantId?: number | null;
  actorUserId?: number;
}) {
  const today = startOfToday();
  const cutoffDate = new Date(today);
  cutoffDate.setDate(cutoffDate.getDate() - MICROFINANCE_POLICY.gracePeriodDays);

  const prismaLoanClient = prisma.loan as unknown as {
    findMany: (args: unknown) => Promise<Array<{ loan_id: number }>>;
  };
  const loans = await prismaLoanClient.findMany({
    where: {
      ...(params.tenantId ? { tenant_id: params.tenantId } : {}),
      status: {
        in: [LoanStatus.active, LoanStatus.defaulted],
      },
      balance_remaining: {
        gt: 0,
      },
      is_recovery_loan: false,
      schedules: {
        some: {
          status: ScheduleStatus.overdue,
          due_date: {
            lte: cutoffDate,
          },
        },
      },
    },
    select: {
      loan_id: true,
    },
  });

  if (loans.length === 0) {
    return { enforcedLoans: 0 };
  }

  const affectedUsers = new Set<number>();
  for (const loan of loans) {
    const userIds = await prisma.$transaction((tx) =>
      enforceLoanDefault(tx, loan.loan_id, params.actorUserId),
    );

    for (const userId of userIds) {
      affectedUsers.add(userId);
    }
  }

  await Promise.all(
    [...affectedUsers].map((userId) =>
      syncUserTier(userId, params.tenantId ?? undefined).catch(() => null),
    ),
  );

  return { enforcedLoans: loans.length };
}
