# Agapay Codebase Audit (Revised)

**Date:** 2026-05-04 | **Source:** PRD.txt + PRD-execution-matrix.md + User Annotations

---

## Status Legend

| Symbol | Meaning                                                   |
| ------ | --------------------------------------------------------- |
| ✅     | Implemented — present and aligned with PRD                |
| 🟡     | Partial — present but incomplete or misaligned            |
| ❌     | Missing — not found in codebase                           |
| 🔴     | Broken — present but has a clear correctness / UX problem |
| ⬛     | Out of scope — acknowledged but will not be built         |
| 🚫     | Stale concern — was a bug/gap, now resolved               |

---

## Section A — Core Platform & Multi-Tenant Isolation

| Feature                                | Status | Key Files                                                 | Gap / Action                                                                                                                                                                                                                                                                       |
| -------------------------------------- | ------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical tenant-scoped identity       | ✅     | [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts), [lib/auth.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts), [lib/scoped-identity.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/scoped-identity.ts)       | —                                                                                                                                                                                                                                                                                  |
| Branch-subpath routing `/[branch]/...` | 🔴     | `app/[branch]/agapay-tanaw/`, [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts)                  | Routing produces `agapay-tanaw/agapay-tanaw` instead of correct path. **Branch selector must be on the main public homepage.** User selects branch, then is routed to that designated branch homepage. Login/registration on a branch homepage must be branch-sensitive — Block Branch B users from logging in on Branch A page |
| **Sidebar branch-switcher**            | 🔴     | `components/layout/branch-switcher.tsx`                   | **Remove the sidebar branch switcher.** In global+branch-scoped modules, implement a header selector element instead                                                                                                                                                               |
| One-DB multi-schema isolation (seed)   | ✅     | [prisma/seed.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/seed.ts), [prisma/init.sql](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/init.sql)                       | Working. Must verify runtime API routes use [getBranchPrisma](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts#84-129)                                                                                                                                                                                                                      |
| Runtime API schema switching           | 🟡     | [lib/prisma.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts) → [getBranchPrisma](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts#84-129)                       | Systematic pass across all 30 action files required                                                                                                                                                                                                                                |
| Request-side authorization guards      | ✅     | [lib/authorization.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/authorization.ts), [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts)                        | —                                                                                                                                                                                                                                                                                  |
| **Franchise billing stage**            | 🔴     | [actions/subscription-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/subscription-actions.ts), `app/pricing/page.tsx` | No payment prompt exists when a branch registers via the onboarding form. **Pricing page should lead to the onboarding form, which then requires payment before branch activation.** Lifetime model only (no monthly/yearly)                                                       |
| Mobile API bearer auth                 | ⬛     | —                                                         | Out of scope for this phase                                                                                                                                                                                                                                                        |

---

## Section B — Public Site, Branding & Content

| Feature                                 | Status | Key Files                                                                | Gap / Action                                                                                                                                                                      |
| --------------------------------------- | ------ | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language**                            | 🔴     | All pages, modals, dialogs, forms                                        | Some pages/modals/forms still have Tagalog wording — must be **fully English** except for Agapay brand names (Pintig, Tanaw, Ka-Agapay, etc.). Remove i18n toggle from the matrix |
| Homepage (public)                       | 🟡     | [app/page.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx), `app/about/`, `app/platform/`, `app/pricing/`            | Content improvements needed per PRD                                                                                                                                               |
| **Subscription/Loan Plans on Homepage** | ❌     | `app/pricing/page.tsx`                                                   | Must display **lifetime** pricing (not monthly/yearly), with benefit lists. Leads to onboarding form                                                                              |
| **Dynamic FAQ & Testimonial workflow**  | 🔴     | [actions/site-content.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/site-content.ts), [components/admin/homepage-content-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/homepage-content-tab.tsx)   | **P2000 column-too-long error** on `homepageTestimonial.upsert()`. Add image upload support. Remove non-functional live preview. Support multiple branch homepage logic           |
| Tenant-branding color customization     | 🔴     | [components/admin/tenant-branding-card.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-branding-card.tsx), [app/globals.css](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/globals.css)           | **`#0e1529` gradient is hardcoded in sidebar** causing this color to dominate. Full palette (main + accent + font) must apply globally                                            |
| Email header with `agapay_titled.png`   | 🔴     | [lib/mail.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts)                                                            | All email templates must use the official Agapay visual header image                                                                                                              |
| Cooperative logo (shell, SOA, receipts) | 🟡     | `components/layout/authenticated-shell.tsx`, `app/[branch]/reports/soa/` | Letter placeholders still used; logos not shown in receipts/SOA headers                                                                                                           |
| Live branch map on homepage             | ❌     | [app/page.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx)                                                           | Not implemented                                                                                                                                                                   |
| Tenant T&C / DPA consent dashboard      | 🟡     | [components/member/consent-dashboard.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/consent-dashboard.tsx)                                | Member consent flow exists; broader compliance is thin                                                                                                                            |

---

## Section C — Authentication, Registration & Account Recovery

| Feature                                          | Status | Key Files                                      | Gap / Action                                                                                                                                              |
| ------------------------------------------------ | ------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant-safe registration                         | ✅     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts)                          | —                                                                                                                                                         |
| Registration limited to availed tenants          | ✅     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [actions/tenant.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant.ts)     | —                                                                                                                                                         |
| **Branch-homepage-sensitive login/registration** | 🔴     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts)              | A Branch B user must be blocked from logging in on the Branch A homepage, and vice versa                                                                  |
| Email verification                               | ✅     | [actions/new-verification.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/new-verification.ts), [lib/tokens.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/tokens.ts) | —                                                                                                                                                         |
| TOTP-based 2FA                                   | ✅     | [actions/2fa.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/2fa.ts)                               | —                                                                                                                                                         |
| **Forgot password — multi-tenant UX**            | 🟡     | [actions/reset.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/reset.ts)                             | Token is scoped per tenant, but no UI to select which cooperative when the same email exists across multiple branches. **Status: Partial. Work on this.** |
| **Idle session lock**                            | 🟡     | `components/auth/idle-session-timer.tsx`       | No warning state before auto-logout, no role-aware timeout, no user preference to adjust it. **Work on this.**                                            |
| **Registration schema-length robustness**        | 🔴     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [prisma/schema.prisma](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma)  | Long PSGC names → generic DB overflow. Needs field-length audit + friendly validation                                                                     |

