import {
  Role,
  InterestTier,
  AppModule,
  SupportTicketType,
} from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

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
    const short = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${tenant.slug.toUpperCase()}-O-${short}-${String(i + 1).padStart(4, "0")}`;
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

  // 2. Members
  const members = [];
  const memberCount = rand(15, 25);
  for (let i = 0; i < memberCount; i++) {
    const isMale = Math.random() > 0.5;
    const first = pick(isMale ? NAMES_M : NAMES_F);
    const last = pick(SURNAMES);
    const short = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `${tenant.slug.toUpperCase()}-M-${short}-${String(i + 1).padStart(4, "0")}`;
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

  // 3. Support Tickets (Normalized)
  for (let i = 0; i < 5; i++) {
    const requester = pick(members);
    const ticketRef = `TKT-${tenant.slug.toUpperCase()}-${Date.now()}-${i}`;
    await client.supportTicket.create({
      data: {
        ticket_number: ticketRef,
        tenant_id: tenant.tenant_id,
        requester_id: requester.user_id,
        ticket_type: SupportTicketType.FEEDBACK,
        category: pick(["general", "testimonial", "concern"]) as any,
        subject: "Sample Feedback from Member",
        description:
          "Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.",
        status: pick(["open", "resolved"]) as any,
        metadata: {
          page_path: "/dashboard",
          rating: rand(4, 5),
        },
      },
    });
  }

  // REMOVED: Social Vouches — system dropped per PRD

  // 5. Payment Methods
  const defaultPaymentMethods = ["GCash", "Bank Transfer", "Cash", "Maya"];
  for (const name of defaultPaymentMethods) {
    await client.paymentMethod.create({
      data: {
        tenant_id: tenant.tenant_id,
        provider_name: name,
        is_active: true,
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

  // Clear child data only (leave tenant/plan/group structures)
  console.log("🧹 Clearing transactional data...");
  try {
    await prisma.trustScoreSnapshot.deleteMany();
    await prisma.trustTierAudit.deleteMany();
    await prisma.loanGuarantee.deleteMany();
    await prisma.loanSchedule.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.businessLedger.deleteMany();
    await prisma.savingsTransaction.deleteMany();
    await prisma.savingsAccount.deleteMany();
    await prisma.billingInvoice.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.topupRequest.deleteMany();
    await prisma.supportTicket.deleteMany();
    await prisma.userDocument.deleteMany();
    await prisma.userProfile.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log("⚠️ Data cleared.");
  }

  // 1.5 System Ledger Accounts
  const ledgerAccounts = [
    {
      code: "CASH_EQUIVALENTS",
      name: "Cash and Cash Equivalents",
      type: "ASSET" as any,
    },
    {
      code: "MEMBER_SAVINGS",
      name: "Member Savings Deposits",
      type: "LIABILITY" as any,
    },
    {
      code: "LOAN_RECEIVABLES",
      name: "Loan Receivables",
      type: "ASSET" as any,
    },
    {
      code: "INTEREST_INCOME",
      name: "Interest Income",
      type: "REVENUE" as any,
    },
    {
      code: "RECONC_DISCREPANCY",
      name: "Reconciliation Discrepancy",
      type: "EXPENSE" as any,
    },
  ];
  for (const acc of ledgerAccounts) {
    await prisma.ledgerAccount.upsert({
      where: { code: acc.code },
      create: { ...acc, tenant_id: null },
      update: {},
    });
  }

  // 2. Subscription Plans
  const plansData = [
    {
      name: "Agapay Core",
      price_monthly: 1200,
      price_quarterly: 3500,
      features: ["Basic Admin Dashboard", "Audit Logs", "Email Support"],
    },
    {
      name: "Agapay Pro",
      price_monthly: 1500,
      price_semi_annually: 6500,
      features: ["Custom Branding", "Priority Support", "Compassion Workflow"],
    },
    {
      name: "Agapay Enterprise",
      price_monthly: 2000,
      price_annually: 12000,
      features: ["Analytics Module", "Technical Support", "Reputation System"],
    },
  ];

  const seededPlans = [];
  for (const p of plansData) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { tier_name: p.name },
      create: {
        tier_name: p.name,
        price_monthly: p.price_monthly,
        price_quarterly: p.price_quarterly || 0,
        price_semi_annually: p.price_semi_annually || 0,
        price_annually: p.price_annually || 0,
        max_members:
          p.name === "Agapay Core"
            ? 500
            : p.name === "Agapay Pro"
              ? 2500
              : 1000000,
        max_storage_mb:
          p.name === "Agapay Core"
            ? 5000
            : p.name === "Agapay Pro"
              ? 25000
              : 100000,
        features: p.features,
      },
      update: { tier_name: p.name, features: p.features },
    });
    seededPlans.push(plan);
  }

  // 3. Tenant Groups
  const seededGroups = [];
  for (const g of REGIONS) {
    const group = await prisma.tenantGroup.upsert({
      where: { reg_code: g.reg_code },
      create: { name: g.name, reg_code: g.reg_code },
      update: { name: g.name },
    });
    seededGroups.push(group);
  }

  // 4. Superadmins (Will be seeded into Malolos below)

  // 5. Per-Tenant Seeding
  for (let i = 0; i < COOPERATIVES.length; i++) {
    const coop = COOPERATIVES[i];
    const tenant = await prisma.tenant.upsert({
      where: { slug: coop.slug },
      create: {
        name: coop.name,
        slug: coop.slug,
        tenant_group_id: seededGroups[coop.groupIdx].id,
        brand_color: coop.color,
      },
      update: {
        name: coop.name,
        tenant_group_id: seededGroups[coop.groupIdx].id,
        brand_color: coop.color,
      },
    });

    if (coop.slug === "malolos") {
       await prisma.user.create({
        data: {
          username: "superadmin",
          email: "agapay.saas@gmail.com",
          password_hash: hashedAdmin,
          role: Role.superadmin,
          status: "active",
          member_code: "AGP-S-000001",
          tenant_id: tenant.tenant_id,
          profile: {
            create: {
              first_name: "James",
              last_name: "Bryant",
              tenant_id: tenant.tenant_id,
            },
          },
        },
      });
    }

    const plan = seededPlans[i % 3];
    const cycle =
      i % 4 === 0
        ? "monthly"
        : i % 3 === 0
          ? "quarterly"
          : i % 2 === 0
            ? "semi_annually"
            : "annually";

    // All leases start from April 2026
    const startDate = new Date(2026, 3, 1); // April 1, 2026
    startDate.setDate(startDate.getDate() + rand(0, 14)); // stagger by 0-14 days
    const endDate = new Date(startDate);

    if (cycle === "monthly") endDate.setMonth(endDate.getMonth() + 1);
    else if (cycle === "quarterly") endDate.setMonth(endDate.getMonth() + 3);
    else if (cycle === "semi_annually")
      endDate.setMonth(endDate.getMonth() + 6);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const coreModules = [
      AppModule.wallet,
      AppModule.loans,
      AppModule.community,
    ];
    const proModules = [
      ...coreModules,
      AppModule.branding,
      AppModule.audit,
      AppModule.compassion,
    ];
    const enterpriseModules = [
      ...proModules,
      AppModule.reports,
      AppModule.analytics,
      AppModule.system_config,
    ];

    const activatedModules =
      plan.tier_name === "Agapay Enterprise"
        ? enterpriseModules
        : plan.tier_name === "Agapay Pro"
          ? proModules
          : coreModules;

    await prisma.tenantSubscription.create({
      data: {
        tenant_id: tenant.tenant_id,
        plan_id: plan.id,
        billing_cycle: cycle as any,
        status: "active",
        start_date: startDate,
        end_date: endDate,
        activated_modules: activatedModules,
      },
    });

    // Seed 2-3 Invoices per tenant
    for (let j = 0; j < 3; j++) {
      const isPaid = Math.random() > 0.1;
      const invItems = [
        {
          description: `${plan.tier_name} - ${cycle}`,
          amount: plan.price_monthly,
          quantity: 1,
        },
      ];
      if (j === 0)
        invItems.push({
          description: "Down Payment / Setup Fee",
          amount: 1500,
          quantity: 1,
        });

      const total = invItems.reduce((acc, it) => acc + it.amount, 0);

      await prisma.billingInvoice.create({
        data: {
          tenant_id: tenant.tenant_id,
          invoice_number: `INV-${tenant.slug.toUpperCase()}-${year}-${String(j + 1).padStart(3, "0")}`,
          amount: total,
          status: isPaid ? "paid" : "pending",
          due_date: new Date(startDate.getTime() + j * 30 * 86400000),
          paid_at: isPaid
            ? new Date(startDate.getTime() + j * 30 * 86400000 + 3600000)
            : null,
          items: invItems,
        },
      });
    }

    // Seed Members & Data
    try {
      await prisma.$transaction(
        async (tx: any) => {
          await seedTenantData(tx, tenant, {
            hashedPassword,
            hashedAdmin,
            year,
          });
        },
        { timeout: 60000 },
      );
    } catch (err) {
      console.error(`❌ ${coop.name} seed failed:`, err);
    }
  }

  // ── Post-Seed: Treasury funds, superadmin wallet, trust snapshots ──
  console.log("🌱 Seeding supplementary data...");
  try {
  const adminUser = await prisma.user.findFirst({ where: { role: "superadmin" } });
  if (adminUser) {
    // Give superadmin a wallet (skip if already exists)
    const existing = await prisma.savingsAccount.findFirst({
      where: { user_id: adminUser.user_id, account_type: "personal_wallet" },
    });
    if (!existing) {
      await prisma.savingsAccount.create({
        data: {
          user_id: adminUser.user_id, tenant_id: adminUser.tenant_id ?? 1,
          account_type: "personal_wallet", owner_role: "superadmin", balance: 100000,
        },
      });
    }
  }

  // Fund tenant treasuries and create trust snapshots
  const allTenants = await prisma.tenant.findMany({ where: { is_active: true, slug: { not: "apex" } } });
  for (const t of allTenants) {
    const cashAcct = await prisma.ledgerAccount.findFirst({ where: { code: "CASH_EQUIVALENTS" } });
    if (cashAcct) {
      // Create treasury balance via ledger
      await prisma.businessLedger.create({
        data: {
          transaction_id: `TREASURY-SEED-${t.tenant_id}`,
          account_id: cashAcct.id,
          tenant_id: t.tenant_id,
          debit: 500000,
          credit: 0,
          description: `Initial treasury funding for ${t.name}`,
          metadata: { source: "seed" },
        },
      });
    }

    // Create trust score snapshots for members
    const members = await prisma.user.findMany({ where: { tenant_id: t.tenant_id, role: "member" } });
    for (const m of members) {
      const baseScore = 40 + Math.floor(Math.random() * 55); // 40–94
      const tier = baseScore >= 85 ? "T5_3_PERCENT" : baseScore >= 75 ? "T4_3_5_PERCENT" : baseScore >= 65 ? "T3_4_PERCENT" : baseScore >= 55 ? "T2_4_5_PERCENT" : "T1_5_PERCENT";
      await prisma.trustScoreSnapshot.create({
        data: {
          user_id: m.user_id,
          tenant_id: t.tenant_id,
          score: baseScore,
          payment_score: Math.min(100, baseScore - 5 + Math.floor(Math.random() * 15)),
          business_score: Math.min(100, baseScore - 10 + Math.floor(Math.random() * 20)),
          peer_score: Math.min(100, baseScore - 15 + Math.floor(Math.random() * 25)),
          guarantor_score: Math.min(100, baseScore - 5 + Math.floor(Math.random() * 15)),
          payment_weight: 50,
          business_weight: 25,
          peer_weight: 0,
          guarantor_weight: 25,
          tier_before: "T1_5_PERCENT",
          tier_after: tier,
          calculated_at: new Date(),
        },
      });
    }

    // Create sample active loans with schedules for a few members
    const eligibleMembers = members.filter((_: any, i: number) => i % 3 === 0).slice(0, 2);
    const products = await prisma.loanProduct.findMany({ where: { tenant_id: t.tenant_id } });
    for (const member of eligibleMembers) {
      const product = products.length > 0 ? products[Math.floor(Math.random() * products.length)] : null;
      if (!product) continue;
      const amount = Number(product.min_amount) + Math.floor(Math.random() * (Number(product.max_amount) - Number(product.min_amount)));
      const term = Math.min(6, Number(product.max_term_months));
      const ref = `LN-SEED-${t.slug}-${member.user_id}-${Date.now()}`.substring(0, 50);
      const interest = amount * Number(product.interest_rate_percent) / 100 * term;
      const fees = 70;
      const total = amount + interest + fees;
      const installment = total / term;

      const loan = await prisma.loan.create({
        data: {
          tenant_id: t.tenant_id,
          user_id: member.user_id,
          product_id: product.product_id,
          loan_reference: ref,
          principal_amount: amount,
          purpose: "Business capital (seed)",
          term_months: term,
          interest_applied: interest,
          fees_applied: fees,
          total_payable: total,
          balance_remaining: total,
          status: "active",
          repayment_frequency: "monthly",
          applied_at: new Date(Date.now() - 60 * 86400000),
          approved_at: new Date(Date.now() - 55 * 86400000),
        },
      });

      // Create repayment schedule
      for (let i = 1; i <= term; i++) {
        await prisma.loanSchedule.create({
          data: {
            loan_id: loan.loan_id,
            tenant_id: t.tenant_id,
            installment_number: i,
            due_date: new Date(Date.now() + (i - 1) * 30 * 86400000),
            principal_amount: amount / term,
            interest_amount: interest / term,
            total_due: installment,
            status: i <= 2 ? "paid" : "pending",
            paid_at: i <= 2 ? new Date(Date.now() - (term - i) * 30 * 86400000) : null,
          },
        });
      }
    }
  }
  } catch (e: any) {
    console.error("⚠️ Supplementary seed data error (non-fatal):", e?.message?.substring(0, 150) || e);
  }

  console.log("✅ Agapay Seed Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
