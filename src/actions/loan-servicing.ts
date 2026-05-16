"use server";

import * as z from "zod";
import { shouldUseApiClient } from "@/lib/api-config";
import { api } from "@/lib/api-client";
import prisma from "@/lib/prisma";
import {
  requireAdminSession,
  requireAuthenticatedSession,
} from "@/lib/authorization";
import {
  PaymentStatus,
  ScheduleStatus,
  Prisma,
  NotificationChannel,
  NotificationType,
  AccountType,
  TransactionType,
} from "@prisma/client";
import { createNotification } from "@/lib/notifications";
import { refreshUserReputation } from "@/actions/reputation";
import { revalidatePath } from "next/cache";
import { serializeDecimal } from "@/lib/utils";
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

  return await prisma.$withTenant(targetTenantId, async (tx: any) => {
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
      return {
        error:
          "Loan application is no longer pending. It may have already been approved or rejected. Check the My Loans section for current status.",
      };
    }

    if (shouldUseApiClient()) {
      const result = await api.loans.approve({ loanId });
      revalidatePath("/agapay-tanaw");
      return result;
    }

    const targetTenantId = tenantId || loan.tenant_id;

    await prisma.$withTenant(targetTenantId, async (tx: any) => {
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

    await createNotification({
      userId: loan.user_id,
      tenantId: targetTenantId,
      type: "loan_approved",
      title: "Loan Application Approved",
      body: `Your loan application #${loanId} has been approved.`,
      actionUrl: `/member/loans/${loanId}`,
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Loan application approved successfully." };
  } catch (error) {
    console.error("approveLoanApplication failed:", error);
    return {
      error:
        "Unable to approve this loan application. The loan may have already been approved or the tenant context changed. Please refresh the page and try again, or contact support if the issue persists.",
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

    if (shouldUseApiClient()) {
      const result = await api.loans.reject({ loanId, notes });
      revalidatePath("/agapay-tanaw");
      return result;
    }

    const targetTenantId = tenantId || loan.tenant_id;

    await prisma.$withTenant(targetTenantId, async (tx: any) => {
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
          module: "loan",
          action_category: "update",
          severity: "warning",
        } as any,
      });

      // Mark loan as failed/invalid, keep the loan record but add rejection reason
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "rejected",
          rejection_reason: notes,
        },
      });
      }
    });

    await createNotification({
      userId: loan.user_id,
      tenantId: targetTenantId,
      type: "loan_rejected",
      title: "Loan Application Rejected",
      body: notes
        ? `Your loan application #${loanId} was rejected. Reason: ${notes}`
        : `Your loan application #${loanId} was rejected.`,
      actionUrl: `/member/loans/${loanId}`,
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

    if (shouldUseApiClient()) {
      const result = await api.loans.release({ loanId });
      revalidatePath("/agapay-tanaw");
      return result;
    }

    const targetTenantId = tenantId || loan.tenant_id;

    const result = await prisma.$withTenant(targetTenantId, async (tx: any) => {
      const principalAmount = Number(loan.principal_amount);
      const transId = `DISB-${loan.loan_id}-${Date.now()}`;

      // Check tenant treasury (CASH_EQUIVALENTS ledger balance)
      const treasuryAccount = await tx.ledgerAccount.findFirst({
        where: { code: "CASH_EQUIVALENTS", tenant_id: { in: [targetTenantId, null] } },
        orderBy: { tenant_id: "desc" },
      });
      if (!treasuryAccount) {
        return { error: "Treasury account not configured. Contact superadmin to set up ledger accounts." };
      }

      const treasuryEntries = await tx.businessLedger.findMany({
        where: { tenant_id: targetTenantId, account_id: treasuryAccount.id },
        select: { debit: true, credit: true },
      });
      const treasuryBalance = treasuryEntries.reduce(
        (sum: number, e: any) => sum + Number(e.debit) - Number(e.credit), 0,
      );

      if (treasuryBalance < principalAmount) {
        return {
          error: `Insufficient tenant funds (Available: ₱${Math.max(0, treasuryBalance).toLocaleString()}, ` +
            `Required: ₱${principalAmount.toLocaleString()}). Members must deposit capital first before loans can be released.`,
        };
      }

      // Deduct from treasury
      await tx.businessLedger.create({
        data: {
          transaction_id: transId,
          account_id: treasuryAccount.id,
          tenant_id: targetTenantId,
          debit: 0,
          credit: principalAmount,
          description: `Loan disbursement #${loan.loan_reference}`,
          loan_id: loanId,
          created_by: session.user.user_id,
          metadata: { source: "loan_release", transactionId: transId },
        },
      });

      // Credit the member's wallet with the loan amount
      const memberWallet = await tx.savingsAccount.findFirst({
        where: { user_id: loan.user_id, account_type: AccountType.personal_wallet },
      });

      if (memberWallet) {
        await tx.savingsAccount.update({
          where: { account_id: memberWallet.account_id },
          data: { balance: { increment: principalAmount } },
        });
        await tx.savingsTransaction.create({
          data: {
            account_id: memberWallet.account_id,
            tenant_id: targetTenantId,
            transaction_type: TransactionType.deposit,
            amount: principalAmount,
            reference: transId,
            processed_by: session.user.user_id,
            issue_notes: `Loan disbursement for #${loan.loan_reference}`,
          },
        });
      }

      // Update loan status to active
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
        principalAmount: principalAmount,
        totalInterest: Number(loan.interest_applied),
        processingFee: Number(loan.fees_applied),
        frequency: loan.repayment_frequency,
      });

      await tx.loanSchedule.createMany({
        data: schedules.map((s) => ({ ...s, tenant_id: targetTenantId })),
      });

      // 5. Post Ledger Entries (Double Entry)
      await postLedgerEntry(tx, {
        tenantId: targetTenantId,
        loanId,
        description: `Loan Released: #${loan.loan_reference}. Funded from tenant treasury.`,
        createdBy: session.user.user_id,
        metadata: { source: "loan_release", transactionId: transId },
        entries: [
          {
            accountCode: "LOAN_RECEIVABLES",
            debit: principalAmount,
            credit: 0,
          },
          {
            accountCode: "CASH_EQUIVALENTS",
            debit: 0,
            credit: principalAmount,
          },
        ],
      });

      return { success: "Loan funds released successfully." };
    });

    if (result.error) return result;

    await createNotification({
      userId: loan.user_id,
      tenantId: targetTenantId,
      type: "loan_disbursed",
      title: "Loan Funds Released",
      body: `Your loan #${loanId} funds of ₱${Number(loan.principal_amount).toLocaleString()} have been released.`,
      actionUrl: `/member/loans/${loanId}`,
    });

    revalidatePath("/agapay-tanaw");
    return { success: "Loan funds released successfully." };
  } catch (error) {
    console.error("releaseLoanFunds failed:", error);
    return {
      error:
        "Failed to release the loan. The ledger entry may have failed — please verify that all ledger accounts are configured and the tenant is active. If the problem continues, contact support.",
    };
  }
}

