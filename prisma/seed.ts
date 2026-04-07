import { PrismaClient } from "@prisma/client";
import { Role, UserStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.AGAPAYSTORAGE_DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.AGAPAYSTORAGE_DATABASE_URL ||
  process.env.AGAPAYSTORAGE_URL ||
  process.env.AGAPAYSTORAGE_PRISMA_URL;

const adapter = new PrismaNeon({
  connectionString,
});
const prisma = new PrismaClient({ adapter });

import fs from "fs";
import path from "path";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("Seeding started...");

  // --- 0. Core Ledger Accounts (Double-Entry Foundation) ---
  console.log("Seeding Ledger Accounts...");
  const ledgerAccounts = [
    { name: "Treasury Vault (Main)", code: "TREASURY_VAULT", type: "ASSET" },
    {
      name: "Member Savings (Total)",
      code: "MEMBER_SAVINGS",
      type: "LIABILITY",
    },
    { name: "Loan Receivables", code: "LOAN_RECEIVABLES", type: "ASSET" },
    { name: "Interest Revenue", code: "REVENUE_INTEREST", type: "REVENUE" },
    { name: "Fee & Penalty Revenue", code: "REVENUE_FEES", type: "REVENUE" },
  ];

  for (const acc of ledgerAccounts) {
    await (prisma as any).ledgerAccount.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type },
      create: { name: acc.name, code: acc.code, type: acc.type as any },
    });
  }

  // --- 1. Infrastructure ---

  // 1. Create Default Tenant Group (Region)
  const group = await prisma.tenantGroup.upsert({
    where: { reg_code: "HQ-001" },
    update: {},
    create: {
      name: "Agapay Headquarters",
      reg_code: "HQ-001",
    },
  });

  // 2. Create Default Tenant (Branch)
  const tenant = await prisma.tenant.upsert({
    where: { slug: "main-branch" },
    update: {},
    create: {
      name: "Main Branch",
      slug: "main-branch",
      tenant_group_id: group.id,
    },
  });

  // 3. Create Superadmin
  await prisma.user.upsert({
    where: { email: "superadmin@agapay.com" },
    update: { tenant_id: tenant.tenant_id },
    create: {
      username: "superadmin",
      email: "superadmin@agapay.com",
      password_hash: hashedPassword,
      role: Role.superadmin,
      status: UserStatus.active,
      tenant_id: tenant.tenant_id,
      profile: {
        create: {
          first_name: "Super",
          last_name: "Admin",
          occupation: "System Administrator",
        },
      },
    },
  });

  // 4. Create Admin
  await prisma.user.upsert({
    where: { email: "admin@agapay.com" },
    update: { tenant_id: tenant.tenant_id },
    create: {
      username: "admin",
      email: "admin@agapay.com",
      password_hash: hashedPassword,
      role: Role.admin,
      status: UserStatus.active,
      tenant_id: tenant.tenant_id,
      profile: {
        create: {
          first_name: "Agapay",
          last_name: "Admin",
          occupation: "Cooperative Manager",
        },
      },
    },
  });

  // 5. Create Sample Member
  await prisma.user.upsert({
    where: { email: "juan@agapay.com" },
    update: { tenant_id: tenant.tenant_id },
    create: {
      username: "juan.delacruz",
      email: "juan@agapay.com",
      password_hash: hashedPassword,
      role: Role.member,
      status: UserStatus.active,
      tenant_id: tenant.tenant_id,
      profile: {
        create: {
          first_name: "Juan",
          last_name: "Dela Cruz",
          occupation: "Farmer",
        },
      },
    },
  });

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
