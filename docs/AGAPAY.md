# AGAPAY: A Cooperative-Based Microfinance SaaS

**Tagline:** Iyong Agapay, Ating Tagumpay

---

# 1. INTRODUCTION

## 1.1 Background

Microfinance in the Philippines plays a critical role in supporting underserved sectors such as sari-sari store owners, market vendors, and small-scale entrepreneurs. However, existing options present significant limitations:

- Informal lenders (e.g., “5-6”) impose excessively high interest rates and exploitative repayment structures.
- Digital lending platforms such as GCash provide convenience but often lack transparency, flexibility, and community-based accountability.

These gaps create a need for a system that balances **financial sustainability, fairness, and social trust**.

---

## 1.2 Purpose of the System

Agapay is a **multi-tenant microfinance Software-as-a-Service (SaaS)** platform designed for cooperatives. It integrates:

- Transparent lending mechanisms
- Trust and reputation scoring
- Community-based guarantor systems
- Ethical penalty and compassion frameworks

The system aims to deliver a **sustainable, fair, and human-centered lending ecosystem**.

---

# 2. SYSTEM OVERVIEW

## 2.1 System Architecture

Agapay is structured as a **multi-tenant system**, where each cooperative operates independently within the platform.

### Components:

- **Agapay Pintig (Member Application)**
  - Used by borrowers and guarantors
  - Accessible via mobile and web

- **Agapay Tanaw (Admin Dashboard)**
  - Used by cooperative staff
  - Provides oversight and operational control

- **Super Admin Panel**
  - Manages all cooperative tenants
  - Configures global rules and policies

---

## 2.2 User Roles

### 1. Borrower (Member)

- Applies for loans
- Makes repayments
- Builds trust score

### 2. Guarantor (Loan Endorser)

- Endorses borrowers
- Shares partial liability
- Monitors borrower performance

### 3. Admin (Cooperative Staff)

- Approves loans
- Monitors repayments
- Handles risk and exceptions

### 4. Super Admin

- Manages system-wide configurations
- Oversees tenant cooperatives
- Monitors fraud and system health

---

# 3. LOAN SYSTEM DESIGN

## 3.1 Loan Structure

| Parameter         | Specification              |
| ----------------- | -------------------------- |
| Loan Amount       | ₱5,000 – ₱100,000+         |
| Term              | 3 – 12 months              |
| Payment Frequency | Weekly, Bi-weekly, Monthly |
| Interest Rate     | 3% – 5% per month          |

---

## 3.2 Amortization Models

### 3.2.1 Fixed Amortization (Entry-Level)

- Equal payments throughout the loan term
- Used for new borrowers
- Easier to understand and predict

### 3.2.2 Declining Balance (Advanced Users)

- Interest decreases as principal decreases
- Rewards consistent repayment behavior
- More cost-efficient for borrowers

---

## 3.3 Loan Progression System

| Tier    | Loan Limit | Requirement                     |
| ------- | ---------- | ------------------------------- |
| Starter | ₱5,000     | New user                        |
| Growth  | ₱20,000    | 2–3 successful loans            |
| Trusted | ₱50,000    | Strong repayment history        |
| Elite   | ₱100,000+  | High trust score + endorsements |

---

# 4. TRUST AND REPUTATION SYSTEM

## 4.1 Trust Score Components

| Factor               | Weight |
| -------------------- | ------ |
| Payment Reliability  | 40%    |
| Business Performance | 20%    |
| Peer Reviews         | 20%    |
| Guarantor Feedback   | 20%    |

---

## 4.2 Trust Graph

The system establishes a **network-based trust model**:

- Borrowers are linked to guarantors and peer groups
- Trust is influenced by both individual and network behavior
- Defaults affect connected users

---

## 4.3 Trust-Based Incentives

- Lower interest rates (down to 3%)
- Higher loan limits
- Faster approval processes
- Eligibility for declining balance loans

---

# 5. PENALTY SYSTEM

## 5.1 Structure

Penalties are applied **only to missed payments**, not the full loan balance.

| Days Late  | Penalty Rate           |
| ---------- | ---------------------- |
| 1–3 days   | 2%                     |
| 4–7 days   | 5%                     |
| 8–14 days  | 8%                     |
| 15–30 days | 12%                    |
| 30+ days   | Default classification |

---

## 5.2 Safeguards

- Maximum penalty cap: 20% of missed payment
- Transparent computation
- No compounding penalty abuse

---

## 5.3 Enforcement Actions

| Status     | Action                          |
| ---------- | ------------------------------- |
| At Risk    | Notifications                   |
| Delinquent | Penalties + restrictions        |
| Defaulted  | Account freeze, reputation loss |

---

# 6. GUARANTOR SYSTEM

## 6.1 Requirements

- Each borrower must have 1–2 guarantors
- Guarantors must be verified system users

---

## 6.2 Liability Model

If a borrower defaults:

- Guarantors are assigned **20–30% repayment responsibility**
- Their trust scores are negatively impacted
- Access to future lending is restricted if unresolved

