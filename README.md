# Agapay Web

**Tagline:** _Iyong Agapay, Ating Tagumpay_

Agapay is a multi-tenant microfinance SaaS platform designed for cooperatives. It balances technical efficiency with social trust, community accountability, and compassion-based business logic.

---

## 🚀 Overview

Agapay enables cooperatives to operate independent, isolated digital microfinance ecosystems. It features a robust multi-tenant architecture where each cooperative (Tenant) manages its own members, lenders, and loan products while benefiting from platform-wide security, audit, and AI-driven analytics.

---

## ✨ Core Features

- **Multi-Tenancy**: Logical isolation using regional schemas and tenant-specific branding.
- **Mock E-wallet**: Integrated withdrawal, deposit, and ledger tracking.
- **Trust & Reputation Engine**: Dynamic scoring based on repayment behavior, peer validation, and social vouching.
- **Tiered Loan Lifecycle**: Interest rates that reward reliability (Gabay to Kaagapay tiers).
- **Social Vouching**: Mean-based vouching system to reduce risk and enhance community trust.
- **Compassion Policy**: Automated grace periods and restructuring for emergencies.
- **EOD Reconciliation**: Critical financial integrity checks for admins and lenders.
- **Discord-style Community**: Integrated chat, announcements, and peer engagement.

---

## 👥 Roles & Modules

### [Agapay Tanaw](docs/PRD.md#agapay-tanaw) (Admin/Lender Dashboard)

- **Superadmin**: Regional governance, tenant onboarding, and SaaS monetization.
- **Tenant Admin**: Loan approvals, EOD reconciliation, and member management.
- **Tenant Lender**: Capital provision, risk evaluation, and portfolio monitoring.

### [Agapay Pintig](docs/PRD.md#agapay-pintig) (Member Application)

- **Tenant Member**: Loan application, installment payments, and trust-building.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with multi-schema isolation
- **ORM**: [Prisma](https://www.prisma.io/) (with `getBranchPrisma` utility)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Jobs/Crons**: [Trigger.dev](https://trigger.dev/) (v4)
- **Verification**: ID/Liveness docs management
- **AI**: Snapshot summaries and risk detection engine

---

## 💳 Subscription Plans

| Plan           | Benefits                                                      | Price      |
| -------------- | ------------------------------------------------------------- | ---------- |
| **Core**       | Up to 500 members, basic dashboard, standard policy.          | ₱3,500/mo  |
| **Pro**        | 2500 members, branding, community tools, compassion workflow. | ₱6,500/mo  |
| **Enterprise** | Unlimited members, analytics, data export, priority support.  | ₱12,000/mo |
| **Sangay**     | Multi-branch management (Enterprise add-on).                  | +₱3,000/br |

---

## 📂 Documentation

- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Execution Matrix & Roadmap](./docs/PRD-execution-matrix.md)
- [Architecture & Schema Policy](./docs/ARCHITECTURE.md)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS)
- PostgreSQL
- pnpm / npm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Jamespino20/Agapay.git

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Run migrations (Global + Schema awareness)
npx prisma migrate dev

# Seed database with schemas
npx tsx prisma/seed.ts # or
npm run db:reset # for full database reset
```

### Development

```bash
npm run dev
```

---

## ⚖️ License

Proprietary - © 2026 Agapay SaaS
