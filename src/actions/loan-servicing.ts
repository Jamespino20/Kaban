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
  buildMonthlyRepaymentSchedule,
  computeMonthlyLoanQuote,
  getCompassionPolicyCopy,
  MICROFINANCE_POLICY,
} from "@/lib/microfinance-policy";

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
    return { error: "Hindi maaprubahan ang loan application." };
  }
}

export async function rejectLoanApplication(
  input: z.infer<typeof RejectLoanSchema>,
) {
  try {
    const { loanId, notes } = RejectLoanSchema.parse(input);
    const { session, loan } = await requireLoanAdminAccess(loanId);

    if (loan.status !== "pending") {
      return { error: "Loan application is no longer pending." };
    }

    await prisma.loan.update({
      where: { loan_id: loanId },
      data: {
        status: "rejected",
        approved_by: session.user.user_id,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenant_id: loan.tenant_id,
        user_id: session.user.user_id,
        action: "LOAN_REJECTED",
        entity_type: "Loan",
        entity_id: loanId,
        new_values: { status: "rejected", notes, mockFlow: true },
      },
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Na-reject ang loan application." };
  } catch (error) {
    console.error("rejectLoanApplication failed:", error);
    return { error: "Hindi ma-reject ang loan application." };
  }
}

export async function releaseLoanFunds(
  input: z.infer<typeof ReleaseLoanSchema>,
) {
  try {
    const { loanId, methodId, releaseReference, notes } =
      ReleaseLoanSchema.parse(input);
    const { session, loan } = await requireLoanAdminAccess(loanId);

    if (loan.status !== "approved") {
      return { error: "Loan must be approved before release." };
    }

    const paymentMethod = loan.tenant.payment_methods.find(
      (method) => method.method_id === methodId,
    );
    if (!paymentMethod) {
      return { error: "Invalid release method for this branch." };
    }

    await prisma.$transaction(async (tx) => {
      const existingSchedules = await tx.loanSchedule.count({
        where: { loan_id: loanId },
      });

      if (existingSchedules === 0) {
        const quote = computeMonthlyLoanQuote({
          principalAmount: Number(loan.principal_amount),
          termMonths: loan.term_months,
          monthlyRatePercent: Number(loan.product.interest_rate_percent),
        });

        await tx.loanSchedule.createMany({
          data: buildMonthlyRepaymentSchedule({
            loanId: loan.loan_id,
            approvedAt: loan.approved_at ?? new Date(),
            termMonths: loan.term_months,
            principalAmount: Number(loan.principal_amount),
            totalInterest: quote.totalInterest,
            processingFee: quote.processingFee,
          }),
        });
      }

      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "active",
          approved_by: session.user.user_id,
          approved_at: loan.approved_at ?? new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: loan.tenant_id,
          user_id: session.user.user_id,
          action: "LOAN_RELEASED",
          entity_type: "Loan",
          entity_id: loanId,
          new_values: {
            status: "active",
            release_method: paymentMethod.provider_name,
            release_reference: releaseReference,
            notes,
            compassion_policy: getCompassionPolicyCopy(),
            mockFlow: true,
          },
        },
      });
    });

    revalidatePath("/agapay-tanaw");
    revalidatePath("/agapay-pintig");
    return { success: "Na-release na ang mock funds at activated na ang loan." };
  } catch (error) {
    console.error("releaseLoanFunds failed:", error);
    return { error: "Hindi ma-release ang loan." };
  }
}

export async function submitMockRepayment(
  input: z.infer<typeof SubmitPaymentSchema>,
) {
  try {
    const session = await requireAuthenticatedSession();
    const { loanId, methodId, amount, reference, receiptUrl, notes } =
      SubmitPaymentSchema.parse(input);

    if (session.user.role !== "member" || !session.user.tenantId) {
      return { error: "Members only." };
    }

    const loan = await prisma.loan.findFirst({
      where: {
        loan_id: loanId,
        tenant_id: session.user.tenantId,
        user_id: session.user.user_id,
        status: "active",
      },
      include: {
        product: true,
        schedules: {
          where: {
            status: {
              in: [ScheduleStatus.pending, ScheduleStatus.overdue],
            },
          },
          orderBy: { installment_number: "asc" },
        },
      },
    });

    if (!loan) {
      return { error: "Active loan not found." };
    }

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        method_id: methodId,
        tenant_id: session.user.tenantId,
        is_active: true,
      },
    });

    if (!paymentMethod) {
      return { error: "Invalid payment method." };
    }

    if (amount > Number(loan.balance_remaining)) {
      return { error: "Payment amount exceeds your remaining balance." };
    }

    const nextSchedule = loan.schedules[0];
    if (nextSchedule) {
      const minimumInstallment = Number(nextSchedule.total_due);
      const isFinalSettlement =
        Math.abs(Number(loan.balance_remaining) - amount) <= 0.01;

      if (!isFinalSettlement && amount + 0.01 < minimumInstallment) {
        return {
          error: `Minimum repayment is PHP ${minimumInstallment.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} for the next installment.`,
        };
      }
    }

    await prisma.payment.create({
      data: {
        loan_id: loanId,
        method_id: methodId,
        payment_reference: reference,
        amount_paid: amount,
        receipt_url: receiptUrl || null,
        status: PaymentStatus.pending,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenant_id: session.user.tenantId,
        user_id: session.user.user_id,
        action: "PAYMENT_SUBMITTED",
        entity_type: "Payment",
        entity_id: loanId,
        new_values: {
          amount,
          payment_method: paymentMethod.provider_name,
          reference,
          notes,
          mockFlow: true,
        },
      },
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Naipasa na ang repayment para sa admin verification." };
  } catch (error) {
    console.error("submitMockRepayment failed:", error);
    return { error: "Hindi maipasa ang repayment." };
  }
}

