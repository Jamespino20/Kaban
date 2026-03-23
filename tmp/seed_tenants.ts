import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
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
    await prisma.user.updateMany({
      where: { tenant_id: null },
      data: { tenant_id: tenant.tenant_id },
    });

    console.log("Updating products...");
    await prisma.loanProduct.updateMany({
      where: { tenant_id: null },
      data: { tenant_id: tenant.tenant_id },
    });

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
