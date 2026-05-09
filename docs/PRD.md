Alright, let's have a complete revamp for Agapay, we'll redo everything from scratch. This is an improved PRD with expected features, constants, use flows, and current systemwide/role-based issues.

# AGAPAY FEATURES:

- Mock E-wallet with withdrawal and deposit capabilities, along with verification (ID/photos/documents)
- Mock loaning and repayment, with interest rates set by a user's tier
- Feedback systems across all transactions
- Imbalance tracking, investigation, and resolution
- Guarantorship and Mentorship (can be optional for some tenants who do not support it)
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

- Purpose: Platform governance, not business interference
- Scope: Cross-tenant control, system integrity, SaaS monetization

## Tenant Admin

- Purpose: Operate a cooperative
- Scope: Loans, members, risk, finance, content

## Tenant Lender

- Purpose: Provide capital
- Scope: Investment decisions, risk evaluation

## Tenant Member

- Purpose: Borrow and participate
- Scope: Loans, repayments, trust-building

---

# AGAPAY MAIN SECTIONS

## Agapay Platform Homepage Content

- Navbar with Agapay logo, quicklinks, and find cooperatives button
- Hero section with tagline and subtitle, no buttons
- Why Agapay section
- Features section
- Sample Calculator section
- Agapay Zoomable Live Tenant section-
- Agapay SaaS Pricing
- Testimonials section
- FAQs section
- Contact section
- Footer

## Agapay Tenants Homepage Content

- Navbar with cooperative logo, quicklinks, and find cooperatives button
- Hero section with Powered by @agapay_titled.png, cooperative tagline and subtitle, no buttons
- Tenant's Mission and Vision section
- Tenant's Values section
- Sample Calculator section
- Testimonials section
- FAQs section
- Contact section
- Footer

## Agapay Tanaw

- Sidebar with navigation links, profile preview, and signout button
- Main content area
- Module header with role name, notifications, and three-dot actions
- For Superadmin, Tenant Admins, and Tenant Lenders

## Agapay Pintig

- Sidebar with navigation links, profile preview, and signout button
- Main content area
- Module header with role name, notifications, and three-dot actions
- For Tenant Members

---

# AGAPAY MODULES PER ROLE

## Superadmin

