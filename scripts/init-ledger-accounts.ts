import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initializing missing ledger accounts (System-Wide)...");

  const requiredAccounts = [
    {
      code: "CASH_EQUIVALENTS",
      name: "Cash and Cash Equivalents",
      type: "ASSET",
    },
    {
      code: "MEMBER_SAVINGS",
      name: "Member Savings Deposits",
      type: "LIABILITY",
    },
    { code: "LOAN_RECEIVABLES", name: "Loan Receivables", type: "ASSET" },
    { code: "INTEREST_INCOME", name: "Interest Income", type: "REVENUE" },
    {
      code: "RECONC_DISCREPANCY",
      name: "Reconciliation Discrepancy",
      type: "EXPENSE",
    },
  ];

  for (const req of requiredAccounts) {
    const existing = await prisma.ledgerAccount.findUnique({
      where: { code: req.code },
    });

    if (!existing) {
      await prisma.ledgerAccount.create({
        data: {
          code: req.code,
          name: req.name,
          type: req.type as any,
          tenant_id: null,
        },
      });
      console.log(`  ✅ Created: ${req.code}`);
    } else {
      console.log(`  - Exists: ${req.code}`);
    }
  }

  console.log("\n✅ Ledger account initialization complete!");
}

main()
  .catch((e) => {
    console.error("❌ Initialization Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
