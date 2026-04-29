# AGAPAY PRD Execution Matrix

Last reviewed: 2026-04-28  
Source of truth compared: [PRD.txt](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/PRD.txt) against the current `agapay-web` working tree.

## Status legend

- `Implemented`: present in source and materially aligned with the PRD intent.
- `Partial`: present, but incomplete, thin, under-polished, or only partly aligned.
- `Missing`: not found in the current codebase.
- `Broken`: present, but there is a clear correctness or flow problem in current source.
- `Stale report`: PRD or earlier review concern no longer reproduces in the current working tree.

## Snapshot summary

- The security and tenant-isolation core is much stronger than before and is no longer the main blocker.
- The shared microfinance policy layer exists and is shaping loan application, servicing, trust, branch-membership, and overindebtedness decisions.
- The biggest gap is now product completeness: member/staff UX, notifications UI, compact workflows, richer messaging UI, compliance/ops surfaces, and broader test coverage.
- Backend maturity is currently ahead of frontend maturity.

## A. Core Platform and Multi-Tenant Isolation

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Canonical tenant-scoped identity | Implemented | [src/lib/auth.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts), [src/lib/auth.config.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.config.ts), [src/lib/scoped-identity.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/scoped-identity.ts), [src/actions/identity.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/identity.ts) | Current source uses tenant-aware identity and guarded branch switching. |
| Branch switching only from proven memberships | Implemented | [src/lib/auth.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts), [src/actions/identity.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/identity.ts), [src/components/layout/branch-switcher.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/branch-switcher.tsx) | `superadmin` also supports explicit `Global View`. |
| Superadmin global vs branch-scoped mode | Implemented | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx), [src/components/layout/branch-switcher.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/branch-switcher.tsx), [src/lib/auth.config.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.config.ts) | This is one of the stronger parts of the current app. |
| Tenant lifetime entitlement / availing gate | Implemented | [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma), [prisma/migrations/20260429093000_tenant_lifetime_entitlement/migration.sql](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/migrations/20260429093000_tenant_lifetime_entitlement/migration.sql), [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts), [src/proxy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts), [src/app/tenant-access/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/tenant-access/page.tsx) | Tenants now have first-class `prospect` / `active` / `suspended` access state for one-time lifetime availing. |
| Request-side authorization guards | Implemented | [src/lib/authorization.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/authorization.ts), [src/actions/admin-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/admin-actions.ts), [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts) | Replaced earlier trust-in-page-placement behavior. |
| Report access isolation | Implemented | [src/app/reports/soa/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/reports/soa/page.tsx), [src/app/api/reports/soa/route.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/api/reports/soa/route.ts) | Current source checks session/role instead of query-string trust. |
| Fake Prisma RLS wrapper removed | Implemented | [src/lib/prisma.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma.ts) | No longer claims automatic tenant isolation it cannot enforce. |

## B. Public Site, Branding, and Content

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Filipino-first public homepage with Agapay positioning | Implemented | [src/app/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx), [src/app/about/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/about/page.tsx), [src/app/platform/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/platform/page.tsx), [src/app/pricing/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/pricing/page.tsx) | Public content is much closer to the product story now. |
| Dynamic FAQ and testimonial workflow | Implemented | [src/actions/site-content.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/site-content.ts), [src/components/admin/homepage-content-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/homepage-content-tab.tsx), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Admin proposal + superadmin publication workflow exists. |
| Contact form with feedback + email | Implemented | [src/app/contact/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/contact/page.tsx), [src/actions/site-content.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/site-content.ts), [src/lib/mail.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts) | Submission currently fails if email cannot send, by design. |
| Cooperative application / branch onboarding intake | Missing | [src/app/contact/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/contact/page.tsx), [src/components/admin/tenant-management-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-management-tab.tsx) | There is contact and tenant management, but no dedicated cooperative application flow with requirements and review stages. |
| Superadmin-recorded one-time lifetime availing | Implemented | [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts), [src/components/admin/tenant-management-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-management-tab.tsx) | Superadmin can now mark tenants as availed and operational instead of treating all tenants as automatically live. |
| Tenant-specific consent, T&C, DPA dashboard | Missing | [src/app/terms/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/terms/page.tsx), [src/app/privacy/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/privacy/page.tsx), [src/components/auth/enhanced-register-form.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/auth/enhanced-register-form.tsx) | Static pages exist and registration accepts terms generally, but there is no managed consent dashboard or tenant-specific acceptance record. |

