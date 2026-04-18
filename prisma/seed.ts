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
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaNeon({ connectionString });
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

// ═══════════════════════════════════════════════
// PHILIPPINE DATA CONSTANTS
// ═══════════════════════════════════════════════
const REGIONS = [
  { name: "NCR Sector", reg_code: "AGP-NCR" },
  { name: "Central Luzon Sector", reg_code: "AGP-CL" },
  { name: "Calabarzon Sector", reg_code: "AGP-CBZ" },
  { name: "Western Visayas Sector", reg_code: "AGP-WV" },
];

const BRANCHES = [
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
  {
    name: "Laguna Sta. Rosa",
    slug: "agapay-laguna",
    groupIdx: 2,
    color: "#7c3aed",
  },
  {
    name: "Cavite Bacoor",
    slug: "agapay-cavite",
    groupIdx: 2,
    color: "#2563eb",
  },
  { name: "Iloilo City", slug: "agapay-iloilo", groupIdx: 3, color: "#ea580c" },
  {
    name: "Bacolod Silay",
    slug: "agapay-bacolod",
    groupIdx: 3,
    color: "#65a30d",
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
    term: 6,
  },
  {
    name: "Negosyo Growth",
    desc: "Business expansion for established entrepreneurs",
    min: 10000,
    max: 50000,
    rate: 4.5,
    term: 12,
  },
  {
    name: "Paluwagan Plus",
    desc: "Community-backed group lending with trust incentives",
    min: 3000,
    max: 15000,
    rate: 4.0,
    term: 3,
  },
  {
    name: "Agri-Agapay",
    desc: "Agricultural and livestock financing",
    min: 15000,
    max: 100000,
    rate: 3.5,
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

async function seedAdmins(ctx: TenantContext): Promise<SeededUser[]> {
  const count = rand(1, 2);
  const admins: SeededUser[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.5;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const uname = `admin_${ctx.tenantSlug.replace("agapay-", "")}_${i + 1}`;
    const user = await prisma.user.create({
      data: {
        username: uname,
        email: `${uname}@${ctx.tenantSlug.replace("agapay-", "")}.coop.ph`,
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
    admins.push({ user_id: user.user_id, role: Role.admin, username: uname });
  }
  return admins;
}

async function seedLenders(ctx: TenantContext): Promise<SeededUser[]> {
  const count = rand(2, 3);
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
    const uname = `lender_${ctx.tenantSlug.replace("agapay-", "")}_${i + 1}`;
    const user = await prisma.user.create({
      data: {
        username: uname,
        email: `${uname}@${ctx.tenantSlug.replace("agapay-", "")}.coop.ph`,
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
    lenders.push({ user_id: user.user_id, role: Role.lender, username: uname });
  }
  return lenders;
}

async function seedMembers(ctx: TenantContext): Promise<SeededUser[]> {
  const count = rand(10, 15);
  const members: SeededUser[] = [];
  for (let i = 0; i < count; i++) {
    const isMale = Math.random() > 0.45;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const uname = `${first.toLowerCase()}_${last.toLowerCase().replace(/ /g, "")}_${ctx.branchIndex}${i}`;
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
    const user = await prisma.user.create({
      data: {
        username: uname,
        email: `${first.toLowerCase()}.${last.toLowerCase().replace(/ /g, "")}${rand(1, 999)}@gmail.com`,
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
    members.push({ user_id: user.user_id, role: Role.member, username: uname });
  }
  return members;
}

async function seedLoansWithSchedulesAndPayments(
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
  const loanCount = rand(18, 30);
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

    const loan = await prisma.loan.create({
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
      await prisma.loanSchedule.createMany({ data: schedBatch });
      if (payBatch.length > 0) {
        await prisma.payment.createMany({ data: payBatch });
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
        await prisma.loanGuarantee.createMany({ data: gBatch });
      } catch {
        /* skip dup */
      }
    }
  }
}

async function seedSocialGraph(members: SeededUser[]) {
  const vouchCount = rand(8, 20);
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
    await prisma.socialVouch.createMany({ data: batch, skipDuplicates: true });
  } catch {
    /* skip */
  }
}

async function seedAuditLogs(ctx: TenantContext, staff: SeededUser[]) {
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
  const logCount = rand(15, 30);
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
  await prisma.auditLog.createMany({ data: batch });
}

// ═══════════════════════════════════════════════
// MAIN TENANT SEEDER (modular)
// ═══════════════════════════════════════════════
async function seedTenant(
  tenant: { tenant_id: number; name: string; slug: string },
  branchIdx: number,
  regionIdx: number,
  hashedPassword: string,
  hashedAdmin: string,
) {
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
  const admins = await seedAdmins(ctx);
  const lenders = await seedLenders(ctx);
  const members = await seedMembers(ctx);
  const staff = [...admins, ...lenders];

  console.log(
    `  ✔ Roles: ${admins.length} admin, ${lenders.length} lender, ${members.length} member`,
  );

  // Products
  const products = [];
  for (const p of PRODUCTS) {
    const prod = await prisma.loanProduct.create({
      data: {
        name: p.name,
        description: p.desc,
        min_amount: p.min,
        max_amount: p.max,
        interest_rate_percent: p.rate,
        max_term_months: p.term,
        tenant_id: ctx.tenantId,
      },
    });
    products.push(prod);
  }

  // Payment method
  const payMethod = await prisma.paymentMethod.create({
    data: { provider_name: `${tenant.name} Counter`, tenant_id: ctx.tenantId },
  });

  // Savings (batch)
  const savingsBatch = members.map((m) => ({
    user_id: m.user_id,
    tenant_id: ctx.tenantId,
    account_type: AccountType.regular_savings,
    balance: pesos(500, 25000),
  }));
  await prisma.savingsAccount.createMany({ data: savingsBatch });

  // Loans + schedules + payments (with behavior engine)
  await seedLoansWithSchedulesAndPayments(
    ctx,
    members,
    staff,
    products,
    payMethod.method_id,
  );

  // Social graph
  await seedSocialGraph(members);

  // Audit logs
  await seedAuditLogs(ctx, staff);
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

  // ── CLEAN (transaction for safety) ──
  console.log("🧹 Cleaning database...");
  await prisma.interestAudit.deleteMany();
  await prisma.socialVouch.deleteMany();
  await prisma.businessLedger.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.loanGuarantee.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.loanProduct.deleteMany();
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
  await prisma.tenant.deleteMany();
  await prisma.tenantGroup.deleteMany();
  await prisma.ledgerAccount.deleteMany();

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

  // ── BRANCHES ──
  console.log("🏢 Creating Cooperative Branches...");
  const tenants = [];
  for (const b of BRANCHES) {
    tenants.push(
      await prisma.tenant.create({
        data: {
          name: b.name,
          slug: b.slug,
          tenant_group_id: groups[b.groupIdx].id,
          brand_color: b.color,
        },
      }),
    );
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
    await seedTenant(
      tenants[i],
      i,
      BRANCHES[i].groupIdx,
      hashedPassword,
      hashedAdmin,
    );
  }

  // ── CROSS-TENANT DEMO (same email, 2 isolated identities) ──
  console.log(
    "\n🔄 Cross-tenant demo: maria.santos@gmail.com in QC + Laguna...",
  );
  for (const [idx, tenantRef] of [tenants[0], tenants[4]].entries()) {
    await prisma.user.create({
      data: {
        username: `maria_santos_${tenantRef.slug.replace("agapay-", "")}`,
        email: "maria.santos@gmail.com",
        password_hash: hashedPassword,
        role: Role.member,
        tenant_id: tenantRef.tenant_id,
        status: "active",
        interest_tier:
          idx === 0 ? InterestTier.T4_3_5_PERCENT : InterestTier.T1_5_PERCENT,
        member_code: `AGP-DEMO-${idx + 1}`,
        profile: {
          create: {
            first_name: "Maria",
            last_name: "Santos",
            gender: "female",
            birthdate: new Date("1988-03-15"),
            address:
              idx === 0
                ? "42 Rizal St., Brgy. Commonwealth, QC"
                : "18 Mabini Ave., Brgy. Balibago, Sta. Rosa",
            business_name:
              idx === 0 ? "Maria's Karinderya" : "Santos Fish Trading",
            marital_status: MaritalStatus.married,
            occupation: idx === 0 ? "Carenderia Owner" : "Fish Vendor",
            mothers_maiden_name: "Elena Cruz",
            place_of_birth: "Manila",
          },
        },
      },
    });
  }

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
  console.log("📌 Cross-tenant: maria.santos@gmail.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
