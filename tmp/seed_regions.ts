import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import fs from "fs";
import path from "path";

async function main() {
  const url = (process.env.DATABASE_URL || "").replace(
    "mysql://",
    "mariadb://",
  );
  const adapter = new PrismaMariaDb(url);
  const prisma = new PrismaClient({ adapter });

  try {
    const regionsPath = path.join(
      process.cwd(),
      "public",
      "json",
      "regions.json",
    );
    const regionsData = JSON.parse(fs.readFileSync(regionsPath, "utf-8"));

    console.log(`Seeding ${regionsData.length} Regions...`);

    for (const region of regionsData) {
      await prisma.tenantGroup.upsert({
        where: { reg_code: region.reg_code },
        update: { name: region.name, is_active: true },
        create: {
          name: region.name,
          reg_code: region.reg_code,
          is_active: true,
        },
      });
    }

    // Link the default tenant to NCR for testing
    const ncrRegion = await prisma.tenantGroup.findUnique({
      where: { reg_code: "13" },
    });
    if (ncrRegion) {
      await prisma.tenant.updateMany({
        where: { slug: "main-branch" },
        data: { tenant_group_id: ncrRegion.id },
      });
      console.log("Linked Main Branch to NCR region.");
    }

    console.log("Regions seeded successfully.");
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
