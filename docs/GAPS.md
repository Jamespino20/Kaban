# Agapay PHP Port — Gap Analysis

> **Source of Truth**: NextJS 15 codebase at `C:\xampp\htdocs\Agapay\agapay-web`
> **PHP Port**: `C:\Users\James Bryant\Documents\Agapay\agapay-web-final`
> **MATRIFLOW CODEBASE**: Confirmed as a **separate project** (maternity clinic system) — NOT Agapay. Excluded from this analysis.

---

## Executive Summary

The PHP port's **backend is ~90% complete** — all core business engines, action modules, and API endpoints are fully ported with correct logic. The **frontend is ~15% complete** — only public-facing pages exist. **No authenticated dashboard UI** (member portal, operator portal, or superadmin portal) has been built.

| Layer | NextJS Baseline | PHP Port | Parity |
|-------|----------------|----------|--------|
| **Core Engines** | 3 (microfinance-policy, trust-engine, default-enforcement) | 3 (LoanCalculator, TrustEngine, DefaultEnforcement) | ✅ 100% |
| **Server Actions** | 38 files | 9 action classes (~40 methods) | ✅ ~90% |
| **API Endpoints** | Server Actions (implicit) | 8 explicit routers | ✅ ~85% |
| **Auth & Session** | NextAuth 5β + Prisma | SessionManager + AuthManager (native PHP) | ✅ 95% |
| **Database** | Prisma 7 / Neon (Postgres) | MySQLi / MariaDB | ✅ Schema ported |
| **Member Portal UI** (Pintig) | Full tab-based dashboard | ❌ **None** | ❌ 0% |
| **Admin/Operator Portal UI** (Tanaw) | Full tab-based dashboard | ❌ **None** | ❌ 0% |
| **Platform Landing** | Full marketing page | ✅ Complete | ✅ 95% |
| **Onboarding Wizard** | 5-step flow | ✅ Complete (5 steps) | ✅ 90% |
| **Community Module** | Discord-style board | ❌ **None** | ❌ 0% |
| **Support/Ticketing** | Internal ticketing system | ❌ **None** | ❌ 0% |

---

## ✅ FULLY PORTED (No Action Required)

### Core Lib Modules
| PHP File | NextJS Equivalent | Status |
|----------|-------------------|--------|
| [LoanCalculator.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/LoanCalculator.php) | `microfinance-policy.ts` | ✅ 5 tiers (T1–T5), policy constants, quote computation, schedule builder, penalty calc |
| [TrustEngine.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/TrustEngine.php) | `trust-engine.ts` | ✅ 4-component weighted score (payment 40%, business 20%, peer 20%, guarantor 20%) |
| [DefaultEnforcement.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/DefaultEnforcement.php) | `default-enforcement.ts` | ✅ Automated enforcement, guarantor deduction, recovery loan creation, ledger posting |
| [Auth.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/Auth.php) | NextAuth 5β + `authorization.ts` | ✅ Session mgmt, bcrypt, TOTP 2FA, role hierarchy, tenant context |
| [Database.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/Database.php) | Prisma 7 | ✅ MySQLi singleton, prepared statements, transactions |
| [Validator.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/Validator.php) | Zod schemas | ✅ Fluent validation |
| [Mailer.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/Mailer.php) | Email actions | ✅ SMTP mailer |
| [helpers.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/lib/helpers.php) | Various utilities | ✅ UUID gen, reference gen, config, logging |

### Action Layer
| PHP File | NextJS Equivalent | Status |
|----------|-------------------|--------|
| [loan-actions.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/loan-actions.php) | `loan-application.ts`, `loan-servicing.ts`, `loan-service.ts` | ✅ Apply, approve, reject, release, pay, verify, full-pay, enforce |
| [wallet-actions.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/wallet-actions.php) | `wallet-actions.ts` | ✅ Topup, approve/reject, pay-from-wallet, transactions |
| [admin-actions.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/admin-actions.php) | `admin-actions.ts`, `superadmin-actions.ts` | ✅ Dashboard metrics, members, profiles, staff creation, lifecycle |
| [compassion-actions.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/compassion-actions.php) | `compassion-actions.ts` | ✅ Request + process (grace, penalty freeze, term extension) |
| [reconciliation.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/reconciliation.php) | `reconciliation.ts` | ✅ EOD reconciliation, sign-off with adjustment, CSV export |
| [tenant-actions.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/tenant-actions.php) | `tenant-management.ts` | ✅ CRUD, branding, features, decommission, restore, regions |
| [ledger.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/ledger.php) | `ledger.ts` | ✅ Double-entry, balance check, account init, transaction history |
| [identity.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/identity.php) | `identity.ts` | ✅ Login, register, password reset, email verification |

