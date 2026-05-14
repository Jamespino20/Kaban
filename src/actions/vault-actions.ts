"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { Prisma } from "@prisma/client";
const { Decimal } = Prisma;

export async function getCapitalOversight() {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  if (!tenantId) throw new Error("Unauthorized: Tenant context required");

  // Fetch aggregated balances for Share Capital and Regular Savings
  const balances = (await sql`
    SELECT 
      account_type,
      SUM(balance) as total_balance,
      COUNT(account_id) as member_count
    FROM savings_accounts
    WHERE tenant_id = ${tenantId}
    GROUP BY account_type
  `) as any[];

  const shareCapital = balances.find(
    (b) => b.account_type === "share_capital",
  ) || { total_balance: 0, member_count: 0 };
  const regularSavings = balances.find(
    (b) => b.account_type === "regular_savings",
  ) || { total_balance: 0, member_count: 0 };

  return {
    shareCapital: {
      total: Number(shareCapital.total_balance),
      count: Number(shareCapital.member_count),
    },
    regularSavings: {
      total: Number(regularSavings.total_balance),
      count: Number(regularSavings.member_count),
    },
    totalLiquidAssets:
      Number(shareCapital.total_balance) + Number(regularSavings.total_balance),
  };
}

export async function recordCapitalTransaction(data: {
  amount: number;
  type: "share_capital" | "regular_savings";
  direction: "invest" | "withdraw";
  description: string;
}) {
  const session = await auth();
  const tenantId = session?.user?.tenantId;
  const userId = session?.user?.id;
  if (!tenantId || !userId) throw new Error("Unauthorized");

  const amount = new Decimal(data.amount);
  const multiplier = data.direction === "invest" ? 1 : -1;

  // 1. Transactionally update the owner's account and record in ledger
  // In a cooperative Microfinance SaaS, 'Operator Vault' usually manages the COOP's own capital
  // or the operator's personal stake in the pool.

  return await prisma.$transaction(
    async (tx: {
      savingsAccount: {
        findFirst: (arg0: {
          where: {
            tenant_id: any;
            user_id: number;
            account_type: "share_capital" | "regular_savings";
          };
        }) => any;
        create: (arg0: {
          data: {
            tenant_id: any;
            user_id: number;
            account_type: "share_capital" | "regular_savings";
            balance: number;
          };
        }) => any;
        update: (arg0: {
          where: { account_id: any };
          data: { balance: Prisma.Decimal };
        }) => any;
      };
      savingsTransaction: {
        create: (arg0: {
          data: {
            account_id: any;
            tenant_id: any;
            amount: Prisma.Decimal;
            type: string;
            description: string;
            status: string;
            reference: string;
          };
        }) => any;
      };
      ledgerAccount: {
        findFirst: (arg0: { where: { tenant_id: any; code: string } }) => any;
        create: (arg0: {
          data: { tenant_id: any; name: string; code: string; type: string };
        }) => any;
      };
      businessLedger: {
        create: (arg0: {
          data: {
            tenant_id: any;
            account_id: any;
            debit: number | Prisma.Decimal;
            credit: number | Prisma.Decimal;
            description: string;
            source_module: string;
            source_reference: any;
            created_by: number;
          };
        }) => any;
      };
    }) => {
      // Find or create the operator's own savings account for this type
      let account = await tx.savingsAccount.findFirst({
        where: {
          tenant_id: tenantId,
          user_id: Number(userId),
          account_type: data.type,
        },
      });

      if (!account) {
        account = await tx.savingsAccount.create({
          data: {
            tenant_id: tenantId,
            user_id: Number(userId),
            account_type: data.type,
            balance: 0,
          },
        });
      }

      // Update balance
      const newBalance = new Decimal(account.balance).add(
        amount.mul(multiplier),
      );
      if (newBalance.lt(0)) {
        throw new Error("Insufficient funds for withdrawal");
      }

      await tx.savingsAccount.update({
        where: { account_id: account.account_id },
        data: { balance: newBalance },
      });

      // Record in SavingsTransaction
      const st = await tx.savingsTransaction.create({
        data: {
          account_id: account.account_id,
          tenant_id: tenantId,
          amount: amount.mul(multiplier),
          type: data.direction === "invest" ? "deposit" : "withdrawal",
          description: data.description,
          status: "completed",
          reference: `VAULT-${Date.now()}`,
        },
      });

      // Record in BusinessLedger for financial oversight
      // We need a LedgerAccount for 'Treasury' or 'Capital'
      let ledgerAccount = await tx.ledgerAccount.findFirst({
        where: {
          tenant_id: tenantId,
          code: data.type === "share_capital" ? "EQUITY-SC" : "LIAB-SAV",
        },
      });

      if (!ledgerAccount) {
        ledgerAccount = await tx.ledgerAccount.create({
          data: {
            tenant_id: tenantId,
            name:
              data.type === "share_capital"
                ? "Share Capital"
                : "Regular Savings",
            code: data.type === "share_capital" ? "EQUITY-SC" : "LIAB-SAV",
            type: data.type === "share_capital" ? "EQUITY" : "LIABILITY",
          },
        });
      }

      await tx.businessLedger.create({
        data: {
          tenant_id: tenantId,
          account_id: ledgerAccount.id,
          debit: data.direction === "invest" ? 0 : amount,
          credit: data.direction === "invest" ? amount : 0,
          description: `Vault ${data.direction}: ${data.description}`,
          source_module: "vault",
          source_reference: st.reference,
          created_by: Number(userId),
        },
      });

      return { success: true };
    },
  );
}
