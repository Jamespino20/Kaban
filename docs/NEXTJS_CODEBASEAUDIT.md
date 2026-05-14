# Agapay-Web Exhaustive Codebase Audit

> **Path:** `C:\xampp\htdocs\Agapay\agapay-web`
> **Audited:** 2026-05-13 · **Stack:** Next.js 15 · React 19 · Prisma 7 · Neon PostgreSQL · NextAuth 5β · Tailwind v4

---

## 1. Tech Stack & Infrastructure

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | ^15.1.11 |
| UI | React + react-dom | ^19.2.6 |
| Auth | next-auth (v5 beta) | 5.0.0-beta.30 |
| ORM | Prisma Client + Neon adapter | ^7.8.0 |
| Database | Neon PostgreSQL (serverless) | — |
| CSS | Tailwind CSS v4 + PostCSS | ^4.2.1 |
| Animations | Framer Motion | ^12.38.0 |
| Forms | react-hook-form + @hookform/resolvers + Zod v4 | ^7.71.2 / ^4.3.6 |
| UI Primitives | Radix UI (via radix-ui + cmdk + sonner) | ^1.4.3 |
| Icons | lucide-react | ^0.577.0 |
| Email | nodemailer | ^8.0.4 |
| 2FA | otplib + qrcode | ^13.3.0 / ^1.5.4 |
| PDF Generation | puppeteer-core + @sparticuz/chromium-min | 24.42.0 / 147.0.1 |
| Background Jobs | Trigger.dev | ^4.4.0 |
| Analytics | @vercel/analytics + @vercel/speed-insights | ^2.0.1 / ^1.1.0 |
| PHP Geo Data | @jobuntux/psgc (Philippine Standard Geographic Code) | ^0.2.1 |
| Hashing | bcryptjs | ^3.0.3 |
| Dates | date-fns | ^4.1.0 |
| Theming | next-themes | ^0.4.6 |
| Community Chat | ws (WebSocket) | ^8.20.0 |
| Utilities | clsx, tailwind-merge, class-variance-authority | misc |

---

## 2. Roles & Authorization

### 2.1 Defined Roles (Prisma enum `Role`)

| Role | Description |
|------|-------------|
| `superadmin` | Platform-wide access. Manages all tenants, global infrastructure, billing, subscriptions. |
| `operator` | Tenant-scoped staff. Manages one cooperative's members, loans, treasury, content. |
| `member` | End-user. Applies for loans, manages wallet, participates in community. |

### 2.2 Authorization Guards — [authorization.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/authorization.ts)

| Guard Function | Who Passes | Used By |
|----------------|-----------|---------|
| `requireAuthenticatedSession()` | Any logged-in user | Base guard for all protected pages |
| `requireTanawSession()` | `superadmin`, `operator`, `member` | Tanaw (admin) portal entry |
| `requireAdminSession()` | `superadmin`, `operator` | Admin-only server actions |
| `requireSuperadminSession()` | `superadmin` only | Platform-level operations |
| `canAccessTenantStaffResource()` | `superadmin` or matching-tenant `operator` | Tenant-scoped data access |
| `canAccessOwnOrTenantStaffResource()` | Own user OR tenant staff | Member self-service + admin override |

---

## 3. Application Routes

### 3.1 Public / Marketing Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | [page.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/app/page.tsx) | Landing page |
| `/about` | `src/app/about/` | About page |
| `/contact` | `src/app/contact/` | Contact page |
| `/pricing` | `src/app/pricing/` | Subscription pricing page |
| `/privacy` | `src/app/privacy/` | Privacy policy |
| `/terms` | `src/app/terms/` | Terms of service |
| `/not-found` | [not-found.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/app/not-found.tsx) | 404 page |

### 3.2 Auth Routes

| Route | Purpose |
|-------|---------|
| `/auth/login` | Login + 2FA confirmation |
| `/auth/register` | Member registration |
| `/auth/new-verification` | Email verification |
| `/auth/reset` | Password reset request |
| `/auth/new-password` | New password form |
| `[tenant]/auth/login` | Tenant-scoped login |
| `[tenant]/auth/register` | Tenant-scoped registration |
| `[tenant]/auth/new-password` | Tenant-scoped password reset |
| `[tenant]/auth/new-verification` | Tenant-scoped email verification |
| `[tenant]/auth/reset` | Tenant-scoped reset |

