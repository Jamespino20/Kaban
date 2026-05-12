"use server";

import * as z from "zod";
import prisma from "@/lib/prisma";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/authorization";
import { PaymentStatus, ScheduleStatus, Prisma } from "@prisma/client";
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

const FullPaymentSchema = z.object({
  loanId: z.number().int().positive(),
  methodId: z.number().int().positive(),
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
  const tenantId = session.user.tenantId;

  const targetTenantId = session.user.tenantId || -1;
  const targetUserRole = session.user.role;

  const query = async (db: any) => {
    const loan = await db.loan.findUnique({
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
       throw new Error(`Loan application #${loanId} not found.`);
     }

     if (
       session.user.role !== "superadmin" &&
       loan.tenant_id !== session.user.tenantId
     ) {
       throw new Error(
         `Unauthorized: User does not have access to loan #${loanId} in tenant ${tenantId}.`,
       );
     }

    return { session, loan, tenantId };
  };

  return await prisma.$withTenant(targetTenantId, async (tx) => {
    return await query(tx);
  });
}

export async function approveLoanApplication(
  input: z.infer<typeof ApproveLoanSchema>,
) {
  try {
    const { loanId } = ApproveLoanSchema.parse(input);
    const { session, loan, tenantId } = await requireLoanAdminAccess(loanId);

    if (loan.status !== "pending") {
      return { error: "Loan application is no longer pending." };
    }

    const targetTenantId = tenantId || loan.tenant_id;

    await prisma.$withTenant(targetTenantId, async (tx) => {
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "approved",
          approved_at: new Date(),
          approved_by: session.user.user_id,
        },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: targetTenantId,
          user_id: session.user.user_id,
          action: "LOAN_APPROVED",
          entity_type: "Loan",
          entity_id: loanId,
          new_values: { status: "approved", mockFlow: true },
        },
      });
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Loan application approved successfully." };
  } catch (error) {
    console.error("approveLoanApplication failed:", error);
    return {
      error:
        "Unable to approve this loan application. It may have already been processed.",
    };
  }
}

export async function rejectLoanApplication(
  input: z.infer<typeof RejectLoanSchema>,
) {
  try {
    const parsed = RejectLoanSchema.parse(input);
    const { loanId, notes } = parsed;
    const { session, loan, tenantId } = await requireLoanAdminAccess(loanId);

    if (loan.status !== "pending") {
      return {
        error:
          "Unable to reject this loan application. It may have already been processed.",
      };
    }

    const targetTenantId = tenantId || loan.tenant_id;

    await prisma.$withTenant(targetTenantId, async (tx) => {
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "rejected",
          approved_at: new Date(),
          approved_by: session.user.user_id,
        },
      });

      // Store rejection reason as audit log entry
      if (notes) {
        await tx.auditLog.create({
          data: {
            tenant_id: targetTenantId,
            user_id: session.user.user_id,
            action: "LOAN_REJECTED",
            entity_type: "Loan",
            entity_id: loanId,
            new_values: { rejection_reason: notes } as any,
            module: "loans",
            action_category: "update",
            severity: "warning",
          },
        });
      }
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Loan application rejected successfully." };
  } catch (error) {
    console.error("rejectLoanApplication failed:", error);
    return {
      error:
        "Unable to reject this loan application. It may have already been processed.",
    };
  }
}

export async function releaseLoanFunds(
  input: z.infer<typeof ReleaseLoanSchema>,
) {
  try {
    const { loanId } = ReleaseLoanSchema.parse(input);
    const { session, loan, tenantId } = await requireLoanAdminAccess(loanId);

    if (loan.status !== "approved") {
      return {
        error: "Unable to release this loan. The loan must first be approved.",
      };
    }

    const targetTenantId = tenantId || loan.tenant_id;

    await prisma.$withTenant(targetTenantId, async (tx) => {
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "active",
        },
      });

      const schedules = buildRepaymentSchedule({
        loanId,
        approvedAt: loan.approved_at || new Date(),
        termMonths: loan.term_months,
        principalAmount: Number(loan.principal_amount),
        totalInterest: Number(loan.interest_applied),
        processingFee: Number(loan.fees_applied),
        frequency: loan.repayment_frequency,
      });

      await tx.loanSchedule.createMany({
        data: schedules.map((s) => ({ ...s, tenant_id: targetTenantId })),
      });
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Loan funds released successfully." };
  } catch (error) {
    console.error("releaseLoanFunds failed:", error);
    return { error: "Failed to release the loan. Please try again." };
  }
}

