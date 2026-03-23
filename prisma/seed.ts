import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  console.log("Seeding started...");

  // 1. Create Superadmin
  await prisma.user.upsert({
    where: { email: "superadmin@kaban.com" },
    update: {},
    create: {
      username: "superadmin",
      email: "superadmin@kaban.com",
      password_hash: hashedPassword,
      role: Role.superadmin,
      status: UserStatus.active,
      profile: {
        create: {
          first_name: "Super",
          last_name: "Admin",
          occupation: "System Administrator",
          region: "REGION III (CENTRAL LUZON)",
          province: "PAMPANGA",
          city: "CITY OF SAN FERNANDO",
          barangay: "Dolores",
        } as any,
      },
    },
  });

  // 2. Create Admin
  await prisma.user.upsert({
    where: { email: "admin@kaban.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@kaban.com",
      password_hash: hashedPassword,
      role: Role.admin,
      status: UserStatus.active,
      profile: {
        create: {
          first_name: "Kaban",
          last_name: "Admin",
          occupation: "Cooperative Manager",
        } as any,
      },
    },
  });

  // 3. Create Sample Member
  await prisma.user.upsert({
    where: { email: "juan@kaban.com" },
    update: {},
    create: {
      username: "juan.delacruz",
      email: "juan@kaban.com",
      password_hash: hashedPassword,
      role: Role.member,
      status: UserStatus.active,
      profile: {
        create: {
          first_name: "Juan",
          last_name: "Dela Cruz",
          occupation: "Farmer",
        } as any,
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