export async function submitMockRepayment(
  input: z.infer<typeof SubmitPaymentSchema>,
) {
  try {
    const { loanId, amount, methodId } = SubmitPaymentSchema.parse(input);
    const session = await requireAuthenticatedSession();
    const tenantId = session.user.tenantId;

    if (!tenantId)
      return {
        error:
          "Tenant context required. Please select or switch to your cooperative tenant first.",
      };

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      const loan = await tx.loan.findUnique({
        where: { loan_id: loanId },
      });

      if (!loan || loan.user_id !== session.user.user_id) {
        return {
          error:
            "This action is only available for members. Please log in with a member account to submit repayments.",
        };
      }

      if (loan.status !== "active") {
        return {
          error:
            "No active loan found for this transaction. Check your loan status in My Loans to verify.",
        };
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

      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
      return serializeDecimal({
        success: "Repayment submitted successfully.",
        payment,
      });
    });
  } catch (error) {
    console.error("submitMockRepayment failed:", error);
    return {
      error:
        "Failed to process repayment. The payment method may be invalid or the loan is not active. Please check the payment method and loan status, then try again.",
    };
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

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      const loan = await tx.loan.findUnique({
        where: { loan_id: loanId },
        include: {
          schedules: { orderBy: { installment_number: "asc" } },
          approver: { select: { user_id: true } },
        },
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
      const fullPayment = await tx.payment.create({
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

      // 6. Credit operator wallet (The user who funded the loan)
      if (loan.approved_by) {
        const operatorWallet = await tx.savingsAccount.findFirst({
          where: {
            user_id: loan.approved_by,
            account_type: AccountType.personal_wallet,
          },
        });

        if (operatorWallet) {
          await tx.savingsAccount.update({
            where: { account_id: operatorWallet.account_id },
            data: { balance: { increment: remainingPrincipal } },
          });

          const creditTransRef = `FULL-CREDIT-${fullPayment.payment_id}-${Date.now()}`;
          await tx.savingsTransaction.create({
            data: {
              account_id: operatorWallet.account_id,
              tenant_id: tenantId,
              transaction_type: TransactionType.deposit,
              amount: remainingPrincipal,
              reference: creditTransRef,
              processed_by: session.user.user_id,
              issue_notes: `Loan full-payment credit from #${loan.loan_reference}`,
            },
          });
        }
      }

      // Post ledger entries for financial integrity
      const totalFaceValue = unpaidSchedules.reduce(
        (sum: number, s: any) => sum + Number(s.total_due),
        0,
      );
      const waivedInterest = totalFaceValue - remainingPrincipal;

      await postLedgerEntry(tx, {
        tenantId,
        description: `Full Loan Settlement (Interest Waived): LOAN-${loanId}`,
        createdBy: session.user.user_id,
        loanId: loanId,
        metadata: {
          source: "full_settlement",
          paymentId: fullPayment.payment_id,
        },
        entries: [
          {
            accountCode: "CASH_EQUIVALENTS",
            debit: remainingPrincipal,
            credit: 0,
          },
          {
            accountCode: "INTEREST_DISCOUNTS", // New account code for waivers
            debit: waivedInterest,
            credit: 0,
          },
          {
            accountCode: "LOAN_RECEIVABLES",
            debit: 0,
            credit: totalFaceValue,
          },
        ],
      });

      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
      return {
        success: `Full payment processed successfully. You paid ₱${remainingPrincipal.toLocaleString()} (remaining interest waived as full-payment discount).`,
      };
    });
  } catch (error) {
    console.error("processFullPayment failed:", error);
    return {
      error:
        "Failed to process full payment. The loan balance or schedules may have changed. Please refresh the page and verify the remaining balance before retrying.",
    };
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

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      const payment = await tx.payment.findUnique({
        where: { payment_id: paymentId },
        include: {
          loan: {
            select: {
              user_id: true,
              tenant_id: true,
              approved_by: true,
              loan_reference: true,
              loan_id: true,
            },
          },
        },
      });

      if (!payment) {
        return { error: "Payment record not found." };
      }

      const loanOwnerId = payment.loan.user_id;
      const loanTenantId = payment.loan.tenant_id;

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
          // Partial payment: amount is insufficient for this installment, stop here
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
          data: { status: "paid", paid_at: new Date() },
        });
      }

      // 6. Credit tenant treasury (CASH_EQUIVALENTS)
      const treasuryAcct = await tx.ledgerAccount.findFirst({
        where: { code: "CASH_EQUIVALENTS", tenant_id: { in: [tenantId, null] } },
        orderBy: { tenant_id: "desc" },
      });
      if (treasuryAcct) {
        await tx.businessLedger.create({
          data: {
            transaction_id: `REPAY-${payment.payment_id}-${Date.now()}`,
            account_id: treasuryAcct.id,
            tenant_id: tenantId,
            debit: payment.amount_paid,
            credit: 0,
            description: `Loan repayment from #${payment.loan.loan_reference}`,
            loan_id: payment.loan_id,
            created_by: session.user.user_id,
            metadata: { source: "repayment_credit" },
          },
        });
      }

      // Notify member of verified payment
      try {
        await tx.notification.create({
          data: {
            user_id: payment.loan.user_id,
            tenant_id: tenantId,
            type: "repayment_received",
            title: "Payment Verified",
            body: `Your payment of ₱${Number(payment.amount_paid).toLocaleString()} for #${payment.loan.loan_reference} has been verified.`,
          },
        });
      } catch {}

      // Post ledger entries
      await postLedgerEntry(tx, {
        tenantId,
        description: `Loan Repayment Verified: ${payment.payment_reference}`,
        createdBy: session.user.user_id,
        loanId: payment.loan_id,
        metadata: {
          source: "repayment_verification",
          paymentId: payment.payment_id,
        },
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

      // After full payment: recalculate trust score and notify the member
      if (updatedLoan && Number(updatedLoan.balance_remaining) <= 0) {
        // Recalculate trust score (non-blocking)
        try {
          await refreshUserReputation(loanOwnerId);
        } catch (reputationError) {
          console.error(
            "Failed to refresh reputation after loan closure:",
            reputationError,
          );
        }

        // Notify the member
        try {
          await createNotification({
            userId: loanOwnerId,
            tenantId: loanTenantId,
            type: NotificationType.loan_paid,
            title: "Loan Fully Paid",
            body: "Congratulations! Your loan has been fully paid. Your trust score has been updated.",
            actionUrl: "/agapay-pintig?tab=loans",
          });
        } catch (notifyError) {
          console.error("Failed to send loan paid notification:", notifyError);
        }
      }

      // Notify member that payment was verified
      try {
        await createNotification({
          userId: loanOwnerId,
          tenantId: loanTenantId,
          type: NotificationType.repayment_received,
          title: "Payment Verified",
          body: `Your payment of ₱${Number(payment.amount_paid).toLocaleString()} has been verified.`,
          actionUrl: "/agapay-pintig?tab=loans",
        });
      } catch (notifyError) {
        console.error(
          "Failed to send payment verification notification:",
          notifyError,
        );
      }

      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
      revalidatePath("/agapay-tanaw", "layout");
      return { success: "Payment verified successfully." };
    });
  } catch (error: any) {
    console.error("verifySubmittedPayment failed:", error);
    const detail = error?.message || error?.meta?.cause || "";
    return {
      error: `Failed to verify repayment. ${detail || "The payment record or loan schedules may be in an unexpected state. Please check that the payment is still pending and the loan is active."}`,
    };
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

    return await prisma.$withTenant(tenantId, async (tx: any) => {
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

      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
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

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      return serializeDecimal(
        await tx.businessLedger.findMany({
          where: {
            loan_id: loanId,
            account: {
              code: "LOAN_RECEIVABLES",
            },
          },
          orderBy: {
            created_at: "desc",
          },
        }),
      );
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

  return await prisma.$withTenant(tenantId, async (tx: any) => {
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

export async function markLoanAsPaid(loanId: number) {
  try {
    const session = await requireAdminSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return { error: "Tenant context required." };

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      const loan = await tx.loan.findUnique({ where: { loan_id: loanId } });

      if (!loan) return { error: "Loan not found." };
      if (loan.status === "paid")
        return { error: "Loan is already marked as paid." };

      // Mark all unpaid schedules as paid
      await tx.loanSchedule.updateMany({
        where: { loan_id: loanId, status: { in: ["pending", "overdue"] } },
        data: { status: ScheduleStatus.paid, paid_at: new Date() },
      });

      // Update loan
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          status: "paid",
          paid_at: new Date(),
          balance_remaining: 0,
        },
      });

      // Post ledger entry for zero-sum closure
      const totalOutstanding = Number(loan.balance_remaining);
      if (totalOutstanding > 0) {
        await postLedgerEntry(tx, {
          tenantId,
          description: `Manual Loan Closure: LOAN-${loanId}`,
          createdBy: session.user.user_id,
          loanId,
          metadata: { source: "manual_closure" },
          entries: [
            {
              accountCode: "CASH_EQUIVALENTS",
              debit: totalOutstanding,
              credit: 0,
            },
            {
              accountCode: "LOAN_RECEIVABLES",
              debit: 0,
              credit: totalOutstanding,
            },
          ],
        });
      }

      // Recalculate trust score
      try {
        await refreshUserReputation(loan.user_id);
      } catch (reputationError) {
        console.error(
          "Failed to refresh reputation after manual loan closure:",
          reputationError,
        );
      }

      // Notify member
      try {
        await createNotification({
          userId: loan.user_id,
          tenantId: loan.tenant_id,
          type: NotificationType.loan_paid,
          title: "Loan Marked as Paid",
          body: "Your loan has been marked as fully paid by the cooperative. Your trust score has been updated.",
          actionUrl: "/agapay-pintig?tab=loans",
        });
      } catch (notifyError) {
        console.error("Failed to send loan closure notification:", notifyError);
      }

      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
      return { success: "Loan marked as paid successfully." };
    });
  } catch (error) {
    console.error("markLoanAsPaid failed:", error);
    return { error: "Failed to mark loan as paid. Please try again." };
  }
}