---

## Section D — Loan Lifecycle, Policy Engine & Computation

| Feature                                            | Status | Key Files                                                                   | Gap / Action                                                                                                                                                                   |
| -------------------------------------------------- | ------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shared microfinance policy engine                  | ✅     | [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                                                | —                                                                                                                                                                              |
| Loan application validation                        | ✅     | [actions/loan-application.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts)                                               | —                                                                                                                                                                              |
| Overindebtedness blocking                          | ✅     | [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                                                | —                                                                                                                                                                              |
| Loan approval → release → repayment                | ✅     | [actions/loan-servicing.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts), [components/admin/verification-queue-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/verification-queue-tab.tsx)  | —                                                                                                                                                                              |
| **Repayment frequency (weekly/bi-weekly/monthly)** | 🟡     | [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts), [components/member/loan-application-form.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-application-form.tsx) | Product still feels monthly-first. **Work on full end-to-end UX and reporting for all 3 cadences.**                                                                            |
| **Loan application form layout**                   | 🔴     | [components/member/loan-application-form.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-application-form.tsx)                               | Portrait orientation is undesirable. **Make it landscape.** Guarantor search → dropdown checkbox with lazy-loading co-branch suggestions                                       |
| SOA from ledger truth                              | ✅     | `app/reports/soa/page.tsx`, `lib/reporting/engine.ts`                       | —                                                                                                                                                                              |
| Fixed vs declining balance math                    | ✅     | [actions/loan-product.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-product.ts)                                                   | —                                                                                                                                                                              |
| **Homepage loan calculator**                       | 🔴     | [app/page.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx)                                                              | Calculator missing Weekly + Bi-weekly cadences. Elements overflow on certain settings. Rates div is dark — should follow the green-white palette                               |
| **Transactional feedback hooks**                   | ❌     | [actions/loan-application.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts), [actions/loan-servicing.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts)                  | No feedback for loan application, release, payment, rejection, cancellation                                                                                                    |
| **Wallet (Magdagdag sa Wallet)**                   | 🔴     | [actions/wallet-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/wallet-actions.ts), [components/member/wallet-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/wallet-tab.tsx)             | Currently allows typing any amount and it immediately adds — no validation, no actual funding source required. Must prevent magic money / cross-branch debt-laundering exploit |

---

## Section E — Default, Penalties, Guarantors & Compassion

| Feature                                   | Status | Key Files                                                                      | Gap / Action                                                                                                                                                        |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default enforcement + cron                | ✅     | [lib/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [trigger/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/trigger/default-enforcement.ts)      | **Now uses Trigger.dev (v4)** for scheduled jobs. Daily midnight UTC cron. Includes auto-retries, observability dashboard. Project ID needs user configuration via `npx trigger.dev login`. |
| **Guarantor liability %**                 | 🟡     | [lib/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                     | Should be configurable per branch admin. Superadmin can override individual branch settings                                                                         |
| Trust graph (borrower + guarantor impact) | 🟡     | [lib/trust-engine.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/trust-engine.ts)                                                          | No full reciprocity; "Community Hero" model absent                                                                                                                  |
| **Monthly peer voting for trust scores**  | ❌     | [lib/trust-engine.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/trust-engine.ts)                                                          | Members must vote for each other's trust monthly. If a user does not vote within the period, they are **temporarily locked out of their dashboard** until they vote |
| Compassion request + admin approval       | ✅     | [actions/compassion-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/compassion-actions.ts), [components/admin/compassion-actions-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/compassion-actions-tab.tsx) | Member-facing discovery still thin                                                                                                                                  |
| EOD reconciliation sign-off               | 🔴     | [components/admin/reconciliation-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/reconciliation-tab.tsx)                                      | Banner does not clear after sign-off. **EOD cannot be a one-click sign-off.** There must be actual resolution attempts before sign-off is permitted                 |
| Guarantor revocation / reassignment       | ❌     | —                                                                              | No lifecycle for revoking or reassigning a guarantor                                                                                                                |

---

## Section F — Community, Mentorship & Messaging

| Feature                                         | Status | Key Files                                                                              | Gap / Action                                                                                                                                                                                                                                     |
| ----------------------------------------------- | ------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant-scoped DMs, branch rooms, group chats    | ✅     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)                                                         | —                                                                                                                                                                                                                                                |
| Replies, reactions, attachments, unread         | ✅     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)                                                         | Data contract exists                                                                                                                                                                                                                             |
| Mentorship endorsement                          | ✅     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)                                                         | —                                                                                                                                                                                                                                                |
| Cross-tenant isolation                          | ✅     | `tests/business-policy.test.ts`                                                        | —                                                                                                                                                                                                                                                |
| **Community layout (all roles)**                | 🔴     | [components/member/community-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/community-tab.tsx), [components/admin/community-operations-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/community-operations-tab.tsx) | **Lay it out like Instagram or Discord's chat system.** Internal popups + selectors to reduce scrolling                                                                                                                                          |
| **Default GCs and initiation rules**            | ❌     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)                                                         | **Superadmins, admins, and lenders must be able to initiate conversations.** Superadmin has a default GC with all branch admins. Each admin/lender has a default GC with their members. Members have limited contacts (admins + superadmin only) |
| Rich messaging UI (emoji, attachments, threads) | 🟡     | [components/member/community-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/community-tab.tsx)                                                  | No emoji picker, no attachment flow, no lazy thread loading                                                                                                                                                                                      |
| Notification bell / tray (60s polling)          | ✅     | `components/layout/notification-bell.tsx`                                              | Poll-only; no WebSocket                                                                                                                                                                                                                          |
| SMS fallback                                    | ⬛     | —                                                                                      | Out of scope                                                                                                                                                                                                                                     |
| Real-time (WebSocket/push)                      | 🟡     | —                                                                                      | Polling only                                                                                                                                                                                                                                     |
| Offline-first                                   | ❌     | —                                                                                      | Not implemented (lower priority)                                                                                                                                                                                                                 |

