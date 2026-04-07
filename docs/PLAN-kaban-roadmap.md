# PLAN: Agapay Comprehensive Roadmap (`agapay-roadmap`)

This document outlines the strategic pivot of Agapay into **Agapay**, a Business Operating System designed for the "Urban Grit" of the Filipino market vendor.

## 🏗️ Phase 4: The "Agapay" Refactor (Identity & Logic)

_Goal: Rebrand and harden the core models to support risk-based pricing._

### [MODIFY] `prisma/schema.prisma`

- **[REBRAND]** Models: `Agapay` terminology to `Agapay`. (e.g., `AgapayVault` -> `AgapayTreasury`).
- **[REFAC]** `User`: Add `business_name`, `interest_tier` (T1, T2, T3), `verification_level`.
- **[REFAC]** `Loan`: Explicitly track `principal_receivable` and `interest_receivable` divisions.
- **[NEW]** `BusinessPermit`: Model for T2 verification (Mayors/DTI).

### [UPDATE] Portal Identity

- **Dashboard**: "Agapay Gabay" (Guide to Growth).
- **Member Portal**: "Agapay Katuwang" (Partner in Progress).
- **Greetings**: Personalized "Magandang umaga, Ma'am [Name]!" based on business profile.

---

## 🎨 Phase 5: The Loyalty Ladder & Credit Scoring

_Goal: Automated Tiering based on Documentation._

### [NEW] Tiered Interest Logic

- **T1 (3%)**: Basic + Barangay Clearance.
- **T2 (2.5%)**: Business Permit (DTI/Mayor's).
- **T3 (2%)**: Payslips + 3x On-time Payment history.

### [NEW] Registration "Vouch" QR

- Integration of QR-based Identity Vouching for members without secondary IDs.

---

## 🏗️ Phase 6: Payment Rails & OCR Automation

_Goal: Speed and Painless Collections._

### [INTEGRATION] Payment Gateway

- **PayMongo/Xendit**: Implementation of Gcash/Maya QR Ph payment links.
- **Direct Debit**: BPI/UnionBank linking for automated collections.

### [NEW] Receipt OCR (Staff Portal)

- Implementation of high-speed verification for uploaded GCash screenshots using OCR suggestions.

---

## 📊 Phase 7: Loan Portfolio Tracking & Reporting

_Goal: Professional AR/AP Ledger transparency._

### [NEW] Portfolio Dashboard

- Real-time tracking of **AR - Principal**, **AR - Interest**, and **Active Loan Headcount**.
- **AP - Member Savings**: Transparency for Share Capital "Owners."

---

## ✅ Verification Plan

### Interest Tiers

- [ ] Upload a Business Permit and verify the `interest_tier` shifts from T1 to T2 automatically (or via staff approval).

### Ledger Integrity

- [ ] Verify that a ₱500 payment correctly splits into `principal_receivable` reductions and `interest_earned` entries.

### PWA Performance

- [ ] Measure Time to Interactive (TTI) on 3G simulation to ensure < 2 seconds.
