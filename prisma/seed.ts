import "dotenv/config";
import { PrismaClient, Role, InterestTier } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import ws from "ws";
import fs from "fs";
import path from "path";
import { getDbUrl } from "../src/lib/db-url";

const connectionString = getDbUrl();
neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString } as any);
const prisma = new PrismaClient({ adapter });

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const normalizeNamePart = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * NAMING CONVENTION: firstname-lastname-membercode[tenant######]
 * Example: maria-santos-AGP2026M001[malolos]
 */
const buildMemberIdentity = (
  first: string,
  last: string,
  memberCode: string,
  tenantSlug: string,
) => {
  const firstPart = normalizeNamePart(first);
  const lastPart = normalizeNamePart(last);
  const username = `${firstPart}-${lastPart}-${memberCode}`;
  return {
    username,
    email: `${firstPart}.${lastPart}.${memberCode}@gmail.com`,
  };
};

// ── SINGLE-SCHEMA SEEDER ──
// All data will be seeded into the public schema.
// Isolation is handled via tenant_id and RLS.

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
const REGIONS = [
  { name: "NCR Sector", reg_code: "AGP_NCR" },
  { name: "Central Luzon Sector", reg_code: "AGP_CL" },
  { name: "Southern Tagalog Sector", reg_code: "AGP_ST" },
];

const COOPERATIVES = [
  {
    name: "Malolos Market Vendors Cooperative",
    slug: "malolos",
    groupIdx: 1,
    color: "#2563eb",
  },
  {
    name: "San Jose Rural Workers Coop",
    slug: "san_jose",
    groupIdx: 1,
    color: "#059669",
  },
  {
    name: "Quezon City Vendors Trust",
    slug: "qc_vendors",
    groupIdx: 0,
    color: "#d97706",
  },
  {
    name: "Makati Business Sari-Sari Coop",
    slug: "makati_business",
    groupIdx: 0,
    color: "#dc2626",
  },
  {
    name: "Calamba Agricultural Cooperative",
    slug: "calamba_agri",
    groupIdx: 2,
    color: "#7c3aed",
  },
];

const NAMES_M = [
  "Jose",
  "Ricardo",
  "Antonio",
  "Eduardo",
  "Fernando",
  "Miguel",
  "Carlos",
  "Rafael",
  "Andres",
  "Emilio",
  "Ramon",
  "Manuel",
  "Roberto",
  "Arturo",
  "Ernesto",
  "Danilo",
  "Reynaldo",
  "Leonardo",
  "Rolando",
  "Gregorio",
];
const NAMES_F = [
  "Maria",
  "Elena",
  "Carmen",
  "Rosario",
  "Luisa",
  "Teresa",
  "Gloria",
  "Patricia",
  "Cecilia",
  "Angelica",
  "Lourdes",
  "Victoria",
  "Esperanza",
  "Marites",
  "Rowena",
  "Jocelyn",
  "Merlinda",
  "Remedios",
  "Corazon",
  "Ligaya",
];
const SURNAMES = [
  "Santos",
  "Reyes",
  "Cruz",
  "Bautista",
  "Gonzales",
  "Villanueva",
  "Ramos",
  "Aquino",
  "Mendoza",
  "Garcia",
  "Torres",
  "Dela Cruz",
  "Flores",
  "Rivera",
  "Castillo",
  "Domingo",
  "Fernandez",
  "Lopez",
  "Mercado",
  "Navarro",
  "Pascual",
  "Salazar",
  "Soriano",
  "Valencia",
  "Zamora",
];
const BUSINESSES = [
  "Aling Nena's Sari-Sari",
  "Tiangge ni Mang Bert",
  "Kuya Eddie's General Mdse",
  "Ate Rose Mini Mart",
  "Tres Marias Store",
  "J&R Trading",
  "Golden Star Variety",
  "Kabayan Grocery",
  "Lucky 7 Sari-Sari",
  "Sampaguita Store",
  "Bahay Kubo Trading",
  "Mabuhay Mart",
  "Tindahan ni Nanay",
  "Isdaan Fish Trading",
  "Palengke Express",
  "Buko King Enterprise",
  "Taho Master PH",
  "Kakanin Corner",
  "Lutong Bahay Catering",
  "Panaderia De Manila",
];
const OCCUPATIONS = [
  "Sari-Sari Store Owner",
  "Market Vendor",
  "Tricycle Driver",
  "Fish Vendor",
  "Street Food Vendor",
  "Laundry Service",
  "Freelancer",
  "Farmer",
  "Carinderia Owner",
  "Ukay-Ukay Vendor",
  "Rice Trader",
  "Water Refilling Operator",
];
const BARANGAYS = [
  "Brgy. Commonwealth",
  "Brgy. Holy Spirit",
  "Brgy. Batasan Hills",
  "Brgy. San Nicolas",
  "Brgy. Sto. Domingo",
  "Brgy. Balibago",
  "Brgy. Macabling",
  "Brgy. Jaro",
  "Brgy. Mandurriao",
];

// ═══════════════════════════════════════════════
// MODULAR SEEDERS
// ═══════════════════════════════════════════════

async function seedTenantData(client: any, tenant: any, ctx: any) {
  const { hashedPassword, hashedAdmin, year } = ctx;

  console.log(`\n🌱 Seeding Cooperative: ${tenant.name}`);

  // 1. Operators (Staff)
  const staff = [];
  for (let i = 0; i < 1; i++) {
    const role = Role.operator;
    const isMale = Math.random() > 0.5;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const code = `AGP${year}O${String(i + 1).padStart(12, "0")}`;
    const identity = buildMemberIdentity(first, last, code, tenant.slug);

    const user = await client.user.create({
      data: {
        username: identity.username,
        email: identity.email,
        password_hash: hashedAdmin,
        role,
        tenant_id: tenant.tenant_id,
        status: "active",
        member_code: code,
        profile: {
          create: {
            first_name: first,
            last_name: last,
            gender: isMale ? "male" : "female",
            address: `${pick(BARANGAYS)}, ${tenant.name}`,
            occupation: "Cooperative Operator",
            tenant_id: tenant.tenant_id,
          },
        },
      },
    });
    staff.push(user);
  }

  // 2. Members (20-30 per tenant for realistic feel)
  const members = [];
  const memberCount = rand(20, 30);
  for (let i = 0; i < memberCount; i++) {
    const isMale = Math.random() > 0.5;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const code = `AGP${year}M${String(i + 1).padStart(12, "0")}`;
    const identity = buildMemberIdentity(first, last, code, tenant.slug);

    const user = await client.user.create({
      data: {
        username: identity.username,
        email: identity.email,
        password_hash: hashedPassword,
        role: Role.member,
        tenant_id: tenant.tenant_id,
        status: "active",
        member_code: code,
        interest_tier: pick([
          InterestTier.T1_5_PERCENT,
          InterestTier.T2_4_5_PERCENT,
          InterestTier.T3_4_PERCENT,
        ]),
        profile: {
          create: {
            first_name: first,
            last_name: last,
            gender: isMale ? "male" : "female",
            address: `${rand(1, 100)} Rizal St, ${pick(BARANGAYS)}`,
            business_name: pick(BUSINESSES),
            occupation: pick(OCCUPATIONS),
            tin: `${rand(100, 999)}-${rand(100, 999)}-${rand(0, 999)}`,
            tenant_id: tenant.tenant_id,
          },
        },
      },
    });
    members.push(user);
  }

  console.log(
    `  Loan products intentionally left empty for ${tenant.name}; PRD sample products are optional templates, not automatic tenant seeds.`,
  );

  // 3. Social Vouches
  for (let i = 0; i < 15; i++) {
    const voucher = pick(members);
    const vouchee = pick(members.filter((m) => m.user_id !== voucher.user_id));
    await client.socialVouch.create({
      data: {
        voucher_id: voucher.user_id,
        vouchee_id: vouchee.user_id,
        tenant_id: tenant.tenant_id,
        score: rand(7, 10),
        comment: "Maaasahan at matapat na miyembro.",
      },
    });
  }
}

// ═══════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════
async function main() {
  console.log("🚀 Agapay Multi-Tenant Revamp Seed Started...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const hashedAdmin = await bcrypt.hash("admin2026!", 10);
  const year = new Date().getFullYear();

  // 1. Clear Global Tables
  console.log("🧹 Clearing global tables...");
  await prisma.socialVouch.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.tenantSubscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.tenantGroup.deleteMany();
  await prisma.subscriptionPlan.deleteMany();

  // 2. Subscription Plans
  const plans = [
    {
      name: "Agapay Core",
      price: 3500,
      members: 500,
      storageMb: 5000,
      features: [
        "Basic Admin Dashboard",
        "Standard Microfinancing Policy Access",
        "Audit Logs",
        "Email Support",
      ],
    },
    {
      name: "Agapay Pro",
      price: 6500,
      members: 2500,
      storageMb: 25000,
      features: [
        "Custom Tenant Branding",
        "Mentorship Community Tools",
        "Chat/Priority Email Support",
        "Automated Compassion Workflow",
      ],
    },
    {
      name: "Agapay Enterprise",
      price: 12000,
      members: 1000000,
      storageMb: 100000,
      features: [
        "Analytics Module",
        "Priority Technical Support",
        "Data Exporting/Reporting Tools",
        "System Configuration Controls",
      ],
    },
  ];
  const seededPlans = [];
  for (const p of plans) {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        tier_name: p.name,
        price_monthly: p.price,
        price_annually: p.price * 12,
        max_members: p.members,
        max_storage_mb: (p as any).storageMb ?? 0,
        features: p.features,
      },
    });
    seededPlans.push(plan);
  }

  // 3. Tenant Groups (Sectors)
  const seededGroups = [];
  for (const g of REGIONS) {
    const group = await prisma.tenantGroup.create({
      data: { name: g.name, reg_code: g.reg_code },
    });
    seededGroups.push(group);
  }

  // 3.5 System Tenant (for Superadmins)
  const apexTenant = await prisma.tenant.create({
    data: {
      name: "Agapay System",
      slug: "apex",
      brand_color: "#009966",
    },
  });

  // 4. Superadmins
  await prisma.user.create({
    data: {
      username: "superadmin",
      email: "agapay.saas@gmail.com",
      password_hash: hashedAdmin,
      role: Role.superadmin,
      status: "active",
      member_code: "SUPER-001",
      tenant_id: apexTenant.tenant_id,
      profile: {
        create: {
          first_name: "James",
          last_name: "Bryant",
          tenant_id: apexTenant.tenant_id,
        },
      },
    },
  });

  // 5. Per-Tenant Seeding
  for (let i = 0; i < COOPERATIVES.length; i++) {
    const coop = COOPERATIVES[i];
    const tenant = await prisma.tenant.create({
      data: {
        name: coop.name,
        slug: coop.slug,
        tenant_group_id: seededGroups[coop.groupIdx].id,
        brand_color: coop.color,
      },
    });

    await prisma.tenantSubscription.create({
      data: {
        tenant_id: tenant.tenant_id,
        plan_id: seededPlans[1].id,
        billing_cycle: "monthly",
        status: "active",
      },
    });

    try {
      await prisma.$transaction(
        async (tx) => {
          await seedTenantData(tx, tenant, {
            hashedPassword,
            hashedAdmin,
            year,
          });
        },
        { timeout: 120000 },
      );
    } catch (err) {
      console.error(`❌ Failed to seed ${coop.name}:`, err);
    }
  }

  console.log("✅ Agapay Revamp Seed Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed!");
    if (e instanceof Error) {
      console.error(`  Message: ${e.message}`);
      if ("code" in e) console.error(`  Code: ${(e as any).code}`);
      if ("meta" in e)
        console.error(`  Meta: ${JSON.stringify((e as any).meta)}`);
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