### 3.3 Tenant-Scoped Application Routes

| Route | Role | Purpose |
|-------|------|---------|
| `[tenant]/agapay-pintig` | `member` | **Member Portal** — full member dashboard |
| `[tenant]/agapay-tanaw` | `operator`, `superadmin` | **Admin Portal** — operator/superadmin dashboard |
| `[tenant]/tenant-access` | any | Restricted access page (inactive/suspended tenants) |
| `[tenant]/reports/soa` | `member` | Statement of Account page |

### 3.4 API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth authentication handler |
| `/api/admin/backups/[id]` | GET | Download decommissioned tenant backups |
| `/api/loans/apply` | POST | Loan application submission |
| `/api/reports/soa` | GET | PDF Statement of Account generation (puppeteer) |
| `/api/site-content` | GET | Public site content (FAQs, testimonials) |
| `/api/testimonials` | GET | Public testimonials API |
| `/api/cron/default-enforcement` | — | Cron trigger for automated default enforcement |
| `[tenant]/api/reports/soa` | GET | Tenant-scoped SOA report |

### 3.5 Special Routes

| Route | Purpose |
|-------|---------|
| `/agapay-pintig` | Non-tenant pintig (direct) |
| `/agapay-tanaw` | Non-tenant tanaw (direct) |
| `/platform` | Platform page (`page.tsx` only) |
| `/reports` | Reports page |

---

## 4. Portal Feature Breakdown by Role

### 4.1 Member Portal (`agapay-pintig`)

Member landing at `[tenant]/agapay-pintig`. Tabs:

| Tab | Component | Features Implemented |
|-----|-----------|---------------------|
| **Overview** | Inline in page | Loan Capability Meter, savings/wallet/active loan cards, trust score display (payment/business/peer breakdown), penalty & compassion policy cards, recent activity |
| **Wallet** | [wallet-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/wallet-tab.tsx) | View savings accounts, personal wallet balance, transaction history, top-up requests |
| **Loan Application** | [loan-application-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/loan-application-tab.tsx) | Apply for loans against products, form with guarantor selection |
| **My Loans** | [loan-servicing-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/loan-servicing-tab.tsx) | Active loans list, repayment schedules, payment submission, compassion action views |
| **Community** | [community-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/community-tab.tsx) | Discord-style chat, conversations, emoji reactions, replies, mentorship |
| **Support** | [support-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/support-tab.tsx) | Support ticketing, feedback submission |
| **Settings** | [member-settings-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/member-settings-tab.tsx) | Profile view, 2FA, notifications, consent management |

**Additional member components:**
- [member-onboarding-dialogs.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/member-onboarding-dialogs.tsx) — Consent acceptance dialog
- [member-profile-popup.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/member-profile-popup.tsx) — Profile popup modal
- [consent-dashboard.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/consent-dashboard.tsx) — Consent status dashboard
- [guarantee-request-panel.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/guarantee-request-panel.tsx) — Guarantorship request panel
- [dashboard-polling-wrapper.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/dashboard-polling-wrapper.tsx) — Real-time polling wrapper
- [loan-application-form.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/loan-application-form.tsx) — Loan application form component

### 4.2 Operator Portal (`agapay-tanaw`, role=`operator`)