- Overview [Contains KPIs of global numbers (funds, active loans, portfolio growth, repayment rates, risks), recent logs, total trust score of Agapay itself, and recent snapshot summaries (AI-generated)
- Community
  - Internal messaging / bulletin
  - Global announcements
  - Individual chats/group chats [with admins only]
- Approvals [has grid of cards that expands upon clicking, has searchbar, inside scrolling, appropriately sized elements, and filters]
  - Documents Verification (Tenant Application)
    For Tenant Application, each card contains:
    - Applicant Name
    - Tenant Name
    - Tenant Email
    - Tenant Phone Number
    - Estimate Member Count
    - Tenant Region
    - Selected Plan
    - Attached Documents
- Global Management [has grid of cards that expands upon hovering, has searchbar, inside scrolling, appropriately sized elements, and filters]
  - Sorts all tenants according to regions
  - Each card shows member counts, current paid plan, portfolio, tenant score, and last availment date, with buttons to edit, mark availed/suspended, and decommission/restore
  - Add Tenant should show a two-pane dialog. Left pane is the homepage and dashboard builder. Homepage builder contains parent region, tenant name, URL slug, brand color, main color, accent color, tenant logo, primary contents, starter testimonials and FAQs, hero section content, and calculator configs. Dashboard builder should show the entire functions for each role (Superadmin can toggle enabled functions of the tenant dashboard depending on the current plan). Right pane is the landscape live preview with a button to access the actual tenant homepage.
  - Once new tenants are created, it should create a new tenant record in the DB
  - There should be a lease according to the tenant's purchased plan, and it should warn tenants 2 weeks before access suspension so they can pay
- Homepage Content (for Platform Dashboard) contains FAQ Moderation (General-Scoped) and Testimonial Moderation (Uses Tenants' Testimonials)
  - In FAQ Moderation, the superadmin can input a question, the parent season (superadmin can create parent seasons so the superadmin can tick seasons in one go), and the question's answer. Superadmin can hide/show seasons and tick all of the contents or tick individually. All custom FAQs override the constants.
  - Testimonial Moderation should allow superadmin to choose from other tenants' testimonies. Hide/show tenants, all custom testimonies (Testimonee Name, Occupation,
- Feedback
  - This is received from the platform homepage or system concerns
- Reports
  - Cross-Tenant Financial Reports
    - Total disbursed vs repaid
    - Default rates per region
    - Portfolio at risk (PAR)
  - Tenant Performance Reports
    - Growth trends
    - Member acquisition
    - Retention rates
  - Exportable formats (CSV, PDF)
  - Scheduled reports (email dispatch)
- System Health
  - API uptime
  - Queue processing status
  - AI processing logs
  - DB usage per tenant schema
- Fraud & Risk Monitoring
  - Cross-tenant fraud detection signals
  - Duplicate identities across tenants
  - Suspicious transaction patterns
- Audit Logs
  - Audit Logs across all tenants
- Settings
  - Platform Config
    - Global scoring weights (Trust Score, Vouch Score logic)
    - Risk thresholds (auto-flag delinquency, fraud signals)
    - Default loan calculator configs
  - Subscription & Billing
    - Plan creation (limits: members, lenders, features)
    - Pricing tiers
    - Tenant billing cycles & invoices
  - AI Configuration
    - Snapshot summary prompts
    - Risk detection sensitivity
    - Notification System
  - Email/SMS templates
    - Global announcement broadcaster
  - Security
    - Role-based access control (RBAC) templates
    - 2FA enforcement rules

## Tenant Operator (Unified Admin & Lender)

- Overview [Contains combined KPIs of tenant health: Funds, Active Loans, Portfolio Growth, Repayment Rates, ROI/Earnings (Personal & Tenant), Risk Exposure, and Portfolio Diversification; includes Recent Interaction Logs, Total Trust Score of the Tenant, and AI-generated Snapshots/Summaries]
- Approvals & Queue [Unified grid of cards with search, filters, and inside-scrolling]
  -Loan Applications [Status: Rejected, Pending, Approved]
  -Card contains: Applicant Name, Vouch Score, Trust Score, Loan Product, Requested Value, Cadence/Term, Purpose, Reference Number
  - Fund Releases [Status: Not Released, Released]
    - Card contains: Applicant Name, Loan Product, Approved Value, Release Method, Scheduled Date, Reference Number
  - Payment Verification [Status: Rejected, Pending, Approved]
    - Card contains: Applicant Name, Installment #, Payment Reference, Receipt Attachment, Amount, Verification Action
  - Capital Top-Up Queue [Incoming funding requests from operators/lenders]
    - Card contains: Lender Name, Amount, Method (E-wallet/Bank), Status, Reference Number
  - Identity Verification [Document review for new members]
    - Card contains: Applicant Name, Membership Code, Attached IDs, Verification Status
- Capital & Investments (The Vault) [Personal and Tenant-level funding management]
  - My Investment Portfolio [Active investments in loans, ROI breakdown, Earnings history, Defaulted loan exposure]
  - Wallet & Top-Ups [Add/Withdraw funds, Transaction History, Linked Bank/E-wallet accounts]
  - Risk & Diversification [AI-driven suggested investments and risk alerts across the tenant portfolio]
- Member Management
  - Member Directory [Grid/cards view of the community]
  - Member Profiles [Personal info, full Loan History, Trust/Vouch scores, Uploaded Documents]
  - Status Controls [Active / Suspended / Blacklisted toggles]
- Loan Products & Policy
  - Product Studio [Create/Edit products: Interest models (Flat/Diminishing), Cadence, Term Limits, Penalty rules]
  - Logic Config [Assigning eligibility rules and risk scoring modifiers]
- Treasury & Reconciliation [Strict daily financial integrity]
  - EOD Reconciliation (Critical) [Daily sign-off: Payments received vs. Loans released, Treasury balance, Flagging discrepancies]
  - Compassion Actions [Loan restructuring/Grace periods/Penalty waivers with approval trails and notes]
- Content & Branding [Branding and Member-facing UI control]
  - Tenant Homepage Editor [Hero Section, Calculator Config, Testimonials, FAQs, Announcements Banner]
  - Tenant Identity [Logo, Brand/Accent Colors, Typography selection]
- Community
  - Intercom / Bulletin [Tenant-wide announcements, internal messaging, member engagement posts]
  - Chat Hub [Individual and Group chats with members and staff]
- Support & Analytics
  - Feedback Registry [Member complaints, system issues, and feature requests]
  - Growth Analytics [Portfolio trends, behavior insights, default forecasts]
  - Security & Audit Logs [All Operator + Staff actions; filter by User, Module, and Date]
- Settings
  - Tenant Config [Strict loan rules, scoring tweaks, email/system notification triggers]
  - Operator Profile [Personal info, profile picture, Theme selection (Light/Dark)]
  - Security Matrix [2FA config, password management, session controls, linked banking/wallet accounts]

## Tenant Member

- Overview
  - Active loans
  - Remaining balance
  - Next due date
  - Trust & Vouch score
  - AI financial tips
- Apply for Loan
  - Loan product selection
  - Calculator preview
  - Submit application
  - Upload requirements
- My Loans
  - Active loans
  - Loan details: Payment schedule, Remaining balance, Payment history
- Payments
  - Pay installments
  - Upload proof (if manual)
  - Payment status tracking
- Community
  - Internal messaging / bulletin
  - Group announcements
  - Member engagement posts
  - Individual chats/group chats
- Vouch System
  - Request vouches
  - Give vouches
  - View trust network
- Support / Feedback
  - Submit concerns
  - Track ticket status
- Profile & Settings
  - Profile [Editable with username, address, profile picture, light/dark theme]
  - Security (password, 2FA)
  - Linked accounts
  - Bank / wallet accounts
  - Notification preferences

---

# AGAPAY CONSTANTS:

## Agapay Tagline

- Iyong Agapay, Ating Tagumpay

## Agapay Main Tenant

- Malolos City, Bulacan

## Agapay Email

- agapay.saas@gmail.com

## Agapay Roles

- Superadmin
- Tenant Admins
- Tenant Lenders
- Tenant Members

## Agapay Dashboards

- Agapay Tanaw (Superadmin, Tenant Admins, Tenant Lenders)
- Agapay Pintig (Tenant Members)

## Agapay Tenant Subscription Plans:

- Agapay Core — P3,500/3-months [Benefits: Up to 500 members, Basic Admin Dashboard, Standard Microfinance Policy Access, Audit Logs, Email Support
- Agapay Pro — P6,500/6-months [Benefits: Everything in Core, plus: Up to 2,500 members, Custom Tenant Branding, Mentorship & Community Tools, Chat/Priority Email Support, Automated Compassion Workflow, Basic Data Export Tools]
- Agapay Enterprise — P12,000/12-months [Benefits: Everything in Pro, plus: Unlimited Members, Analytics Module, Priority Support (faster SLA), Advanced Data Export & Reporting Tools, System Configuration Controls]

## Agapay Tenant Interest Rate Tiers

- Tier 1: Gabay (5%) (All new users start here)
- Tier 2: Bagong Sigla (4.5%)
- Tier 3: Kasapi (4%)
- Tier 4: Katuwang (3.5%)
- Tier 5: Kaagapay (3%)

## Agapay Loan Amounts

- P2,000 - P1,000,000 [Could go past that on special cases]

## Sample Agapay Loan Products

- Agapay Sari-Sari ( P2,000 - P5,000 )
- Agapay Negosyo ( P6,000 - P29,000 )
- Agapay Paluwagan ( P30,000 - P59,000 )
- Agapay Angat ( P60,000 - >P100,000 )

## Agapay Payment Cadence

- Weekly
- Bi-weekly
- Monthly

## Rates

- Penalties (2% (1–3 days), 5% (4–7 days), 8% (8–14 days), 12% (15+ days), capped at 20% of the missed installment)
- Processing Fee (P20)
- Service Fee (P50)
- Guarantor Liability (%25) [1-2 tenant member guarantors]

## Agapay Member's Tenant Limits

- 2

## Agapay Member Trust Score Criteria

- Repayment Behavior (40%, Lender's Rating)
- Savings & Financial Discipline (20%, Lender's Rating)
- Loan Utilization (15%, Lender's Rating)
- Membership Tenure & Activity (15%, Admin's Rating)
- Peer/Community Validation (10%, Members' Ratings)

## Agapay Tenant Trust Score Criteria

- Portfolio Repayment Health (35%, System-Generated)
- Savings Growth & Stability (20%, System-Generated)
- Loan Portfolio Quality & Risk (20%, System-Generated)
- Operational Compliance & Efficiency (15%, Admin’s Rating)
- Member Satisfaction & Engagement (10%, Members’ Ratings)

## Agapay Vouch Score

- 10 (computing the mean)

---

# AGAPAY USE FLOWS:

## Login

- Accesses agapay-saas.vercel.app
- Searches for active tenants in tenant selector or zoomable live map
- Accesses agapay-saas.vercel.app/[tenant-slug]/ for the tenant-specific homepage
- Logs in and verifies if 2FA is enabled
- Accesses agapay-saas.vercel.app/[tenant-slug]/agapay-[tanaw/pintig]

* If member is in multiple tenants, there should be a new login prompt

## Registration [Tenant Members]

- Accesses agapay-saas.vercel.app
- Searches for active tenants in tenant selector or zoomable live map
- Accesses agapay-saas.vercel.app/[tenant-slug]/ for the tenant-specific homepage
- Registers through the four-stage process and uploads required documents
  - Account Details (Username, email, phone number, password, confirm password)
  - Personal Information (First, middle, last names, then birthdate, gender, marital status, addresses)
  - Finance Information
    - 1. Income & Employment (This helps the microfinance institution evaluate loaning eligibility and repayment ability.)
      - Source of income (e.g., employment, small business, remittances)
      - Occupation / business type
      - Employer or business name
      - Monthly income (range is better than exact amount)
      - Length of employment / business operation
    - 2. Business Information (if applicable, can answer)
      - Has a business (Yes/No, skip if none)
      - Business name (optional if informal)
      - Business type / industry
      - Years in operation
      - Estimated monthly revenue
      - Business address
    - 3. Financial Obligations (To understand existing burden)
      - Current loans (Yes/No)
      - If yes, number of active loans, total estimated monthly repayments, other recurring expenses (optional or ranged)
    - 4. Savings & Assets (Optional but valuable, gives a fuller financial picture:
      - Do you have savings? (Yes/No)
      - Estimated savings range
      - Owned assets (e.g., house, land, vehicle, equipment)
    - 5. References / Community Verification (optional; common in microfinance systems)
      - Reference person name
      - Relationship
      - Contact number
  - Documents (Valid Gov. ID, Selfie with Valid Gov. ID, Business Permit (required if user has business), Barangay certificate of residency, Proof of Income (Business slip, paycheck, etc.))
- Accesses agapay-saas.vercel.app/[tenant-slug]/agapay-pintig
- A welcome message and direction tour should pop up

* Add prefer not to say option for sensitive details

## Tenant Onboarding

- Accesses agapay-saas.vercel.app
- Accesses the tenant onboarding from the Get in Touch button, Contact Us page, or the Pricing page
- Tenant owner fills in the details of the tenant
- Picks a paid plan
- Billing prompt
- Accesses agapay-saas.vercel.app/[tenant-slug]/agapay-tanaw after superadmin approval of plan payment and tenant application

## Tenant Creation/Management

- Superadmin creates a region
- Superadmin creates a tenant
- A tenant creation dialog shows, with details on the left and the preview panel of the tenant homepage on the right.
- Superadmin inputs the tenant name, tenant slug, parent region, color palette for homepage and dashboard, and logo (5MB)
- Superadmin gets the confirtmation, can check the created tenant site

* Superadmin can avail/suspend tenant access depending on the plan
* Superadmin can decommission or restore tenant access depending on tenant performance and any offense

## Withdrawal [Tenant Member/Lender]

- At agapay-saas.vercel.app/[tenant-slug]/agapay-[tanaw-pintig]
- E-wallet module -> Withdrawal button
- Chooses from preset values according to the amount in the e-wallet or types in the custom value, and method of withdrawal
- Shows a re-confirmation of withdrawed value, processing fee, method of withdrawal, and remaining wallet value
- User confirms
- Withdrawal makes a record

* Should the moment arise when a withdrawal transaction is not yet processed, a user can report to admin

## Deposit [Tenant Member/Lender]

- At agapay-saas.vercel.app/[tenant-slug]/agapay-[tanaw-pintig]
- E-wallet module -> Deposit button
- Chooses from preset values according to the amount in the e-wallet or types in the custom value, and method of deposit
- Shows a re-confirmation of deposit value, processing fee if applicable, method of withdrawal, and total wallet value
- User confirms
- Deposit makes a record

* Should the moment arise when a deposit transaction is not yet processed, a user can report to admin

## Loaning [Tenant Member/Lender]

- Loanee chooses an available loan product depending on Loanee's tier
- Loanee enters the desired loan value (must not be lower or higher than loan range), payment cadence, purpose of loan, and may choose 1-2 guarantors
- Shows a reconfirmation of loan value, processing fee, service fee, list of guarantors, possible penalties, and amount of installments with their costs
- Loanee confirms
- Loaner (Admin/Other Lenders for Lender, Lender for Members) gets notified of this, which gets forwarded to the loanee/loaner's tenant admin.
- Tenant Admin may approve or reject the loan, which notifies the Loaner, who then provides the money
- Loan transaction makes a record

* Should the moment arise when a loan transaction is not yet processed, a user can report to admin
* There can only be one active loan per user, per tenant
* If a loan is rejected, the loanee should be notified of the reason

## Installment / Full Payment

- Loanee checks their current active loan
- Loanee decides if they wish to pay per installment or full (has discount)
- Loanee decides if they wish to pay using their e-wallet or pay through real-life or GCash
- Loanee input loan payment
- Shows re-confirmation of payment cadence/option, payment method, and payment value + fees
- Tenant Admin may approve or reject the payment, which notifies the Loaner who is then given the money
- Loan transaction makes a record

* Should the moment arise when a loan transaction is not yet processed, a user can report to admin
* The active loan will be marked paid and the loanee can opt for a new loan product

## Trust Score Voting

- At the end of each month, users can rate for each other and the tenant.
- Superadmin rates tenants and admins
- Lenders and members can rate one another
- If a user has not yet completely rated for members and their tenant, they will be suspended from interacting with Agapay until they vote
- If a user has consistently been given low ratings, necessary actions will be done against them

* Problem: Too many members → impossible voting -> Solution: Randomized sampling voting, Weighted trust graph, Minimum voting quota

# Vouching

- Anytime, a member can vouch for another member, which gives both of them additional discounts

## Tier Upgrade/Downgrade

- Automatic upgrade or downgrade depending on Agapay Goals (will be set up)

## Default Handling

- Account frozen, Guarantors charged, Trust score reduced
- Collection workflow triggered: Reminders -> Restructuring offer -> Final write-off

---

# ISSUES

## SYSTEMWIDE ISSUES

## ROLE-BASED ISSUES

### Superadmin

### Tenant Admin

### Tenant Lender

### Tenant Member

---

# UI/UX Tips:

## 1. Prioritize Scannability Over Raw Density

People don’t read lists—they scan.

- Use **clear visual hierarchy** (title > subtitle > metadata).
- Keep each item structured consistently (same layout across rows).
- Highlight only _one or two key attributes_ per item.

👉 If everything is emphasized, nothing is.

---

## 2. Use Progressive Disclosure

Don’t show everything at once.

- Show essential info upfront.
- Hide secondary details behind:
  - Expand/collapse
  - “View more”
  - Drill-down screens

This keeps the list compact without losing depth.

---

## 3. Group and Segment Content

Break long lists into meaningful chunks.

- Use:
  - Section headers
  - Sticky headers
  - Categories or tags

Example:

- “Today”
- “Yesterday”
- “Earlier”

This reduces cognitive load dramatically.

---

## 4. Optimize Row Height (Compact but Touchable)

Balance density with usability:

- Minimum touch target: ~44px height (mobile)
- Reduce unnecessary padding—but don’t eliminate breathing room
- Use line truncation instead of wrapping when appropriate

---

## 5. Use Smart Truncation

Avoid multi-line chaos.

- Truncate long text with ellipses (`...`)
- Prioritize showing distinguishing information first
- Provide full content on tap/hover

---

## 6. Add Visual Anchors

Help users orient quickly:

- Icons or thumbnails for recognition
- Status indicators (color dots, badges)
- Consistent alignment (e.g., left-aligned titles, right-aligned metadata)

These reduce reading effort.

---

## 7. Enable Fast Filtering & Sorting

Long lists without controls = frustration.

Include:

- Search (with instant results)
- Filters (category, status, date)
- Sorting (recent, A–Z, priority)

👉 A good filter can eliminate 90% of scrolling.

---

## 8. Use Sticky UI Elements

Keep key controls visible:

- Sticky search bar
- Sticky filters
- Sticky section headers

This avoids constant scrolling back up.

---

## 9. Consider Pagination vs Infinite Scroll

Each has tradeoffs:

- **Infinite scroll**
  - Good for discovery (social feeds)
  - Risk: hard to relocate items

- **Pagination**
  - Better for task-oriented lists (tables, admin panels)
  - Easier navigation and sense of position

Choose based on user intent.

---

## 10. Provide Item-Level Actions (But Keep Them Hidden)

Avoid clutter:

- Use swipe actions (mobile)
- Use hover actions (desktop)
- Use overflow menus (⋯)

Show actions _on demand_, not all the time.

---

## 11. Maintain Consistent Spacing and Alignment

Messy spacing = perceived complexity.

- Use a consistent grid system
- Align text and elements cleanly
- Keep margins predictable

Clean alignment alone improves readability significantly.

---

## 12. Use Skeleton Loading for Perceived Performance

For long lists that load dynamically:

- Show skeleton placeholders instead of spinners
- Load items progressively

This makes the interface feel faster and more stable.

---

## 13. Add “Position Awareness”

Help users know where they are:

- Scroll indicators
- “Back to top” button
- Section jump navigation (A–Z index for directories)

---

## 14. Handle Empty and Edge States Well

Don’t leave blank screens.

- Show helpful empty states
- Suggest actions (e.g., “Try adjusting filters”)
- Provide quick resets

---

## 15. Test With Real Data (Not Mock Content)

Designs often break when:

- Names are too long
- Data is inconsistent
- Fields are missing

Always validate with messy, real-world content.

---

## A Simple Mental Model

For every list, aim for:

> **“Recognize in <1 second, decide in <3 seconds, act in <5 seconds.”**

If users need to stop and think too long, the list is too dense or poorly structured.