---

## Section G — Analytics, Reporting & Operational Oversight

| Feature                                  | Status | Key Files                                                              | Gap / Action                                                                                                                                                                   |
| ---------------------------------------- | ------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KPI + trust score criteria**           | 🔴     | `app/agapay-tanaw/page.tsx`, [lib/trust-engine.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/trust-engine.ts)                     | **The trust score criteria for a branch (and for all Agapay operations) are undefined and vague.** Must define the exact formula and surface it. Add a trust/tier progress bar |
| **Tier upgrade criteria + progress bar** | ❌     | `components/analytics/trust-distribution-chart.tsx`                    | No progress indicator showing how members level up (Starter → Growth → Trusted → Elite)                                                                                        |
| Analytics Insights (operations module)   | ✅     | [components/admin/analytics-dashboard-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/analytics-dashboard-tab.tsx)                         | —                                                                                                                                                                              |
| **Analytics Insights visible to Lender** | 🔴     | `app/agapay-tanaw/page.tsx`                                            | Remove Analytics Insights from Lender's view                                                                                                                                   |
| EOD reconciliation                       | 🔴     | [actions/reconciliation.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/reconciliation.ts), [components/admin/reconciliation-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/reconciliation-tab.tsx) | Analytics is the main highlight. Sign-off must require actual imbalance resolution, not just a click                                                                           |
| Audit logs                               | ✅     | [components/admin/audit-log-viewer.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/audit-log-viewer.tsx)                                | —                                                                                                                                                                              |
| AI-assisted report summaries             | ❌     | —                                                                      | Not yet built                                                                                                                                                                  |