| Tab | Component(s) | Features |
|-----|-------------|----------|
| **Overview** | Inline KPIs + [trust-distribution-chart.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/analytics/trust-distribution-chart.tsx), [trust-meter.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/analytics/trust-meter.tsx), [kpi-metric-card.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/analytics/kpi-metric-card.tsx) | Total funds, active loans, repayment rate, risk exposure, trust index, portfolio status, treasury imbalance alert |
| **Approvals** | [approvals-queue-module.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/approvals-queue-module.tsx) | Loan approvals, identity verification queue, top-up approvals, compassion action approvals |
| **Capital & Investments** | [operator-vault-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/operator-vault-tab.tsx) | Treasury/vault investment management |
| **Members** | [member-directory-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/member-directory-tab.tsx) | Member directory/search, profile modals, activity modals, edit modal |
| **Loan Products** | [loan-products-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/loan-products-tab.tsx) | CRUD for loan products, policy configuration |
| **Reconciliation** | [reconciliation-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/reconciliation-tab.tsx) | EOD reconciliation, treasury health, signoff workflow |
| **Content & Branding** | [tenant-branding-card.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/tenant-branding-card.tsx), [homepage-content-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/homepage-content-tab.tsx) | Brand color/accent/logo/font customization, FAQ & testimonial management |
| **Community** | [community-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/member/community-tab.tsx) + [community-operations-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/community-operations-tab.tsx) | Chat + moderation sidebar with community stats |
| **Support/Feedback** | [support-analytics-module.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/support-analytics-module.tsx) | Feedback entries viewer, support analytics |
| **Audit Logs** | [audit-log-viewer.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/audit-log-viewer.tsx) | Filterable audit log viewer (tenant-scoped) |
| **Settings** | [admin-profile-settings.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/admin-profile-settings.tsx), [tenant-name-settings-card.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/tenant-name-settings-card.tsx), [subscription-settings.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/subscription-settings.tsx) | Profile, tenant name, subscription plan, 2FA |

### 4.3 Superadmin Portal (`agapay-tanaw`, role=`superadmin`)

| Tab | Component(s) | Features |
|-----|-------------|----------|
| **Overview** | [superadmin-overview-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/superadmin-overview-tab.tsx) | Global platform KPIs (when no tenant context), or tenant-specific KPIs |
| **Community** | [superadmin-community-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/superadmin-community-tab.tsx) | Cross-tenant community oversight |
| **Approvals** | [superadmin-approvals-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/superadmin-approvals-tab.tsx) | Tenant application approvals, cross-tenant verification |
| **Global Management** | [tenant-management-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/tenant-management-tab.tsx) | Create/edit/decommission tenants, create branches, regions, staff |
| **Content** | Same as operator + global scope | Homepage FAQs/testimonials management |
| **Feedback** | Same as operator + global scope | Global feedback review |
| **Email Templates** | [email-templates-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/email-templates-tab.tsx) | Manage email templates per category |
| **AI Config** | [ai-config-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/ai-config-tab.tsx) | AI/system configuration |
| **Subscriptions** | [subscriptions-module.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/subscriptions-module.tsx) | Manage subscription plans and tenant subscriptions |
| **Reports** | [reports-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/reports-tab.tsx), [tenant-performance-reports-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/tenant-performance-reports-tab.tsx), [system-health-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/system-health-tab.tsx), [fraud-risk-tab.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/admin/fraud-risk-tab.tsx) | Cross-tenant reports, system health, fraud monitoring |
| **Audit** | Same as operator but cross-tenant | Global audit log viewer |
| **Settings** | Same as operator + tenant switcher | Profile, 2FA, tenant name per context |

---

## 5. Server Actions Inventory (38 files)

### 5.1 Authentication & Identity

| File | Functions | Role Access |
|------|----------|-------------|
| [register.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/register.ts) (5.8KB) | User registration flow | Public |
| [new-verification.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/new-verification.ts) (2.2KB) | Email verification | Public |
| [new-password.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/new-password.ts) | Password update | Authenticated |
| [reset-password.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/reset-password.ts) (3.9KB) | Password reset flow | Public |
| [reset.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/reset.ts) (1.7KB) | Reset trigger | Public |
| [identity.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/identity.ts) (4.4KB) | Identity doc upload/verification | Member, Admin |
| [2fa.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/2fa.ts) (2.7KB) | 2FA setup/disable | Authenticated |
| [two-factor.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/two-factor.ts) (1.6KB) | 2FA verification helpers | Authenticated |
| [two-factor-token.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/two-factor-token.ts) | 2FA token helpers | System |

### 5.2 Loan Lifecycle

| File | Size | Functions |
|------|------|----------|
| [loan-servicing.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/loan-servicing.ts) | 17KB | Loan approval, disbursement, repayment recording, schedule management, payment verification, default handling |
| [loan-application.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/loan-application.ts) | 3KB | Loan application creation |
| [loan-product.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/loan-product.ts) | 4.3KB | CRUD for loan products |
| [compassion-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/compassion-actions.ts) | 6.4KB | Grace period, term extension, penalty freeze requests & approvals |

### 5.3 Wallet & Treasury