## C. Authentication, Registration, and Account Recovery

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Tenant-safe registration | Implemented | [src/actions/register.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [src/components/auth/enhanced-register-form.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/auth/enhanced-register-form.tsx) | Registration is tenant-bound and verification-token flow is tenant-aware. |
| Registration limited to live/availed tenants | Implemented | [src/actions/register.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts), [src/actions/tenant.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant.ts) | Public tenant lists now exclude non-availed tenants, and registration rejects non-operational branches. |
| Email verification | Implemented | [src/actions/new-verification.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/new-verification.ts), [src/lib/tokens.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/tokens.ts), [src/lib/mail.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts) | Current flow is much safer than the earlier email-only token model. |
| Authenticator-based 2FA | Implemented | [src/actions/2fa.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/2fa.ts), [src/components/auth/two-factor-setup.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/auth/two-factor-setup.tsx), [src/lib/auth.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts) | Login flow now treats `2fa_required` as an expected auth step. |
| Forgot-password / password reset | Missing | [src/app/auth/login/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/auth/login/page.tsx), [src/actions/register.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [src/lib/tokens.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/tokens.ts) | No reset-token route, request action, or reset form is present. |
| Inactivity timeout / idle session lock | Missing | [src/components/providers/session-provider.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/providers/session-provider.tsx), [src/lib/auth.config.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.config.ts) | No idle timer or inactivity UX was found. |
| Registration overflow robustness | Broken | [src/actions/register.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Real-world PSGC names and profile strings can still plausibly hit DB length limits and return generic transaction failure. This needs schema-length audit plus friendlier validation. |

## D. Loan Lifecycle, Policy Engine, and Financial Computation

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Shared microfinance policy engine | Implemented | [src/lib/microfinance-policy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts) | Central source for tier caps, rates, guarantor limits, penalties, and some compassion constraints. |
| Loan application validation by tier and branch context | Implemented | [src/actions/loan-application.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts), [src/components/member/loan-application-form.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-application-form.tsx) | Includes same-tenant guarantor validation and overindebtedness blocking. |
| Loan approval, release, and repayment verification | Implemented | [src/actions/loan-servicing.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts), [src/components/admin/verification-queue-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/verification-queue-tab.tsx), [src/components/member/loan-servicing-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-servicing-tab.tsx) | Core mock money-flow path is present and working. |
| Repayment frequency support (`weekly`, `bi_weekly`, `monthly`) | Partial | [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma), [src/actions/loan-application.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts), [src/lib/default-enforcement.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [src/actions/loan-servicing.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts) | Persisted and used in several paths, but the product still feels monthly-first and needs fuller end-to-end UX/reporting support. |
| Overindebtedness hard blocking | Implemented | [src/lib/microfinance-policy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts), [src/actions/loan-application.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts) | Blocks new applications based on exposure and delinquency rules. |
| SOA uses ledger truth as source of truth | Implemented | [src/app/reports/soa/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/reports/soa/page.tsx), [src/actions/ledger.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/ledger.ts), [src/lib/reporting/engine.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/reporting/engine.ts) | Earlier double-subtraction finding no longer reproduces in current source. |
| Wallet and deposit/withdrawal rails | Partial | [src/actions/wallet-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/wallet-actions.ts), [src/components/member/wallet-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/wallet-tab.tsx) | Mock wallet exists but still needs stronger anti-abuse, clearer funding rules, and tighter UX. |
| Real declining-balance vs flat product differentiation | Partial | [src/actions/loan-product.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-product.ts), [src/components/admin/create-product-form.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/create-product-form.tsx), [src/app/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/page.tsx) | Product rules improved, but end-to-end computation transparency and product-model clarity still need work. |

## E. Default, Penalties, Guarantors, and Compassion

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Default enforcement and overdue automation | Implemented | [src/lib/default-enforcement.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [src/app/api/cron/default-enforcement/route.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/api/cron/default-enforcement/route.ts) | Scheduled/default enforcement pipeline exists. |
| Same-tenant guarantor rules | Implemented | [src/actions/loan-application.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts), [src/actions/member-search.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/member-search.ts), [src/components/member/guarantee-request-panel.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/guarantee-request-panel.tsx) | Current source enforces tenant-safe guarantor discovery and selection. |
| Guarantor liability enforcement | Partial | [src/lib/default-enforcement.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/default-enforcement.ts), [src/lib/microfinance-policy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts) | Policy exists, but the full lifecycle UX and ledger visibility for guarantor catchment remains thin. |
| Compassion request modeling and staff action | Partial | [src/actions/compassion-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/compassion-actions.ts), [src/components/admin/compassion-actions-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/compassion-actions-tab.tsx), [prisma/migrations/20260424133000_compassion_admin_notes_reconcile/migration.sql](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/migrations/20260424133000_compassion_admin_notes_reconcile/migration.sql) | Backend/admin support exists, but member-facing discovery and guided request flow still feel light. |
| Guarantor revocation / transfer / reassignment | Missing | [src/actions/loan-application.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts), [src/actions/loan-servicing.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts) | No clear reassignment/revocation lifecycle found. |

## F. Community, Mentorship, and Messaging

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Tenant-scoped direct messaging backend | Implemented | [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Direct conversations are modeled with participant isolation. |
| Branch rooms | Implemented | [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Backend support exists for branch/tenant-scoped rooms. |
| Group chats | Implemented | [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Current backend requires tenant context and minimum participants. |
| Replies, reactions, attachments, unread state | Implemented | [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma), [prisma/migrations/20260424193000_message_replies_notifications_limits/migration.sql](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/migrations/20260424193000_message_replies_notifications_limits/migration.sql) | The data contract is there. |
| Mentorship endorsement | Implemented | [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma), [src/components/admin/community-operations-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/community-operations-tab.tsx) | Formal mentorship is modeled as an endorsed relationship, not just chat. |
| Rich messaging UI matching backend capabilities | Partial | [src/components/member/community-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/community-tab.tsx), [src/components/admin/community-operations-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/community-operations-tab.tsx) | Backend supports much more than the current UI exposes. No polished emoji picker, attachment flow, lazy thread loading UX, or strong chat ergonomics yet. |
| Notification backend for community/system events | Implemented | [src/lib/notifications.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/notifications.ts), [src/lib/mail.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts), [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts) | Event plumbing exists for notifications and emails. |
| Notification inbox / bell / end-user UI | Missing | [src/lib/notifications.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/notifications.ts), [src/components/layout/authenticated-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx) | Backend exists, but no visible notification center was found. |
| Cross-tenant conversation isolation | Implemented | [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts), [tests/business-policy.test.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/tests/business-policy.test.ts) | Isolation is part of the current community policy/testing surface. |

## G. Analytics, Reporting, and Operational Oversight

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Tanaw trust distribution uses all 5 tiers | Implemented | [src/actions/admin-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/admin-actions.ts), [src/components/analytics/trust-distribution-chart.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/analytics/trust-distribution-chart.tsx) | Earlier flattened-tier concern no longer reproduces in current source. |
| KPI / overview dashboard | Implemented | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx), [src/components/analytics/kpi-metric-card.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/analytics/kpi-metric-card.tsx), [src/components/analytics/trust-meter.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/analytics/trust-meter.tsx) | Overview is reasonably established. |
| Analytics Insights module | Partial | [src/actions/analytics-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/analytics-actions.ts), [src/components/admin/analytics-dashboard-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/analytics-dashboard-tab.tsx), [src/lib/analytics-logger.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/analytics-logger.ts), [src/proxy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/proxy.ts) | Module exists and is wired, but PRD complaints about thin or empty analytics remain credible if traffic/interaction logs are sparse. |
| Audit logs | Implemented | [src/components/admin/audit-log-viewer.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/audit-log-viewer.tsx), [src/lib/prisma-audit.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/prisma-audit.ts) | Current source supports filtering, pagination, and card expansion. |
| End-of-day reconciliation / imbalance alerting | Missing | [src/actions/ledger.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/ledger.ts), [src/actions/wallet-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/wallet-actions.ts) | Reconciliation and imbalance warnings are not implemented as an operator workflow. |
| AI-assisted report summaries / clustering / guidance | Missing | [src/actions/analytics-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/analytics-actions.ts) | No meaningful AI operations layer is present yet. |

## H. Dashboard UX, Layout Density, and Accessibility

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Shared authenticated sidebar shell | Implemented | [src/components/layout/authenticated-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx), [src/components/layout/dashboard-tabs-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/dashboard-tabs-shell.tsx) | Shell is now stable, sticky, and role-aware. |
| Scroll-reset behavior across dashboard tabs | Implemented | [src/components/layout/dashboard-tabs-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/dashboard-tabs-shell.tsx), [src/components/layout/authenticated-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx) | Major usability improvement already landed. |
| Compact, low-literacy operator UX across major tabs | Partial | [src/components/member/loan-application-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-application-tab.tsx), [src/components/member/loan-servicing-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-servicing-tab.tsx), [src/components/admin/verification-queue-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/verification-queue-tab.tsx), [src/components/admin/homepage-content-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/homepage-content-tab.tsx), [src/components/admin/feedback-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/feedback-tab.tsx), [src/components/admin/audit-log-viewer.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/audit-log-viewer.tsx) | Some compaction work exists, but many screens still feel too spacious and require more guided grouping. |
| Long-list containment with filters / pagination / inner scroll | Partial | [src/components/admin/member-directory-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/member-directory-tab.tsx), [src/components/admin/feedback-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/feedback-tab.tsx), [src/components/admin/audit-log-viewer.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/audit-log-viewer.tsx), [src/components/admin/verification-queue-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/verification-queue-tab.tsx) | Better than before, but not yet consistently compact or beginner-friendly. |
| Dark mode / accessibility preferences | Missing | [src/components/layout/authenticated-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx), [src/app/globals.css](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/globals.css) | No real preference center or accessibility toggles were found. |

## I. Role-by-Role Product Fit

### Superadmin

| Surface | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Global overview and branch context switching | Implemented | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx), [src/components/layout/branch-switcher.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/branch-switcher.tsx) | One of the strongest role flows currently. |
| Global tenant management | Implemented | [src/components/admin/tenant-management-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-management-tab.tsx), [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts) | Present, though not yet especially polished. |
| Tenant/company rename by superadmin | Implemented | [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts), [src/components/admin/tenant-management-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-management-tab.tsx) | Superadmin can rename tenants and manage entitlement state from tenant management. |
| Mature global operations center | Partial | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx) | Core modules are there, but the final “control tower” feel is still incomplete. |

### Admin

| Surface | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Tenant approvals, members, products, content, feedback | Implemented | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx), [src/actions/admin-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/admin-actions.ts) | Functionally present. |
| Tenant/company rename by admin | Implemented | [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts), [src/components/admin/tenant-name-settings-card.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-name-settings-card.tsx), [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx) | Admin can rename the current tenant from Settings; access control keeps it tenant-scoped. |
| Admin workflow polish | Partial | [src/components/admin/verification-queue-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/verification-queue-tab.tsx), [src/components/admin/member-directory-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/feedback-tab.tsx) | Still needs compacting and clearer next-action framing. |
| Admin-to-superadmin lender creation/request workflow | Missing | [src/components/admin/tenant-management-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/tenant-management-tab.tsx), [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts) | No explicit lender-request escalation flow was found. |

### Lender

| Surface | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Lender access to Tanaw operations | Implemented | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx) | Role is supported. |
| Distinct lender UX and sharply defined responsibilities | Partial | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx), [src/components/admin/community-operations-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/admin/community-operations-tab.tsx) | Lender is still the least differentiated role. |

### Member

| Surface | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Pintig shell and role segregation | Implemented | [src/app/agapay-pintig/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-pintig/page.tsx), [src/components/layout/authenticated-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx) | Current shell is stable and role-safe. |
| Loan application and repayment | Implemented | [src/components/member/loan-application-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-application-tab.tsx), [src/components/member/loan-servicing-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/loan-servicing-tab.tsx) | Core business flow exists. |
| Wallet clarity and starter-tier education | Partial | [src/components/member/wallet-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/wallet-tab.tsx), [src/app/agapay-pintig/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-pintig/page.tsx) | Still needs clearer guidance, denser layout, and stronger safeguards. |
| Community / mentorship UX | Partial | [src/components/member/community-tab.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/member/community-tab.tsx) | Backend supports more than the current member UI reveals. |
| Full settings / preferences / profile center | Missing | [src/app/agapay-pintig/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-pintig/page.tsx), [src/components/auth/two-factor-setup.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/auth/two-factor-setup.tsx) | Security settings exist, but no real settings center. |

## J. Notifications, Realtime, Offline, and Communications

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Email notifications | Implemented | [src/lib/mail.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts), [src/actions/site-content.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/site-content.ts), [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts) | Email is used in several operational flows. |
| In-app notification persistence | Implemented | [src/lib/notifications.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/notifications.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Model and creation path exist. |
| Notification UI | Missing | [src/lib/notifications.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/notifications.ts), [src/components/layout/authenticated-shell.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/layout/authenticated-shell.tsx) | No bell tray or inbox surface found. |
| SMS fallback | Missing | [src/lib/mail.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/mail.ts) | No SMS provider or SMS action found. |
| Real-time updates / subscriptions | Missing | [src/components/providers/session-provider.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/providers/session-provider.tsx), [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts) | Current app relies on refresh/revalidation patterns, not live sync. |
| Offline-first capability | Missing | [src/app/layout.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/layout.tsx), [src/app/globals.css](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/globals.css) | No service worker, local cache strategy, or offline queueing found. |

## K. Compliance, Risk, and Abuse Controls

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Non-superadmin max branch memberships | Implemented | [src/lib/auth.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/auth.ts), [src/actions/identity.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/identity.ts), [src/lib/microfinance-policy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts) | Hard-capped to reduce abuse and laundering-style branch hopping. |
| Overindebtedness automation | Implemented | [src/lib/microfinance-policy.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/microfinance-policy.ts), [src/actions/loan-application.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-application.ts) | Current source blocks new applications when risk conditions are met. |
| Public backup download exposure | Stale report | [src/actions/tenant-management.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/tenant-management.ts), [src/app/api/admin/backups/[id]/route.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/api/admin/backups/%5Bid%5D/route.ts) | Current source writes backups outside `public` and protects access. |
| Cross-tenant token collision | Stale report | [src/lib/tokens.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/lib/tokens.ts), [src/actions/new-verification.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/new-verification.ts), [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma) | Token scoping has been corrected. |

## L. Testing and Verification

| PRD area | Status | Evidence files | Notes / gap |
|---|---|---|---|
| Targeted business-rule tests | Implemented | [tests/business-policy.test.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/tests/business-policy.test.ts) | Good start for policy confidence. |
| Messaging/community isolation tests | Partial | [tests/business-policy.test.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/tests/business-policy.test.ts), [src/actions/community-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/community-actions.ts) | Some policy testing exists, but the broader community matrix is still thin. |
| End-to-end role/use-case coverage | Missing | [src/app/agapay-tanaw/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-tanaw/page.tsx), [src/app/agapay-pintig/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/agapay-pintig/page.tsx) | No substantial E2E or integrated scenario test suite was found. |
| Edge-case regression harness for onboarding and money flow | Missing | [src/actions/register.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts), [src/actions/wallet-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/wallet-actions.ts), [src/actions/loan-servicing.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/loan-servicing.ts) | This remains a major quality gap. |

## M. Earlier Review Findings Rechecked

| Earlier finding | Current status | Evidence files | Notes |
|---|---|---|---|
| SOA balance still subtracts payments twice | Stale report | [src/app/reports/soa/page.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/app/reports/soa/page.tsx) | Current source uses `balance_remaining` directly. |
| Tanaw trust distribution still flattens 5 tiers into 3 | Stale report | [src/actions/admin-actions.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/admin-actions.ts), [src/components/analytics/trust-distribution-chart.tsx](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/components/analytics/trust-distribution-chart.tsx) | Current source exposes the full 5-tier distribution. |

## N. Working Refactor Priorities

These are the highest-value next areas based on the current matrix:

1. Fix registration robustness and schema-length validation in [src/actions/register.ts](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/src/actions/register.ts) and related profile fields in [prisma/schema.prisma](/C:/Users/James%20Bryant/Documents/Agapay/agapay-web/prisma/schema.prisma).
2. Build the missing account-recovery flow: password reset request, token, route, and reset form.
3. Surface the existing notification backend with a real inbox/bell UI.
4. Finish the messaging frontend so it matches the backend contract: replies, reactions, attachments, room/group UX, better lazy loading.
5. Continue the compact UX pass on `Verification Queue`, `Wallet`, `Feedback`, `Audit Logs`, and `Compassion Actions`.
6. Add compliance/ops surfaces that the PRD calls out: cooperative application intake, consent/DPA tracking, reconciliation, and stronger wallet controls.
7. Expand automated coverage beyond policy-unit tests into onboarding, community isolation, and role-based end-to-end scenarios.
