"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import {
  Prisma,
  ScheduleStatus,
  AccountType,
  TransactionType,
} from "@prisma/client";
import { postLedgerEntry } from "./ledger";
import { logInteraction } from "@/lib/analytics-logger";

const PERSONAL_WALLET = "personal_wallet";

export async function approveWalletTopUp(requestId: number) {
  const session = await requireAuthenticatedSession();
  const adminId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return { error: "Tenant context required." };

  try {
    return await prisma.$withTenant(tenantId, async (tx) => {
      // 1. Get request
      const request = await tx.topUpRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) return { error: "Request not found." };
      if (request.status !== "pending")
        return { error: "Request is not pending." };

      // 2. Mark approved
      await tx.topUpRequest.update({
        where: { id: requestId },
        data: {
          status: "verified",
          processed_at: new Date(),
          processed_by: adminId,
        },
      });

      // 3. Update or create wallet
      let wallet = await tx.savingsAccount.findFirst({
        where: {
          user_id: request.user_id,
          account_type: AccountType.personal_wallet,
        },
      });

      if (!wallet) {
        wallet = await tx.savingsAccount.create({
          data: {
            user_id: request.user_id,
            tenant_id: tenantId,
            account_type: AccountType.personal_wallet,
            balance: request.amount,
          },
        });
      } else {
        wallet = await tx.savingsAccount.update({
          where: { account_id: wallet.account_id },
          data: { balance: { increment: request.amount } },
        });
      }

      // 4. Log savings transaction
      const trans = await tx.savingsTransaction.create({
        data: {
          account_id: wallet.account_id,
          tenant_id: tenantId,
          transaction_type: TransactionType.deposit,
          amount: request.amount,
          reference: `TOPUP-${requestId}`,
          processed_by: adminId,
        },
      });

      // 5. Post Ledger Entry: DR Cash, CR Savings
      await postLedgerEntry(tx, {
        description: `Wallet Top-up Verified: Req #${requestId}`,
        createdBy: adminId,
        metadata: { source: "topup", transactionId: trans.transaction_id },
        entries: [
          {
            accountCode: "CASH_EQUIVALENTS",
            debit: Number(request.amount),
            credit: 0,
          },
          {
            accountCode: "MEMBER_SAVINGS",
            debit: 0,
            credit: Number(request.amount),
          },
        ],
      });

      revalidatePath("/agapay-tanaw");
      return { success: "Top-up request successfully approved." };
    });
  } catch (error) {
    console.error("approveWalletTopUp failed:", error);
    return { error: "Failed to approve top up." };
  }
}

export async function rejectWalletTopUp(requestId: number) {
  const session = await requireAuthenticatedSession();
  const adminId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return { error: "Tenant context required." };

  try {
    await prisma.$withTenant(tenantId, async (tx) => {
      await tx.topUpRequest.update({
        where: { id: requestId },
        data: {
          status: "rejected",
          processed_at: new Date(),
          processed_by: adminId,
        },
      });
    });
    revalidatePath("/agapay-tanaw");
    return { success: "Top-up request successfully rejected." };
  } catch (error) {
    console.error("rejectWalletTopUp failed:", error);
    return { error: "Failed to reject top up." };
  }
}

export async function getPendingTopUps() {
  const session = await requireAuthenticatedSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) return [];

  return await prisma.$withTenant(tenantId, async (tx) => {
    return await tx.topUpRequest.findMany({
      where: { status: "pending" },
      include: { user: { include: { profile: true } } },
      orderBy: { created_at: "asc" },
    });
  });
}

export async function getMemberWallets() {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return [];

  return await prisma.$withTenant(tenantId, async (tx) => {
    return await tx.savingsAccount.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        account_type: "asc",
      },
    });
  });
}

export async function requestWalletTopUp(amount: number, receiptUrl?: string) {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return { error: "Tenant context required." };
  if (amount <= 0)
    return { error: "Deposit amount must be greater than zero." };

  try {
    await prisma.$withTenant(tenantId, async (tx) => {
      await tx.topUpRequest.create({
        data: {
          tenant_id: tenantId,
          user_id: userId,
          amount: new Prisma.Decimal(amount),
          receipt_url: receiptUrl || null,
          status: "pending",
        },
      });
    });

    return {
      success:
        "Your top-up request has been successfully submitted. Please wait for admin approval.",
    };
  } catch (error) {
    console.error("requestWalletTopUp failed:", error);
    return { error: "Failed to process deposit request." };
  }
}