export async function verifySubmittedPayment(
  input: z.infer<typeof ReviewPaymentSchema>,
) {
  try {
    const { paymentId, notes } = ReviewPaymentSchema.parse(input);
    const session = await requireAdminSession();

    const payment = await prisma.payment.findUnique({
      where: { payment_id: paymentId },
      include: {
        loan: true,
        payment_method: true,
      },
    });

    if (!payment) {
      return { error: "Payment not found." };
    }

    if (
      session.user.role !== "superadmin" &&
      payment.loan.tenant_id !== session.user.tenantId
    ) {
      return { error: "Unauthorized" };
    }

    if (payment.status !== PaymentStatus.pending) {
      return { error: "Payment is no longer pending." };
    }

    await prisma.$transaction(async (tx) => {
      await syncOverdueSchedules(tx, payment.loan_id);

      const refreshedLoan = await tx.loan.findUnique({
        where: { loan_id: payment.loan_id },
        include: {
          schedules: {
            where: {
              status: {
                in: [ScheduleStatus.pending, ScheduleStatus.overdue],
              },
            },
            orderBy: { installment_number: "asc" },
          },
        },
      });

      if (!refreshedLoan) {
        throw new Error("Loan not found during payment verification.");
      }

      await tx.payment.update({
        where: { payment_id: paymentId },
        data: {
          status: PaymentStatus.verified,
          verified_at: new Date(),
          verified_by: session.user.user_id,
          notes: notes || payment.notes,
        },
      });

      let remaining = Number(payment.amount_paid);
      for (const schedule of refreshedLoan.schedules) {
        const scheduleDue = Number(schedule.total_due);
        if (remaining + 0.01 < scheduleDue) {
          break;
        }

        await tx.loanSchedule.update({
          where: { schedule_id: schedule.schedule_id },
          data: {
            status: ScheduleStatus.paid,
            paid_at: new Date(),
          },
        });
        remaining -= scheduleDue;
      }

      const nextBalance = Math.max(
        0,
        Number(refreshedLoan.balance_remaining) - Number(payment.amount_paid),
      );

      await tx.loan.update({
        where: { loan_id: payment.loan_id },
        data: {
          balance_remaining: nextBalance,
          status: nextBalance <= 0 ? "paid" : refreshedLoan.status,
        },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: payment.loan.tenant_id,
          user_id: session.user.user_id,
          action: "PAYMENT_VERIFIED",
          entity_type: "Payment",
          entity_id: paymentId,
          new_values: {
            amount: Number(payment.amount_paid),
            payment_method: payment.payment_method.provider_name,
            notes,
            mockFlow: true,
          },
        },
      });
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Na-verify na ang repayment." };
  } catch (error) {
    console.error("verifySubmittedPayment failed:", error);
    return { error: "Hindi ma-verify ang repayment." };
  }
}

export async function rejectSubmittedPayment(
  input: z.infer<typeof ReviewPaymentSchema>,
) {
  try {
    const { paymentId, notes } = ReviewPaymentSchema.parse(input);
    const session = await requireAdminSession();

    const payment = await prisma.payment.findUnique({
      where: { payment_id: paymentId },
      include: {
        loan: true,
      },
    });

    if (!payment) {
      return { error: "Payment not found." };
    }

    if (
      session.user.role !== "superadmin" &&
      payment.loan.tenant_id !== session.user.tenantId
    ) {
      return { error: "Unauthorized" };
    }

    await prisma.payment.update({
      where: { payment_id: paymentId },
      data: {
        status: PaymentStatus.rejected,
        notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenant_id: payment.loan.tenant_id,
        user_id: session.user.user_id,
        action: "PAYMENT_REJECTED",
        entity_type: "Payment",
        entity_id: paymentId,
        new_values: { notes, mockFlow: true },
      },
    });

    revalidatePath("/agapay-pintig");
    revalidatePath("/agapay-tanaw");
    return { success: "Na-reject ang repayment submission." };
  } catch (error) {
    console.error("rejectSubmittedPayment failed:", error);
    return { error: "Hindi ma-reject ang repayment." };
  }
}