---

## Section H — Dashboard UX, Layout & Accessibility

| Feature                                   | Status | Key Files                                                 | Gap / Action                                                        |
| ----------------------------------------- | ------ | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Authenticated sidebar shell               | ✅     | `components/layout/authenticated-shell.tsx`               | —                                                                   |
| Scroll-reset on tab switch                | ✅     | `components/layout/dashboard-tabs-shell.tsx`              | —                                                                   |
| **Dynamic "Pangkalahatan" header**        | 🔴     | `app/agapay-tanaw/page.tsx`, `app/agapay-pintig/page.tsx` | Header must change based on the active module, not remain stagnant  |
| **Dark mode / accessibility preferences** | ❌     | [app/globals.css](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/globals.css)                                         | No preference center, no dark mode, no accessibility toggles        |
| Login redirect to correct role dashboard  | 🔴     | [lib/auth.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts)                                             | Members sometimes land on `agapay-tanaw`; only correct after reload |

---

## Section I — Role-by-Role Product Fit

### Superadmin

| Surface                                         | Status | Gap / Action                                                                                                                                                     |
| ----------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sidebar branch-switcher**                     | 🔴     | Remove. Use header selector per module instead                                                                                                                   |
| **Branch/homepage website builder**             | ❌     | When creating a new branch, superadmin gets a "website builder" to edit that branch's homepage, modules, feature flags based on purchased plan, and colors/logos |
| **Decommission + Recommission lifecycle**       | 🟡     | On decommission: users see a data download snapshot page. Recommissioning (once branch is reset/reformed) provides one-time compensation bonuses                 |
| Mga Miyembro — management actions + trust/vouch | 🟡     | Three-dot actions, trust/vouch columns, branch column, staff creation with region assignment                                                                     |
| Produkto ng Loan — global view                  | 🟡     | Header selector per branch, guarantor liability % column, payment cadence setting                                                                                |
| Global Tenant Mgmt — region segregation         | 🟡     | Add Branch must include logo upload + hex color pickers                                                                                                          |
| **Testimonial Photo URL not rendering**         | 🔴     | P2000 error + photo not showing in homepage + missing status-tab scrollbars                                                                                      |
| Ka-AgapayCommunity layout                       | 🔴     | Internal popups/selectors; lay out like Discord/Instagram                                                                                                        |
| **Settings**                                    | 🔴     | Expand: profile photo, username, email, phone, dark mode, accessibility                                                                                          |
| EOD alert persisting after sign-off             | 🔴     | Must require resolution; not just a signature click                                                                                                              |