| File | Size | Functions |
|------|------|----------|
| [wallet-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/wallet-actions.ts) | 17.8KB | Deposits, withdrawals, top-up queue, wallet transactions, pending top-ups |
| [ledger.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/ledger.ts) | 2.7KB | Business ledger operations |
| [reconciliation.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/reconciliation.ts) | 9.6KB | EOD reconciliation, signoff, imbalance detection |

### 5.4 Tenant & Platform Management

| File | Size | Functions |
|------|------|----------|
| [superadmin-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/superadmin-actions.ts) | **53.3KB** | Global management: create tenants, branches, regions, staff, decommission tenants, backup, manage tenant groups, entitlement status, tenant applications |
| [tenant-management.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/tenant-management.ts) | 21KB | getTenants, updateTenant, tenant operations |
| [tenant-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/tenant-actions.ts) | 7.8KB | Tenant-level configuration |
| [tenant-applications.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/tenant-applications.ts) | 3.6KB | Tenant application submission and review |
| [tenant.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/tenant.ts) | 0.6KB | Tenant slug lookup |
| [subscription-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/subscription-actions.ts) | 7.4KB | Subscription plan CRUD, tenant subscription management |

### 5.5 Admin Operations

| File | Size | Functions |
|------|------|----------|
| [admin-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/admin-actions.ts) | 20.6KB | Dashboard metrics, tenant trust metrics, pending approvals, member directory, member activity |
| [analytics-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/analytics-actions.ts) | 8.4KB | Analytics data gathering |
| [audit-logs.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/audit-logs.ts) | 3.3KB | Audit log querying and filtering |
| [system-health.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/system-health.ts) | 3.6KB | System health metrics |

### 5.6 Content & Communication

| File | Size | Functions |
|------|------|----------|
| [site-content.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/site-content.ts) | **30.6KB** | Homepage FAQ CRUD, testimonial CRUD, content workflow (draft/published), feedback entries, homepage content admin |
| [community-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/community-actions.ts) | **29KB** | Conversations, messages, reactions, replies, community dashboard data, staff summary, mentorship |
| [email-template-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/email-template-actions.ts) | 4.3KB | Email template CRUD |
| [notifications.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/notifications.ts) | 2.7KB | In-app notification management |

### 5.7 Trust & Reputation

| File | Size | Functions |
|------|------|----------|
| [reputation.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/reputation.ts) | 2.1KB | Reputation/vouch actions |

### 5.8 Utility/Support

| File | Size | Functions |
|------|------|----------|
| [transactional-feedback.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/transactional-feedback.ts) | 4.5KB | Transactional feedback + support tickets |
| [compliance-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/compliance-actions.ts) | 3.6KB | Consent acceptance |
| [export-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/export-actions.ts) | 6.3KB | Data export functionality |
| [file-management.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/file-management.ts) | 4.9KB | System file upload/management |
| [member-search.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/member-search.ts) | 1.8KB | Member search functionality |
| [psgc-actions.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/psgc-actions.ts) | 1.6KB | Philippine geographic code lookup |
| [upload.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/actions/upload.ts) | 0.7KB | File upload action |

---

## 6. Lib / Engine Modules

| File | Size | Purpose |
|------|------|---------|
| [auth.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/auth.ts) (6.5KB) | NextAuth v5 configuration, session callbacks, JWT strategy |
| [auth.config.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/auth.config.ts) (5.3KB) | Credentials provider, tenant-scoped login, 2FA verification |
| [authorization.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/authorization.ts) (3.6KB) | Role-based guards (see §2.2) |
| [prisma.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/prisma.ts) (3KB) | Prisma client initialization (TS entry) |
| [prisma.js](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/prisma.js) (12KB) | Prisma client with Neon adapter, connection pooling, schema-based multi-tenancy |
| [microfinance-policy.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/microfinance-policy.ts) (14.2KB) | **Core business engine**: 5-tier interest rate policy, credit limits per tier, penalty calculations, repayment schedule builder, compassion policy rules, tier labels |
| [trust-engine.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/trust-engine.ts) (4.5KB) | Trust score calculation: weighted composite (payment + business + peer + guarantor), tier assignment |
| [default-enforcement.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/default-enforcement.ts) (8.8KB) | Automated default detection, penalty application, guarantor cascading, compassion freeze enforcement |
| [mail.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/mail.ts) (11.4KB) | Email sending via nodemailer with HTML templates |
| [tokens.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/tokens.ts) (2.4KB) | Verification & password reset token generation |
| [notifications.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/notifications.ts) (1.5KB) | Notification creation helper |
| [prisma-audit.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/prisma-audit.ts) (4.6KB) | Audit log creation with context (IP, session, module, severity) |
| [analytics-logger.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/analytics-logger.ts) (3.2KB) | Traffic & interaction logging |
| [scoped-identity.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/scoped-identity.ts) | Tenant-scoped identity helper |
| [db-url.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/db-url.ts) | Database URL resolver |
| [utils.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/utils.ts) | `cn()` utility (clsx + tailwind-merge) |
| [reporting/engine.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/lib/reporting/engine.ts) (1.7KB) | Report generation engine |

