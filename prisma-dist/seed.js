import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  const hashedPassword = await bcrypt.hash("password123", 10);
  try {
    console.log("Testing connection...");
    await prisma.$connect();
    console.log("Connected successfully.");
  } catch (e) {
    console.error("Connection test failed:", e);
  }
  // 1. Create Superadmin
  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@asenso.com" },
    update: {},
    create: {
      username: "superadmin",
      email: "superadmin@asenso.com",
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
        },
      },
    },
  });
  // 2. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@asenso.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@asenso.com",
      password_hash: hashedPassword,
      role: Role.admin,
      status: UserStatus.active,
      profile: {
        create: {
          first_name: "Asenso",
          last_name: "Admin",
          occupation: "Cooperative Manager",
        },
      },
    },
  });
  // 3. Create Sample Members
  const member1 = await prisma.user.upsert({
    where: { email: "juan@asenso.com" },
    update: {},
    create: {
      username: "juan.delacruz",
      email: "juan@asenso.com",
      password_hash: hashedPassword,
      role: Role.member,
      status: UserStatus.active,
      profile: {
        create: {
          first_name: "Juan",
          last_name: "Dela Cruz",
          occupation: "Farmer",
        },
      },
    },
  });
  console.log("Seeding finished.");
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