export async function payLoanWithWallet(loanId: number, amount: number) {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return { error: "Tenant context required." };
  if (amount <= 0)
    return { error: "Payment amount must be greater than zero." };

  try {
    await prisma.$withTenant(tenantId, async (tx) => {
      // 1. Get wallet
      const wallet = await tx.savingsAccount.findFirst({
        where: {
          user_id: userId,
          account_type: AccountType.personal_wallet,
        },
      });

      if (!wallet || Number(wallet.balance) < amount) {
        throw new Error("Kulang ang pondo sa iyong wallet.");
      }

      // 2. Deduct from wallet
      await tx.savingsAccount.update({
        where: { account_id: wallet.account_id },
        data: {
          balance: { decrement: new Prisma.Decimal(amount) },
        },
      });

      // 3. Create wallet debit transaction
      await tx.savingsTransaction.create({
        data: {
          account_id: wallet.account_id,
          tenant_id: tenantId,
          transaction_type: TransactionType.withdrawal,
          amount: new Prisma.Decimal(amount),
          reference: `LOAN-PAY-${loanId}-${Date.now()}`,
          processed_by: userId,
        },
      });

      // 4. Update Loan Schedules (Atomic payment)
      const schedules = await tx.loanSchedule.findMany({
        where: {
          loan_id: loanId,
          status: { in: [ScheduleStatus.pending, ScheduleStatus.overdue] },
        },
        orderBy: { installment_number: "asc" },
      });

      let remaining = amount;
      for (const schedule of schedules) {
        const scheduleDue = Number(schedule.total_due);
        if (remaining + 0.01 < scheduleDue) break;

        await tx.loanSchedule.update({
          where: { schedule_id: schedule.schedule_id },
          data: {
            status: ScheduleStatus.paid,
            paid_at: new Date(),
          },
        });
        remaining -= scheduleDue;
      }

      // 5. Update loan balance
      await tx.loan.update({
        where: { loan_id: loanId },
        data: {
          balance_remaining: {
            decrement: new Prisma.Decimal(amount - remaining),
          },
        },
      });

      // 6. Post Ledger Entry (Double-Entry truth)
      await postLedgerEntry(tx, {
        description: `Loan Repayment via Wallet: Loan #${loanId}`,
        createdBy: userId,
        loanId: loanId,
        metadata: { source: "wallet", walletId: wallet.account_id },
        entries: [
          {
            accountCode: "MEMBER_SAVINGS",
            debit: amount - remaining,
            credit: 0,
          },
          {
            accountCode: "LOAN_RECEIVABLES",
            debit: 0,
            credit: amount - remaining,
          },
        ],
      });
    });

    await logInteraction({
      eventType: "LOAN_PAYMENT_VIA_WALLET",
      tenantId,
      userId,
      metadata: { loanId, amount },
    });

    revalidatePath("/agapay-pintig");
    return { success: "Payment successful via e-wallet." };
  } catch (error) {
    console.error("payLoanWithWallet failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Unable to process payment via e-wallet.";
    return {
      error: message,
    };
  }
}

export async function getWalletTransactions() {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return [];

  const savingsAccount = await prisma.$withTenant(tenantId, async (tx) => {
    return await tx.savingsAccount.findFirst({
      where: {
        user_id: userId,
        account_type: AccountType.personal_wallet,
      },
      include: {
        transactions: {
          orderBy: { processed_at: "desc" },
          take: 50,
        },
      },
    });
  });

  if (!savingsAccount) {
    return [];
  }

  return savingsAccount.transactions.map((tx: any) => ({
    id: tx.transaction_id,
    type: tx.transaction_type,
    amount: tx.amount.toNumber(),
    reference: tx.reference,
    date: tx.processed_at,
  }));
}
export async function processPosTransaction(data: {
  targetUserId: number;
  type: "deposit" | "repayment";
  amount: number;
  reference: string;
  notes?: string;
}) {
  const session = await requireAuthenticatedSession();
  const operatorId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (!tenantId) return { error: "Tenant context required." };
  if (data.amount <= 0)
    return { error: "Transaction amount must be greater than zero." };

  try {
    return await prisma.$withTenant(tenantId, async (tx) => {
      if (data.type === "deposit") {
        // 1. Update or create wallet
        let wallet = await tx.savingsAccount.findFirst({
          where: {
            user_id: data.targetUserId,
            account_type: AccountType.personal_wallet,
          },
        });

        if (!wallet) {
          wallet = await tx.savingsAccount.create({
            data: {
              user_id: data.targetUserId,
              tenant_id: tenantId,
              account_type: AccountType.personal_wallet,
              balance: new Prisma.Decimal(data.amount),
            },
          });
        } else {
          wallet = await tx.savingsAccount.update({
            where: { account_id: wallet.account_id },
            data: { balance: { increment: new Prisma.Decimal(data.amount) } },
          });
        }

        // 2. Log savings transaction
        const trans = await tx.savingsTransaction.create({
          data: {
            account_id: wallet.account_id,
            tenant_id: tenantId,
            transaction_type: TransactionType.deposit,
            amount: new Prisma.Decimal(data.amount),
            reference: data.reference,
            processed_by: operatorId,
            issue_notes: data.notes || null,
          },
        });

        // 3. Ledger: DR Cash, CR Savings
        await postLedgerEntry(tx, {
          description: `POS Cash Deposit: ${data.reference}`,
          createdBy: operatorId,
          metadata: {
            source: "pos_deposit",
            transactionId: trans.transaction_id,
          },
          entries: [
            {
              accountCode: "CASH_EQUIVALENTS",
              debit: data.amount,
              credit: 0,
            },
            {
              accountCode: "MEMBER_SAVINGS",
              debit: 0,
              credit: data.amount,
            },
          ],
        });
      } else {
        // REPAYMENT LOGIC (Simplified for POS)
        const loan = await tx.loan.findFirst({
          where: {
            user_id: data.targetUserId,
            status: "active",
          },
          orderBy: { created_at: "desc" },
        });

        if (!loan) throw new Error("Walang active na loan ang member na ito.");

        const amountToApply = Math.min(
          data.amount,
          Number(loan.balance_remaining),
        );

        // Update Loan Schedules
        const schedules = await tx.loanSchedule.findMany({
          where: {
            loan_id: loan.loan_id,
            status: { in: [ScheduleStatus.pending, ScheduleStatus.overdue] },
          },
          orderBy: { installment_number: "asc" },
        });

        let remaining = amountToApply;
        for (const schedule of schedules) {
          const scheduleDue = Number(schedule.total_due);
          if (remaining + 0.01 < scheduleDue) break;

          await tx.loanSchedule.update({
            where: { schedule_id: schedule.schedule_id },
            data: {
              status: ScheduleStatus.paid,
              paid_at: new Date(),
            },
          });
          remaining -= scheduleDue;
        }

        // Update loan balance
        await tx.loan.update({
          where: { loan_id: loan.loan_id },
          data: {
            balance_remaining: {
              decrement: new Prisma.Decimal(amountToApply - remaining),
            },
          },
        });

        // Ledger: DR Cash, CR Loan Receivables
        await postLedgerEntry(tx, {
          description: `POS Cash Repayment: ${data.reference}`,
          createdBy: operatorId,
          loanId: loan.loan_id,
          metadata: { source: "pos_repayment", reference: data.reference },
          entries: [
            {
              accountCode: "CASH_EQUIVALENTS",
              debit: amountToApply - remaining,
              credit: 0,
            },
            {
              accountCode: "LOAN_RECEIVABLES",
              debit: 0,
              credit: amountToApply - remaining,
            },
          ],
        });
      }

      revalidatePath("/agapay-tanaw");
      return { success: "POS Transaction successfully processed." };
    });
  } catch (error) {
    console.error("processPosTransaction failed:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process POS transaction.",
    };
  }
}
