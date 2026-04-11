import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

// @ts-ignore - PrismaNeon takes a pool or config object
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Agapay Ecosystem Initialization v5 (TypeScript)...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Explicit Clean using Prisma ORM (respects @@map)
  console.log("🧹 Explicitly cleaning database...");
  await prisma.auditLog.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.loanGuarantee.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.loanProduct.deleteMany();
  await prisma.savingsTransaction.deleteMany();
  await prisma.savingsAccount.deleteMany();
  await prisma.socialVouch.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.tenantGroup.deleteMany();

  // 2. Global Federation
  const group = await prisma.tenantGroup.create({
    data: { name: "Agapay Cooperative Federation", reg_code: "AGP-FED-01" },
  });

  const hq = await prisma.tenant.create({
    data: { name: "Agapay HQ", slug: "agapay-hq", tenant_group_id: group.id },
  });

  const branch = await prisma.tenant.create({
    data: { name: "QC Central", slug: "agapay-qc", tenant_group_id: group.id },
  });

  // 3. Superadmin
  console.log("👑 Seeding Major Superadmin...");
  await prisma.user.create({
    data: {
      username: "superadmin",
      email: "superadmin@agapay.ph",
      password_hash: hashedPassword,
      role: "superadmin",
      tenant_id: hq.tenant_id,
      status: "active",
    },
  });

  // 4. Products
  const growthProduct = await prisma.loanProduct.create({
    data: {
      name: "Sari-Sari Growth",
      min_amount: 5000,
      max_amount: 50000,
      interest_rate_percent: 2.5,
      max_term_months: 12,
      tenant_id: branch.tenant_id,
    },
  });

  // 5. Members & Guarantor Network
  console.log("👥 Seeding Members (Standardized Member Codes)...");

  const genCode = (i: number) =>
    `AGP-2026-${String(1000 + i).padStart(4, "0")}`;

  const memberData = [
    {
      username: "elena",
      first: "Elena",
      last: "Santos",
      biz: "Elena's Bakery",
    },
    {
      username: "ricardo",
      first: "Ricardo",
      last: "Dalisay",
      biz: "Rick's Repair",
    },
    {
      username: "marina",
      first: "Marina",
      last: "Sumera",
      biz: "Marina's Sari-Sari",
    },
    { username: "juan", first: "Juan", last: "Luna", biz: "Luna Arts" },
  ];

  const userIds: Record<string, number> = {};
  for (let i = 0; i < memberData.length; i++) {
    const m = memberData[i];
    const user = await prisma.user.create({
      data: {
        username: m.username,
        email: `${m.username}@example.com`,
        password_hash: hashedPassword,
        role: "member",
        tenant_id: branch.tenant_id,
        status: "active",
        interest_tier: i === 0 ? "T3_2_PERCENT" : "T1_3_PERCENT",
        member_code: genCode(i),
        profile: {
          create: {
            first_name: m.first,
            last_name: m.last,
            business_name: m.biz,
            address: "Agapay Center",
          },
        },
      },
    });
    userIds[m.username] = user.user_id;
  }

  // 6. Loans & Social Vouching (Guarantors)
  console.log("🕸️ Interweaving Social Trust Graph...");

  // Elena is a high-trust member who vouches for Ricardo
  await prisma.socialVouch.create({
    data: {
      voucher_id: userIds.elena,
      vouchee_id: userIds.ricardo,
      score: 10,
      comment: "Strong community leader, highly recommended.",
    },
  });

  // Ricardo has an active loan
  const ricardoLoan = await prisma.loan.create({
    data: {
      loan_reference: "LN-2026-001",
      principal_amount: 20000,
      purpose: "Business Expansion",
      term_months: 6,
      interest_applied: 3000,
      total_payable: 23000,
      balance_remaining: 23000,
      status: "active",
      user_id: userIds.ricardo,
      tenant_id: branch.tenant_id,
      product_id: growthProduct.product_id,
    },
  });

  // Elena is the Guarantor (Liability Simulation)
  await prisma.loanGuarantee.create({
    data: {
      loan_id: ricardoLoan.loan_id,
      guarantor_id: userIds.elena,
      status: "vouched",
    },
  });

  console.log("✅ Seed v5 (TypeScript) Complete! Ecosystem active.");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
