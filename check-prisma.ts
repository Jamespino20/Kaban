import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("Starting standard Prisma unpooled check...");
  const poolUrl = process.env.DATABASE_URL;
  const unpooledUrl = process.env.AGAPAYSTORAGE_DATABASE_URL_UNPOOLED;

  console.log("Pool URL:", poolUrl?.substring(0, 20) + "...");
  console.log("Unpooled URL:", unpooledUrl?.substring(0, 20) + "...");

  try {
    const prisma = new PrismaClient();

    console.log("Attempting count query via TCP...");
    const count = await prisma.user.count();
    console.log("Success! Users count:", count);
    await prisma.$disconnect();
  } catch (error) {
    console.error("Prisma TCP check failed:", error);
    process.exit(1);
  }
}

main();