---

## 7. Database Schema Summary (2255 lines, 35+ models)

### 7.1 Multi-Tenancy Infrastructure

| Model | Purpose |
|-------|---------|
| `TenantGroup` | Groups of tenants (federations/regions) |
| `Tenant` | Individual cooperative/tenant with branding, entitlement status |
| `TenantApplication` | Prospective tenant applications (pending/approved/rejected) |
| `TenantSubscription` | Subscription plan assignment + activated modules |
| `SubscriptionPlan` | Plan definitions (Core/Pro/Enterprise/Sangay) with pricing |
| `DecommissionedBackup` | Backups of decommissioned tenants |

### 7.2 User & Identity

| Model | Purpose |
|-------|---------|
| `User` | Core user record (role, status, interest tier, consent) |
| `UserProfile` | Extended profile (name, address, occupation, PSGC geo fields) |
| `UserDocument` | KYC documents (valid ID, proof of billing, etc.) |
| `TwoFactorAuth` | TOTP secret + recovery codes |
| `VerificationToken` | Email verification tokens |
| `TwoFactorToken` | 2FA tokens |
| `PasswordResetToken` | Password reset tokens |

### 7.3 Loan Lifecycle

| Model | Purpose |
|-------|---------|
| `LoanProduct` | Product definitions (min/max amount, interest, term, guarantor liability, frequencies) |
| `Loan` | Individual loans (principal, interest, fees, balance, status, recovery chain) |
| `LoanSchedule` | Amortization schedules (per installment, penalties, days late) |
| `Payment` | Loan payments (receipt, verification flow) |
| `PaymentMethod` | Payment providers (GCash, Bank Transfer, Cash, Maya) |
| `LoanGuarantee` | Guarantor records (liability %, charging, freeze states) |
| `InterestAudit` | Interest audit trail per loan |

### 7.4 Wallet & Savings

| Model | Purpose |
|-------|---------|
| `SavingsAccount` | 3 types: `share_capital`, `regular_savings`, `personal_wallet` |
| `SavingsTransaction` | Deposits, withdrawals, dividends, fees, default recovery debits/credits |
| `TopUpRequest` | Wallet top-up/withdrawal requests with admin verification |

### 7.5 Trust & Reputation System

| Model | Purpose |
|-------|---------|
| `TenantTrustPolicy` | Configurable weights (payment/business/peer/guarantor), voting quotas |
| `TrustRatingPeriod` | Rating period lifecycle (planned → active → closed) |
| `TrustRatingAssignment` | Peer-to-peer rating assignments (rater → ratee) |
| `TrustScoreSnapshot` | Composite trust score snapshots with tier transitions |
| `TrustTierAudit` | Tier change audit trail |
| `SocialVouch` | Peer vouching system (relationship types, discount eligibility) |
| `VouchScoreSnapshot` | Vouch score aggregation snapshots |

### 7.6 Compassion Engine

| Model | Purpose |
|-------|---------|
| `CompassionAction` | Grace period / term extension / penalty freeze requests with full lifecycle (freeze status, reminder state, restructuring offer, guarantor charge, write-off) |

### 7.7 Accounting & Reconciliation

| Model | Purpose |
|-------|---------|
| `BusinessLedger` | Double-entry ledger (debit/credit, reconciliation references, reversal tracking, hash chain) |
| `LedgerAccount` | Chart of accounts (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE) |
| `DailyReconciliation` | EOD reconciliation with signoff workflow, discrepancy detection |
| `ImbalanceInvestigation` | Imbalance tracking and resolution workflow |