export async function submitMockRepayment(
  input: z.infer<typeof SubmitPaymentSchema>,
) {
  try {
    const { loanId, amount, methodId } = SubmitPaymentSchema.parse(input);
    const session = await requireAuthenticatedSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return { error: "Tenant context required." };

    return await prisma.$withTenant(tenantId, async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { loan_id: loanId },
      });

      if (!loan || loan.user_id !== session.user.user_id) {
        return { error: "This action is only available for members." };
      }

      if (loan.status !== "active") {
        return { error: "No active loan found for this transaction." };
      }

      const payment = await tx.payment.create({
        data: {
          tenant_id: tenantId,
          loan_id: loanId,
          method_id: methodId,
          amount_paid: amount,
          payment_reference: `MOCK-${Date.now()}`,
          status: "pending",
          submitted_at: new Date(),
        },
      });

      return { success: "Repayment submitted successfully.", payment };
    });
  } catch (error) {
    console.error("submitMockRepayment failed:", error);
    return { error: "Failed to process repayment. Please try again." };
  }
}

export async function processFullPayment(
  input: z.infer<typeof FullPaymentSchema>,
) {
  try {
    const { loanId, methodId } = FullPaymentSchema.parse(input);
    const session = await requireAuthenticatedSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return { error: "Tenant context required." };

    return await prisma.$withTenant(tenantId, async (tx) => {
      const loan = await tx.loan.findUnique({
        where: { loan_id: loanId },
        include: { schedules: { orderBy: { installment_number: "asc" } } },
      });

      if (!loan || loan.user_id !== session.user.user_id) {
        return { error: "This action is only available for members." };
      }

      if (loan.status !== "active") {
        return { error: "No active loan found for this transaction." };
      }

      // Calculate full-payment amount: remaining principal only (waive remaining interest)
      const unpaidSchedules = loan.schedules.filter(
        (s: any) => s.status === "pending" || s.status === "overdue",
      );

      if (unpaidSchedules.length === 0) {
        return { error: "This loan has no pending installments." };
      }

      const remainingPrincipal = unpaidSchedules.reduce(
        (sum: number, s: any) => sum + Number(s.principal_amount),
        0,
      );

      // Create the full-payment record
      await tx.payment.create({
        data: {
          tenant_id: tenantId,
          loan_id: loanId,
          method_id: methodId,
          amount_paid: remainingPrincipal,
          payment_reference: `FULL-${Date.now()}`,
          status: "verified",
          submitted_at: new Date(),
          verified_at: new Date(),
          verified_by: session.user.user_id,
        },
      });

      // Mark all schedules as paid
      await tx.loanSchedule.updateMany({
        where: { loan_id: loanId, status: { in: ["pending", "overdue"] } },
        data: { status: "paid" },
      });

      // Update loan balance to 0 and mark as paid
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          balance_remaining: 0,
          status: "paid",
        },
      });

      return {
        success: `Full payment processed successfully. You paid ₱${remainingPrincipal.toLocaleString()} (remaining interest waived as full-payment discount).`,
      };
    });
  } catch (error) {
    console.error("processFullPayment failed:", error);
    return { error: "Failed to process full payment. Please try again." };
  }
}

