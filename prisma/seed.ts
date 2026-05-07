import "dotenv/config";
import { PrismaClient, Role, InterestTier } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
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

// ── MULTI-SCHEMA PROVISIONER ──
async function provisionBranchSchema(client: any, tenant: any) {
  const slug = tenant.slug;
  console.log(`🏗️  Provisioning isolated schema: [${slug}]`);

  await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${slug}" CASCADE`);
  await client.$executeRawUnsafe(`CREATE SCHEMA "${slug}"`);
  await client.$executeRawUnsafe(`SET search_path TO "${slug}", public`);

  const initSqlPath = path.join(process.cwd(), "prisma/init.sql");
  const initSqlRaw = fs.readFileSync(initSqlPath, "utf8");

  const GLOBAL_TABLES = [
    "tenants",
    "tenant_groups",
    "subscription_plans",
    "tenant_subscriptions",
  ];

  const statements = initSqlRaw.split(";").filter((s) => s.trim().length > 0);

  for (let sql of statements) {
    const trimmed = sql.trim();
    if (!trimmed) continue;

    try {
      if (trimmed.includes('CREATE SCHEMA IF NOT EXISTS "public"')) continue;

      const isGlobalAction = GLOBAL_TABLES.some(
        (t) =>
          trimmed.includes(`TABLE "${t}"`) ||
          trimmed.includes(`INDEX "${t}_`) ||
          trimmed.includes(`ON "${t}"`),
      );
      if (isGlobalAction) continue;

      if (trimmed.includes("CREATE TYPE")) {
        const qualifiedEnum = trimmed.replace(
          /CREATE TYPE "([^"]+)"/g,
          `CREATE TYPE "${slug}"."$1"`,
        );
        await client.$executeRawUnsafe(qualifiedEnum);
        continue;
      }

      if (
        trimmed.includes("CREATE TABLE") ||
        trimmed.includes("ALTER TABLE") ||
        trimmed.includes("CREATE UNIQUE INDEX") ||
        trimmed.includes("CREATE INDEX")
      ) {
        let qualified = trimmed;
        qualified = qualified.replace(
          /CREATE TABLE "([^"]+)"/g,
          `CREATE TABLE "${slug}"."$1"`,
        );
        qualified = qualified.replace(
          /ALTER TABLE "([^"]+)"/g,
          `ALTER TABLE "${slug}"."$1"`,
        );
        qualified = qualified.replace(
          /CREATE (UNIQUE )?INDEX "([^"]+)" ON "([^"]+)"/g,
          `CREATE $1 INDEX "$2" ON "${slug}"."$3"`,
        );

        for (const gt of GLOBAL_TABLES) {
          const regex = new RegExp(`REFERENCES "${gt}"`, "g");
          qualified = qualified.replace(regex, `REFERENCES public."${gt}"`);
        }

        const enumNames = [
          "Role",
          "MaritalStatus",
          "InterestTier",
          "UserStatus",
          "DocumentType",
          "VerificationStatus",
          "LoanStatus",
          "ScheduleStatus",
          "PaymentStatus",
          "GuaranteeStatus",
          "LedgerAccountType",
          "AccountType",
          "TransactionType",
          "RepaymentFrequency",
          "CompassionActionType",
          "CompassionStatus",
          "ConversationType",
          "MentorshipStatus",
          "NotificationType",
          "NotificationChannel",
          "TenantEntitlementStatus",
          "BillingCycle",
        ];
        for (const enm of enumNames) {
          const regex = new RegExp(`"${enm}"`, "g");
          qualified = qualified.replace(regex, `"${slug}"."${enm}"`);
        }

        await client.$executeRawUnsafe(qualified);
      }
    } catch (err: any) {
      console.error(`      ❌ DDL Error in [${slug}]: ${err.message}`);
      throw err;
    }
  }

  for (const table of GLOBAL_TABLES) {
    await client.$executeRawUnsafe(
      `CREATE OR REPLACE VIEW "${slug}"."${table}" AS SELECT * FROM public."${table}"`,
    );
  }
}

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════
const REGIONS = [
  { name: "NCR Sector", reg_code: "AGP-NCR" },
  { name: "Central Luzon Sector", reg_code: "AGP-CL" },
  { name: "Southern Tagalog Sector", reg_code: "AGP-ST" },
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
    slug: "san-jose",
    groupIdx: 1,
    color: "#059669",
  },
  {
    name: "Quezon City Vendors Trust",
    slug: "qc-vendors",
    groupIdx: 0,
    color: "#d97706",
  },
  {
    name: "Makati Business Sari-Sari Coop",
    slug: "makati-business",
    groupIdx: 0,
    color: "#dc2626",
  },
  {
    name: "Calamba Agricultural Cooperative",
    slug: "calamba-agri",
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
  "Carenderia Owner",
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

  // 1. Admin & Lenders
  const staff = [];
  for (let i = 0; i < 6; i++) {
    const role = i < 2 ? Role.admin : Role.lender;
    const isMale = Math.random() > 0.5;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const code = `AGP${year}${role === Role.admin ? "A" : "L"}${String(i + 1).padStart(3, "0")}`;
    const identity = buildMemberIdentity(first, last, code, tenant.slug);

    const user = await client.user.create({
      data: {
        username: identity.username,
        email: identity.email,
        password_hash: role === Role.admin ? hashedAdmin : hashedPassword,
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
            occupation: role === Role.admin ? "Branch Manager" : "Loan Officer",
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
    const code = `AGP${year}M${String(i + 1).padStart(4, "0")}`;
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
  await prisma.tenantSubscription.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.tenantGroup.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.user.deleteMany({ where: { tenant_id: null } });

  // 2. Subscription Plans
  const plans = [
    {
      name: "Agapay Core",
      price: 3500,
      members: 500,
      storageMb: 5000,
      features: [
        "basic_admin_dashboard",
        "standard_microfinance_policy_access",
        "audit_logs",
        "email_support",
      ],
    },
    {
      name: "Agapay Pro",
      price: 6500,
      members: 2500,
      storageMb: 25000,
      features: [
        "custom_tenant_branding",
        "mentorship_community_tools",
        "chat_priority_email_support",
        "automated_compassion_workflow",
      ],
    },
    {
      name: "Agapay Enterprise",
      price: 12000,
      members: 1000000,
      storageMb: 100000,
      features: [
        "analytics_module",
        "priority_support",
        "data_export_reporting_tools",
        "system_configuration_controls",
      ],
    },
    {
      name: "Agapay Sangay",
      price: 3000,
      members: 0,
      storageMb: 10000,
      features: [
        "enterprise_addon_only",
        "multi_branch_management",
        "branch_level_roles_permissions",
        "consolidated_branch_analytics",
        "inter_branch_monitoring_reporting",
        "branch_configuration_controls",
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
        max_storage_mb: p.storageMb,
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

  // 4. Superadmins
  await prisma.user.create({
    data: {
      username: "agapay-admin",
      email: "admin@agapay.ph",
      password_hash: hashedAdmin,
      role: Role.superadmin,
      status: "active",
      member_code: "SUPER-001",
      profile: { create: { first_name: "James", last_name: "Bryant" } },
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

    const isMain = coop.slug === "malolos";
    const branchAdapter = isMain
      ? new PrismaNeon({ connectionString } as any)
      : new PrismaNeon(
          { connectionString } as any,
          { schema: coop.slug } as any,
        );
    const branchPrisma = new PrismaClient({ adapter: branchAdapter });

    try {
      if (!isMain) {
        await provisionBranchSchema(branchPrisma, tenant);
      }
      await branchPrisma.$transaction(async (tx) => {
        await seedTenantData(tx, tenant, { hashedPassword, hashedAdmin, year });
      });
    } catch (err) {
      console.error(`❌ Failed to seed ${coop.name}:`, err);
    } finally {
      await branchPrisma.$disconnect();
    }
  }

  console.log("✅ Agapay Revamp Seed Complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