---

## 6.3 System Effects

- Encourages responsible endorsements
- Introduces social accountability
- Reduces default probability

---

# 7. COMPASSION POLICY

## 7.1 Eligibility Triggers

- Natural disasters (e.g., typhoons, flooding)
- Medical emergencies
- Business disruptions

---

## 7.2 Available Actions

- Grace period (1–2 weeks)
- Loan restructuring
- Temporary interest adjustment
- Penalty freeze

---

## 7.3 Constraints

- Limited to once per loan cycle
- Requires verification and admin approval

---

# 8. FRAUD PREVENTION

## 8.1 Multi-Layer Verification

### Layer 1: Documentation

- Valid ID
- Barangay certificate
- Business permit

### Layer 2: Liveness Verification

- Selfie with ID
- Video confirmation

### Layer 3: Social Verification

- Guarantor endorsement
- Peer validation

---

## 8.2 Risk Mitigation

- Low initial loan limits
- Progressive trust-based scaling
- Cross-account monitoring

---

# 9. SYSTEM WORKFLOW

## 9.1 Loan Lifecycle

1. Registration and verification
2. Trust score calculation
3. Loan application
4. Admin approval
5. Disbursement (simulated)
6. Repayment tracking
7. Completion or default

---

# 10. SAMPLE SCENARIOS

## Scenario 1: Successful Loan Cycle

- Borrower applies for ₱5,000
- Term: 3 months
- Interest: 5% monthly (fixed amortization)

### Outcome:

- Weekly payments completed on time
- Trust score increases
- User upgraded to Growth Tier
- Eligible for ₱20,000 loan

---

## Scenario 2: Late Payment Case

- Weekly payment: ₱500
- Missed payment by 5 days

### Penalty:

- 5% of ₱500 = ₱25

### Outcome:

- Total due: ₱525
- Trust score slightly reduced

---

## Scenario 3: Default Case

- Loan: ₱10,000
- Remaining balance: ₱6,000
- No payment after 30 days

### System Response:

- Account marked as Defaulted
- Borrower account frozen
- Guarantors assigned:
  - 25% each → ₱1,500 per guarantor

### Effects:

- Guarantors’ trust scores decrease
- Borrower cannot reapply

---

## Scenario 4: Emergency Restructuring

- Borrower affected by typhoon
- Applies for emergency relief

### Admin Action:

- Approves 2-week grace period
- Extends loan term by 1 month
- Freezes penalties

### Outcome:

- Borrower continues repayment
- Trust score minimally affected

---

# 11. SYSTEM ADVANTAGES

## 11.1 Compared to Informal Lending

- Lower and controlled interest rates
- Structured repayment
- No exploitative practices

---

## 11.2 Compared to Digital Lending Platforms

(e.g., GCash)

- Transparent loan computation
- Community-driven trust model
- Built-in compassion mechanisms
- Explainable penalties and incentives

---

# 12. CONCLUSION

Agapay represents a **hybrid financial system** that integrates:

- Traditional cooperative values
- Modern fintech architecture
- Behavioral and social trust mechanisms

It addresses key issues in microfinance by:

- Reducing exploitation
- Increasing transparency
- Promoting accountability
- Supporting financial resilience

The system is designed not only as a technological solution but as a **sustainable financial ecosystem grounded in trust, fairness, and community empowerment**.

---

## 1. INTRODUCTION

### 1.1 The "Sovereign Cooperative" Problem

In the Philippines, cooperatives value autonomy. A vendor in Malolos shouldn't have their data visible to a cooperative in Calumpit. Traditional "Single-Tenant" apps fail to provide the strict privacy required for financial trust.

### 1.2 The Agapay Solution

Agapay provides a **Multi-Tenant SaaS** where each Cooperative (Tenant) operates in a vacuum. The system supports **Isolated Identity**, meaning a user’s relationship with one cooperative is invisible to another, even if they use the same email address to register.

---

## 2. SYSTEM OVERVIEW: DATA ISOLATION

### 2.1 The Tenant-First Model

The system uses a **Logical Isolation** strategy. Every table in the database is "leashed" to a `tenant_id`.

- **Registration:** Users do not sign up for "Agapay"; they sign up for a specific "Cooperative Portal."
- **Branding:** The UI dynamically fetches a tenant's configuration (colors, logo, interest rates) upon login.

### 2.2 Portal Structure

- **Agapay Pintig (Mobile):** Member-facing. Siloed to the specific cooperative the user is logged into.
- **Agapay Tanaw (Web):** Admin-facing. Strictly filtered by the staff's `tenant_id`.

---

## 3. MULTI-TENANT IDENTITY LOGIC

### 3.1 The "Same Email" Protocol

To meet academic and industry standards for isolated SaaS, the unique identifier for a user is not just their email, but the combination of **Tenant + Email**.

