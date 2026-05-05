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

| Feature                                | Status | Key Files                                                                                                                                                                                                                                                                                          | Gap / Action                                                                                                                                                                                            |
| -------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical tenant-scoped identity       | ✅     | [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts), [lib/auth.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts), [lib/scoped-identity.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/scoped-identity.ts) | —                                                                                                                                                                                                       |
| Branch-subpath routing `/[branch]/...` | 🔴     | `app/[branch]/agapay-tanaw/`, [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts)                                                                                                                                                                                 | **Subfolder mechanic required.** Paths: `/main/` (main branch), `/[branch]/` (tenant branch), `/[branch]/agapay-tanaw/` (admin), `/[branch]/agapay-pintig/` (member). Branch selector on main homepage. |
| **Header branch-selector**             | 🔴     | `components/layout/branch-switcher.tsx`                                                                                                                                                                                                                                                            | **Remove sidebar branch switcher.** Implement header selector element in global+branch-scoped modules instead.                                                                                          |
| One-DB multi-schema isolation (seed)   | ✅     | [prisma/seed.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/seed.ts), [prisma/init.sql](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/init.sql)                                                                                                       | Working. Must verify runtime API routes use [getBranchPrisma](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts#84-129)                                                     |
| Runtime API schema switching           | 🟡     | [lib/prisma.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts) → [getBranchPrisma](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts#84-129)                                                                                           | Systematic pass across all 30 action files required                                                                                                                                                     |
| Request-side authorization guards      | ✅     | [lib/authorization.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/authorization.ts), [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts)                                                                                                 | —                                                                                                                                                                                                       |
| **Franchise billing stage**            | 🔴     | [actions/subscription-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/subscription-actions.ts), `app/pricing/page.tsx`                                                                                                                                         | **One-time lifetime purchase.** Branch owners (admins) must be able to buy the system. Includes payment plans before superadmin approval.                                                               |
| Mobile API bearer auth                 | ⬛     | —                                                                                                                                                                                                                                                                                                  | Out of scope for this phase                                                                                                                                                                             |

---

## Section B — Public Site, Branding & Content

| Feature                                 | Status | Key Files                                                                                                                                                                                                                                                                  | Gap / Action                                                                                                                                                          |
| --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Language**                            | ✅     | All pages, modals, dialogs, forms                                                                                                                                                                                                                                          | **Standardized to English.** Filipino brand names (Pintig, Tanaw, etc.) remain. Validation messages and labels refactored.                                            |
| Homepage (public)                       | 🟡     | [app/page.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx), `app/about/`, `app/platform/`, `app/about/`                                                                                                                                  | Main landing site. Malolos is the MAIN branch. Live map of branches. Showcase branch content on main homepage.                                                        |
| **Subscription/Loan Plans on Homepage** | ❌     | `app/about/page.tsx`                                                                                                                                                                                                                                                       | Must display **lifetime** pricing benefits. Leads to cooperative application mailing system with specific criteria.                                                   |
| **Dynamic FAQ & Testimonial workflow**  | 🔴     | [actions/site-content.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/site-content.ts), [components/admin/homepage-content-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/homepage-content-tab.tsx) | **P2000 column-too-long error.** Support image uploads. Penting/Published/Rejected segregation with internal scrollbars. Multi-branch content curation for main site. |
| Tenant-branding color customization     | 🔴     | [components/admin/tenant-branding-card.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-branding-card.tsx), [app/globals.css](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/globals.css)                 | **Full palette customization** (Main, Accents, Fonts). Apply globally. Accent colors should affect the entire theme, not just sidebar.                                |
| Email header with `agapay_titled.png`   | 🔴     | [lib/mail.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts)                                                                                                                                                                                 | All automated emails must use the `agapay_titled.png` header photo.                                                                                                   |
| Cooperative logo (shell, SOA, receipts) | 🟡     | `components/layout/authenticated-shell.tsx`, `app/[branch]/reports/soa/`                                                                                                                                                                                                   | Letter placeholders still used; logos not shown in receipts/SOA headers                                                                                               |
| Live branch map on homepage             | ❌     | [app/page.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx)                                                                                                                                                                               | Not implemented                                                                                                                                                       |
| Tenant T&C / DPA consent dashboard      | 🟡     | [components/member/consent-dashboard.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/consent-dashboard.tsx)                                                                                                                         | Member consent flow exists; broader compliance is thin                                                                                                                |

---

## Section C — Authentication, Registration & Account Recovery

| Feature                                          | Status | Key Files                                                                                                                                                                                                                  | Gap / Action                                                                             |
| ------------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Tenant-safe registration                         | ✅     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts)                                                                                                                 | —                                                                                        |
| Registration limited to availed tenants          | ✅     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [actions/tenant.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant.ts)         | —                                                                                        |
| **Branch-homepage-sensitive login/registration** | 🔴     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [proxy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts)                           | A Branch B user must be blocked from logging in on the Branch A homepage, and vice versa |
| Email verification                               | ✅     | [actions/new-verification.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/new-verification.ts), [lib/tokens.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/tokens.ts) | —                                                                                        |
| TOTP-based 2FA                                   | ✅     | [actions/2fa.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/2fa.ts)                                                                                                                           | —                                                                                        |
| **Forgot password — multi-tenant UX**            | 🟡     | [actions/reset.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/reset.ts)                                                                                                                       | **Cooperative selector required** when same email exists across branches.                |
| **Idle session lock**                            | 🟡     | `components/auth/idle-session-timer.tsx`                                                                                                                                                                                   | No warning state. Implement role-aware timeout + accessibility/preference toggles.       |
| **Registration schema robustness**               | ✅     | [actions/register.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts)                                                                                                                 | PSGC names/labels standardized. Field lengths audited.                                   |

---

## Section D — Loan Lifecycle, Policy Engine & Computation

| Feature                             | Status | Key Files                                                                                                                                                                                                                                                                          | Gap / Action                                                                                                                     |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Shared microfinance policy engine   | ✅     | [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                                                                                                                                                           | —                                                                                                                                |
| Loan application validation         | ✅     | [actions/loan-application.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts)                                                                                                                                                         | —                                                                                                                                |
| Overindebtedness blocking           | ✅     | [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                                                                                                                                                           | —                                                                                                                                |
| Loan approval → release → repayment | ✅     | [actions/loan-servicing.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts), [components/admin/verification-queue-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/verification-queue-tab.tsx) | —                                                                                                                                |
| **Repayment frequencies**           | ✅     | [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                                                                                                                                                           | **Weekly, Bi-weekly, Monthly support.** Computation matrix validated.                                                            |
| **Loan application form layout**    | ✅     | [components/member/loan-application-form.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-application-form.tsx)                                                                                                                         | **Refactored to 2-column landscape grid.** Warns users of active loans. Lazy-loading guarantor suggestions.                      |
| SOA from ledger truth               | ✅     | `app/reports/soa/page.tsx`, `lib/reporting/engine.ts`                                                                                                                                                                                                                              | **English standardized.** Includes cooperative logos and "Part of Agapay" caption.                                               |
| Fixed vs declining balance math     | ✅     | [actions/loan-product.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-product.ts)                                                                                                                                                                 | —                                                                                                                                |
| **Homepage loan calculator**        | ✅     | [app/page.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx)                                                                                                                                                                                       | **Responsive layout fixed.** Weekly/Bi-weekly/Monthly cadences added. Standardized to English.                                   |
| **Transactional feedback hooks**    | ❌     | [actions/loan-application.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts)                                                                                                                                                         | Feedback missing for loan release, payment, rejection, and recovery processes.                                                   |
| **Wallet & Ipon module**            | 🔴     | [actions/wallet-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/wallet-actions.ts)                                                                                                                                                             | **Strict deposit validation required.** Prevent magic money / cross-branch debt-laundering. invalid dates in transactions fixed. |

---

## Section E — Default, Penalties, Guarantors & Compassion

| Feature                                   | Status | Key Files                                                                                                                                                                                                                                                                                  | Gap / Action                                                                                                                                                        |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default enforcement + cron                | ✅     | [lib/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [trigger/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/trigger/default-enforcement.ts)                                 | **Using Trigger.dev (v4).** Daily midnight UTC cron. Observed and retriable batch processing.                                                                       |
| **Guarantor liability %**                 | 🟡     | [lib/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [lib/microfinance-policy.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts)                                         | Should be configurable per branch admin. Superadmin can override individual branch settings                                                                         |
| Trust graph (borrower + guarantor impact) | 🟡     | [lib/trust-engine.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/trust-engine.ts)                                                                                                                                                                                 | No full reciprocity; "Community Hero" model absent                                                                                                                  |
| **Monthly peer voting for trust scores**  | ❌     | [lib/trust-engine.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/trust-engine.ts)                                                                                                                                                                                 | Members must vote for each other's trust monthly. If a user does not vote within the period, they are **temporarily locked out of their dashboard** until they vote |
| Compassion request + admin approval       | ✅     | [actions/compassion-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/compassion-actions.ts), [components/admin/compassion-actions-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/compassion-actions-tab.tsx) | Member-facing discovery still thin                                                                                                                                  |
| EOD reconciliation sign-off               | 🔴     | [components/admin/reconciliation-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/reconciliation-tab.tsx)                                                                                                                                         | Banner does not clear after sign-off. **EOD cannot be a one-click sign-off.** There must be actual resolution attempts before sign-off is permitted                 |
| Guarantor revocation / reassignment       | ❌     | —                                                                                                                                                                                                                                                                                          | No lifecycle for revoking or reassigning a guarantor                                                                                                                |

---

## Section F — Community, Mentorship & Messaging

| Feature                                         | Status | Key Files                                                                                                                                  | Gap / Action                                                                                                 |
| ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Tenant-scoped DMs, branch rooms, group chats    | ✅     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)               | —                                                                                                            |
| Replies, reactions, attachments, unread         | ✅     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)               | Data contract exists                                                                                         |
| Mentorship endorsement                          | ✅     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)               | —                                                                                                            |
| Cross-tenant isolation                          | ✅     | `tests/business-policy.test.ts`                                                                                                            | —                                                                                                            |
| **Community layout (all roles)**                | 🔴     | [components/member/community-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/community-tab.tsx) | **Discord/Instagram-style layout.** In-chat emoji picker. Internal popups and selectors to reduce scrolling. |
| **Default GCs and initiation rules**            | ❌     | [actions/community-actions.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts)               | Superadmins ↔ Admins GCs. Admin/Lender ↔ Member GCs. Member initiation strictly limited to staff/admins.     |
| Rich messaging UI (emoji, attachments, threads) | 🟡     | [components/member/community-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/community-tab.tsx) | Add emoji picker. Improve Composer UX. Dynamic updates (Websockets/SSE) for in-chat feed.                    |
| Notification bell / tray (60s polling)          | ✅     | `components/layout/notification-bell.tsx`                                                                                                  | Poll-only; no WebSocket                                                                                      |
| SMS fallback                                    | ⬛     | —                                                                                                                                          | Out of scope                                                                                                 |
| Real-time (WebSocket/push)                      | 🟡     | —                                                                                                                                          | Polling only                                                                                                 |
| Offline-first                                   | ❌     | —                                                                                                                                          | Not implemented (lower priority)                                                                             |

---

## Section G — Analytics, Reporting & Operational Oversight

| Feature                                  | Status | Key Files                                                                                                                                                                                                                                                                  | Gap / Action                                                                                                                                                                   |
| ---------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **KPI + trust score criteria**           | 🔴     | `app/agapay-tanaw/page.tsx`, [lib/trust-engine.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/trust-engine.ts)                                                                                                                                    | **The trust score criteria for a branch (and for all Agapay operations) are undefined and vague.** Must define the exact formula and surface it. Add a trust/tier progress bar |
| **Tier upgrade criteria + progress bar** | ❌     | `components/analytics/trust-distribution-chart.tsx`                                                                                                                                                                                                                        | No progress indicator showing how members level up (Starter → Growth → Trusted → Elite)                                                                                        |
| Analytics Insights (operations module)   | ✅     | [components/admin/analytics-dashboard-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/analytics-dashboard-tab.tsx)                                                                                                               | —                                                                                                                                                                              |
| **Analytics Insights visible to Lender** | 🔴     | `app/agapay-tanaw/page.tsx`                                                                                                                                                                                                                                                | Remove Analytics Insights from Lender's view                                                                                                                                   |
| EOD reconciliation                       | 🔴     | [actions/reconciliation.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/reconciliation.ts), [components/admin/reconciliation-tab.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/reconciliation-tab.tsx) | Analytics is the main highlight. Sign-off must require actual imbalance resolution, not just a click                                                                           |
| Audit logs                               | ✅     | [components/admin/audit-log-viewer.tsx](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/audit-log-viewer.tsx)                                                                                                                             | —                                                                                                                                                                              |
| AI-assisted report summaries             | ❌     | —                                                                                                                                                                                                                                                                          | Not yet built                                                                                                                                                                  |

---

## Section H — Dashboard UX, Layout & Accessibility

| Feature                                   | Status | Key Files                                                                                                                                | Gap / Action                                                              |
| ----------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Authenticated sidebar shell               | ✅     | `components/layout/authenticated-shell.tsx`                                                                                              | —                                                                         |
| Scroll-reset on tab switch                | ✅     | `components/layout/dashboard-tabs-shell.tsx`                                                                                             | —                                                                         |
| **Dynamic "Pangkalahatan" header**        | 🔴     | `app/agapay-tanaw/page.tsx`, `app/agapay-pintig/page.tsx`                                                                                | Header content must change based on the active module, not stay stagnant. |
| **Dark mode / accessibility preferences** | ❌     | [app/globals.css](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/globals.css)                                       | Profile preference center: theme, font sizes, a11y toggles.               |
| Login redirect & Scroll Reset             | ✅     | [lib/auth.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts), `components/layout/dashboard-tabs-shell.tsx` | Redirection and scroll-reset on switch are stable.                        |

---

## Section I — Role-by-Role Product Fit

### Superadmin

| Surface                                   | Status | Gap / Action                                                                                                                                    |
| ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Header branch-selector**                | 🔴     | Remove sidebar switcher. Use header selector per module instead                                                                                 |
| **Branch/homepage website builder**       | ❌     | Create new website directories with customizable colors, logos, fonts, and homepage content. Main branch homepage curation of branch content.   |
| **Decommission + Recommission lifecycle** | 🟡     | On decommission: users see data download snapshot. Recommissioning rewards compensation bonuses.                                                |
| Mga Miyembro — management actions         | 🟡     | **Three-dot actions.** Vouch scores, trust meters. Branch column. staff creation (Admin/Lender) with cooperative region assignment.             |
| Produkto ng Loan — global view            | 🟡     | Header selector (branches vs global). **Three-dot actions.** Guarantor liability % column. Payment cadence settings.                            |
| Global Tenant Mgmt — region segregation   | 🟡     | Segregate branches by regional logic. Add Branch includes logo upload and hex color pickers.                                                    |
| **Testimonial Moderation**                | 🔴     | P2000 column error. Photo URL rendering fix. Published/Rejected segregation with internal scrollbars. Show creator admin for FAQs/Testimonials. |
| Ka-AgapayCommunity layout                 | 🔴     | Instagram/Discord-style layout. In-chat emoji picker. Popups for community navigation.                                                          |
| **Settings**                              | 🔴     | Expand: Profile image, username, email, phone. Dark mode and accessibility preferences.                                                         |
| EOD Reconcilliation Sign-off              | 🔴     | **Not a one-click sign-off.** Require imbalance resolution attempts. Banner must clear after signature.                                         |

### Admin

| Surface                                           | Status | Gap / Action                                                                                      |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| **Verification Queue UX**                         | 🔴     | **Header selector required** (Loan Applications / Mock Releases). Card info density improvements. |
| Mga Miyembro — management actions                 | 🟡     | **Three-dot actions.** Trust meters, lenders list. Lender creation requests to superadmin.        |
| **Admin → Superadmin lender creation escalation** | ❌     | Escalation flow with criteria/docs upload for new lender requests.                                |
| **KYC document validation**                       | 🟡     | Admin side validation workflow for ID, Barangay Cert, and Business Permit.                        |
| Ka-AgapayCommunity layout                         | 🔴     | Instagram/Discord-style layout. In-chat emoji picker.                                             |
| **Settings**                                      | 🔴     | Profile photo, username, email, phone. Dark mode, a11y preferences.                               |

### Lender

| Surface                              | Status | Gap / Action                                                                    |
| ------------------------------------ | ------ | ------------------------------------------------------------------------------- |
| **Mga Pag-apruba — header selector** | 🔴     | Loan Applications vs Mock Fund Releases. **Three-dot actions.** Rich card info. |
| Mga Miyembro — filters               | 🟡     | Role/branch filters. **Three-dot actions.** Trust/vouch meter standardization.  |
| **Analytics Insights — remove**      | 🔴     | Not for the lender role to see.                                                 |
| **Nav order fix**                    | 🔴     | **Compassion Actions, then Settings.**                                          |
| Ka-AgapayCommunity layout            | 🔴     | Instagram/Discord-style layout.                                                 |
| **Settings**                         | 🔴     | Profile photo, contact info. Dark mode/a11y. Cannot change tenant name.         |

### Member

| Surface                             | Status | Gap / Action                                                                                         |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| **Pangkalahatan — design overhaul** | 🟡     | Redesign with optimized KPIs and information layout.                                                 |
| **Wallet & Ipon module**            | 🔴     | **Strict deposit validation.** Table dropdowns for transaction details. Prevent magic money exploit. |
| **Loan Application — guardrails**   | 🟡     | Warn if active loan exists. Standardized English application UI. Landscape layout.                   |
| **Loan Application — search**       | 🟡     | Guarantor search to checkbox dropdown with co-branch suggestions.                                    |
| Ka-AgapayCommunity layout           | 🔴     | Instagram/Discord-style layout. Popups/selectors for scrolling reduction.                            |
| **Compassion Actions**              | 🟡     | Member-facing discovery and trigger flow.                                                            |
| **Settings**                        | 🔴     | Profile photo, username, email, phone, dark mode, a11y. Camera/File upload.                          |

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
>
> - Implemented in [trigger/default-enforcement.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/trigger/default-enforcement.ts)
> - Runs daily at midnight UTC with automatic retries
> - Provides observability dashboard for tracking enforced loans
> - Requires user configuration via `npx trigger.dev login` to set project ID in [trigger.config.ts](file:///c:/Users/James%20Bryant/Documents/Agapay/agapay-web/trigger.config.ts)

---

_Audit revised: 2026-05-04 | Based on PRD.txt, execution matrix, and user annotations._
