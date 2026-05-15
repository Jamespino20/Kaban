"use server";

import { Prisma } from "@prisma/client";

/**
 * Atomic Utility for Double-Entry Ledger Posting
 * Must be called within a Prisma.$transaction to ensure integrity.
 */
export async function postLedgerEntry(
  tx: Prisma.TransactionClient,
  params: {
    tenantId: number;
    entries: {
      accountCode: string;
      debit: number;
      credit: number;
    }[];
    description: string;
    createdBy?: number;
    transactionId?: string; // Optional: specify a custom ID to link multi-account entries
    loanId?: number; // Optional: Link to a specific loan
    metadata?: Record<string, unknown>; // Optional: extra context
  },
) {
  const {
    tenantId,
    entries,
    description,
    createdBy,
    transactionId = undefined,
    loanId,
    metadata,
  } = params;

  // 1. Validate Zero-Sum Integrity (Assets = Liabilities + Equity)
  const totalDebits = entries.reduce((sum: number, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum: number, e) => sum + e.credit, 0);

  if (Math.abs(totalDebits - totalCredits) > 0.001) {
    throw new Error(
      `Double-Entry Violation: Debits (₱${totalDebits}) must equal Credits (₱${totalCredits}). Balance: ${totalDebits - totalCredits}`,
    );
  }

  // 2. Fetch Account IDs by Codes
  const accountCodes = entries.map((e) => e.accountCode);
  const accounts = await (tx as any).ledgerAccount.findMany({
    where: { code: { in: accountCodes } },
  });

  if (accounts.length < accountCodes.length) {
    const missing = accountCodes.filter(
      (code: string) =>
        !(accounts as { code: string }[]).find((a) => a.code === code),
    );
    throw new Error(
      `Ledger Error: Missing account codes: ${missing.join(", ")}`,
    );
  }

  // 3. Generate a Linking Transaction ID if not provided
  const linkId =
    transactionId ||
    `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 4. Record Entries
  const ledgerPromises = entries.map((entry) => {
    const account = (accounts as { id: number; code: string }[]).find(
      (a) => a.code === entry.accountCode,
    )!;
    const createData: Record<string, unknown> = {
      transaction_id: linkId,
      tenant: { connect: { tenant_id: tenantId } },
      account: { connect: { id: account.id } },
      debit: new Prisma.Decimal(entry.debit),
      credit: new Prisma.Decimal(entry.credit),
      description: description,
      metadata: metadata || undefined,
      created_by: createdBy,
    };
    if (loanId !== undefined) {
      createData.loan = { connect: { loan_id: loanId } };
    }
    return (tx as any).businessLedger.create({ data: createData });
  });

  await Promise.all(ledgerPromises);
  return linkId;
}
