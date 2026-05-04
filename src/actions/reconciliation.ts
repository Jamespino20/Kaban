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

  const tenantFilter = tenantId ? { tenant_id: tenantId } : {};
  const ledgerTenantFilter = tenantId
    ? { account: { tenant_id: tenantId } }
    : {};

  // 1. Gather all Disbursed Loans today
  const loansDisbursed = await prisma.loan.findMany({
    where: {
      ...tenantFilter,
      status: "active",
      approved_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { principal_amount: true, loan_reference: true },
  });

  const totalDisbursed = loansDisbursed.reduce(
    (sum, loan) => sum + Number(loan.principal_amount),
    0,
  );

  // 2. Gather all Verified Payments today
  const paymentsVerified = await prisma.payment.findMany({
    where: {
      loan: tenantFilter,
      status: "verified",
      verified_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { amount_paid: true, payment_reference: true },
  });

  const totalCollected = paymentsVerified.reduce(
    (sum, payment) => sum + Number(payment.amount_paid),
    0,
  );

  // 3. Ledger Sanity Check (Debits vs Credits today for the branch)
  const ledgerEntries = await prisma.businessLedger.findMany({
    where: {
      ...ledgerTenantFilter,
      created_at: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: { debit: true, credit: true },
  });

  const totalLedgerDebits = ledgerEntries.reduce(
    (sum, entry) => sum + Number(entry.debit),
    0,
  );
  const totalLedgerCredits = ledgerEntries.reduce(
    (sum, entry) => sum + Number(entry.credit),
    0,
  );

  // They should roughly balance if double-entry is strict, but since some accounts might be omitted
  // from our query depending on setup, we just return the raw totals.
  const isLedgerBalanced =
    totalLedgerDebits === totalLedgerCredits && totalLedgerDebits > 0;

  // 4. Branch Wallet Checks (Total Active Savings Accounts)
  const branchSavings = await prisma.savingsAccount.findMany({
    where: {
      ...tenantFilter,
    },
    select: { balance: true },
  });

  const totalBranchSavings = branchSavings.reduce(
    (sum, savings) => sum + Number(savings.balance),
    0,
  );

  // 5. Master Pulse Check: Treasury (Asset) vs. User Wallets (Liability)
  // Sum of all CASH_EQUIVALENTS for this branch/tenant
  const treasuryAccount = await prisma.ledgerAccount.findFirst({
    where: { code: "CASH_EQUIVALENTS", tenant_id: tenantId },
  });

  const treasuryEntries = treasuryAccount
    ? await prisma.businessLedger.findMany({
        where: { account_id: treasuryAccount.id },
        select: { debit: true, credit: true },
      })
    : [];

  const totalTreasuryBalance = treasuryEntries.reduce(
    (sum, e) => sum + Number(e.debit) - Number(e.credit),
    0,
  );

  const imbalance = Math.abs(totalTreasuryBalance - totalBranchSavings);
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
      totalBranchSavings,
      totalTreasuryBalance,
      imbalance,
      isTreasuryHealthy,
    },
  };
}

export async function resolveAndSignEndOfDay(reason?: string) {
  const session = await requireTanawSession();
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    throw new Error("EOD sign-off requires a branch context.");
  }

  const eodData = await getEndOfDayReconciliation(undefined, tenantId);

  // If healthy and balanced, we just sign off.
  if (eodData.holdings.isTreasuryHealthy && eodData.ledger.isBalanced) {
    await prisma.auditLog.create({
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
    const treasuryAccount = await prisma.ledgerAccount.findFirst({
      where: { code: "CASH_EQUIVALENTS", tenant_id: tenantId },
    });

    if (!treasuryAccount) throw new Error("Missing treasury account.");

    let discrepancyAccount = await prisma.ledgerAccount.findFirst({
      where: { code: "RECONC_DISCREPANCY", tenant_id: tenantId },
    });

    if (!discrepancyAccount) {
      discrepancyAccount = await prisma.ledgerAccount.create({
        data: {
          name: "Reconciliation Discrepancy",
          code: "RECONC_DISCREPANCY",
          type: "EXPENSE",
          tenant_id: tenantId,
        },
      });
    }

    const diff =
      Number(eodData.holdings.totalBranchSavings) -
      Number(eodData.holdings.totalTreasuryBalance);
    const transactionId = crypto.randomUUID();

    const entries = [];
    if (diff > 0) {
      entries.push({
        transaction_id: transactionId,
        account_id: treasuryAccount.id,
        debit: diff,
        credit: 0,
        description: `EOD Adjustment: ${reason}`,
        created_by: Number(session.user.id),
      });
      entries.push({
        transaction_id: transactionId,
        account_id: discrepancyAccount.id,
        debit: 0,
        credit: diff,
        description: `EOD Adjustment: ${reason}`,
        created_by: Number(session.user.id),
      });
    } else if (diff < 0) {
      const absDiff = Math.abs(diff);
      entries.push({
        transaction_id: transactionId,
        account_id: treasuryAccount.id,
        debit: 0,
        credit: absDiff,
        description: `EOD Adjustment: ${reason}`,
        created_by: Number(session.user.id),
      });
      entries.push({
        transaction_id: transactionId,
        account_id: discrepancyAccount.id,
        debit: absDiff,
        credit: 0,
        description: `EOD Adjustment: ${reason}`,
        created_by: Number(session.user.id),
      });
    }

    if (entries.length > 0) {
      await prisma.businessLedger.createMany({ data: entries });
    }
  }

  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: Number(session.user.id),
      action: "EOD_SIGN_OFF_WITH_ADJUSTMENT",
      entity_type: "RECONCILIATION",
      new_values: { status: "ADJUSTED", reason: reason } as any,
    },
  });

  return { success: true, adjusted: true };
}
