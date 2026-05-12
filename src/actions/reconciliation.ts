"use server";

import prisma from "@/lib/prisma";
import { requireTanawSession } from "@/lib/authorization";

export async function getEndOfDayReconciliation(
  dateCursor?: string,
  overrideTenantId?: number,
) {
  const session = await requireTanawSession();
  const tenantId = overrideTenantId || session.user.tenantId;

  if (!tenantId && session.user.role !== "superadmin") {
    throw new Error("Unauthorized context");
  }

  // Use today if no date provided
  const targetDate = dateCursor ? new Date(dateCursor) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const queryFn = async (db: any) => {
    // 1. Gather all Disbursed Loans today
    const loansDisbursed = await db.loan.findMany({
      where: {
        status: "active",
        approved_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: { principal_amount: true, loan_reference: true },
    });

    const totalDisbursed = loansDisbursed.reduce(
      (sum: number, loan: any) => sum + Number(loan.principal_amount),
      0,
    );

    // 2. Gather all Verified Payments today
    const paymentsVerified = await db.payment.findMany({
      where: {
        status: "verified",
        verified_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: { amount_paid: true, payment_reference: true },
    });

    const totalCollected = paymentsVerified.reduce(
      (sum: number, payment: any) => sum + Number(payment.amount_paid),
      0,
    );

    // 3. Ledger Sanity Check (Debits vs Credits today for the tenant)
    const ledgerEntries = await db.businessLedger.findMany({
      where: {
        created_at: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: { debit: true, credit: true },
    });

    const totalLedgerDebits = ledgerEntries.reduce(
      (sum: number, entry: any) => sum + Number(entry.debit),
      0,
    );
    const totalLedgerCredits = ledgerEntries.reduce(
      (sum: number, entry: any) => sum + Number(entry.credit),
      0,
    );

    const isLedgerBalanced =
      Math.abs(totalLedgerDebits - totalLedgerCredits) <= 0.01;

    // 4. Tenant Wallet Checks (Total Active Savings Accounts)
    const tenantSavings = await db.savingsAccount.findMany({
      select: { balance: true },
    });

    const totalTenantSavings = tenantSavings.reduce(
      (sum: number, savings: any) => sum + Number(savings.balance),
      0,
    );

    // 5. Master Pulse Check: Treasury (Asset) vs. User Wallets (Liability)
    const treasuryAccount = await db.ledgerAccount.findFirst({
      where: { code: "CASH_EQUIVALENTS" },
    });

    const treasuryEntries = treasuryAccount
      ? await db.businessLedger.findMany({
          where: { account_id: treasuryAccount.id },
          select: { debit: true, credit: true },
        })
      : [];

    const totalTreasuryBalance = treasuryEntries.reduce(
      (sum: number, e: any) => sum + Number(e.debit) - Number(e.credit),
      0,
    );

    const imbalance = Math.abs(totalTreasuryBalance - totalTenantSavings);
    const isTreasuryHealthy = imbalance <= 0.01;

    return {
      targetDate,
      totalDisbursed,
      disbursedCount: loansDisbursed.length,
      totalCollected,
      collectedCount: paymentsVerified.length,
      ledger: {
        totalDebits: totalLedgerDebits,
        totalCredits: totalLedgerCredits,
        isBalanced: isLedgerBalanced,
      },
      holdings: {
        totalTenantSavings,
        totalTreasuryBalance,
        imbalance,
        isTreasuryHealthy,
      },
    };
  };
  return await prisma.$withTenant(tenantId!, async (tx) => {
    return await queryFn(tx);
  });
}

export async function resolveAndSignEndOfDay(reason?: string) {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    throw new Error("EOD sign-off requires a tenant context.");
  }

  return await prisma.$withTenant(tenantId, async (tx) => {
    const eodData = await getEndOfDayReconciliation(undefined, tenantId);

    // If healthy and balanced, we just sign off.
    if (eodData.holdings.isTreasuryHealthy && eodData.ledger.isBalanced) {
      await tx.auditLog.create({
        data: {
          tenant_id: tenantId,
          user_id: Number(session.user.id),
          action: "EOD_SIGN_OFF",
          entity_type: "RECONCILIATION",
          new_values: { status: "BALANCED" } as any,
        },
      });
      return { success: true, adjusted: false };
    }

    // Imbalance scenario
    if (!reason || reason.trim() === "") {
      throw new Error(
        "An imbalance was detected. You must provide a reason for the discrepancy to generate an adjusting entry.",
      );
    }

    if (!eodData.holdings.isTreasuryHealthy) {
      const treasuryAccount = await tx.ledgerAccount.findFirst({
        where: { code: "CASH_EQUIVALENTS" },
      });

      if (!treasuryAccount) throw new Error("Missing treasury account.");

      let discrepancyAccount = await tx.ledgerAccount.findFirst({
        where: { code: "RECONC_DISCREPANCY" },
      });

      if (!discrepancyAccount) {
        discrepancyAccount = await tx.ledgerAccount.create({
          data: {
            name: "Reconciliation Discrepancy",
            code: "RECONC_DISCREPANCY",
            type: "EXPENSE",
            tenant_id: tenantId,
          },
        });
      }

      const diff =
        Number(eodData.holdings.totalTenantSavings) -
        Number(eodData.holdings.totalTreasuryBalance);
      const transactionId = crypto.randomUUID();

      const entries: Array<{
        transaction_id: string;
        accountId: number;
        tenant_id: number;
        debit: number;
        credit: number;
        description: string;
        created_by: number;
      }> = [];
      if (diff > 0) {
        entries.push({
          transaction_id: transactionId,
          accountId: treasuryAccount.id,
          tenant_id: tenantId,
          debit: diff,
          credit: 0,
          description: `EOD Adjustment: ${reason}`,
          created_by: Number(session.user.id),
        });
        entries.push({
          transaction_id: transactionId,
          accountId: discrepancyAccount.id,
          tenant_id: tenantId,
          debit: 0,
          credit: diff,
          description: `EOD Adjustment: ${reason}`,
          created_by: Number(session.user.id),
        });
      } else if (diff < 0) {
        const absDiff = Math.abs(diff);
        entries.push({
          transaction_id: transactionId,
          accountId: treasuryAccount.id,
          tenant_id: tenantId,
          debit: 0,
          credit: absDiff,
          description: `EOD Adjustment: ${reason}`,
          created_by: Number(session.user.id),
        });
        entries.push({
          transaction_id: transactionId,
          accountId: discrepancyAccount.id,
          tenant_id: tenantId,
          debit: absDiff,
          credit: 0,
          description: `EOD Adjustment: ${reason}`,
          created_by: Number(session.user.id),
        });
      }

      if (entries.length > 0) {
        for (const entry of entries) {
          await tx.businessLedger.create({
            data: {
              transaction_id: entry.transaction_id,
              account: { connect: { id: entry.accountId } },
              tenant_id: entry.tenant_id,
              debit: entry.debit,
              credit: entry.credit,
              description: entry.description,
              created_by: entry.created_by,
            },
          });
        }
      }
    }

    await tx.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: Number(session.user.id),
        action: "EOD_SIGN_OFF_WITH_ADJUSTMENT",
        entity_type: "RECONCILIATION",
        new_values: { status: "ADJUSTED", reason: reason } as any,
      },
    });

    return { success: true, adjusted: true };
  });
}

export async function exportReconciliationCSV(
  dateCursor?: string,
  overrideTenantId?: number,
) {
  const data = await getEndOfDayReconciliation(dateCursor, overrideTenantId);
  const rows = [
    ["Metric", "Value"],
    ["Target Date", data.targetDate.toISOString().split("T")[0]],
    ["Total Disbursed", data.totalDisbursed.toString()],
    ["Disbursed Count", data.disbursedCount.toString()],
    ["Total Collected", data.totalCollected.toString()],
    ["Collected Count", data.collectedCount.toString()],
    ["Ledger Debits", data.ledger.totalDebits.toString()],
    ["Ledger Credits", data.ledger.totalCredits.toString()],
    ["Ledger Balanced", data.ledger.isBalanced.toString()],
    ["Member Savings Total", data.holdings.totalTenantSavings.toString()],
    ["Treasury Balance", data.holdings.totalTreasuryBalance.toString()],
    ["Imbalance", data.holdings.imbalance.toString()],
    ["Treasury Healthy", data.holdings.isTreasuryHealthy.toString()],
  ];
  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const filename = `reconciliation-${data.targetDate.toISOString().split("T")[0]}.csv`;
  return { success: true, data: { filename, content: csvContent } };
}
