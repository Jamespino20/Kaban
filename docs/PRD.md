# AGAPAY — Product Requirements Document (Enhanced)

> **Tagline:** Iyong Agapay, Ating Tagumpay
> **Main Tenant:** Malolos City, Bulacan
> **Contact:** agapay.saas@gmail.com

---

# AGAPAY FEATURES

- Mock E-wallet with withdrawal and deposit capabilities, along with verification (ID/photos/documents)
- Mock loaning and repayment, with interest rates set by a user's tier
- Feedback systems across all transactions
- Imbalance tracking, investigation, and resolution
- Guarantorship and Mentorship (optional per tenant)
- Receipt generation
- Multi-tenancy by tenant regions and tenants
- 2FA (TOTP)
- RBAC
- Audit Logging across all modules and nodes
- Report generation
- Discord-style chat system with file uploads, emojis, and custom reactions
- In-app/Email notifications
- Three-dot actions
- Tenant management with custom homepage/dashboard customization and functionality toggle
- Backup / Recovery
- AI-assisted analytics
- Mobile integration [Out of Scope]

---

# AGAPAY ROLES

## Superadmin

- **Purpose:** Platform governance, not business interference
- **Scope:** Cross-tenant control, system integrity, SaaS monetization

## Tenant Operator

- **Purpose:** Operate or fund a cooperative
- **Scope:** Loans, members, risk, finance, content, capital provision
- **Note:** "Tenant Admin" and "Tenant Lender" are the same.

## Tenant Member

- **Purpose:** Borrow and participate
- **Scope:** Loans, repayments, trust-building

---

# AGAPAY MAIN SECTIONS

## Agapay Platform Homepage

| Section                     | Content                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Navbar                      | Agapay logo, quicklinks (Why Agapay, Features, Pricing, FAQs, Contact), Find Cooperatives button                               |
| Hero                        | Tagline: _"Iyong Agapay, Ating Tagumpay"_, supporting subtitle about financial empowerment, no CTA buttons                     |
| Why Agapay                  | 3–4 value proposition cards: Transparency, Community, Accessibility, Security                                                  |
| Features                    | Icon-based feature grid covering E-Wallet, Loaning, Trust Score, Multi-Tenancy, Analytics                                      |
| Sample Calculator           | Interactive loan calculator with configurable amount, cadence, term, and tier — shows breakdown of installment, interest, fees |
| Agapay Zoomable Live Branch | Interactive map of active tenant branches with pinned markers, tenant name, and region label                                   |
| Agapay SaaS Pricing         | Three-tier plan cards: Core, Pro, Enterprise — each shows price, billing cycle, member limit, and feature checklist            |
| Testimonials                | Rotating testimonial cards sourced from tenant testimonies moderated by Superadmin                                             |
| FAQs                        | Accordion list grouped by Superadmin-defined seasons                                                                           |
| Contact                     | Simple form (Name, Email, Message) + agapay.saas@gmail.com display                                                             |
| Footer                      | Agapay logo, nav links, social links, copyright notice                                                                         |

## Agapay Tenant Homepage

| Section           | Content                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Navbar            | Cooperative logo, tenant quicklinks, "Powered by Agapay" badge, Find Cooperatives button   |
| Hero              | Cooperative tagline and subtitle, "Powered by @agapay_titled.png" branding, no CTA buttons |
| Mission & Vision  | Tenant-defined mission and vision statements in split layout                               |
| Values            | Icon + label cards representing the tenant's core values                                   |
| Sample Calculator | Same as platform calculator, pre-configured with tenant's default loan products and rates  |
| Testimonials      | Tenant-specific testimonies (member-submitted, admin-moderated)                            |
| FAQs              | Tenant-defined FAQ accordion, falls back to platform FAQs if none set                      |
| Contact           | Tenant contact form + tenant admin email                                                   |
| Footer            | Tenant logo, nav links, Agapay attribution, copyright                                      |

## Agapay Tanaw (Dashboard — Superadmin, Tenant Admins, Tenant Lenders)

- Sidebar with logo, navigation links grouped by section, profile preview (avatar, name, role), and sign-out button
- Main content area with responsive grid layout
- Module header: role label (e.g., "Superadmin"), notification bell with badge count, three-dot action menu (Profile, Settings, Logout)
- Collapsible sidebar for compact view

## Agapay Pintig (Dashboard — Tenant Members)

- Sidebar with cooperative logo, navigation links, profile preview, and sign-out button
- Main content area with member-friendly card layouts
- Module header: member name, notification bell, three-dot action menu (Profile, Settings, Logout)
- Streamlined interface emphasizing loan status, wallet balance, and payment actions

---

# AGAPAY MODULES PER ROLE

---

## SUPERADMIN MODULES

### 1. Overview

**Purpose:** High-level command center for platform-wide health monitoring.

**KPI Cards (Top Row):**

- Total Active Tenants
- Global Funds Under Management (FUM)
- Total Active Loans (count + aggregate value)
- Platform-Wide Repayment Rate (%)
- Portfolio at Risk (PAR) — flagged in red if above threshold
- Agapay Platform Trust Score (composite, displayed as gauge)

**Recent Audit Snapshot (Mid Section):**

- Last 10 system-wide audit log entries in a condensed table (Timestamp, Tenant, Actor, Action)
- "View All Logs" button leading to the Audit Logs module

**AI Snapshot Summary (Bottom Section):**

- Auto-generated paragraph summary of platform health (past 7 days)
- Flags anomalies: rising defaults, new tenant signups, top-performing branches
- "Regenerate Summary" button with timestamp of last generation

---

### 2. Community

**Purpose:** Superadmin-to-tenant communication hub.

**Sub-sections:**

#### Internal Messaging / Bulletin

- Rich-text bulletin board for platform-wide announcements
- Posts can be pinned, scheduled, or sent immediately
- Supports file attachments and emoji reactions
- Bulletin entries show: Author (Superadmin), Timestamp, Audience (All Tenants / Specific Region), Read receipts count

#### Global Announcements

- Dedicated announcement composer
- Fields: Title, Body (rich text), Target Audience (All / Region / Specific Tenant), Delivery Channel (In-app / Email / Both), Schedule toggle
- Announcement history table with status (Draft, Scheduled, Sent) and open rate

#### Individual / Group Chats (Admins Only)

- Discord-style chat interface
- Sidebar shows all admin contacts (Tenant Admins) with online indicator
- Message threads support: text, file uploads (images, PDFs), emoji reactions, custom reactions
- Group chats can be created for regions or specific tenant clusters
- Message search within threads

