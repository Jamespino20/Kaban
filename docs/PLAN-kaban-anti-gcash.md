# PLAN: Agapay Anti-GCash Features & PSGC Rollback

## Phase -1: Context Check

**Goal**: Transform Agapay into a "Business Operating System" with cooperative features (Paluwagan 2.0, Social Verification) while finalizing the `@jobuntux/psgc` Option B integration and applying SEO best practices.

## Phase 0: Socratic Gate / Questions

See the chat for clarifying questions regarding Paluwagan 2.0 penalty distributions and PSGC data structures.

## Phase 1: PSGC Option B & SEO Integration (Immediate Focus)

- [ ] Add `cmdk` and complete the `shadcn/ui` Popover/Command components.
- [ ] Replace the Registration Dropdowns with `LocationComboBox` auto-suggest fields querying `@jobuntux/psgc`.
- [ ] Add global `<head>` SEO metadata (`title`, `description`, OpenGraph, Twitter Cards) to `layout.tsx` targeting E-E-A-T principles.

## Phase 2: Core Database Updates (Prisma)

- [ ] Add `LoanGuarantee` model (Paluwagan 2.0) with Tiered Enforcement (Soft Freeze / Hard Freeze).
- [ ] Add `BusinessLedger` model as a **Double-Entry Accounting System** (Immutable, transaction-linked debits/credits).
- [ ] Add `Account` model to categorize Ledger entries (e.g., `Member_Savings`, `Treasury_Vault`, `Revenue_Interest`).
- [ ] Add `SocialVouch` model (Social Verification / Reputation engine).
- [ ] Add `InterestAudit` model to lock interest formulas at loan inception.
- [ ] Enhance `AuditLog` model with `ip_address` and `user_agent` strings.
- [ ] Implementation of `Prisma.$transaction` wrapper utility for all financial operations.

## Phase 3: The "Anti-GCash" UI Features (Pintuan & Sibol)

- [ ] Build the Group Guarantee flow with a "Voluntary Cover" button (strictly NO auto-deductions).
- [ ] Implement a "Save Progress" state for the KYC/Document Upload bottleneck.
- [ ] Overhaul the Amortization Preview: Explicitly isolate Principal, Interest, Fees, and add the "Total Cost Guarantee".
- [ ] Enforce "Teller Dual-Approval": Require Superadmin digital signature/2FA for manual balance overrides.
- [ ] Build the "Statement of Account" (SOA) generator for clean, downloadable, itemized PDFs.
- [ ] Integrate "Offline Receipting": Allow uploads of physical collector receipts for manual verification.
- [ ] Build the "Credit Path" dashboard (progress bar to 1.5% interest rate).
- [ ] Integrate a "Panic Button / Business Coach" module for premium loans.
- [ ] Build the Sari-Sari Daily Ledger entry component.

## Verification Checklist

- [ ] PSGC loads instantly in the ComboBox without server-side database lag.
- [ ] SEO Lighthouse score > 90 for performance and SEO.
- [ ] Paluwagan 2.0 enforces a minimum of 3 guarantees to trigger the lower interest rate logic.
