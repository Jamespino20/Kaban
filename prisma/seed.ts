import "dotenv/config";
import {
  PrismaClient,
  Role,
  InterestTier,
  LoanStatus,
  ScheduleStatus,
  GuaranteeStatus,
  MaritalStatus,
  AccountType,
  DocumentType,
  VerificationStatus,
  PaymentStatus,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
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
const pesos = (min: number, max: number) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));
const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};
const weightedPick = <T>(items: T[], weights: number[]): T => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};
const correlatedDate = (
  anchor: Date,
  daysOffset: number,
  jitterDays: number = 2,
): Date => {
  const d = new Date(anchor);
  d.setDate(d.getDate() + daysOffset + rand(-jitterDays, jitterDays));
  return d;
};

// ── FRANCHISING PIVOT: MULTI-SCHEMA PROVISIONER ──
// This function isolates tenant data by creating a dedicated schema for each tenant.
// 1. Drops/Create schema (fresh start)
// 2. Replays DDL from init.sql into the tenant schema
// 3. Qualifies local refs (enums, tables) to use tenant schema
// 4. Qualifies global refs (tenants) to use public schema
// 5. Creates views for global tables to allow "SELECT * FROM tenants"
async function provisionBranchSchema(client: any, tenant: any) {
  const slug = tenant.slug;
  console.log(`🏗️  Provisioning isolated schema: [${slug}]`);

  // 1. Schema Setup: Ensure fresh slate
  await client.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${slug}" CASCADE`);
  await client.$executeRawUnsafe(`CREATE SCHEMA "${slug}"`);
  // Set search_path so FKs in DDL (REFERENCES "users") resolve to the local schema
  await client.$executeRawUnsafe(`SET search_path TO "${slug}", public`);

  const initSqlPath = path.join(process.cwd(), "prisma/init.sql");
  const initSqlRaw = fs.readFileSync(initSqlPath, "utf8");

  // Global tables that MUST remain in public (not replicated in branch schema)
  const GLOBAL_TABLES = [
    "tenants",
    "tenant_groups",
    "subscription_plans",
    "tenant_subscriptions",
  ];

  // Parse and Replay DDL
  const statements = initSqlRaw.split(";").filter((s) => s.trim().length > 0);

  console.log(`📜 Injecting isolated DDL into [${slug}]...`);
  for (let sql of statements) {
    const trimmed = sql.trim();
    if (!trimmed) continue;

    try {
      // A. Skip public schema init
      if (trimmed.includes('CREATE SCHEMA IF NOT EXISTS "public"')) continue;

      // B. Skip global table definitions (they exist in public)
      const isGlobalAction = GLOBAL_TABLES.some(
        (t) =>
          trimmed.includes(`TABLE "${t}"`) ||
          trimmed.includes(`INDEX "${t}_`) ||
          trimmed.includes(`ON "${t}"`),
      );
      if (isGlobalAction) continue;

      // C. Handle Enums: Create as Type in Branch Schema
      if (trimmed.includes("CREATE TYPE")) {
        const qualifiedEnum = trimmed.replace(
          /CREATE TYPE "([^"]+)"/g,
          `CREATE TYPE "${slug}"."$1"`,
        );
        await client.$executeRawUnsafe(qualifiedEnum);
        continue;
      }

      // D. Handle Tables/Indexes: Qualify with Branch Schema
      if (
        trimmed.includes("CREATE TABLE") ||
        trimmed.includes("ALTER TABLE") ||
        trimmed.includes("CREATE UNIQUE INDEX") ||
        trimmed.includes("CREATE INDEX")
      ) {
        let qualified = trimmed;

        // Target table/alter
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

        // E. Fix References: Local vs Global
        // Global: Point FKs to public (e.g. REFERENCES "tenants" -> REFERENCES public."tenants")
        for (const gt of GLOBAL_TABLES) {
          const regex = new RegExp(`REFERENCES "${gt}"`, "g");
          qualified = qualified.replace(regex, `REFERENCES public."${gt}"`);
        }

        // F. Fix Types: Use local branch enums
        // Note: This assumes init.sql doesn't use schema-prefixed types yet.
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
      console.error(`      SQL: ${trimmed.substring(0, 200)}...`);
      throw err;
    }
  }

  // G. Create Views: Expose Global Tables in Branch Schema
  // This allows "SELECT * FROM tenants" inside the branch to work via view
  console.log(`🌐 Mapping global tables as views in [${slug}]...`);
  for (const table of GLOBAL_TABLES) {
    await client.$executeRawUnsafe(
      `CREATE OR REPLACE VIEW "${slug}"."${table}" AS SELECT * FROM public."${table}"`,
    );
  }
}

const normalizeNamePart = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const buildTenantScopedIdentity = (
  first: string,
  last: string,
  tenantSlug: string,
  roleLabel: string,
  index: number,
) => {
  const firstPart = normalizeNamePart(first);
  const lastPart = normalizeNamePart(last);
  const tenantPart = tenantSlug.replace("agapay-", "");
  const suffix = `${tenantPart}.${roleLabel}.${String(index + 1).padStart(2, "0")}`;

  return {
    username: `${firstPart}_${lastPart}_${roleLabel}_${tenantPart}_${index + 1}`,
    email: `${firstPart}.${lastPart}.${suffix}@gmail.com`,
  };
};