### Admin

| Surface                                              | Status | Gap / Action                                                                               |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Tenant rename                                        | ✅     | —                                                                                          |
| **Verification Queue UX**                            | 🔴     | "Really clunky" — needs header selector (Loan Apps / Mock Releases), richer card density   |
| Mga Miyembro — management actions + trust/vouch      | 🟡     | Three-dot actions, trust data, lenders in list, lender creation → escalation to superadmin |
| **Admin → Superadmin lender creation escalation**    | ❌     | No criteria/docs upload or request escalation flow                                         |
| Testimonial Photo URL not rendering                  | 🔴     | Same as superadmin gap                                                                     |
| **KYC document validation on admin/superadmin side** | 🟡     | Uploads exist at registration; no review/validation workflow on admin side                 |
| Ka-AgapayCommunity layout                            | 🔴     | Same layout gap                                                                            |
| **Settings**                                         | 🔴     | Same expansion gap                                                                         |

### Lender

| Surface                              | Status | Gap / Action                                                                     |
| ------------------------------------ | ------ | -------------------------------------------------------------------------------- |
| **Mga Pag-apruba — header selector** | 🔴     | Header selector for Loan Applications, Mock Fund Releases, etc. Richer card info |
| Mga Miyembro — filters + trust/vouch | 🟡     | Role/branch filters, three-dot actions, trust/vouch data                         |
| **Analytics Insights — remove**      | 🔴     | Must not be visible to Lender                                                    |
| **Nav order fix**                    | 🔴     | Compassion Actions must come before Settings                                     |
| Ka-AgapayCommunity layout            | 🔴     | Same layout gap                                                                  |
| **Settings**                         | 🔴     | Expand + dark mode + a11y. Lender cannot change tenant name                      |

### Member

| Surface                                      | Status | Gap / Action                                                                                                                                      |
| -------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pangkalahatan — design overhaul + KPIs**   | 🟡     | Needs redesign and better KPI layout                                                                                                              |
| **Wallet — immediate top-up exploit**        | 🔴     | Currently any amount is added instantly with no funding source — exploit for paying off loans across branches. Must add strict deposit validation |
| **Loan Application — warn if active loan**   | 🟡     | Must warn user about existing active loan(s) before allowing new application                                                                      |
| **Loan Application form — landscape**        | 🔴     | Portrait orientation; make it landscape                                                                                                           |
| Guarantor search → dropdown                  | 🟡     | Lazy-loading dropdown checkbox from co-branch members                                                                                             |
| Ka-AgapayCommunity layout                    | 🔴     | Same layout gap                                                                                                                                   |
| Compassion Actions — member-facing discovery | 🟡     | Backend exists; member cannot easily find/trigger                                                                                                 |
| **Settings**                                 | 🔴     | Expand: profile photo, username, email, phone, camera/file upload                                                                                 |

---

## Section J — Notifications & Realtime

| Feature                              | Status | Gap / Action                               |
| ------------------------------------ | ------ | ------------------------------------------ |
| Email notifications                  | ✅     | —                                          |
| In-app notification persistence + UI | ✅     | 60s polling                                |
| Real-time (WebSocket/SSE)            | 🟡     | Polling only — feeds require manual reload |
| SMS fallback                         | ⬛     | Out of scope                               |
| Offline-first                        | ❌     | Lower priority; not in immediate roadmap   |

---

## Section K — Compliance, Risk & Abuse

| Feature                                 | Status | Gap / Action                                                                                         |
| --------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| Max branch memberships                  | ✅     | Hard cap enforced                                                                                    |
| Overindebtedness automation             | ✅     | —                                                                                                    |
| **Monthly peer trust voting + lockout** | ❌     | Members vote each other monthly. Non-voters are locked out of dashboard until they complete the vote |
| Cross-tenant token collision            | 🚫     | Fixed                                                                                                |