const UpdateScheduleSchema = z.object({
  scheduleId: z.number().int().positive(),
  dueDate: z.string().optional(),
  totalDue: z.number().positive().optional(),
  status: z.enum(["pending", "paid", "overdue", "forgiven", "restructured"]).optional(),
  principalAmount: z.number().positive().optional(),
  interestAmount: z.number().min(0).optional(),
});

export async function updateLoanSchedule(
  input: z.infer<typeof UpdateScheduleSchema>,
) {
  try {
    const data = UpdateScheduleSchema.parse(input);
    const session = await requireAdminSession();
    const tenantId = session.user.tenantId;

    if (!tenantId) return { error: "Tenant context required." };

    return await prisma.$withTenant(tenantId, async (tx: any) => {
      const schedule = await tx.loanSchedule.findUnique({
        where: { schedule_id: data.scheduleId },
        include: { loan: { select: { loan_id: true, loan_reference: true } } },
      });

      if (!schedule) return { error: "Schedule not found." };

      const updateData: Record<string, any> = {};
      if (data.dueDate !== undefined) updateData.due_date = new Date(data.dueDate);
      if (data.totalDue !== undefined) updateData.total_due = data.totalDue;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.principalAmount !== undefined) updateData.principal_amount = data.principalAmount;
      if (data.interestAmount !== undefined) updateData.interest_amount = data.interestAmount;

      if (Object.keys(updateData).length === 0) {
        return { error: "No fields to update." };
      }

      await tx.loanSchedule.update({
        where: { schedule_id: data.scheduleId },
        data: updateData,
      });

      // Recalculate loan balance_remaining from schedules
      const schedules = await tx.loanSchedule.findMany({
        where: { loan_id: schedule.loan_id },
      });
      const newBalance = schedules
        .filter((s: any) => s.status === "pending" || s.status === "overdue")
        .reduce((sum: number, s: any) => sum + Number(s.total_due), 0);

      await tx.loan.update({
        where: { loan_id: schedule.loan_id },
        data: { balance_remaining: newBalance },
      });

      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: session.user.user_id,
          action: "SCHEDULE_UPDATED",
          entity_type: "LoanSchedule",
          entity_id: data.scheduleId,
          new_values: updateData,
          module: "loan",
        },
      });

      revalidatePath("/agapay-tanaw");
      revalidatePath("/agapay-pintig");
      return { success: `Installment #${schedule.installment_number} updated.` };
    });
  } catch (error) {
    console.error("updateLoanSchedule failed:", error);
    return { error: "Failed to update schedule. Please check the values and try again." };
  }
}

export async function closeLoan(loanId: number) {
  return markLoanAsPaid(loanId);
}