const buildMemberIdentity = (
  first: string,
  last: string,
  branchIndex: number,
  memberIndex: number,
) => {
  const firstPart = normalizeNamePart(first);
  const lastPart = normalizeNamePart(last);
  const suffix = `${String(branchIndex).padStart(2, "0")}${String(memberIndex + 1).padStart(2, "0")}`;

  return {
    username: `${firstPart}_${lastPart}_${suffix}`,
    email: `${firstPart}.${lastPart}.${suffix}@gmail.com`,
  };
};

// ═══════════════════════════════════════════════
// PHILIPPINE DATA CONSTANTS
// ═══════════════════════════════════════════════
const REGIONS = [
  { name: "NCR Sector", reg_code: "AGP-NCR" },
  { name: "Central Luzon Sector", reg_code: "AGP-CL" },
];

const BRANCHES = [
  {
    name: "Malolos Main",
    slug: "malolos",
    groupIdx: 0,
    color: "#2563eb",
  },
  {
    name: "Quezon City Central",
    slug: "agapay-qc-central",
    groupIdx: 0,
    color: "#059669",
  },
  {
    name: "Makati CBD",
    slug: "agapay-makati-cbd",
    groupIdx: 0,
    color: "#0d9488",
  },
  { name: "Tarlac City", slug: "agapay-tarlac", groupIdx: 1, color: "#d97706" },
  {
    name: "Pampanga Angeles",
    slug: "agapay-pampanga",
    groupIdx: 1,
    color: "#dc2626",
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
const STREETS = [
  "Rizal St.",
  "Mabini Ave.",
  "Bonifacio Rd.",
  "Aguinaldo Blvd.",
  "Luna St.",
  "Del Pilar St.",
  "Quezon Ave.",
  "Burgos St.",
];
const BARANGAYS_BY_REGION = [
  [
    "Brgy. Commonwealth",
    "Brgy. Holy Spirit",
    "Brgy. Batasan Hills",
    "Brgy. Payatas",
    "Brgy. Bagong Silangan",
  ],
  [
    "Brgy. San Nicolas",
    "Brgy. Sto. Domingo",
    "Brgy. Mabini",
    "Brgy. Rizal",
    "Brgy. Lucinda",
  ],
  [
    "Brgy. Balibago",
    "Brgy. Dita",
    "Brgy. Macabling",
    "Brgy. Tagapo",
    "Brgy. Pulong Santa Cruz",
  ],
  [
    "Brgy. Jaro",
    "Brgy. Mandurriao",
    "Brgy. Molo",
    "Brgy. La Paz",
    "Brgy. Arevalo",
  ],
];

const LOAN_PURPOSES = [
  "Sari-sari store restocking",
  "Motorcycle purchase for delivery",
  "Palengke stall renovation",
  "Rice trading capital",
  "Ukay-ukay business expansion",
  "Catering equipment purchase",
  "Fish vendor refrigerator",
  "Bakery oven upgrade",
  "Water refilling station setup",
  "Livestock feed purchase",
  "Tricycle unit acquisition",
  "Cellphone loading business",
  "Beauty salon supplies",
  "Vulcanizing shop equipment",
  "Laundry machine purchase",
  "Food cart franchise fee",
  "Street food vending capital",
  "Farm tools and supplies",
  "Piggery expansion",
  "School tuition for children",
];

const PRODUCTS = [
  {
    name: "Sari-Sari Starter",
    desc: "Entry-level microfinance for small store owners",
    min: 5000,
    max: 20000,
    rate: 5.0,
    liabilityRate: 25,
    term: 6,
  },
  {
    name: "Negosyo Growth",
    desc: "Business expansion for established entrepreneurs",
    min: 10000,
    max: 50000,
    rate: 4.5,
    liabilityRate: 25,
    term: 12,
  },
  {
    name: "Paluwagan Plus",
    desc: "Community-backed group lending with trust incentives",
    min: 3000,
    max: 15000,
    rate: 4.0,
    liabilityRate: 25,
    term: 3,
  },
  {
    name: "Agri-Agapay",
    desc: "Agricultural and livestock financing",
    min: 15000,
    max: 100000,
    rate: 3.5,
    liabilityRate: 25,
    term: 12,
  },
];

const VOUCHING_COMMENTS = [
  "Maaasahan sa komunidad, laging nagtutulungan.",
  "Responsible borrower, palaging on-time.",
  "Malaki ang tulong sa barangay namin.",
  "Trusted vendor sa palengke, maraming suki.",
  "Matagal ko nang kakilala, magaling mag-negosyo.",
  "Active sa cooperative meetings.",
  "Kilala sa buong barangay bilang matapat.",
];

// ═══════════════════════════════════════════════
// PAYMENT BEHAVIOR ENGINE
// ═══════════════════════════════════════════════
type PaymentBehavior = "on_time" | "late" | "partial" | "defaulted";

function pickBehavior(loanStatus: LoanStatus): PaymentBehavior {
  if (loanStatus === "defaulted") return "defaulted";
  if (loanStatus === "paid")
    return weightedPick(["on_time", "late"] as const, [85, 15]);
  // active loans
  return weightedPick(["on_time", "late", "partial"] as const, [60, 25, 15]);
}

function getPaymentDelay(behavior: PaymentBehavior): number {
  switch (behavior) {
    case "on_time":
      return rand(-1, 2); // on time or 1-2 days early/late
    case "late":
      return rand(3, 30); // 3-30 days late
    case "partial":
      return rand(1, 10); // slight delay
    case "defaulted":
      return 0; // no payment
  }
}

// ═══════════════════════════════════════════════
// MODULAR SEEDERS
// ═══════════════════════════════════════════════

interface TenantContext {
  tenantId: number;
  tenantName: string;
  tenantSlug: string;
  regionIdx: number;
  barangays: string[];
  hashedPassword: string;
  hashedAdmin: string;
  year: number;
  branchIndex: number;
}

interface SeededUser {
  user_id: number;
  role: Role;
  username: string;
}

async function seedAdmins(
  client: any, // Supports PrismaClient or TransactionClient
  ctx: TenantContext,
): Promise<SeededUser[]> {
  const count = 2; // Fixed as requested
  const admins: SeededUser[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const identity = buildTenantScopedIdentity(
      first,
      last,
      ctx.tenantSlug,
      "admin",
      i,
    );
    const user = await client.user.create({
      data: {
        username: identity.username,
        email: identity.email,
        password_hash: ctx.hashedAdmin,
        role: Role.admin,
        tenant_id: ctx.tenantId,
        status: "active",
        interest_tier: InterestTier.T1_5_PERCENT,
        member_code: `AGP-${ctx.year}-A${String(ctx.branchIndex * 10 + i + 1).padStart(3, "0")}`,
        profile: {
          create: {
            first_name: first,
            last_name: last,
            gender: isMale ? "male" : "female",
            birthdate: faker.date.birthdate({ min: 30, max: 55, mode: "age" }),
            address: `${pick(ctx.barangays)}, ${ctx.tenantName}`,
            marital_status: pick([MaritalStatus.single, MaritalStatus.married]),
            occupation: "Branch Manager",
          },
        },
      },
    });
    admins.push({
      user_id: user.user_id,
      role: Role.admin,
      username: identity.username,
    });
  }
  return admins;
}

async function seedLenders(
  client: any,
  ctx: TenantContext,
): Promise<SeededUser[]> {
  const count = 4; // Fixed as requested (2 per admin)
  const lenders: SeededUser[] = [];
  const lenderOrgs = [
    "Cooperative Lending Corp",
    "Community Trust Capital",
    "Bayanihan Finance",
    "Samahan Credit Services",
  ];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.4;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const identity = buildTenantScopedIdentity(
      first,
      last,
      ctx.tenantSlug,
      "lender",
      i,
    );
    const user = await client.user.create({
      data: {
        username: identity.username,
        email: identity.email,
        password_hash: ctx.hashedPassword,
        role: Role.lender,
        tenant_id: ctx.tenantId,
        status: "active",
        interest_tier: InterestTier.T1_5_PERCENT,
        member_code: `AGP-${ctx.year}-L${String(ctx.branchIndex * 10 + i + 1).padStart(3, "0")}`,
        profile: {
          create: {
            first_name: first,
            last_name: last,
            gender: isMale ? "male" : "female",
            birthdate: faker.date.birthdate({ min: 28, max: 50, mode: "age" }),
            address: `${pick(ctx.barangays)}, ${ctx.tenantName}`,
            business_name: pick(lenderOrgs),
            marital_status: pick([MaritalStatus.single, MaritalStatus.married]),
            occupation: "Loan Officer",
          },
        },
      },
    });
    lenders.push({
      user_id: user.user_id,
      role: Role.lender,
      username: identity.username,
    });
  }
  return lenders;
}

async function seedMembers(
  client: any,
  ctx: TenantContext,
): Promise<SeededUser[]> {
  const count = 6; // Fixed as requested
  const members: SeededUser[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.45;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const identity = buildMemberIdentity(first, last, ctx.branchIndex, i);
    const tier = weightedPick(
      [
        InterestTier.T1_5_PERCENT,
        InterestTier.T2_4_5_PERCENT,
        InterestTier.T3_4_PERCENT,
        InterestTier.T4_3_5_PERCENT,
        InterestTier.T5_3_PERCENT,
      ],
      [35, 25, 20, 12, 8],
    );
    const status =
      i < count - 2 ? "active" : pick(["active", "pending"] as const);
    const user = await client.user.create({
      data: {
        username: identity.username,
        email: identity.email,
        password_hash: ctx.hashedPassword,
        role: Role.member,
        tenant_id: ctx.tenantId,
        status,
        interest_tier: tier,
        member_code: `AGP-${ctx.year}-${String(ctx.branchIndex * 100 + i + 1).padStart(4, "0")}`,
        profile: {
          create: {
            first_name: first,
            last_name: last,
            gender: isMale ? "male" : "female",
            birthdate: faker.date.birthdate({ min: 21, max: 60, mode: "age" }),
            address: `${rand(1, 500)} ${pick(STREETS)}, ${pick(ctx.barangays)}`,
            business_name: pick(BUSINESSES),
            marital_status: weightedPick(
              [
                MaritalStatus.single,
                MaritalStatus.married,
                MaritalStatus.widowed,
                MaritalStatus.separated,
              ],
              [30, 50, 12, 8],
            ),
            occupation: pick(OCCUPATIONS),
            mothers_maiden_name: `${pick(NAMES_F)} ${pick(SURNAMES)}`,
            place_of_birth: pick([
              "Manila",
              "Quezon City",
              "Cebu City",
              "Davao City",
              "Tarlac",
              "Iloilo",
              "Bacolod",
              "Laguna",
            ]),
            tin: `${rand(100, 999)}-${rand(100, 999)}-${rand(100, 999)}-${String(rand(0, 9)).padStart(3, "0")}`,
          },
        },
        documents: {
          create: [
            {
              document_type: DocumentType.valid_id,
              file_url: `https://placehold.co/400x300/059669/white?text=${first}+ID`,
              verification_status:
                status === "active"
                  ? VerificationStatus.verified
                  : VerificationStatus.pending,
            },
            {
              document_type: DocumentType.brgy_cert,
              file_url: `https://placehold.co/400x300/0d9488/white?text=Brgy+Cert`,
              verification_status:
                status === "active"
                  ? VerificationStatus.verified
                  : VerificationStatus.pending,
            },
          ],
        },
      },
    });
    members.push({
      user_id: user.user_id,
      role: Role.member,
      username: identity.username,
    });
  }
  return members;
}

async function seedLoansWithSchedulesAndPayments(
  client: any,
  ctx: TenantContext,
  members: SeededUser[],
  staff: SeededUser[],
  products: {
    product_id: number;
    min_amount: any;
    max_amount: any;
    interest_rate_percent: any;
    max_term_months: number;
  }[],
  payMethodId: number,
) {
  const loanCount = rand(10, 15);
  console.log(
    `  📄 Generating ${loanCount} loans with correlated schedules & payments...`,
  );

  for (let li = 0; li < loanCount; li++) {
    const borrower = pick(members);
    const product = pick(products);
    const amount = pesos(
      Number(product.min_amount),
      Number(product.max_amount),
    );
    const termMonths = rand(3, product.max_term_months);
    const rate = Number(product.interest_rate_percent) / 100;
    const totalInterest = amount * rate * termMonths;
    const processingFee = Math.max(50, amount * 0.02);
    const totalPayable = amount + totalInterest + processingFee;
    const monthlyPayment = totalPayable / termMonths;

    // Weighted loan status distribution (realistic)
    const loanStatus = weightedPick(
      [
        LoanStatus.active,
        LoanStatus.paid,
        LoanStatus.pending,
        LoanStatus.approved,
        LoanStatus.defaulted,
        LoanStatus.rejected,
      ],
      [35, 20, 15, 10, 12, 8],
    );

    // Correlated timeline: application → approval → disbursement
    const appliedAt = faker.date.between({
      from: new Date("2025-06-01"),
      to: new Date("2026-03-15"),
    });
    const isApproved = !["pending", "rejected"].includes(loanStatus);
    const approvedAt = isApproved
      ? correlatedDate(appliedAt, rand(1, 7), 1)
      : null;
    const approver = isApproved && staff.length > 0 ? pick(staff) : null;

    const balanceRemaining =
      loanStatus === "paid"
        ? 0
        : loanStatus === "defaulted"
          ? pesos(totalPayable * 0.4, totalPayable * 0.9)
          : pesos(0, totalPayable);

    const loan = await client.loan.create({
      data: {
        tenant_id: ctx.tenantId,
        user_id: borrower.user_id,
        product_id: product.product_id,
        loan_reference: `LN-${ctx.tenantId}-${appliedAt.getTime()}-${li}`,
        principal_amount: amount,
        purpose: pick(LOAN_PURPOSES),
        term_months: termMonths,
        interest_applied: totalInterest,
        principal_receivable: amount,
        interest_receivable: totalInterest,
        fees_applied: processingFee,
        total_payable: totalPayable,
        balance_remaining: balanceRemaining,
        status: loanStatus,
        applied_at: appliedAt,
        approved_at: approvedAt,
        approved_by: approver?.user_id ?? null,
      },
    });

    // Schedules + payments only for active/paid/defaulted (causally after approval)
    if (["active", "paid", "defaulted"].includes(loanStatus) && approvedAt) {
      const behavior = pickBehavior(loanStatus);
      const schedBatch: any[] = [];
      const payBatch: any[] = [];

      for (let s = 1; s <= termMonths; s++) {
        const dueDate = correlatedDate(approvedAt, s * 30, 0); // monthly intervals from approval

        let schedStatus: ScheduleStatus;
        if (loanStatus === "paid") {
          schedStatus = ScheduleStatus.paid;
        } else if (loanStatus === "defaulted" && s > rand(1, 3)) {
          schedStatus = ScheduleStatus.overdue;
        } else if (dueDate < new Date()) {
          schedStatus =
            behavior === "on_time"
              ? ScheduleStatus.paid
              : behavior === "late"
                ? Math.random() > 0.3
                  ? ScheduleStatus.paid
                  : ScheduleStatus.overdue
                : Math.random() > 0.5
                  ? ScheduleStatus.paid
                  : ScheduleStatus.overdue;
        } else {
          schedStatus = ScheduleStatus.pending;
        }

        const payDelay = schedStatus === "paid" ? getPaymentDelay(behavior) : 0;
        const paidAt =
          schedStatus === "paid" ? correlatedDate(dueDate, payDelay, 1) : null;

        schedBatch.push({
          loan_id: loan.loan_id,
          installment_number: s,
          due_date: dueDate,
          principal_amount: amount / termMonths,
          interest_amount: totalInterest / termMonths,
          total_due: monthlyPayment,
          status: schedStatus,
          paid_at: paidAt,
        });

        if (schedStatus === "paid" && paidAt) {
          payBatch.push({
            loan_id: loan.loan_id,
            method_id: payMethodId,
            payment_reference: `PAY-${ctx.tenantId}-${loan.loan_id}-${s}`,
            amount_paid:
              behavior === "partial"
                ? monthlyPayment * (Math.random() > 0.5 ? 0.6 : 0.8)
                : monthlyPayment,
            status: PaymentStatus.verified,
            submitted_at: paidAt,
            verified_at: correlatedDate(paidAt, rand(0, 2), 0),
            verified_by: approver?.user_id ?? null,
          });
        }
      }

      // BATCH insert schedules and payments
      await client.loanSchedule.createMany({ data: schedBatch });
      if (payBatch.length > 0) {
        await client.payment.createMany({ data: payBatch });
      }
    }

    // Guarantors (40% of non-pending loans)
    if (
      Math.random() < 0.4 &&
      !["pending", "rejected"].includes(loanStatus) &&
      members.length > 3
    ) {
      const gCount = rand(1, 2);
      const gBatch = [];
      const candidates = members.filter((m) => m.user_id !== borrower.user_id);
      for (let g = 0; g < gCount && g < candidates.length; g++) {
        gBatch.push({
          loan_id: loan.loan_id,
          guarantor_id: candidates[g].user_id,
          status:
            loanStatus === "defaulted"
              ? GuaranteeStatus.voided
              : ["active", "paid"].includes(loanStatus)
                ? GuaranteeStatus.vouched
                : GuaranteeStatus.pending,
          vouched_at: loanStatus !== "pending" ? new Date() : null,
        });
      }
      try {
        await client.loanGuarantee.createMany({ data: gBatch });
      } catch {
        /* skip dup */
      }
    }
  }
}

async function seedSocialGraph(client: any, members: SeededUser[]) {
  const vouchCount = rand(5, 10);
  const batch = [];
  for (let v = 0; v < vouchCount; v++) {
    const voucher = pick(members);
    const candidates = members.filter((m) => m.user_id !== voucher.user_id);
    if (candidates.length === 0) continue;
    batch.push({
      voucher_id: voucher.user_id,
      vouchee_id: pick(candidates).user_id,
      score: rand(5, 10),
      comment: pick(VOUCHING_COMMENTS),
    });
  }
  try {
    await client.socialVouch.createMany({ data: batch, skipDuplicates: true });
  } catch {
    /* skip */
  }
}
async function seedAuditLogs(
  client: PrismaClient,
  ctx: TenantContext,
  staff: SeededUser[],
) {
  const ACTIONS = [
    { action: "USER_REGISTERED", entity: "User" },
    { action: "LOAN_APPLIED", entity: "Loan" },
    { action: "LOAN_APPROVED", entity: "Loan" },
    { action: "PAYMENT_VERIFIED", entity: "Payment" },
    { action: "DOCUMENT_VERIFIED", entity: "UserDocument" },
    { action: "TRUST_SCORE_UPDATED", entity: "User" },
    { action: "SAVINGS_DEPOSIT", entity: "SavingsAccount" },
    { action: "MEMBER_SUSPENDED", entity: "User" },
    { action: "COMPASSION_TRIGGERED", entity: "Loan" },
  ];
  const batch = [];
  const logCount = rand(10, 20);
  for (let i = 0; i < logCount; i++) {
    const act = pick(ACTIONS);
    const actor = staff.length > 0 ? pick(staff) : null;
    batch.push({
      action: act.action,
      entity_type: act.entity,
      entity_id: rand(1, 200),
      user_id: actor?.user_id ?? null,
      tenant_id: ctx.tenantId,
      ip_address: `192.168.${rand(1, 254)}.${rand(1, 254)}`,
      created_at: faker.date.between({
        from: new Date("2025-06-01"),
        to: new Date(),
      }),
    });
  }
  await client.auditLog.createMany({ data: batch });
}

// ═══════════════════════════════════════════════
// MAIN TENANT SEEDER (modular)
// ═══════════════════════════════════════════════
async function seedTenant(
  client: any,
  tenant: any,
  branchIdx: number,
  regionIdx: number,
  hashedPassword: any,
  hashedAdmin: any,
) {
  // Ensure we operate in the isolated schema context
  await client.$executeRawUnsafe(`SET search_path TO "${tenant.slug}"`);

  const ctx: TenantContext = {
    tenantId: tenant.tenant_id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    regionIdx,
    barangays: BARANGAYS_BY_REGION[regionIdx],
    hashedPassword,
    hashedAdmin,
    year: new Date().getFullYear(),
    branchIndex: branchIdx,
  };

  console.log(`\n📍 Seeding: ${tenant.name}`);
  const admins = await seedAdmins(client, ctx);
  const lenders = await seedLenders(client, ctx);
  const members = await seedMembers(client, ctx);
  const staff = [...admins, ...lenders];

  console.log(
    `  ✔ Roles: ${admins.length} admin, ${lenders.length} lender, ${members.length} member`,
  );

  // Products
  const products = [];
  for (const p of PRODUCTS) {
    const prod = await client.loanProduct.create({
      data: {
        name: p.name,
        description: p.desc,
        min_amount: p.min,
        max_amount: p.max,
        interest_rate_percent: p.rate,
        guarantor_liability_rate: p.liabilityRate,
        max_term_months: p.term,
        tenant_id: ctx.tenantId,
      },
    });
    products.push(prod);
  }

  // Payment methods for mock money flow
  const p1 = await client.paymentMethod.create({
    data: {
      provider_name: `${tenant.name} Branch Cashier`,
      account_number: `CASH-${ctx.tenantId}`,
      tenant_id: ctx.tenantId,
    },
  });
  const p2 = await client.paymentMethod.create({
    data: {
      provider_name: "GCash Transfer",
      account_number: `09${rand(10, 99)}-${rand(100, 999)}-${rand(1000, 9999)}`,
      tenant_id: ctx.tenantId,
    },
  });
  const p3 = await client.paymentMethod.create({
    data: {
      provider_name: "Bank Transfer",
      account_number: `ACCT-${ctx.tenantId}-${rand(1000, 9999)}`,
      tenant_id: ctx.tenantId,
    },
  });
  const p4 = await client.paymentMethod.create({
    data: {
      provider_name: "Field Collection",
      account_number: `FIELD-${ctx.tenantId}`,
      tenant_id: ctx.tenantId,
    },
  });
  const paymentMethods = [p1, p2, p3, p4];

  // Savings (batch)
  const savingsBatch = members.map((m) => ({
    user_id: m.user_id,
    tenant_id: ctx.tenantId,
    account_type: AccountType.regular_savings,
    balance: pesos(500, 25000),
  }));
  const walletBatch = members.map((m) => ({
    user_id: m.user_id,
    tenant_id: ctx.tenantId,
    account_type: AccountType.personal_wallet,
    balance: pesos(100, 3000),
  }));
  await client.savingsAccount.createMany({
    data: [...savingsBatch, ...walletBatch],
  });

  // Loans + schedules + payments (with behavior engine)
  await seedLoansWithSchedulesAndPayments(
    client,
    ctx,
    members,
    staff,
    products,
    paymentMethods[0].method_id,
  );

  // Social graph
  await seedSocialGraph(client, members);

  // Audit logs
  await seedAuditLogs(client, ctx, staff);
}

// ═══════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════
async function main() {
  console.log(
    "🚀 Agapay Production Seed v8 — Batched Multi-Tenant Financial Simulation",
  );
  const hashedPassword = await bcrypt.hash("password123", 10);
  const hashedAdmin = await bcrypt.hash("admin2026!", 10);

  // ── INIT PUBLIC SCHEMA ──
  console.log("📚 Provisioning [public] schema structure...");
  const initSqlPath = path.join(process.cwd(), "prisma/init.sql");
  const initSqlRaw = fs.readFileSync(initSqlPath, "utf8");
  const initSqlLines = initSqlRaw
    .replace(
      /CREATE SCHEMA IF NOT EXISTS "public";/g,
      "-- skipping public init",
    )
    .split(";")
    .filter((line) => line.trim().length > 0);

  for (const sql of initSqlLines) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err: any) {
      // Ignore "already exists" errors
    }
  }

  // ── CLEAN (transaction for safety) ──
  console.log("🧹 Cleaning database...");
  
  // Drop all branch schemas first to avoid FK lockups
  const branches = [
    "agapay-qc-central", "agapay-makati-cbd", "agapay-tarlac", "agapay-pampanga"
  ];
  for (const b of branches) {
    try {
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${b}" CASCADE`);
    } catch {}
  }
  
  await prisma.interestAudit.deleteMany();
  await prisma.socialVouch.deleteMany();
  await prisma.businessLedger.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.loanGuarantee.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.loanProduct.deleteMany(); // Must delete BEFORE tenants
  await prisma.savingsTransaction.deleteMany();
  await prisma.savingsAccount.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.userDocument.deleteMany();
  await prisma.twoFactorAuth.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.message.deleteMany();
  await prisma.branchTransferRequest.deleteMany();
  await prisma.decommissionedBackup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenantSubscription.deleteMany();
  await prisma.tenant.deleteMany(); // Also delete associated subscription first
  await prisma.subscriptionPlan.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.tenantGroup.deleteMany();
  await prisma.ledgerAccount.deleteMany();

  // ── SUBSCRIPTION PLANS ──
  console.log("📦 Creating Subscription Plans...");
  const planCore = await prisma.subscriptionPlan.create({
    data: {
      tier_name: "Core",
      price_monthly: 1999,
      price_annually: 1499,
      max_members: 100,
      max_storage_mb: 2000,
      features: ["Basic Ledger", "Member App"],
    },
  });
  const planPro = await prisma.subscriptionPlan.create({
    data: {
      tier_name: "Pro",
      price_monthly: 4999,
      price_annually: 3999,
      max_members: 500,
      max_storage_mb: 10000,
      features: ["All Core", "Analytics", "Custom Branding"],
    },
  });
  const planEnterprise = await prisma.subscriptionPlan.create({
    data: {
      tier_name: "Enterprise",
      price_monthly: 12999,
      price_annually: 9999,
      max_members: 5000,
      max_storage_mb: 50000,
      features: ["All Pro", "Dedicated Account Manager"],
    },
  });

  // ── REGIONS ──
  console.log("🌏 Creating Cooperative Sectors...");
  const groups = [];
  for (const r of REGIONS) {
    groups.push(
      await prisma.tenantGroup.create({
        data: { name: r.name, reg_code: r.reg_code },
      }),
    );
  }

  // ── BRANCHES & SUBSCRIPTIONS ──
  console.log("🏢 Creating Cooperative Branches...");
  const tenants = [];
  for (let i = 0; i < BRANCHES.length; i++) {
    const b = BRANCHES[i];
    const tenant = await prisma.tenant.create({
      data: {
        name: b.name,
        slug: b.slug,
        tenant_group_id: groups[b.groupIdx].id,
        brand_color: b.color,
      },
    });

    const isExpiring = i === 2; // e.g. Tarlac City is about to expire
    const endDate = new Date();
    if (isExpiring) {
      endDate.setDate(endDate.getDate() + 1); // Expires tomorrow
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await prisma.tenantSubscription.create({
      data: {
        tenant_id: tenant.tenant_id,
        plan_id: i === 0 ? planPro.id : planCore.id,
        billing_cycle: "monthly",
        status: isExpiring ? "trial" : "active",
        end_date: endDate,
      },
    });

    tenants.push(tenant);
  }

  // ── SUPERADMINS (global, no tenant) ──
  console.log("👑 Creating Superadmin accounts (global scope)...");
  for (const sa of [
    {
      username: "superadmin",
      email: "superadmin@agapay.ph",
      first: "James",
      last: "Bryant",
    },
    {
      username: "sysops",
      email: "sysops@agapay.ph",
      first: "System",
      last: "Operations",
    },
  ]) {
    await prisma.user.create({
      data: {
        username: sa.username,
        email: sa.email,
        password_hash: hashedAdmin,
        role: Role.superadmin,
        tenant_id: null, // Global — not scoped to any tenant
        status: "active",
        interest_tier: InterestTier.T1_5_PERCENT,
        member_code: `AGP-SA-${rand(1000, 9999)}`,
        profile: {
          create: {
            first_name: sa.first,
            last_name: sa.last,
            address: "Agapay HQ, Quezon City",
          },
        },
      },
    });
  }

  // ── PER-TENANT SEEDING ──
  for (let i = 0; i < tenants.length; i++) {
    const t = tenants[i];
    const isMain = t.slug === "malolos";

    console.log(`\n🧵 Processing tenant [${t.slug}]...`);

    // Specialized client for this branch schema
    // isMain (malolos) stays in public, others use their slug-named physical schema
    const branchAdapter = isMain
      ? new PrismaNeon({ connectionString } as any)
      : new PrismaNeon({ connectionString } as any, { schema: t.slug } as any);
    const branchPrisma = new PrismaClient({ adapter: branchAdapter });

    try {
      console.log(
        `\n🌱 Seeding branch [${t.name}] in schema [${isMain ? "public" : t.slug}]...`,
      );

      // Use a transaction to ensure search_path persists across all seeding commands
      await branchPrisma.$transaction(
        async (tx) => {
          if (!isMain) {
            await provisionBranchSchema(tx, t);
          } else {
            // Even for public, ensure we can see other schemas if needed (though not required here)
            await tx.$executeRawUnsafe(`SET search_path TO public`);
          }

          // Perform seeding ON THE TRANSACTION CLIENT
          await seedTenant(
            tx,
            t,
            i,
            BRANCHES[i].groupIdx,
            hashedPassword,
            hashedAdmin,
          );
        },
        {
          timeout: 60000, // Increase timeout for heavy seeding
        },
      );

      console.log(`✅ Branch [${t.name}] completed.`);
    } catch (err: any) {
      console.error(`❌ Branch [${t.name}] FAILED:`, err.message);
    } finally {
      await branchPrisma.$disconnect();
    }
  }

  // ── RANDOM MULTI-TENANCY SEEDING ──
  console.log("\n🔗 Randomizing cross-tenant memberships (15% coverage)...");
  const allUsers = await prisma.user.findMany({
    where: { role: Role.member },
    include: { profile: true },
  });

  const memberToDuplicateCount = Math.ceil(allUsers.length * 0.15);
  const shuffled = allUsers.sort(() => 0.5 - Math.random());
  const targets = shuffled.slice(0, memberToDuplicateCount);

  // Ensure a stable cross-tenant identity remains in the test cohort
  const testUserEmail = "maria.santos.0001@gmail.com";
  const testUser = allUsers.find((u) => u.email === testUserEmail);

  if (testUser && !targets.find((u) => u.email === testUserEmail)) {
    targets.push(testUser);
  }

  for (const user of targets) {
    const otherTenants = tenants.filter((t) => t.tenant_id !== user.tenant_id);
    const extraTenantCount = user.email === testUserEmail ? 2 : rand(1, 2);
    const selected = otherTenants
      .sort(() => 0.5 - Math.random())
      .slice(0, extraTenantCount);

    for (const tenantRef of selected) {
      try {
        await prisma.user.create({
          data: {
            username: user.username,
            email: user.email,
            password_hash: await bcrypt.hash("password123", 10),
            role: Role.member,
            tenant_id: tenantRef.tenant_id,
            status: "active",
            interest_tier: pick([
              InterestTier.T1_5_PERCENT,
              InterestTier.T2_4_5_PERCENT,
              InterestTier.T3_4_PERCENT,
            ]),
            // Preserve strict format: AGP-2026-M[UserID][TenantID]
            member_code: `AGP-2026-M${String(user.user_id).padStart(3, "0")}${String(tenantRef.tenant_id).padStart(2, "0")}`,
            profile: {
              create: {
                first_name: user.profile?.first_name || "Maria",
                last_name: user.profile?.last_name || "Santos",
                gender: user.profile?.gender,
                birthdate: user.profile?.birthdate,
                address: `Cross-tenant Membership in ${tenantRef.name}`,
                marital_status: user.profile?.marital_status,
                occupation: user.profile?.occupation,
              },
            },
          },
        });
      } catch (e) {
        // Skip dups
      }
    }
  }
  console.log(
    `✅ Multi-tenant randomization complete. Generated memberships for ${targets.length} users.`,
  );

  // ── LEDGER COA ──
  console.log("📊 Creating Chart of Accounts...");
  await prisma.ledgerAccount.createMany({
    data: [
      { name: "Treasury Vault", code: "TREASURY_VAULT", type: "ASSET" },
      { name: "Loan Receivables", code: "LOAN_RECEIVABLES", type: "ASSET" },
      {
        name: "Member Savings Pool",
        code: "MEMBER_SAVINGS",
        type: "LIABILITY",
      },
      { name: "Interest Income", code: "INTEREST_INCOME", type: "REVENUE" },
      { name: "Processing Fee Income", code: "FEE_INCOME", type: "REVENUE" },
      { name: "Penalty Income", code: "PENALTY_INCOME", type: "REVENUE" },
      { name: "Share Capital", code: "SHARE_CAPITAL", type: "EQUITY" },
      {
        name: "Operating Expenses",
        code: "OPERATING_EXPENSES",
        type: "EXPENSE",
      },
    ],
  });

  // ── SUMMARY ──
  const [users, loans, scheds, pays, vouches, guarantees] = await Promise.all([
    prisma.user.count(),
    prisma.loan.count(),
    prisma.loanSchedule.count(),
    prisma.payment.count(),
    prisma.socialVouch.count(),
    prisma.loanGuarantee.count(),
  ]);

  console.log(`
╔════════════════════════════════════════════════╗
║  ✅ AGAPAY SEED v8 COMPLETE                   ║
╠════════════════════════════════════════════════╣
║  Regions:      ${REGIONS.length.toString().padEnd(30)}║
║  Branches:     ${tenants.length.toString().padEnd(30)}║
║  Users:        ${users.toString().padEnd(30)}║
║  Loans:        ${loans.toString().padEnd(30)}║
║  Schedules:    ${scheds.toString().padEnd(30)}║
║  Payments:     ${pays.toString().padEnd(30)}║
║  Guarantees:   ${guarantees.toString().padEnd(30)}║
║  Social Graph: ${vouches.toString().padEnd(30)}║
╚════════════════════════════════════════════════╝
  `);
  console.log("📌 Superadmin: superadmin@agapay.ph / admin2026!");
  console.log("📌 Cross-tenant: [EMAIL_ADDRESS] / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
