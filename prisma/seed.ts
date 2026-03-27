import { PrismaClient } from "@prisma/client";
import { Role, UserStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.KABANSTORAGE_DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  process.env.KABANSTORAGE_DATABASE_URL ||
  process.env.KABANSTORAGE_URL ||
  process.env.KABANSTORAGE_PRISMA_URL;

const adapter = new PrismaNeon({
  connectionString,
});
const prisma = new PrismaClient({ adapter });

import fs from "fs";
import path from "path";

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  console.log("Seeding started...");

  // --- 0. Geographical Locations ---
  const jsonDir = path.join(process.cwd(), "public", "json");

  // A. Regions
  console.log("Seeding Regions...");
  const regions = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "regions.json"), "utf8"),
  );
  for (const r of regions) {
    await prisma.region.upsert({
      where: { reg_code: r.reg_code },
      update: { name: r.name },
      create: { name: r.name, reg_code: r.reg_code },
    });
  }

  // B. Provinces
  console.log("Seeding Provinces...");
  const provinces = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "provinces.json"), "utf8"),
  );
  await prisma.province.createMany({
    data: provinces,
    skipDuplicates: true,
  });

  // C. Cities/Municipalities
  console.log("Seeding Cities/Municipalities...");
  const cities = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "city-mun.json"), "utf8"),
  );
  // Chunking for Large Datasets
  for (let i = 0; i < cities.length; i += 5000) {
    const chunk = cities.slice(i, i + 5000);
    await prisma.cityMun.createMany({
      data: chunk,
      skipDuplicates: true,
    });
  }

  // D. Barangays (Large Dataset)
  console.log("Seeding Barangays (this may take a few minutes)...");
  const barangays = JSON.parse(
    fs.readFileSync(path.join(jsonDir, "barangays.json"), "utf8"),
  );

  // Validate mun_code exists in cityMun
  const validMunCodes = new Set(cities.map((c: any) => c.mun_code));
  const validBarangays = barangays.filter((b: any) => {
    if (!validMunCodes.has(b.mun_code)) {
      // console.warn(`Skipping barangay ${b.name}: mun_code ${b.mun_code} not found in CityMun`);
      return false;
    }
    return true;
  });

  if (validBarangays.length < barangays.length) {
    console.warn(
      `Filtered out ${barangays.length - validBarangays.length} barangays with missing CityMun references.`,
    );
  }

  const barangayChunkSize = 1000;
  for (let i = 0; i < validBarangays.length; i += barangayChunkSize) {
    const chunk = validBarangays.slice(i, i + barangayChunkSize);
    try {
      await prisma.barangay.createMany({
        data: chunk,
        skipDuplicates: true,
      });
      if (
        (i / barangayChunkSize) % 5 === 0 ||
        i + barangayChunkSize >= validBarangays.length
      ) {
        console.log(
          `Progress: ${Math.min(i + barangayChunkSize, validBarangays.length)}/${validBarangays.length}`,
        );
      }
    } catch (error: any) {
      console.error(`Error at chunk starting at index ${i}:`, error.message);
      if (error.code === "P2003") {
        console.error(
          "Foreign key constraint failed. Checking chunk for invalid mun_codes...",
        );
      }
      throw error;
    }
  }

  // --- 1. Infrastructure ---

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
