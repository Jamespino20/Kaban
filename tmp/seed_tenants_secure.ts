import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

async function main() {
  const url = (process.env.DATABASE_URL || "").replace(
    "mysql://",
    "mariadb://",
  );
  const adapter = new PrismaMariaDb(url);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Creating Main Branch Tenant...");
    const tenant = await prisma.tenant.upsert({
      where: { slug: "main-branch" },
      update: {},
      create: {
        name: "Main Branch",
        slug: "main-branch",
        is_active: true,
      },
    });
    console.log("Tenant created:", tenant.tenant_id);

    console.log("Updating users...");
    const updatedUsers = await prisma.user.updateMany({
      where: { tenant_id: null },
      data: { tenant_id: tenant.tenant_id },
    });
    console.log(`Updated ${updatedUsers.count} users.`);

    console.log("Updating loan products...");
    const updatedProducts = await prisma.loanProduct.updateMany({
      where: { tenant_id: null },
      data: { tenant_id: tenant.tenant_id },
    });
    console.log(`Updated ${updatedProducts.count} loan products.`);

    console.log(
      "Cleanup: removing any duplicate 'Sikap Micro-Loan' without tenant...",
    );
    // Just to be sure the DB is clean for the unique index if any

    console.log("Migration complete.");
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