### 7.8 Community & Communication

| Model | Purpose |
|-------|---------|
| `Conversation` | Direct messages, operator rooms, group chats |
| `ConversationParticipant` | Chat membership + last read tracking |
| `Message` | Chat messages with reply threading |
| `MessageAttachment` | File attachments in chat |
| `MessageReaction` | Emoji reactions |
| `MentorshipConnection` | Mentor-mentee connections with endorsement |
| `Notification` | In-app + email notifications (50+ notification types) |

### 7.9 Reports & Email

| Model | Purpose |
|-------|---------|
| `ReportDefinition` | Report configuration (10 report types, 3 formats, scheduled/one-time) |
| `EmailTemplate` | Customizable email templates per category and tenant |

### 7.10 Analytics & Audit

| Model | Purpose |
|-------|---------|
| `AuditLog` | Comprehensive audit logging (14 modules, 14 action categories, 4 severity levels) |
| `TrafficLog` | Page view tracking |
| `InteractionLog` | User interaction events |
| `FeedbackEntry` | User feedback with support priority/assignment |
| `SupportTicket` | Support ticket lifecycle (7 statuses, 8 categories) |
| `SystemFile` | Uploaded files (base64 stored) |

### 7.11 Key Enums

| Enum Family | Values |
|-------------|--------|
| **Interest Tiers** | T1 (5%), T2 (4.5%), T3 (4%), T4 (3.5%), T5 (3%) |
| **User Status** | pending, active, suspended, inactive, deactivated |
| **Loan Status** | pending, approved, active, paid, defaulted, rejected |
| **Payment Status** | pending, verified, rejected |
| **Guarantee Status** | pending, vouched, rejected, voided, charged |
| **Compassion Types** | grace_period, term_extension, penalty_freeze |
| **Conversation Types** | direct, operator_room, group_chat |
| **Notification Types** | 50+ types across verification, tenant, wallet, loan, repayment, guarantorship, voting, compassion, feedback, reports, mentorship, security, system |
| **App Modules** | wallet, loans, community, branding, reports, audit, analytics, system_config, compassion |
| **Entitlement Status** | prospect, availed, active, suspended |

---

## 8. Supporting Files

### 8.1 Hooks

| File | Purpose |
|------|---------|
| [use-form-persistence.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/hooks/use-form-persistence.ts) | Persist form state across page navigations |
| [use-polling.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/hooks/use-polling.ts) | Polling hook for real-time data refresh |

### 8.2 Services

| File | Purpose |
|------|---------|
| [loan-service.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/services/loan-service.ts) (6.4KB) | Shared loan computation logic (repayment schedule, interest calculation) |

### 8.3 Types

| File | Purpose |
|------|---------|
| [next-auth.d.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/types/next-auth.d.ts) | NextAuth session type augmentation |

### 8.4 Locales

| File | Purpose |
|------|---------|
| `en.json` (1.6KB) | English translations |
| `tl.json` (1.6KB) | Tagalog translations |

### 8.5 Background Jobs

| File | Purpose |
|------|---------|
| [src/trigger/default-enforcement.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/src/trigger/default-enforcement.ts) | Trigger.dev scheduled task for default enforcement |

### 8.6 Docs