---

### 3. Approvals

**Purpose:** Review and act on pending platform-level documents.

**Layout:** Grid of expandable cards with searchbar, inside scrolling, filter bar (Status, Date, Region), and sort options.

#### Document Verification — Tenant Applications

Each card contains:

- Applicant Name
- Tenant Name
- Tenant Email
- Tenant Phone Number
- Estimated Member Count
- Tenant Region
- Selected Subscription Plan
- Attached Documents (previewed inline, downloadable)
- Status badge: Pending / Under Review / Approved / Rejected
- Action buttons: Approve, Reject (with mandatory rejection reason input), Request Additional Info
- Approval triggers tenant creation and access provisioning

---

### 4. Global Management

**Purpose:** Manage the full directory of tenants across all regions.

**Layout:** Grid of expandable cards sorted by region. Cards expand on hover to reveal full details. Searchbar, region filter, status filter, and plan filter in toolbar.

**Each Tenant Card shows:**

- Tenant Name + Logo
- Parent Region
- Current Active Member Count
- Subscription Plan badge
- Portfolio Value (Total FUM under this tenant)
- Tenant Trust Score (gauge indicator)
- Last Availment Date
- Status badge: Active / Suspended / Decommissioned
- Action buttons: Edit, Mark Availed, Suspend, Decommission / Restore

**Add Tenant Dialog (Two-Pane Layout):**

_Left Pane — Builder:_

- **Homepage Builder:**
  - Parent Region (dropdown)
  - Tenant Name, URL Slug (auto-generated, editable)
  - Brand Color, Main Color, Accent Color (color pickers)
  - Branch Logo upload (max 5MB)
  - Hero section content (Tagline, Subtitle)
  - Starter Testimonials (name, occupation, quote)
  - Starter FAQs (question, answer)
  - Calculator config (default loan product, default term)
- **Dashboard Builder:**
  - Toggle panel for each role's features (enabled/disabled per plan limits)
  - Visual checklist showing which features are included in the selected plan

_Right Pane — Live Preview:_

- Landscape iframe rendering of the tenant homepage in real time
- "Open Tenant Site" button to access the actual generated tenant URL
- Preview updates as left pane inputs change

**Tenant Lifecycle:**

- Lease period tracked per plan; system warns tenant admin 14 days before expiry via in-app + email
- Superadmin can suspend or restore access at any time with a documented reason

---

### 5. Homepage Content

**Purpose:** Manage platform-level FAQ and Testimonial sections.

#### FAQ Moderation

- Create, edit, and reorder FAQ items
- Group FAQs under Seasons (e.g., "General", "Loans", "Membership") — seasons can be toggled visible/hidden in bulk or individually
- Fields per FAQ: Question, Answer (rich text), Parent Season, Visibility toggle
- All custom FAQs override the system constants/defaults

#### Testimonial Moderation

- Pull testimonies submitted from any active tenant
- Display options: toggle visibility per tenant group, or select individual testimonies
- Testimony fields displayed: Testimonee Name, Occupation, Testimony Body, Tenant Source, Submission Date
- Approved testimonies rotate on the platform homepage

---

### 6. Feedback

**Purpose:** Receive and track feedback submitted via the platform homepage or system concern channels.

**Feedback Table Columns:** Sender Name, Email, Source (Homepage / System), Message Preview, Date Received, Status (New / Read / Archived)

**Actions:** Mark as Read, Archive, Reply via Email (opens email compose with sender pre-filled)

---

### 7. Reports

**Purpose:** Exportable, schedulable financial and performance intelligence across all tenants.

#### Cross-Tenant Financial Reports

- Total disbursed vs. total repaid (per period: weekly, monthly, quarterly)
- Default rates broken down by region
- Portfolio at Risk (PAR) — flagged tiers: PAR-30, PAR-60, PAR-90

#### Tenant Performance Reports

- Portfolio growth trends (line chart per tenant)
- Member acquisition over time
- Retention rates (active vs. churned members per cohort)

**Export:** CSV and PDF formats

**Scheduling:** Define report frequency (weekly/monthly), delivery recipients (email list), and report type — dispatched automatically via email

---

### 8. System Health

**Purpose:** Real-time infrastructure and processing status monitoring.

| Monitor             | Details                                                      |
| ------------------- | ------------------------------------------------------------ |
| API Uptime          | Endpoint availability, response times, error rate (5xx/4xx)  |
| Queue Processing    | Job queue status (pending, processing, failed), retry counts |
| AI Processing Logs  | Snapshot generation history, token usage, error flags        |
| DB Usage per Tenant | Schema size, row counts, index health per tenant schema      |

**Alerts:** Color-coded status indicators (Green / Yellow / Red). Critical alerts notify Superadmin via in-app and email.

---

### 9. Fraud & Risk Monitoring

**Purpose:** Detect and investigate suspicious activity across all tenants.

- Cross-tenant fraud detection signals (e.g., same IP registering in multiple tenants)
- Duplicate identity detection across tenant schemas (matched by name + ID document hash)
- Suspicious transaction patterns (unusually high withdrawal velocity, self-referral loops in guarantorship)
- Flagged records shown in a table with Severity (Low / Medium / High / Critical), Tenant, Affected User, Signal Type, and Recommended Action

---

### 10. Audit Logs

**Purpose:** Full, immutable record of all system actions across all tenants.

**Log Entry Columns:** Timestamp, Tenant, Actor (Role + Name), Module, Action, Target Entity, IP Address, Result (Success / Failed)

**Filters:** Tenant, Role, Module, Date Range, Action Type, Result

**Export:** CSV download of filtered log set

---

### 11. Settings

#### Platform Config

- Global Trust Score scoring weights (Repayment Behavior, Savings, Loan Utilization, Tenure, Peer Rating — editable percentages that must sum to 100%)
- Risk thresholds: auto-flag delinquency (days overdue), fraud signal sensitivity
- Default loan calculator configuration (default term, default cadence)

#### Subscription & Billing

- Plan creation: define member limits, operator count, enabled features per plan
- Pricing tiers: amount, billing cycle (3-month, 6-month, 12-month)
- Tenant billing cycles and invoice history table

#### AI Configuration

- Snapshot summary prompt templates (editable system prompts)
- Risk detection sensitivity slider (Low / Medium / High)

#### Notification System

- Email/SMS template editor (variables: `{{tenant_name}}`, `{{due_date}}`, etc.)
- Global announcement broadcaster (send to all tenants immediately or scheduled)