### API Endpoints
| PHP Router | Endpoints | Status |
|------------|-----------|--------|
| [auth/](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/api/auth/index.php) | login, 2fa/verify/enable/disable, register, verify, forgot-password, reset-password, me, tenants, switch-tenant, logout, regions, tenants-by-region | ✅ 12 endpoints |
| [loans/](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/api/loans/index.php) | products, apply, my-loans, pending, approve, reject, release, pay, verify-payment, full-pay, enforce-default, run-enforcement, schedule | ✅ 13 endpoints |
| [wallets/](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/api/wallets/index.php) | wallets, transactions, topup, approve-topup, reject-topup, pending-topups, pay-loan | ✅ 7 endpoints |
| [admin/](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/api/admin/index.php) | pending-approvals, dashboard-metrics, members, profile, status, reset-pw, notify, staff, superadmin-overview, pending-applications, applications, tenants, subscription-plans | ✅ 13 endpoints |
| [reconciliation/](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/api/reconciliation/index.php) | index, sign-off, export, balance, transactions | ✅ 5 endpoints |
| [reports/](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/api/reports/index.php) | daily-collections, outstanding-loans, member-activity, payment-pace, tenant-summary | ✅ 5 endpoints |

### Templates (Public-Facing)
| PHP File | NextJS Equivalent | Status |
|----------|-------------------|--------|
| [platform-landing.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/templates/platform-landing.php) | Root landing page | ✅ Hero w/ video, features, loan calculator, pricing, testimonials, FAQ |
| [home.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/templates/pages/home.php) | Tenant home page | ✅ Dynamic tenant data, mission, category, contact |
| [get-started.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/templates/platform/get-started.php) | Onboarding wizard | ✅ 5-step wizard (region, coop, org details, admin account, review) |
| [layout.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/templates/layout.php) | Layout wrapper | ✅ Base HTML wrapper |

---

## ❌ NOT PORTED — Critical Gaps

### 1. Member Portal (Agapay Pintig) — Priority: 🔴 CRITICAL

The NextJS member portal (`[tenant]/agapay-pintig/page.tsx`, 639 lines) is a full tab-based SPA with these tabs:

| Tab | Description | PHP Status |
|-----|-------------|------------|
| **Dashboard** | KPI cards (wallet balance, trust score, active loans, repayment rate), quick actions | ❌ No template |
| **Loans** | Active loans list, loan application form, repayment schedule viewer, payment submission | ❌ No template |
| **Wallet** | Balance display, top-up form, transaction history, pay-loan-from-wallet | ❌ No template |
| **Trust Score** | Visual trust score breakdown (4 components), tier badge, score history | ❌ No template |
| **Savings** | Regular savings, share capital, transaction records | ❌ No template |
| **Community** | Discord-style message board, tenant operator room | ❌ No template, no API |
| **Support** | Ticket submission, ticket tracking, FAQ | ❌ No template, no API |
| **Profile/Settings** | Update personal info, change password, 2FA management | ❌ No template |

> **Backend Ready**: The API endpoints for Dashboard, Loans, Wallet, and Trust Score data already exist. Only the UI templates and client-side JS are missing.

---

### 2. Operator/Admin Portal (Agapay Tanaw) — Priority: 🔴 CRITICAL

The NextJS operator portal (`[tenant]/agapay-tanaw/page.tsx`, 703 lines) is a role-gated dashboard with these tabs:

| Tab | Role | Description | PHP Status |
|-----|------|-------------|------------|
| **Dashboard** | operator, superadmin | KPI metrics, charts, recent activity | ❌ No template |
| **Pending Approvals** | operator | Loan applications, payment verifications, compassion requests | ❌ No template |
| **Members** | operator | Member directory, profile management, status control | ❌ No template |
| **Loans Management** | operator | All loans view, release funds, enforce defaults | ❌ No template |
| **Reconciliation** | operator | EOD report, sign-off, ledger balance, CSV export | ❌ No template |
| **Reports** | operator | Daily collections, outstanding loans, member activity, payment pace | ❌ No template |
| **Platform Management** | superadmin | Tenant applications, lifecycle, subscription plans | ❌ No template |
| **Audit Logs** | operator, superadmin | Tenant-scoped or global audit trail | ❌ No template |
| **Community Admin** | superadmin | Cross-tenant chat monitoring | ❌ No template |

> **Backend Ready**: All API endpoints for these tabs exist. Missing only UI templates and JS.

---

### 3. Community Module — Priority: 🟡 MEDIUM

| Component | NextJS Status | PHP Status |
|-----------|--------------|------------|
| Conversation model (DB) | ✅ In Prisma schema | ⚠️ Need to verify SQL schema |
| Messages model (DB) | ✅ In Prisma schema | ⚠️ Need to verify SQL schema |
| Community actions (backend) | ✅ `community-actions.ts` | ❌ No action file (`community-actions.php` missing) |
| Community API endpoints | ✅ Server actions | ❌ No API router |
| Community UI | ✅ Discord-style in Pintig | ❌ No template |

