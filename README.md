# Asenso | The Shared Treasury

**Iyong pondo, ating Asenso.**  
A modern, microfinancing digital lending SaaS platform designed for Filipino cooperatives and micro-entrepreneurs. Kaban provides low-interest, transparent, and secure financial services with a focus on community and growth.

![Kaban Hero Preview](kaban-web/public/images/kaban_growth.png)

## 🚀 Quick Start

### Prerequisites

- Node.js 21+
- PostgreSQL (e.g., Vercel Postgres / Neon)
- SMTP account (for emails/2FA)

### Installation

1. **Clone and Install:**

   ```bash
   git clone https://github.com/Jamespino20/Asenso.git
   cd asenso-web
   npm install --legacy-peer-deps
   ```

2. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your database and auth credentials.

   ```bash
   cp .env.example .env
   ```

3. **Database Setup:**

   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run Development:**
   ```bash
   npm run dev
   ```

---

## ✨ Features

- **Tiered Lending:** 1.5%–2.5% monthly interest based on term duration (1–12 months).
- **Multi-Tenancy:** Regional (TenantGroups) and Branch (Tenants) hierarchical management.
- **Enterprise Security:** BSP-supervised standards with 2FA (TOTP/Email) and secure digital receipts.
- **Role-Based Access (RBAC):** Superadmin, Admin, Loan Officer, Teller, and Member roles.
- **Transparent Tracking:** Real-time loan calculator and member dashboard.
- **Audit Logging:** System-wide accountability capturing every critical action.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Database:** [PostgreSQL (Neon)](https://neon.tech/) via [Prisma 7.5](https://www.prisma.io/)
- **Authentication:** [Auth.js (v5)](https://authjs.dev/) + [otplib](https://github.com/yeojames/otplib)
- **Styling:** Tailwind CSS + Lucide Icons
- **Deployment:** Vercel

---

## ⚙️ Configuration

| Variable                | Description                                    | Source                    |
| ----------------------- | ---------------------------------------------- | ------------------------- |
| `DATABASE_URL`          | Neon pooled connection string                  | Neon Console              |
| `DATABASE_URL_UNPOOLED` | Neon direct connection string (for migrations) | Neon Console              |
| `AUTH_SECRET`           | Secret for NextAuth session encryption         | `openssl rand -base64 32` |
| `SMTP_*`                | Server, Port, User, Pass for system emails     | Email Provider            |
| `NEXT_PUBLIC_APP_URL`   | Base URL of the application                    | Deployment Environment    |

---

## 📖 Documentation

- [Implementation Strategy](file:///C:/Users/James%20Bryant/.gemini/antigravity/brain/04a9f28a-febc-4d4c-bec6-6c09e2392202/implementation_plan.md)
- [Migration Walkthrough](file:///C:/Users/James%20Bryant/.gemini/antigravity/brain/04a9f28a-febc-4d4c-bec6-6c09e2392202/walkthrough.md)
- [Future Enhancements Plan](file:///C:/Users/James%20Bryant/.gemini/antigravity/brain/04a9f28a-febc-4d4c-bec6-6c09e2392202/PLAN-auth-audit-roles.md)

---

## ⚖️ License

MIT License. Copyright (c) 2026 Kaban.