#### Security

- RBAC templates (define module access per role per plan tier)
- 2FA enforcement rules (require 2FA for specific roles or all roles)

---

## TENANT OPERATOR MODULES (Unified Admin & Lender)

### 1. Overview

**Purpose:** Branch-level health dashboard combining admin and lender perspectives.

**KPI Cards:**

- Total Branch Funds (FUM)
- Active Loans (count + aggregate value)
- Portfolio Growth (% change vs. last period)
- Repayment Rate (%)
- Personal ROI / Earnings (Lender's own investment returns)
- Branch ROI
- Risk Exposure (PAR amount)
- Portfolio Diversification (loan product spread — pie or donut chart)

**Recent Interaction Logs:** Last 10 branch-level audit entries (Timestamp, Actor, Action)

**Branch Trust Score:** Displayed as a gauge/ring with score breakdown (hover to see sub-scores)

**AI Snapshot Summary:** Auto-generated paragraph summarizing branch health for the past 7 days. Flags top repayers, overdue accounts, and capital availability.

---

### 2. Approvals & Queue

**Purpose:** Unified processing queue for all pending branch-level actions.

**Layout:** Tabbed grid of expandable cards with searchbar, filter bar (Status, Type, Date), inside scrolling.

#### Loan Applications

- **Statuses:** Pending, Under Review, Approved, Rejected
- **Card contains:** Applicant Name, Trust Score badge, Loan Product, Requested Value, Payment Cadence, Term, Purpose, Reference Number
- **Actions:** Approve (with optional conditions), Reject (mandatory reason), Request Clarification, View Full Profile

#### Fund Releases

- **Statuses:** Pending Release, Released
- **Card contains:** Applicant Name, Loan Product, Approved Value, Release Method (E-Wallet / Bank / Cash), Scheduled Release Date, Reference Number
- **Actions:** Mark as Released (triggers receipt generation and loanee notification), Reschedule

#### Payment Verification

- **Statuses:** Pending, Approved, Rejected
- **Card contains:** Applicant Name, Installment Number, Payment Reference, Receipt Attachment (preview inline), Amount, Cadence
- **Actions:** Approve (marks installment paid), Reject (with reason, triggers re-submission prompt to member)

#### Capital Top-Up Queue

- **Statuses:** Pending, Approved, Rejected
- **Card contains:** Lender Name, Amount, Funding Method (E-Wallet / Bank), Status, Reference Number
- **Actions:** Approve (adds funds to branch pool), Reject

#### Identity Verification

- **Statuses:** Pending, Verified, Rejected
- **Card contains:** Applicant Name, Membership Code, Attached IDs (inline preview), Selfie preview, Verification Status
- **Actions:** Verify (activates member account), Reject (with reason)

---

### 3. Capital & Investments (The Vault)

**Purpose:** Personal and branch-level funding management for the operator.

#### My Investment Portfolio

- Table of active investments in loans: Loan reference, Borrower, Invested Amount, Interest Rate, ROI to date, Status (Active / Defaulted / Completed)
- Earnings history chart (line graph, filterable by period)
- Defaulted loan exposure summary with guarantor liability breakdown

#### Wallet & Top-Ups

- Current wallet balance display
- Add Funds button: choose amount (preset or custom), source method (Bank / GCash / Cash), upload proof
- Withdraw Funds button: choose amount, destination, confirm fees
- Transaction history table: Date, Type, Amount, Method, Status, Reference

#### Risk & Diversification

- AI-generated investment suggestions: "Consider diversifying into Agapay Negosyo products — your current portfolio is 78% Agapay Sari-Sari"
- Risk alert panel: overdue accounts with exposure amount
- Portfolio diversification chart (donut chart by loan product)

---

### 4. Member Management

**Purpose:** Full directory and lifecycle control of branch members.

#### Member Directory

- Grid/cards view toggled with list view
- Each card: Profile photo, Name, Membership Code, Trust Score badge, Tier badge, Status badge
- Searchbar, filter by Status (Active / Suspended / Blacklisted), filter by Tier
- Click member to open full profile

#### Member Profiles

- Personal info: Full name, contact details, address, date joined, membership code
- Financial info: Income source, employer, monthly income range, assets declared
- Loan History: All past and active loans with product, amount, status, repayment rate
- Trust Score breakdown: per-criterion scores, voting history, last updated date
- Uploaded Documents: ID, selfie, business permit, barangay cert, proof of income (downloadable)

#### Status Controls

- Toggle: Active / Suspended / Blacklisted
- Each status change requires a mandatory reason and is logged in audit trail
- Suspended members receive in-app + email notification with reason and expected review date

---

### 5. Loan Products & Policy

**Purpose:** Create and configure loan products available to branch members.

#### Product Studio

- Create / Edit loan products
- Fields: Product Name, Loan Amount Range (min/max), Interest Rate Model (Flat / Diminishing Balance), Cadence Options (Weekly / Bi-weekly / Monthly), Term Limits (min/max months), Penalty Rules (editable percentages per day range), Eligible Tiers
- Active/Inactive toggle per product
- Product preview shows a sample amortization table

#### Logic Config

- Assign eligibility rules: minimum Trust Score, minimum tenure (months), minimum tier
- Risk scoring modifiers: boost/reduce Trust Score impact per rule
- Save & Publish pushes config live to member-facing loan application

---

### 6. Treasury & Reconciliation

**Purpose:** Enforce daily financial integrity at the branch level.

#### EOD Reconciliation (Critical)

- Daily summary: Payments received today vs. loans released today vs. expected repayments
- Treasury balance (opening + inflows - outflows = closing balance)
- Discrepancy flag: any mismatch between expected and actual values triggers a warning requiring operator acknowledgment and note
- Sign-off button: Operator confirms daily reconciliation with timestamp and digital signature logged

#### Compassion Actions

- Loan restructuring: adjust remaining term or cadence for a specific active loan
- Grace period grant: defer next installment with documented reason
- Penalty waiver: waive accumulated penalties with approval trail
- All compassion actions require: reason input, approval note, and are permanently logged

---

### 7. Content & Branding

**Purpose:** Control the tenant's public-facing homepage appearance.

#### Tenant Homepage Editor

- Hero Section: Edit cooperative tagline, subtitle, hero image/background
- Calculator Config: Set default loan product, default term, default cadence shown on the homepage calculator
- Testimonials: Review and approve member-submitted testimonies; toggle visibility
- FAQs: Add/edit/reorder FAQ items grouped by season
- Announcements Banner: Toggle a sitewide banner with custom message and expiry date

#### Branch Identity

- Upload/replace branch logo (max 5MB)
- Brand Color, Main Color, Accent Color pickers (with live preview thumbnail)
- Typography selection from approved font list
- Changes trigger a live preview before publishing

---

### 8. Community

**Purpose:** Branch-internal communication between operator and members.

#### Intercom / Bulletin

- Rich-text bulletin posts: visible to all branch members
- Posts can be pinned, scheduled, or sent immediately
- Supports file attachments and emoji reactions
- Fields: Title, Body, Visibility (All Members / Specific Group), Schedule toggle

#### Chat Hub

- Individual direct messages with any branch member
- Group chats (operator can create groups: e.g., "Overdue Members", "New Applicants")
- Supports: text, image uploads, file attachments, emoji reactions, custom reactions
- Unread message count badge on sidebar

---

### 9. Support & Analytics

**Purpose:** Member satisfaction tracking, growth intelligence, and security oversight.

#### Feedback Registry

- Incoming feedback from members: complaints, system concerns, testimony submissions, feature requests
- Table: Sender, Category, Subject, Date, Status (New / In Progress / Resolved)
- Actions: Respond (in-app or email), Escalate to Superadmin, Archive

#### Growth Analytics

- Portfolio trend chart: total FUM over time (weekly/monthly)
- Member behavior insights: average loan utilization, repayment consistency distribution
- Default forecast: AI-predicted default risk for the next 30 days based on overdue patterns

#### Security & Audit Logs

- Full log of all operator and staff actions within the branch
- Filters: User, Module, Action Type, Date Range
- Export: CSV

---

### 10. Settings

#### Tenant Config

- Loan rules: enforce stricter limits beyond platform defaults (e.g., cap loan amount for Tier 1)
- Scoring tweaks: adjust tier upgrade thresholds for the branch
- Email/system notification triggers: define which events generate notifications and to whom

#### Operator Profile

- Edit personal info: name, email, phone number, profile picture
- Theme selection: Light / Dark mode

#### Security Matrix

- 2FA configuration: enable/disable TOTP requirement for this account
- Password management: change password
- Session controls: view active sessions, revoke individual sessions
- Linked banking/wallet accounts: add/remove linked GCash or bank accounts

---

## TENANT MEMBER MODULES

### 1. Overview (Home)

**Purpose:** Quick summary of the member's financial standing.

**Cards displayed:**

- Active Loan Card: Loan product name, outstanding balance, next due date, installment amount — with "Pay Now" shortcut button
- Remaining Balance (E-Wallet): Current wallet amount with Deposit and Withdraw buttons
- Trust Score: Visual gauge with current score, tier badge (e.g., Tier 2: Bagong Sigla), and trend arrow (up/down from last month)
- Loan Availability: Whether the member can apply for a new loan (locked if active loan exists)

**AI Financial Tips:** 1–2 short, personalized tips generated based on the member's repayment history and financial profile (e.g., "You're eligible for a tier upgrade in 2 months — keep your repayments on time!")

---

### 2. Apply for Loan

**Purpose:** Guided loan application flow.

**Step 1 — Product Selection:**

- Grid of available loan products filtered by the member's current tier
- Each product card shows: Product name, Amount range, Interest rate, Available cadences, Estimated monthly installment (sample)
- Greyed-out products display the tier required to unlock them

**Step 2 — Loan Configuration:**

- Desired loan amount (slider within the product's min/max range)
- Payment cadence selector (Weekly / Bi-weekly / Monthly)
- Loan term selector (within product limits)
- Purpose of loan (dropdown + optional notes field)
- Guarantor selector: optional, choose 1–2 members from the branch directory (system shows eligible guarantors only); guarantors receive a notification and must accept

**Step 3 — Calculator Preview:**

- Amortization table: installment number, due date, installment amount, interest portion, principal portion, balance
- Summary: Total loan amount, Total interest, Processing Fee (₱20), Service Fee (₱50), Total cost of loan
- Penalty schedule: shown as a reference table (2% / 5% / 8% / 12% capped at 20%)

**Step 4 — Confirmation & Submission:**

- Full loan summary (product, amount, cadence, term, guarantors, fees)
- Checkbox: "I have read and agree to the loan terms"
- Submit Application button — triggers notification to Tenant Operator queue

---

### 3. My Loans

**Purpose:** Full visibility into all loans — past and present.

**Active Loan Panel (if any):**

- Loan product name, Reference Number, Approved amount, Disbursement date
- Repayment progress bar (e.g., "Installment 3 of 12")
- Next due date and amount due
- Payment history accordion: each installment shows date paid, amount, method, status (Paid / Pending / Overdue / Waived)
- Full amortization schedule toggle

**Loan History Table (Completed / Rejected loans):**

- Columns: Reference, Product, Amount, Date, Status, Outcome (Fully Paid / Defaulted / Rejected)
- Click row to expand full loan details

---

### 4. Payments

**Purpose:** Submit and track loan repayments.

**Pay Installment Flow:**

Step 1 — Choose Payment Type:

- Pay Current Installment (amount pre-filled)
- Pay Full Outstanding Balance (shows early settlement discount if applicable)

Step 2 — Choose Payment Method:

- E-Wallet (deducted directly from wallet balance — shows available balance)
- Manual / GCash (member uploads proof of payment: receipt photo or PDF)

Step 3 — Confirmation:

- Summary: Installment number, amount, method, any applicable fees
- Submit button — triggers notification to Tenant Operator for verification

**Payment Status Tracker:**

- List of recent payment submissions with status: Submitted / Under Verification / Approved / Rejected
- If rejected: rejection reason displayed with a "Resubmit" option

---

### 5. E-Wallet

**Purpose:** Manage the member's Agapay wallet balance.

**Wallet Balance Display:** Large, prominent balance figure with currency symbol.

#### Deposit

- Preset amounts (₱500, ₱1,000, ₱2,000, ₱5,000) + custom amount input
- Method selector: GCash, Bank Transfer, Cash (over-the-counter)
- Upload deposit proof (required for manual methods)
- Confirmation screen: deposit amount, method, processing fee if any, new estimated balance
- Submission triggers admin verification queue

#### Withdraw

- Preset amounts based on available balance + custom input
- Method selector: GCash, Bank Transfer
- Confirmation screen: withdrawal amount, method, Processing Fee (₱20), remaining balance
- Submission creates a withdrawal record pending admin release

**Transaction History:**

- Table: Date, Type (Deposit / Withdrawal), Amount, Method, Status, Reference
- Filterable by type and date range

---

### 6. Community

**Purpose:** Connect with the branch community.

#### Bulletin / Announcements

- Read-only feed of operator-posted bulletins and announcements
- Emoji reactions on posts
- Pinned announcements shown at the top

#### Chat Hub

- Direct message with Tenant Operator or other members (if enabled by tenant config)
- Group chats the member has been added to
- Supports: text, image uploads, emoji reactions
- Notification badge on unread threads

---

### 7. Support / Feedback

**Purpose:** Get help and contribute to the community's quality.

#### Satisfaction Survey

- Monthly survey prompt (auto-triggered after the voting period)
- Star rating + open text comment for: Loan Experience, Admin Responsiveness, Platform Usability

#### Submit Concern

- Form fields: Category (Loan / Payment / Wallet / Technical / Other), Subject, Message, Attachment (optional)
- Submission tracked with a ticket reference number

#### Ticket Status Tracker

- List of submitted tickets: Reference, Category, Subject, Date, Status (Open / In Progress / Resolved)
- Click to view full thread including admin replies

#### Testimony Submission

- Form: Testimony body (max 300 characters), star rating, consent checkbox ("I allow this to appear on the branch homepage")
- Submitted testimonies go to operator moderation queue

---

### 8. Profile & Settings

#### Profile

- Editable: Username, Profile picture, Home address, Contact number
- Non-editable (requires admin action): Legal name, Birthdate, Government ID info
- Theme toggle: Light / Dark mode

#### Security

- Change password (requires current password confirmation)
- Enable/Disable 2FA (TOTP via authenticator app, shows QR code setup)
- Active session list with revoke option

#### Linked Accounts

- Add/remove GCash or bank account (for withdrawals and deposits)

#### Notification Preferences

- Toggle: In-app notifications per event type (Loan Approved, Payment Due Reminder, Trust Score Update, Announcements)
- Toggle: Email notifications per event type

---

# AGAPAY CONSTANTS

## Agapay Roles

- Superadmin
- Tenant Admin
- Tenant Lender
- Tenant Member

## Agapay Dashboards

- **Agapay Tanaw** — Superadmin, Tenant Admins, Tenant Lenders
- **Agapay Pintig** — Tenant Members

## Agapay Tenant Subscription Plans

| Plan              | Price   | Billing Cycle | Member Limit | Key Features                                                                                                                                      |
| ----------------- | ------- | ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agapay Core       | ₱3,500  | 3 months      | Up to 500    | Basic Admin Dashboard, Standard Microfinance Policy Access, Audit Logs, Email Support                                                             |
| Agapay Pro        | ₱6,500  | 6 months      | Up to 2,500  | Everything in Core + Custom Branding, Mentorship & Community Tools, Chat/Priority Email Support, Automated Compassion Workflow, Basic Data Export |
| Agapay Enterprise | ₱12,000 | 12 months     | Unlimited    | Everything in Pro + Analytics Module, Priority Support, Advanced Export & Reporting, System Configuration Controls                                |

## Agapay Subscription Feature Access Matrix

| Module / Feature              | Agapay Core | Agapay Pro  | Agapay Enterprise       |
| ----------------------------- | ----------- | ----------- | ----------------------- |
| E-Wallet & Transactions       | ✅          | ✅          | ✅                      |
| Loaning Node (All products)   | ✅          | ✅          | ✅                      |
| Audit Logs & History          | ✅          | ✅          | ✅                      |
| Community / Chat              | ❌          | ✅          | ✅                      |
| Custom Tenant Branding        | ❌          | ✅          | ✅                      |
| Automated Compassion Workflow | ❌          | ✅          | ✅                      |
| Analytics Module & Metrics    | ❌          | ❌          | ✅                      |
| System Configuration Controls | ❌          | ❌          | ✅                      |
| Data Export (Historical)      | Basic (CSV) | Basic (CSV) | Advanced (CSV/JSON/PDF) |

> [!NOTE]
> **Historical Data Ownership:** As part of Agapay's commitment to cooperative data sovereignty, tenants who downgrade or lose access to specific modules retain **Read-Only Historical Access**. They can download their module-specific data as a CSV at any time via the "Restricted Access" interface.

## Agapay Interest Rate Tiers

| Tier   | Name         | Rate                          |
| ------ | ------------ | ----------------------------- |
| Tier 1 | Gabay        | 5% — All new users start here |
| Tier 2 | Bagong Sigla | 4.5%                          |
| Tier 3 | Kasapi       | 4%                            |
| Tier 4 | Katuwang     | 3.5%                          |
| Tier 5 | Kaagapay     | 3%                            |

## Sample Loan Products

| Product          | Amount Range        |
| ---------------- | ------------------- |
| Agapay Sari-Sari | ₱2,000 – ₱5,000     |
| Agapay Negosyo   | ₱6,000 – ₱29,000    |
| Agapay Paluwagan | ₱30,000 – ₱59,000   |
| Agapay Angat     | ₱60,000 – >₱100,000 |

## Payment Cadences

- Weekly
- Bi-weekly
- Monthly

## Fee & Penalty Schedule

| Item                        | Value                      |
| --------------------------- | -------------------------- |
| Processing Fee              | ₱20                        |
| Service Fee                 | ₱50                        |
| Penalty — 1–3 days overdue  | 2% of missed installment   |
| Penalty — 4–7 days overdue  | 5% of missed installment   |
| Penalty — 8–14 days overdue | 8% of missed installment   |
| Penalty — 15+ days overdue  | 12% of missed installment  |
| Penalty Cap                 | 20% of missed installment  |
| Guarantor Liability         | 25% of outstanding balance |

## Trust Score Criteria — Member

| Criterion                      | Weight | Rater            |
| ------------------------------ | ------ | ---------------- |
| Repayment Behavior             | 40%    | Lender's Rating  |
| Savings & Financial Discipline | 20%    | Lender's Rating  |
| Loan Utilization               | 15%    | Lender's Rating  |
| Membership Tenure & Activity   | 15%    | Admin's Rating   |
| Peer/Community Validation      | 10%    | Members' Ratings |

## Trust Score Criteria — Tenant Branch

| Criterion                           | Weight | Source           |
| ----------------------------------- | ------ | ---------------- |
| Portfolio Repayment Health          | 35%    | System-Generated |
| Savings Growth & Stability          | 20%    | System-Generated |
| Loan Portfolio Quality & Risk       | 20%    | System-Generated |
| Operational Compliance & Efficiency | 15%    | Admin's Rating   |
| Member Satisfaction & Engagement    | 10%    | Members' Ratings |

## Other Constants

- Active loan limit: 1 per user per tenant
- Member tenant limit: 2 tenants maximum
- Guarantors per loan: 1–2 (tenant members only)
- Logo upload size limit: 5MB

---

# AGAPAY USE FLOWS

---

## Flow 1: Login

**Actor:** Any registered user (Superadmin, Tenant Admin/Lender, or Tenant Member)

```
1. User opens agapay-saas.vercel.app
2. User searches for their cooperative via:
   a. Tenant selector search bar (search by name or region), OR
   b. Zoomable live map — clicks on a branch pin
3. User is redirected to agapay-saas.vercel.app/[tenant-slug]/
4. User clicks "Log In" in the tenant homepage navbar
5. Login form appears:
   - Email / Username field
   - Password field
   - "Forgot Password?" link
6. If credentials are valid and 2FA is NOT enabled:
   → User is redirected to their dashboard (Tanaw or Pintig depending on role)
7. If 2FA IS enabled:
   → A TOTP prompt appears ("Enter the 6-digit code from your authenticator app")
   → User enters the code
   → If valid: redirected to dashboard
   → If invalid: error shown, user can retry or use a backup code
8. Superadmin logs in at agapay-saas.vercel.app directly (no tenant slug)

* If a member belongs to multiple tenants (up to 2):
  - After successful login at the first tenant, system detects multi-tenant membership
  - A "Switch Tenant" option appears in the sidebar/profile menu
  - Switching tenants triggers a new login prompt for the target tenant
```

---

## Flow 2: Member Registration

**Actor:** New Tenant Member

```
1. User opens agapay-saas.vercel.app
2. User searches for their cooperative (tenant selector or zoomable map)
3. User is redirected to agapay-saas.vercel.app/[tenant-slug]/
4. User clicks "Join / Register" on the tenant homepage navbar
5. Four-stage registration wizard begins:

STAGE 1 — Account Details
   - Username (unique, validated in real time)
   - Email address (verified format)
   - Phone number
   - Password (strength indicator shown)
   - Confirm Password
   - "Prefer not to say" option available for sensitive fields

STAGE 2 — Personal Information
   - First Name, Middle Name (optional), Last Name
   - Birthdate (date picker, must be 18+)
   - Gender (Male / Female / Prefer not to say)
   - Marital Status (Single / Married / Widowed / Separated / Prefer not to say)
   - Present Address (barangay, city/municipality, province, ZIP)
   - Permanent Address (with "Same as present" toggle)

STAGE 3 — Finance Information
   Section 3.1 — Income & Employment
     - Source of income (Employment / Small Business / Remittances / Other)
     - Occupation / business type
     - Employer or business name
     - Monthly income (range selector: <₱5K / ₱5K–₱10K / ₱10K–₱20K / ₱20K+ / Prefer not to say)
     - Length of employment or business operation

   Section 3.2 — Business Information (shown only if source of income = Small Business)
     - Has a business? (Yes / No toggle, skip section if No)
     - Business name (optional if informal)
     - Business type / industry
     - Years in operation
     - Estimated monthly revenue (range)
     - Business address

   Section 3.3 — Financial Obligations
     - Current active loans elsewhere? (Yes / No)
     - If Yes: Number of active loans, Estimated total monthly repayments (range), Other recurring expenses (optional/ranged)

   Section 3.4 — Savings & Assets (optional)
     - Do you have savings? (Yes / No / Prefer not to say)
     - If Yes: Estimated savings range
     - Owned assets (multi-select: House, Land, Vehicle, Equipment, None)

   Section 3.5 — Community Reference (optional)
     - Reference person name
     - Relationship to applicant
     - Contact number

STAGE 4 — Document Uploads
   Required:
     - Valid Government-Issued ID (front and back)
     - Selfie holding the Valid ID
     - Barangay Certificate of Residency
     - Proof of Income (payslip, business receipt, remittance receipt, etc.)
   Conditionally Required:
     - Business Permit (required if user declared having a business)
   Each upload: file preview, file size indicator, remove/replace option

6. User submits — system shows a "Registration Submitted" confirmation screen with:
   - A reference/tracking number
   - A note: "Your documents are being reviewed. You will be notified via email once your account is activated."
7. Tenant Operator receives notification in the Identity Verification queue
8. Once the operator verifies and approves:
   → User receives email + in-app notification: "Your account has been activated!"
   → User logs in at agapay-saas.vercel.app/[tenant-slug]/agapay-pintig
9. On first login: a Welcome modal + guided feature tour of Agapay Pintig is shown
   - Tour covers: Overview, Apply for Loan, Payments, E-Wallet, Community, Profile
   - User can skip or navigate through step-by-step tooltips
```

---

## Flow 3: Tenant Onboarding (New Cooperative)

**Actor:** Cooperative Owner / Prospective Tenant Admin

```
1. Owner opens agapay-saas.vercel.app
2. Owner initiates onboarding via one of:
   a. "Get a Free Demo" or "Get Started" button on the homepage hero
   b. Contact Us page form
   c. Pricing page — clicking "Get Started" on any plan
3. Tenant Application Form presented:
   - Applicant Name (owner/representative)
   - Cooperative Name
   - Cooperative Email
   - Phone Number
   - Estimated Member Count
   - Region (dropdown of available regions)
   - Selected Subscription Plan (Core / Pro / Enterprise)
   - Reason/Context for joining (brief text)
   - Attached Documents:
     - Business Registration / Cooperative SEC Registration
     - Proof of Address for the cooperative
     - Representative's Valid ID
4. Billing Prompt:
   - Summary of selected plan and price
   - Payment method selection (GCash, Bank Transfer, etc.)
   - Upload payment proof
5. Application submitted — confirmation screen shown with reference number
6. Superadmin receives notification in the Approvals module
7. Superadmin reviews documents and payment proof:
   a. Approved:
      → Superadmin creates the tenant using the Global Management > Add Tenant dialog
      → Tenant admin receives email: "Your cooperative has been approved and set up!"
      → Tenant admin logs in at agapay-saas.vercel.app/[tenant-slug]/agapay-tanaw
   b. Rejected:
      → Owner notified via email with rejection reason and option to resubmit

* 14 days before plan expiry: tenant admin receives in-app + email warning
* Non-renewal: tenant access suspended; data retained for 30 days before decommission
```

---

## Flow 4: Tenant Creation by Superadmin

**Actor:** Superadmin

```
1. Superadmin navigates to Global Management in Agapay Tanaw
2. Superadmin ensures the target region exists (or creates one first via region management)
3. Superadmin clicks "Add Tenant"
4. Two-pane dialog opens:
   LEFT PANE — Tenant Builder:
     Homepage Builder:
       - Parent Region (dropdown)
       - Tenant Name
       - URL Slug (auto-generated from name, editable — validated for uniqueness)
       - Brand Color, Main Color, Accent Color (color pickers)
       - Branch Logo (upload, max 5MB)
       - Hero Tagline and Subtitle
       - Starter Testimonials (add up to 3)
       - Starter FAQs (add up to 5)
       - Calculator Config (default loan product, default term)
     Dashboard Builder:
       - Toggle panel for each dashboard feature per role
       - Features greyed out if not included in selected plan
   RIGHT PANE — Live Preview:
       - Landscape iframe of the tenant homepage rendering in real time
       - Updates as left pane fields change
       - "Open in New Tab" button for full-page preview
5. Superadmin confirms and clicks "Create Tenant"
6. System:
   - Creates a new tenant record and schema in the database
   - Generates the tenant homepage at agapay-saas.vercel.app/[tenant-slug]/
   - Creates the tenant admin account and sends credentials via email
7. Superadmin sees a success toast with a link to the new tenant's homepage
8. Superadmin can return to Global Management to edit, suspend, or decommission the tenant at any time
```

---

## Flow 5: Withdrawal (Tenant Member or Lender)

**Actor:** Tenant Member or Tenant Lender

```
1. User is at agapay-saas.vercel.app/[tenant-slug]/agapay-[tanaw/pintig]
2. User navigates to the E-Wallet module
3. User clicks "Withdraw"
4. Withdrawal form appears:
   - Amount: preset buttons (₱500, ₱1,000, ₱2,000, ₱5,000) or custom input
     * System enforces: amount ≤ available wallet balance
   - Withdrawal method: GCash / Bank Transfer (linked accounts shown; user can add new)
5. Confirmation screen shown:
   - Withdrawal amount: ₱X.XX
   - Processing Fee: ₱20.00
   - Total Deducted from Wallet: ₱X.XX + ₱20.00
   - Withdrawal Method: [selected method]
   - Estimated Remaining Balance: ₱X.XX
6. User clicks "Confirm Withdrawal"
7. Withdrawal record created with status: Pending
8. Tenant Operator receives a notification (for fund release processing)
9. Once the operator processes the release:
   → Status updated to: Released
   → User receives in-app + email notification: "Your withdrawal of ₱X has been processed."
   → Receipt generated and viewable in transaction history

* If a withdrawal is not processed within a reasonable time, the user can:
  → Open E-Wallet → Transaction History → select the pending record → "Report to Admin"
  → This creates a support ticket linked to the transaction
```

---

## Flow 6: Deposit (Tenant Member or Lender)

**Actor:** Tenant Member or Tenant Lender

```
1. User navigates to the E-Wallet module
2. User clicks "Deposit"
3. Deposit form appears:
   - Amount: preset buttons (₱500, ₱1,000, ₱2,000, ₱5,000) or custom input
   - Deposit method: GCash / Bank Transfer / Cash (over-the-counter)
   - Upload proof of deposit (required for all manual methods):
     * Image or PDF of receipt
4. Confirmation screen shown:
   - Deposit amount: ₱X.XX
   - Processing Fee: None (or stated if applicable)
   - Deposit Method: [selected method]
   - Proof attached: ✓
   - Estimated New Balance (after admin approval): ₱X.XX
5. User clicks "Submit Deposit"
6. Deposit record created with status: Pending Verification
7. Tenant Operator receives notification for verification
8. Operator reviews proof and approves:
   → Wallet balance updated
   → Status updated to: Credited
   → User notified: "Your deposit of ₱X has been credited to your wallet."
   → Receipt generated in transaction history

* If rejected: user is notified with reason and prompted to resubmit with correct proof
* If unprocessed: user can report via transaction history
```

---

## Flow 7: Loan Application (Tenant Member)

**Actor:** Tenant Member

```
Pre-condition: Member has no active loan in this tenant.

1. Member navigates to "Apply for Loan" module in Agapay Pintig
2. Member views available loan products (filtered by their current tier)
   - Ineligible products are visible but greyed out with a "Unlock at [Tier X]" label
3. Member selects a loan product
4. Member configures the loan:
   - Desired amount (slider, within product min/max)
   - Payment cadence (Weekly / Bi-weekly / Monthly)
   - Loan term (within product min/max months)
   - Purpose of loan (dropdown + optional notes)
   - Guarantor selection (optional, 1–2 members from branch):
     * Only members with no outstanding guarantor obligations shown
     * Selected guarantors receive an in-app notification to accept/decline
5. Calculator preview shown:
   - Full amortization table
   - Total cost summary (principal + interest + fees)
   - Penalty schedule reference
6. Member checks "I agree to the loan terms and conditions" and submits
7. Application status: Pending
8. Tenant Operator notified (Loan Applications queue)
9. Operator reviews application:
   a. Approved:
      → Loanee notified: "Your loan application has been approved!"
      → Loan moves to Fund Release queue for disbursement scheduling
      → Guarantors (if any) are notified of their active guarantor status
   b. Rejected:
      → Loanee notified with mandatory rejection reason
      → Member can view rejection reason in My Loans history
      → Member may re-apply after addressing the reason

* Only one active loan allowed per member per tenant at any time
* Guarantors can see their active guarantor obligations in their profile
```

---

## Flow 8: Fund Release (Tenant Operator)

**Actor:** Tenant Operator (Admin / Lender)

```
1. Operator navigates to Approvals & Queue → Fund Releases
2. Operator sees approved loans awaiting disbursement
3. Operator selects a pending release record
4. Expanded card shows:
   - Applicant name, approved loan amount, release method, scheduled date
5. Operator confirms the release:
   - If E-Wallet: system credits the member's wallet directly
   - If Cash/GCash: operator marks as released, uploads release receipt
6. Status updated to: Released
7. Loanee receives in-app + email notification: "Your loan of ₱X has been disbursed."
8. Loan record is activated — repayment schedule begins from disbursement date
9. Receipt generated for operator records and member loan details
```

---

## Flow 9: Installment / Full Payment (Tenant Member)

**Actor:** Tenant Member

```
1. Member navigates to "Payments" in Agapay Pintig
2. Member sees their active loan's current installment due:
   - Installment number, due date, amount due, any accumulated penalties
3. Member selects payment type:
   a. Pay Current Installment (pre-filled amount)
   b. Pay Full Outstanding Balance (system shows remaining total and applies early settlement discount if policy allows)
4. Member selects payment method:
   a. E-Wallet:
      - System checks wallet balance
      - If sufficient: proceeds; if insufficient: prompts deposit first
   b. Manual / GCash:
      - Member uploads proof of payment (receipt photo or PDF)
5. Confirmation screen:
   - Payment type (installment # or full)
   - Amount
   - Payment method
   - Any fees or penalties included
6. Member confirms — payment record created with status: Submitted / Pending Verification
7. Tenant Operator notified (Payment Verification queue)
8. Operator reviews and acts:
   a. Approved:
      → Installment marked as Paid in the loan schedule
      → Repayment progress updated
      → Member notified: "Your payment has been verified and applied."
      → If all installments paid: Loan marked as Fully Paid; member can apply for a new loan
   b. Rejected:
      → Member notified with rejection reason (e.g., "Incorrect amount on receipt")
      → Member prompted to resubmit with correct proof

* If a payment is unprocessed: member can report via payment status tracker
* Full payment: loan marked Fully Paid, Trust Score updated accordingly
```

---

## Flow 10: Trust Score Voting

**Actor:** All roles (Superadmin → Tenant Admins; Tenant Operators/Members → each other)

```
1. At the end of each calendar month, a voting period opens (e.g., last 3 days of the month)
2. Each user receives an in-app notification and email: "Monthly Trust Score Voting is now open."
3. Voting assignments (randomized sampling for branches with large member counts):
   - Superadmin rates: Tenant Admins and Branches (Trust Score criteria)
   - Tenant Operators rate: Members (Repayment Behavior, Savings Discipline, Loan Utilization)
   - Tenant Members rate: Each other (Peer/Community Validation — assigned randomly, minimum quota applied)
   - Tenant Admins rate: Members (Membership Tenure & Activity)
4. Voting interface:
   - Card per assigned ratee: Name, role, brief profile summary
   - Rating sliders or star inputs per criterion
   - Optional comment field
   - "Not applicable" option for criteria not observed
5. Once submitted, votes are locked (no edits)
6. System calculates updated Trust Scores after the voting period closes
7. Trust Scores update — users notified of their new score
8. Members who have NOT completed their minimum voting quota are temporarily restricted from:
   - Applying for loans
   - Making withdrawals
   - Accessing chat features
   → A banner shown: "Complete your voting to regain full access."
9. Persistent low-rating records trigger admin review and potential status action (suspension/blacklist)

* Randomized sampling: ensures manageable voting loads in large branches
* Weighted trust graph: ensures consistent scoring even with partial participation
* Minimum voting quota: e.g., must rate at least 3 assigned members to count as complete
```

---

## Flow 11: Tier Upgrade / Downgrade

**Actor:** System (automatic)

```
1. After each Trust Score voting cycle, the system evaluates each member's updated Trust Score
2. Eligibility rules checked against Agapay Goals thresholds (configured by Superadmin/Tenant Admin):
   - e.g., Tier 1 → Tier 2 upgrade: Trust Score ≥ 75 AND at least 1 fully repaid loan AND minimum 3 months tenure
   - e.g., Tier 3 → Tier 2 downgrade: Trust Score falls below 60 OR active default record
3. Automatic tier change applied:
   - Upgrade: Member notified "Congratulations! You've been upgraded to Tier X — [Tier Name]. Your interest rate is now X%."
   - Downgrade: Member notified "Your trust score has dropped. Your tier has been adjusted to Tier X — [Tier Name]. Your interest rate is now X%."
4. New tier takes effect on the member's next loan application
5. Tier history logged in the member's profile and audit trail
```

---

## Flow 12: Default Handling

**Actor:** System (automated) + Tenant Operator

```
Pre-condition: Member misses payments beyond the maximum penalty window.

STAGE 1 — Automated Reminders
   Day 1 after missed due date: In-app + email: "Your installment was due. Please pay to avoid penalties."
   Day 4: "Your account has accumulated a 5% penalty. Please settle your overdue payment immediately."
   Day 8: "Warning: Your account has accumulated an 8% penalty. A final notice will be issued if unpaid."
   Day 15: "Final Notice: Your account is now at risk of default. Please contact your branch immediately."

STAGE 2 — Restructuring Offer
   If no payment by Day 15:
   → Tenant Operator receives alert: "[Member Name] is approaching default status."
   → Operator may initiate a Compassion Action:
     a. Offer loan restructuring: extend term, reduce installment size
     b. Grant a grace period (defers next due date with documented reason)
     c. Waive partial penalties
   → Member notified of the restructuring offer and must accept/decline
   → If accepted: loan restructured, new schedule active

STAGE 3 — Default Declaration
   If no payment or restructuring agreement is reached:
   → Loan marked as Defaulted
   → Member's account frozen (cannot apply for loans, withdraw, or interact with Agapay)
   → Guarantors (if any) notified of their 25% liability and given a payment deadline
   → Member's Trust Score significantly reduced
   → Tenant Operator notified for collection escalation

STAGE 4 — Final Write-Off
   If default remains unresolved after the collection window:
   → Loan written off in treasury records
   → Member flagged as Blacklisted
   → Audit trail permanently records the default and write-off
   → Tenant Admin notified for reporting purposes
```

---

## Flow 13: Two-Factor Authentication Setup (TOTP)

**Actor:** Any Registered User

```
1. User navigates to Settings > Security in their dashboard
2. User clicks "Enable Two-Factor Authentication"
3. System generates a unique TOTP secret and displays:
   - A QR code for scanning
   - A manual entry key (for non-camera devices)
   - A verification code input field
4. User scans the QR code using an authenticator app (Google Authenticator, Authy, etc.)
5. User enters the 6-digit code shown in the app into the Agapay verification field
6. User clicks "Confirm & Enable"
7. System verifies the code:
   - If valid: system enables 2FA, logs the action, and displays 10 single-use Backup Codes
   - If invalid: error shown, user can retry
8. User is prompted to "Save Backup Codes" before closing the setup modal
9. On subsequent logins, Flow 1 Step 7 is triggered
```

---

_End of Agapay Enhanced PRD_