export async function verifySubmittedPayment(
  input: z.infer<typeof ReviewPaymentSchema>,
) {
  try {
    const { paymentId, notes: note } = ReviewPaymentSchema.parse(input);
    const session = await requireAuthenticatedSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return { error: "Tenant context required." };

    return await prisma.$withTenant(tenantId, async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { payment_id: paymentId },
      });

      if (!payment) {
        return { error: "Payment record not found." };
      }

      await tx.payment.update({
        where: { payment_id: paymentId },
        data: {
          status: "verified",
          verified_at: new Date(),
          verified_by: session.user.user_id,
        },
      });

      // Apply payment to unpaid schedules
      const schedules = await tx.loanSchedule.findMany({
        where: {
          loan_id: payment.loan_id,
          status: { in: [ScheduleStatus.pending, ScheduleStatus.overdue] },
        },
        orderBy: { installment_number: "asc" },
      });

      let remaining = Number(payment.amount_paid);
      for (const schedule of schedules) {
        const scheduleDue = Number(schedule.total_due);
        if (remaining + 0.01 < scheduleDue) {
          // Partial payment: apply to this schedule but don't mark fully paid
          await tx.loanSchedule.update({
            where: { schedule_id: schedule.schedule_id },
            data: {
              amount_paid: { increment: new Prisma.Decimal(remaining) },
            },
          });
          break;
        }

        await tx.loanSchedule.update({
          where: { schedule_id: schedule.schedule_id },
          data: {
            status: ScheduleStatus.paid,
            paid_at: new Date(),
            amount_paid: scheduleDue,
          },
        });
        remaining -= scheduleDue;
      } 

      const appliedAmount = Number(payment.amount_paid) - remaining;

      // Update loan balance
      await tx.loan.update({
        where: { loan_id: payment.loan_id },
        data: {
          balance_remaining: {
            decrement: new Prisma.Decimal(appliedAmount),
          },
        },
      });

      // Check if fully paid and update status
      const updatedLoan = await tx.loan.findUnique({
        where: { loan_id: payment.loan_id },
        select: { balance_remaining: true },
      });

      if (updatedLoan && Number(updatedLoan.balance_remaining) <= 0) {
        await tx.loan.update({
          where: { loan_id: payment.loan_id },
          data: { status: "paid" },
        });
      }

      // Post ledger entries
      await postLedgerEntry(tx, {
        tenantId,
        description: `Loan Repayment Verified: ${payment.payment_reference}`,
        createdBy: session.user.user_id,
        loanId: payment.loan_id,
        metadata: { source: "repayment_verification", paymentId: payment.payment_id },
        entries: [
          {
            accountCode: "CASH_EQUIVALENTS",
            debit: appliedAmount,
            credit: 0,
          },
          {
            accountCode: "LOAN_RECEIVABLES",
            debit: 0,
            credit: appliedAmount,
          },
        ],
      });

      return { success: "Payment verified successfully." };
    });
  } catch (error) {
    console.error("verifySubmittedPayment failed:", error);
    return { error: "Failed to verify this repayment. Please try again." };
  }
}

export async function rejectSubmittedPayment(
  input: z.infer<typeof ReviewPaymentSchema>,
) {
  try {
    const { paymentId, notes: note } = ReviewPaymentSchema.parse(input);
    const session = await requireAuthenticatedSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return { error: "Tenant context required." };

    return await prisma.$withTenant(tenantId, async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { payment_id: paymentId },
      });

      if (!payment) {
        return { error: "Payment record not found." };
      }

      await tx.payment.update({
        where: { payment_id: paymentId },
        data: {
          status: "rejected",
          verified_at: new Date(),
          verified_by: session.user.user_id,
          notes: note,
        },
      });

      return { success: "Payment rejected successfully." };
    });
  } catch (error) {
    console.error("rejectSubmittedPayment failed:", error);
    return { error: "Failed to reject this repayment. Please try again." };
  }
}

export async function getLoanStatement(loanId: number) {
  try {
    const session = await requireAuthenticatedSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return [];

    return await prisma.$withTenant(tenantId, async (tx) => {
      return await tx.businessLedger.findMany({
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
    });
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
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) return 0;

  return await prisma.$withTenant(tenantId, async (tx) => {
    const entries = await tx.businessLedger.findMany({
      where: {
        loan_id: loanId,
        account: {
          code: "LOAN_RECEIVABLES",
        },
      },
    });

    // For a receivable account: Debit (Increments) - Credit (Decrements)
    // Principal Release = Debit. Repayment = Credit.
    const balance = entries.reduce((acc: number, entry: any) => {
      return acc + Number(entry.debit) - Number(entry.credit);
    }, 0);

    return Math.max(0, balance);
  });
}