---

## Section L — Testing

| Feature                                           | Status | Gap / Action                    |
| ------------------------------------------------- | ------ | ------------------------------- |
| Business-rule unit tests                          | ✅     | `tests/business-policy.test.ts` |
| Community isolation tests                         | ✅     | `tests/business-policy.test.ts` |
| **E2E role/use-case coverage**                    | ❌     | No Playwright/Cypress suite     |
| **Edge-case regression (onboarding, money flow)** | ❌     | No regression harness           |
| Penalty/compassion policy tests                   | ❌     | Untested                        |

---

## Prioritized Actionable Backlog

### 🔴 P0 — Critical / Broken (Fix First)

1. Fix `agapay-tanaw/agapay-tanaw` routing duplication; implement branch-homepage-sensitive login/registration
2. Remove sidebar branch switcher → use header selector in global+branch modules
3. Remove hardcoded `#0e1529` sidebar gradient; apply full tenant color palette globally
4. Dynamic "Pangkalahatan" module header (changes per active tab)
5. Fix member login redirect (sometimes lands on Tanaw)
6. Fix Testimonial P2000 column-too-long error; add image upload; remove broken live preview
7. Analytics Insights hidden from Lender view
8. Lender nav: Compassion Actions before Settings
9. Homepage calculator: add Weekly/Bi-weekly cadences; fix overflow; fix rates palette (green-white)
10. Wallet exploit: require actual funding source validation for top-up
11. EOD sign-off must require imbalance resolution, not one-click
12. Loan application form → landscape layout
13. Registration schema-length validation with friendly error messages

### 🟡 P1 — High-Value Partials

14. Franchise billing: pricing page → onboarding form → payment prompt (lifetime only)
15. Multi-tenant password reset UX: cooperative selector for shared emails
16. Idle session lock: warning state + role-aware timeout + user preference
17. Repayment frequency: full end-to-end UX + reporting for weekly/bi-weekly
18. Email templates: inject `agapay_titled.png` header everywhere
19. Cooperative logos: replace letter placeholders in shell, SOA, receipts
20. Community layout: restyle like Instagram/Discord (all roles)
21. Default GCs: superadmin↔admins, admin/lender↔members; initiation rules per role
22. Settings expansion (all roles): profile photo, username, email, phone, dark mode, a11y
23. Verification Queue: header selector (Loan Apps / Mock Releases) + richer cards
24. Mga Miyembro: three-dot actions, trust/vouch columns, staff creation/escalation
25. Produkto ng Loan: global view, guarantor liability %, payment cadence setting
26. Trust score criteria: define formula publicly, add tier progress bar
27. Decommission/recommission lifecycle + data snapshot download for affected users
28. Add Branch "website builder": homepage editing, module flags, color/logo pickers
29. Guarantor liability: configurable per branch admin, overridable by superadmin
30. KYC document validation workflow on admin/superadmin side

### ❌ P2 — New Builds

31. Monthly peer trust voting with dashboard lockout for non-voters
32. Live branch map on main homepage
33. Lifetime subscription plans + loan plans on homepage with benefit lists
34. Dark mode system-wide preference center
35. Guarantor revocation / reassignment lifecycle
36. E2E test suite (Playwright) covering all roles
37. AI-assisted report summaries
38. Real-time (WebSocket/SSE) for community, notifications, reconciliation

---

## Open Question

> **Cron Jobs:** ✅ **RESOLVED — Using Trigger.dev (v4)** as the job scheduler.
> - Implemented in [trigger/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/trigger/default-enforcement.ts)
> - Runs daily at midnight UTC with automatic retries
> - Provides observability dashboard for tracking enforced loans
> - Requires user configuration via `npx trigger.dev login` to set project ID in [trigger.config.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/trigger.config.ts)

---

_Audit revised: 2026-05-04 | Based on PRD.txt, execution matrix, and user annotations._