- **Database Constraint:** `UNIQUE(tenant_id, email)`
- **Scenario:** _Aling Nena_ can register at **Tenant A** and **Tenant B** using `nena@email.com`. She will have two separate passwords, two separate trust scores, and two separate loan histories.

---

## 4. LOAN SYSTEM & TENANT CUSTOMIZATION

### 4.1 Parameter Siloing

Each tenant (Cooperative) can set their own "Risk Appetite."

- **Interest Rates:** Tenant A might set a 3% rate; Tenant B might set 5%.
- **Default Terms:** Tenants can choose between 3, 6, or 12-month maximums.

### 4.2 Amortization Calculation

The system calculates payments based on the tenant's chosen model. For the **Declining Balance** model, the interest for a period is calculated as:

$$Interest_{period} = Principal_{remaining} \times \frac{Rate_{monthly}}{Installments_{per\_month}}$$

---

## 5. PROGRESSION & REPUTATION (LOCALIZED)

### 5.1 The "Siloed" Trust Score

Trust is not global. Being a "Suki" (Tier 3) in one cooperative does not automatically grant you Tier 3 status in another. This ensures that a default in one community doesn't unfairly "poison" a user's reputation in another, unless the cooperatives explicitly choose to share data (which is disabled by default for isolation).

| Tier | Status       | Limit          | Tenant Benefit                    |
| :--- | :----------- | :------------- | :-------------------------------- |
| 1    | **Baguhan**  | ₱500–₱2,000    | Basic access                      |
| 2    | **Katuwang** | ₱5,000–₱20,000 | Lowered interest (Tenant defined) |
| 3    | **Suki**     | ₱50,000+       | Unlocks Declining Balance logic   |

---

## 6. THE KAAGAPAY (GUARANTOR) SYSTEM

### 6.1 Intra-Tenant Accountability

A **Kaagapay** (Guarantor) must be a verified member of the **same tenant** as the borrower.

- **Isolation Rule:** You cannot vouch for a friend in a different cooperative.
- **Liability:** The 20% shared liability hit only affects the guarantor’s standing within that specific tenant’s ecosystem.

---

## 7. PENALTY SYSTEM & REVENUE MODELS

### 7.1 Fair Trade Penalties

Penalties are strictly capped per tenant rules.

- **Calculation:** Penalty is applied only to the `current_installment_overdue`, never the `total_balance`.
- **Revenue:** All penalty fees stay within the Tenant's treasury, while Agapay takes a flat SaaS subscription fee from the Tenant.

---

## 8. COMPASSION POLICY: LOCALIZED TRIGGERS

### 8.1 Geo-Fenced Mercy

Since tenants are often regional, the "Calamity Clause" can be triggered by the Admin for their specific location.

- **Example:** If a flood hits only **Tenant A's** market, the Admin freezes A's loans. **Tenant B** in the next town continues operations as normal.
- **Actions:** Penalty freeze, 14-day grace period, and interest suspension.

---

## 9. SECURITY & DATA PRIVACY

### 9.1 The "Leash" Architecture

Data isolation is enforced at the **Database Row Level**.

- **Query Filtering:** Every backend query includes `WHERE tenant_id = ?`.
- **Frontend Siloing:** The API token issued at login is scoped only to that `tenant_id`. A user cannot "hand-craft" a request to see another tenant's data because their token will be rejected by the tenant-validation middleware.

---

## 10. SYSTEM WORKFLOW: ONBOARDING

1.  **Tenant Discovery:** User selects their Cooperative (e.g., via a unique URL or a dropdown).
2.  **Branded Registration:** The app UI changes to the Cooperative's colors/logo.
3.  **Tenant-Specific KYC:** User uploads ID and Barangay Certificate to that tenant's storage bucket.
4.  **Verification:** Tenant Admin reviews and approves.
5.  **Siloed Operation:** All future logins for this "account" are locked to this tenant's data.

---

## 11. SCENARIOS: MULTI-TENANT CONFLICTS

### 11.1 The "Double Member" Scenario

- **User:** _Mang Jose_
- **Action:** Registers for **Tenant A** (3% rate) and **Tenant B** (5% rate) with the same email.
- **System Response:** Two distinct profiles are created. If Jose defaults on Tenant B, his Tier 3 status on Tenant A remains **untouched**. This is the ultimate proof of **Strict Data Isolation**.

### 11.2 The Branding Shift

- **Action:** Jose switches between apps.
- **Result:** The Navbar color shifts from **Emerald Green** (A) to **Deep Blue** (B), proving the same codebase is handling different tenant configurations.

---

## 12. CONCLUSION: THE SAAS ADVANTAGE

By isolating identity and data, **Agapay** provides the security of a custom-built enterprise app with the cost-efficiency of a shared cloud platform. It respects the privacy of the Filipino entrepreneur while giving local cooperatives the "Big Tech" tools they need to succeed.

---

### **How to use this in your Presentation:**

When the panel asks, _"How do you ensure Co-op A can't see Co-op B?"_ point directly to **Section 9**. When they ask about the _"Same email"_ requirement, point to **Section 3.1**.
