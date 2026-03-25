import { PrismaClient } from "@prisma/client";
import { Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("Seeding started...");

  // 1. Create Default Tenant Group (Region)
  const group = await prisma.tenantGroup.upsert({
    where: { reg_code: "HQ-001" },
    update: {},
    create: {
      name: "Kaban Headquarters",
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
    where: { email: "superadmin@kaban.com" },
    update: { tenant_id: tenant.tenant_id },
    create: {
      username: "superadmin",
      email: "superadmin@kaban.com",
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
    where: { email: "admin@kaban.com" },
    update: { tenant_id: tenant.tenant_id },
    create: {
      username: "admin",
      email: "admin@kaban.com",
      password_hash: hashedPassword,
      role: Role.admin,
      status: UserStatus.active,
      tenant_id: tenant.tenant_id,
      profile: {
        create: {
          first_name: "Kaban",
          last_name: "Admin",
          occupation: "Cooperative Manager",
        },
      },
    },
  });

  // 5. Create Sample Member
  await prisma.user.upsert({
    where: { email: "juan@kaban.com" },
    update: { tenant_id: tenant.tenant_id },
    create: {
      username: "juan.delacruz",
      email: "juan@kaban.com",
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