---

### 4. Support/Ticketing Module — Priority: 🟡 MEDIUM

| Component | NextJS Status | PHP Status |
|-----------|--------------|------------|
| Feedback model (DB) | ✅ In Prisma schema | ⚠️ `feedback_entries` table referenced in admin metrics query |
| Support actions (backend) | ✅ `support-actions.ts` | ❌ No action file |
| Support API endpoints | ✅ Server actions | ❌ No API router (empty dir exists: `api/feedback/`) |
| Support UI | ✅ In Pintig/Tanaw tabs | ❌ No template |

---

### 5. Missing API Endpoints (Backend has actions, no API exposure)

| Action Class | File Exists | API Router Exists | Gap |
|-------------|-------------|-------------------|-----|
| `CompassionActions` | ✅ [compassion-actions.php](file:///C:/Users/James%20Bryant/Documents/Agapay/agapay-web-final/includes/actions/compassion-actions.php) | ❌ No router | Need `api/compassion/index.php` |
| `TenantActions::getAuditLogs` | ✅ In tenant-actions.php | ❌ Not in admin router | Need audit-logs endpoint |
| `TenantActions::updateTenantBranding` | ✅ In tenant-actions.php | ❌ Not in admin router | Need branding endpoint |
| `TenantActions::updateTenantFeatures` | ✅ In tenant-actions.php | ❌ Not in admin router | Need features endpoint |
| `AdminActions::getTenantKPIs` | ✅ In admin-actions.php | ❌ Not in admin router | Need KPI endpoint |
| Community actions | ❌ Missing entirely | ❌ Missing | Need full implementation |
| Support/Feedback actions | ❌ Missing entirely | ❌ Missing | Need full implementation |
| File management | ❌ Missing entirely | ❌ Missing | Need full implementation |
| Notification fetch/mark-read | ❌ Missing | ❌ Missing | Backend can `sendMemberNotification` but no read/list |

---

### 6. Frontend Assets — Priority: 🟠 HIGH

| Asset | Status |
|-------|--------|
| Dashboard CSS | ❌ Missing — need `dashboard.css` for tab-based portal shell |
| Dashboard JS | ❌ Missing — need `dashboard.js` for API calls, tab switching, form handling |
| Chart library | ❌ Missing — NextJS uses inline SVG charts, PHP needs lightweight alternative |
| Toast/notification UI | ❌ Missing |
| Modal system for dashboard | ❌ Missing |

---

## ⚠️ PARTIALLY PORTED — Needs Verification

| Area | Issue |
|------|-------|
| **SQL Schema vs Prisma** | `schema.sql` (75KB) exists but hasn't been cross-validated against the 2255-line Prisma schema for model parity |
| **Seed Data** | `seed.php` (26KB) exists but needs verification against NextJS seed logic |
| **Cron Jobs** | `api/cron/index.php` exists, content not yet audited |
| **Email Templates** | NextJS has email template actions; PHP has `Mailer.php` but template parity unknown |
| **File Uploads** | `uploads/` directory exists but no file management action module |
| **Site Content API** | `api/site-content/` and `api/testimonials/` directories exist but not fully audited |

---

## Recommended Implementation Order

### Phase 1: Dashboard Shell & Auth Flow (Foundation)
1. Create `templates/pages/dashboard.php` — tab-based portal shell (the "frame")
2. Create `public/assets/css/dashboard.css` — dashboard styling
3. Create `public/assets/js/dashboard.js` — API integration, tab switching
4. Wire auth flow: login → redirect to `/{slug}/dashboard`

### Phase 2: Member Portal Tabs (Pintig)
5. **Dashboard tab** — KPI cards calling `api/admin/dashboard-metrics`
6. **Loans tab** — Active loans, apply form, schedule viewer
7. **Wallet tab** — Balance, top-up, transactions, pay-from-wallet
8. **Trust Score tab** — Visual breakdown with tier badge
9. **Profile tab** — Personal info update, password change

### Phase 3: Operator Portal Tabs (Tanaw)
10. **Pending Approvals tab** — Loan/payment/compassion queues
11. **Members tab** — Directory, profile editor, status control
12. **Reconciliation tab** — EOD report, sign-off, export
13. **Reports tab** — Collections, outstanding, activity, pace

### Phase 4: Superadmin & Missing APIs
14. **Platform Management tab** — Tenant applications, lifecycle
15. **Audit Logs tab** — Tenant-scoped / global log viewer
16. Wire missing API endpoints (compassion, audit-logs, branding, KPIs)

### Phase 5: Community & Support
17. Create `community-actions.php` + API router
18. Create `support-actions.php` + API router
19. Build Community and Support tabs in dashboard

### Phase 6: Polish & Validation
20. Cross-validate `schema.sql` against Prisma schema
21. Verify seed data parity
22. Audit email templates
23. Test all auth flows end-to-end
