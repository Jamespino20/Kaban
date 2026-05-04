"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/authorization";
import { PaymentStatus, ScheduleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  buildRepaymentSchedule,
  computeLoanQuote,
  getCompassionPolicyCopy,
} from "@/lib/microfinance-policy";
import { postLedgerEntry } from "./ledger";

const ApproveLoanSchema = z.object({
  loanId: z.number().int().positive(),
});

const RejectLoanSchema = z.object({
  loanId: z.number().int().positive(),
  notes: z.string().trim().max(500).optional(),
});

const ReleaseLoanSchema = z.object({
  loanId: z.number().int().positive(),
  methodId: z.number().int().positive(),
  releaseReference: z.string().trim().min(3).max(100),
  notes: z.string().trim().max(500).optional(),
});

const SubmitPaymentSchema = z.object({
  loanId: z.number().int().positive(),
  methodId: z.number().int().positive(),
  amount: z.number().positive(),
  reference: z.string().trim().min(3).max(100),
  receiptUrl: z.string().trim().url().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
});

const ReviewPaymentSchema = z.object({
  paymentId: z.number().int().positive(),
  notes: z.string().trim().max(500).optional(),
});

async function syncOverdueSchedules(tx: any, loanId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await tx.loanSchedule.updateMany({
    where: {
      loan_id: loanId,
      status: ScheduleStatus.pending,
      due_date: {
        lt: today,
      },
    },
    data: {
      status: ScheduleStatus.overdue,
    },
  });
}

async function requireLoanAdminAccess(loanId: number) {
  const session = await requireAdminSession();
  const loan = await prisma.loan.findUnique({
    where: { loan_id: loanId },
    include: {
      tenant: {
        include: {
          payment_methods: {
            where: { is_active: true },
            orderBy: { provider_name: "asc" },
          },
        },
      },
      user: {
        include: { profile: true },
      },
      product: true,
      schedules: {
        orderBy: { installment_number: "asc" },
      },
    },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (
    session.user.role !== "superadmin" &&
    loan.tenant_id !== session.user.tenantId
  ) {
    throw new Error("Unauthorized");
  }

  return { session, loan };
}

export async function approveLoanApplication(
  input: z.infer<typeof ApproveLoanSchema>,
) {
  try {
    const { loanId } = ApproveLoanSchema.parse(input);
    const { session, loan } = await requireLoanAdminAccess(loanId);

    if (loan.status !== "pending") {
      return { error: "Loan application is no longer pending." };
    }

    await prisma.loan.update({
      where: { loan_id: loanId },
      data: {
        status: "approved",
        approved_at: new Date(),
        approved_by: session.user.user_id,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenant_id: loan.tenant_id,
        user_id: session.user.user_id,
        action: "LOAN_APPROVED",
        entity_type: "Loan",
        entity_id: loanId,
        new_values: { status: "approved", mockFlow: true },
      },
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Naaprubahan na ang loan application." };
  } catch (error) {
    console.error("approveLoanApplication failed:", error);
return { error: "Unable to approve this loan application. It may have already been processed." };
    return { error: "Unable to reject this loan application. It may have already been processed." };
    return { error: "Unable to release this loan. The loan must first be approved." };
    return { error: "Invalid release method for this branch. Please contact your administrator." };
    return { error: "Failed to release the loan. Please try again." };
    return { error: "This action is only available for members." };
    return { error: "No active loan found for this transaction." };
    return { error: "Invalid payment method selected." };
    return { error: "Payment amount exceeds the remaining loan balance." };
    return { error: "Failed to process repayment. Please try again." };
    return { error: "Payment record not found." };
    return { error: "You are not authorized to view this payment." };
    return { error: "This payment cannot be modified as it has already been processed." };
    return { error: "Failed to verify this repayment. Please try again." };
    return { error: "Payment record not found." };
    return { error: "You are not authorized to verify this payment." };
    return { error: "Failed to reject this repayment. Please try again." };
  }
}

export async function getLoanStatement(loanId: number) {
  try {
    const session = await requireAuthenticatedSession();
    const ledgerEntries = await prisma.businessLedger.findMany({
      where: {
        loan_id: loanId,
        account: {
          code: "LOAN_RECEIVABLES",
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return ledgerEntries;
  } catch (error) {
    console.error("getLoanStatement failed:", error);
    return [];
  }
}

/**
 * Derives the true outstanding balance from the general ledger entries.
 * Satisfies the "SOA balance truth" requirement.
 */
export async function recalculateLoanBalanceFromLedger(loanId: number) {
  const entries = await prisma.businessLedger.findMany({
    where: {
      loan_id: loanId,
      account: {
        code: "LOAN_RECEIVABLES",
      },
    },
  });

  // For a receivable account: Debit (Increments) - Credit (Decrements)
  // Principal Release = Debit. Repayment = Credit.
  const balance = entries.reduce((acc, entry) => {
    return acc + Number(entry.debit) - Number(entry.credit);
  }, 0);

  return Math.max(0, balance);
}