| File | Purpose |
|------|---------|
| [PRD.md](file:///C:/xampp/htdocs/Agapay/agapay-web/docs/PRD.md) (52KB) | Product Requirements Document |
| [PRD-execution-matrix.md](file:///C:/xampp/htdocs/Agapay/agapay-web/docs/PRD-execution-matrix.md) (94KB) | Execution tracking matrix |
| [ISSUES.md](file:///C:/xampp/htdocs/Agapay/agapay-web/docs/ISSUES.md) (6.6KB) | Known issues |
| [MULTI-TENANT FLOW.png](file:///C:/xampp/htdocs/Agapay/agapay-web/docs/MULTI-TENANT%20FLOW.png) | Multi-tenant architecture diagram |

### 8.7 Scripts (12 files)

| Script | Purpose |
|--------|---------|
| `db-reset.ts` | Database reset utility |
| `init-ledger-accounts.ts` | Initialize chart of accounts |
| `apply-hardening.ts/.js` | Security hardening scripts |
| `migrate-modules.ts` | Module migration script |
| `migrate_roles_to_operator.sql` | SQL: rename `admin` role → `operator` |
| `verify-connectivity.ts` | Database connectivity verification |
| `test-neon.ts/.js`, `test-prisma.ts/.js` | Connection test scripts |
| `verify-raw.js` | Raw SQL verification |

### 8.8 Tests

| File | Purpose |
|------|---------|
| [business-policy.test.ts](file:///C:/xampp/htdocs/Agapay/agapay-web/tests/business-policy.test.ts) (4.6KB) | Unit tests for microfinance policy engine |

### 8.9 Prisma / Database

| File | Purpose |
|------|---------|
| `schema.prisma` (75KB) | Full schema definition |
| `init.sql` (86KB) | Initial SQL schema generation |
| `rls_setup.sql` (3KB) | Row-Level Security setup for multi-tenancy |
| `seed.ts` (17KB) | Database seeding script |

---

## 9. Component Library (21 UI primitives)

All in `src/components/ui/` — shadcn/ui pattern:

`badge` · `button` · `card` · `command` · `dialog` · `dropdown-menu` · `form` · `input` · `label` · `popover` · `scroll-area` · `select` · `skeleton` · `switch` · `table` · `tabs` · `textarea` · `dashboard-skeletons` · `draft-banner` · `location-combo-box` · `sonner`

---

## 10. Layout & Shell Components (11 files)

| Component | Purpose |
|-----------|---------|
| [authenticated-shell.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx) | Main authenticated layout shell with sidebar navigation |
| [dashboard-tabs-shell.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/dashboard-tabs-shell.tsx) | Tab-based dashboard container with tenant branding |
| [navbar.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/navbar.tsx) | Public navigation bar |
| [footer.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/footer.tsx) | Public footer |
| [tenant-switcher.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/tenant-switcher.tsx) | Tenant context switcher (superadmin) |
| [branch-switcher.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/branch-switcher.tsx) | Branch context switcher |
| [tenant-selector.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/tenant-selector.tsx) | Tenant selector dropdown |
| [public-tenant-selector.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/public-tenant-selector.tsx) | Public-facing tenant selector |
| [notification-bell.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/notification-bell.tsx) | Notification bell with unread count |
| [user-account-nav.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/user-account-nav.tsx) | User account dropdown menu |
| [restricted-access.tsx](file:///C:/xampp/htdocs/Agapay/agapay-web/src/components/layout/restricted-access.tsx) | Module access restriction notice |

---

## 11. Feature Module Gating

The platform uses a subscription-based module gating system. Tenant subscriptions define `activated_modules` (from `AppModule` enum). Features are gated via `isFeatureEnabled()` checks on both **Pintig** (member) and **Tanaw** (admin) portals, displaying `<RestrictedAccess>` for deactivated modules.

**Gated Modules:** `wallet`, `loans`, `community`, `branding`, `reports`, `audit`, `analytics`, `system_config`, `compassion`

---

## 12. Key Architectural Patterns

| Pattern | Implementation |
|---------|---------------|
| **Multi-Tenancy** | Schema-based isolation via Neon PostgreSQL, RLS setup, tenant_id on every model |
| **Server Components** | Both portal pages are async Server Components fetching data before render |
| **Server Actions** | All mutations via `"use server"` actions in `src/actions/` |
| **Authentication** | NextAuth v5 with credentials provider, tenant-scoped login, JWT strategy |
| **Authorization** | Hierarchical guards: authenticated → tanaw → admin → superadmin |
| **Audit Trail** | Comprehensive audit logging with module/category/severity classification |
| **Trust System** | Weighted composite scoring with configurable policy per tenant |
| **Compassion Engine** | Multi-stage default handling: freeze → reminder → restructuring offer → guarantor charge → write-off |
| **Real-time** | WebSocket (ws) for community chat, polling hooks for dashboard refresh |
| **Background Jobs** | Trigger.dev for scheduled tasks (default enforcement) |
| **PDF Generation** | Puppeteer-core with @sparticuz/chromium for SOA reports |
| **Module Gating** | Subscription-based feature flags via `activated_modules` |
| **i18n** | English + Tagalog locale files |
