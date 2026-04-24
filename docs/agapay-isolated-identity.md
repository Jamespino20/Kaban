# AGAPAY: A Cooperative-Based Microfinance SaaS

**Tagline:** Iyong Agapay, Ating Tagumpay

---

# 1. INTRODUCTION

## 1.1 Background

Microfinance in the Philippines supports underserved sectors like sari-sari store owners and small entrepreneurs. However:

- Informal lenders (“5-6”) impose exploitative rates
- Digital platforms lack transparency and community accountability

There is a need for a system that balances **sustainability, fairness, and trust**.

## 1.2 Purpose

Agapay is a **multi-tenant microfinance SaaS** for cooperatives featuring:

- Transparent lending
- Trust scoring
- Guarantor systems
- Ethical penalties and compassion policies

It enables a **fair, community-driven lending ecosystem**.

---

# 2. SYSTEM OVERVIEW

## 2.1 Architecture

Agapay uses a **multi-tenant model**, where each cooperative operates independently.

**Components:**

- **Agapay Pintig:** Member app (borrowers/guarantors)
- **Agapay Tanaw:** Admin dashboard
- **Super Admin Panel:** Global system control

## 2.2 Roles

- **Borrower:** Applies, repays, builds trust
- **Guarantor:** Endorses and shares risk
- **Admin:** Approves loans, monitors system
- **Super Admin:** Oversees all tenants

---

# 3. LOAN SYSTEM

## 3.1 Structure

- Amount: ₱5,000 – ₱100,000+
- Term: 3–12 months
- Frequency: Weekly to Monthly
- Interest: 3–5% monthly

## 3.2 Amortization

- **Fixed:** Equal payments (beginners)
- **Declining Balance:** Lower interest over time (trusted users)

## 3.3 Progression

- Starter → Growth → Trusted → Elite
- Based on repayment history and trust

---

# 4. TRUST SYSTEM

## 4.1 Components

- Payment Reliability (40%)
- Business Performance (20%)
- Peer Reviews (20%)
- Guarantor Feedback (20%)

## 4.2 Trust Graph

Users are connected through guarantors and peers. Defaults affect the network.

## 4.3 Incentives

- Lower interest
- Higher limits
- Faster approvals

---

# 5. PENALTY SYSTEM

## 5.1 Rates (on missed payments only)

- 1–3 days: 2%
- 4–7 days: 5%
- 8–14 days: 8%
- 15–30 days: 12%
- 30+ days: Default

## 5.2 Safeguards

- Max 20% cap
- No compounding
- Transparent computation

## 5.3 Actions

- At Risk → Notifications
- Delinquent → Penalties
- Default → Freeze + reputation loss

---

# 6. GUARANTOR SYSTEM

- 1–2 guarantors required
- Must be verified users

**Default Case:**

- Guarantors pay 20–30%
- Trust score reduced

**Effect:** Encourages responsible endorsements and lowers risk

---

# 7. COMPASSION POLICY

## Triggers

- Disasters
- Medical emergencies
- Business disruption

## Actions

- Grace period
- Restructuring
- Penalty freeze

**Limit:** Once per loan cycle, requires approval

---

# 8. FRAUD PREVENTION

- **Docs:** ID, barangay certificate, permit
- **Liveness:** Selfie/video
- **Social:** Guarantor validation

**Mitigation:**

- Low starting limits
- Trust-based scaling

---

# 9. LOAN WORKFLOW

1. Register & verify
2. Trust scoring
3. Apply
4. Admin approval
5. Disbursement
6. Repayment tracking
7. Completion/default

---

# 10. SAMPLE SCENARIOS

**Successful Loan:**

- ₱5,000, fully paid → trust increase → upgrade

**Late Payment:**

- ₱500 missed → 5% penalty = ₱25

**Default:**

- ₱6,000 balance → guarantors pay share → account frozen

**Emergency:**

- Grace period + penalty freeze → repayment continues

---

# 11. ADVANTAGES

**Vs Informal Lending:**

- Lower rates
- Structured system
- No exploitation

**Vs Digital Platforms:**

- Transparent computation
- Community trust
- Compassion mechanisms

---

# 12. MULTI-TENANT DESIGN

## 12.1 Problem

Cooperatives require strict data privacy.

## 12.2 Solution

Agapay uses **logical isolation** via `tenant_id`.

- Users register per cooperative
- UI is tenant-branded
- Data is fully separated

---

# 13. IDENTITY MODEL

- Unique key: **(tenant_id + email)**
- Same email can exist in multiple tenants

**Result:**
Separate passwords, trust scores, and histories per cooperative

---

# 14. TENANT CUSTOMIZATION

Each cooperative controls:

- Interest rates
- Loan terms
- Risk policies

**Declining Balance Formula:**
Interest = Remaining Principal × Rate

---

# 15. LOCALIZED TRUST

Trust is **tenant-specific**

- Good standing in one coop ≠ others
- Prevents cross-community penalty

---

# 16. KAAGAPAY SYSTEM

- Guarantors must belong to same tenant
- Liability only affects that tenant

---

# 17. PENALTIES & REVENUE

- Applied only to overdue installment
- No abuse or compounding
- Revenue stays with cooperative
- Agapay earns via SaaS subscription

---

# 18. LOCALIZED COMPASSION

- Admin-triggered per tenant
- Example: Flood affects only one coop

**Actions:**

- Grace period
- Interest suspension

---

# 19. SECURITY

- Row-level isolation (`tenant_id`)
- Query filtering
- Token-scoped access

**Result:** No cross-tenant data access possible

---

# 20. ONBOARDING

1. Select cooperative
2. Branded registration
3. Submit KYC
4. Admin approval
5. Operate within tenant

---

# 21. MULTI-TENANT SCENARIOS

**Same Email Case:**

- One user → multiple independent accounts
- Default in one does not affect others

**Brand Switching:**

- UI changes per tenant (colors, config)

---

# 22. CONCLUSION

Agapay combines:

- Cooperative values
- Fintech architecture
- Social trust systems

It delivers a **secure, fair, and scalable microfinance ecosystem** that empowers communities while maintaining strict data privacy.
