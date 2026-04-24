"use server";

import prisma from "@/lib/prisma";
import { requireAuthenticatedSession } from "@/lib/authorization";
import { revalidatePath } from "next/cache";
import { Prisma, ScheduleStatus } from "@prisma/client";
import { postLedgerEntry } from "./ledger";

const PERSONAL_WALLET = "personal_wallet";

export async function getMemberWallets() {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;

  const accounts = await prisma.savingsAccount.findMany({
    where: {
      user_id: userId,
      tenant_id: session.user.tenantId || undefined,
    },
    orderBy: {
      account_type: "asc",
    },
  });

  return accounts;
}

export async function depositToWallet(amount: number) {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (amount <= 0) return { error: "Amount must be positive." };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Ensure wallet exists
      let wallet = await tx.savingsAccount.findFirst({
        where: {
          user_id: userId,
          tenant_id: tenantId || undefined,
          account_type: PERSONAL_WALLET as any,
        },
      });

      if (!wallet) {
        wallet = await tx.savingsAccount.create({
          data: {
            user_id: userId,
            tenant_id: tenantId!,
            account_type: PERSONAL_WALLET as any,
            balance: 0,
          },
        });
      }

      // 2. Update balance
      await tx.savingsAccount.update({
        where: { account_id: wallet.account_id },
        data: {
          balance: { increment: new Prisma.Decimal(amount) },
        },
      });

      // 3. Create transaction record
      await tx.savingsTransaction.create({
        data: {
          account_id: wallet.account_id,
          transaction_type: "deposit" as any,
          amount: new Prisma.Decimal(amount),
          reference: `DEP-W-${Date.now()}`,
          processed_by: userId,
        },
      });
    });

    revalidatePath("/agapay-pintig");
    return { success: "Naideposito na ang pondo sa iyong wallet." };
  } catch (error) {
    console.error("depositToWallet failed:", error);
    return { error: "Hindi maideposito ang pondo." };
  }
}

export async function getWalletTransactions() {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;

  const transactions = await prisma.savingsTransaction.findMany({
    where: {
      account: {
        user_id: userId,
        tenant_id: session.user.tenantId || undefined,
      },
    },
    include: {
      account: true,
    },
    orderBy: {
      processed_at: "desc",
    },
    take: 10,
  });

  return transactions;
}

export async function payLoanWithWallet(loanId: number, amount: number) {
  const session = await requireAuthenticatedSession();
  const userId = session.user.user_id;
  const tenantId = session.user.tenantId;

  if (amount <= 0) return { error: "Halaga ay dapat positibo." };

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get wallet
      const wallet = await tx.savingsAccount.findFirst({
        where: {
          user_id: userId,
          tenant_id: tenantId || undefined,
          account_type: PERSONAL_WALLET as any,
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
          transaction_type: "withdrawal" as any,
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

      return { success: true };
    });

    revalidatePath("/agapay-pintig");
    return { success: "Matagumpay na nakapagbayad gamit ang iyong wallet." };
  } catch (error: any) {
    console.error("payLoanWithWallet failed:", error);
    return {
      error: error.message || "Hindi maiproseso ang bayad gamit ang wallet.",
    };
  }
}
