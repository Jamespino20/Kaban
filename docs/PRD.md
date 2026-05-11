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
- Agapay Zoomable Live Branch section-
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
  - Add Tenant should show a two-pane dialog. Left pane is the homepage and dashboard builder. Homepage builder contains parent region, tenant name, URL slug, brand color, main color, accent color, branch logo, primary contents, starter testimonials and FAQs, hero section content, and calculator configs. Dashboard builder should show the entire functions for each role (Superadmin can toggle enabled functions of the tenant dashboard depending on the current plan). Right pane is the landscape live preview with a button to access the actual tenant homepage.
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
    - Global scoring weights (Trust Score logic)
    - Risk thresholds (auto-flag delinquency, fraud signals)
    - Default loan calculator configs
  - Subscription & Billing
    - Plan creation (limits: members, operators, features)
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
- Overview [Contains combined KPIs of branch health: Funds, Active Loans, Portfolio Growth, Repayment Rates, ROI/Earnings (Personal & Branch), Risk Exposure, and Portfolio Diversification; includes Recent Interaction Logs, Total Trust Score of the Branch, and AI-generated Snapshots/Summaries]
- Approvals & Queue [Unified grid of cards with search, filters, and inside-scrolling]
	-Loan Applications [Status: Rejected, Pending, Approved]
	 	-Card contains: Applicant Name, Trust Score, Loan Product, Requested Value, Cadence/Term, Purpose, Reference Number
	- Fund Releases [Status: Not Released, Released]
		- Card contains: Applicant Name, Loan Product, Approved Value, Release Method, Scheduled Date, Reference Number
	- Payment Verification [Status: Rejected, Pending, Approved]
		- Card contains: Applicant Name, Installment #, Payment Reference, Receipt Attachment, Amount, Verification Action
	- Capital Top-Up Queue [Incoming funding requests from operators/lenders]
		- Card contains: Lender Name, Amount, Method (E-wallet/Bank), Status, Reference Number
	- Identity Verification [Document review for new members]
		- Card contains: Applicant Name, Membership Code, Attached IDs, Verification Status
- Capital & Investments (The Vault) [Personal and Branch-level funding management]
	- My Investment Portfolio [Active investments in loans, ROI breakdown, Earnings history, Defaulted loan exposure]
	- Wallet & Top-Ups [Add/Withdraw funds, Transaction History, Linked Bank/E-wallet accounts]
	- Risk & Diversification [AI-driven suggested investments and risk alerts across the branch portfolio]
- Member Management
	- Member Directory [Grid/cards view of the community]
	- Member Profiles [Personal info, full Loan History, Trust scores, Uploaded Documents]
	- Status Controls [Active / Suspended / Blacklisted toggles]
- Loan Products & Policy
	- Product Studio [Create/Edit products: Interest models (Flat/Diminishing), Cadence, Term Limits, Penalty rules]
	- Logic Config [Assigning eligibility rules and risk scoring modifiers]
- Treasury & Reconciliation [Strict daily financial integrity]
	- EOD Reconciliation (Critical) [Daily sign-off: Payments received vs. Loans released, Treasury balance, Flagging discrepancies]
	- Compassion Actions [Loan restructuring/Grace periods/Penalty waivers with approval trails and notes]
- Content & Branding [Branding and Member-facing UI control]
	- Tenant Homepage Editor [Hero Section, Calculator Config, Testimonials, FAQs, Announcements Banner]
	- Branch Identity [Logo, Brand/Accent Colors, Typography selection]
- Community
	- Intercom / Bulletin [Branch-wide announcements, internal messaging, member engagement posts]
	- Chat Hub [Individual and Group chats with members and tenant operator]
- Support & Analytics
        - Satisfaction Survey
	- Feedback Registry [Member complaints/reviews, system issues, testimony submission, and feature requests]
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
  - Trust score
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
  - Chat Hub [Individual and Group chats with members and tenant operator]
- Support / Feedback
  - Satisfaction Survey
  - Submit concerns
  - Track ticket status
  - Testimony submission
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
- Agapay Pro  — P6,500/6-months [Benefits: Everything in Core, plus: Up to 2,500 members, Custom Tenant Branding, Mentorship & Community Tools, Chat/Priority Email Support, Automated Compassion Workflow, Basic Data Export Tools]
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

## Tier Upgrade/Downgrade

- Automatic upgrade or downgrade depending on Agapay Goals (will be set up)

## Default Handling

- Account frozen, Guarantors charged, Trust score reduced
- Collection workflow triggered: Reminders -> Restructuring offer -> Final write-off

---

# ISSUES

## SYSTEMWIDE ISSUES
### Platform Homepage
#### Homepage 
- Add more shortcuts to the navbar
- Disable the default scrollbar and implement a custom green circle scrollbar.
- Remove Get Started with Agapay button from the platform navbar.
- Hero button should be Apply for Agapay (which leads to the tenant onboarding form) and the Loan Calculator
- Loan Calculator should emphasize that this is an example set of business operation and that things may depend on the actual cooperative policies
- Showcase that Agapay is a platform system that offers microfinancing cooperative services, not a microfinancing cooperative company itself.
- Live Map should be zoomable because tenants near each other are clipping against each other, making for a very complicated navigation. The static building icon should show the tenant logos instead, the button to visit the tenant homepage changes according to its brand color, and the members and loans repaid must be accurate to what the tenant actually has
- SaaS pricing is outdated
- Remember that the platform testimonies should come from the testimonies from other tenants, rooted from their homepages, and picked by the superadmin (the system automatically notifies the target testimonees)
- Start a clearer lender flow box should have "Apply for Agapay Now" button only.

#### Platform Footer
- Could improve by showcasing a bit more on Agapay's features
- Remove Security from the Footer
- Pricing should showcase the allowed features per plan better, then the Member Loan Rate Guide could be more accurate to the Agapay Constants

#### Company Footer
- Management and Partners only lead to the /about page. Either remove them from the footer or you actually make content for this.

#### Legal Footer
- Either remove Cookie Settings from the links or actually make content for this.

#### Contact
- Ensure that the wording here is showcasing Agapay as a cooperative platform, not as a cooperative company.
- Tenant Onboarding should add a payments tab after documents. The Tenant can now pick plans and input necessary billing details. This should notify the superadmin about the tenant application
- General Feedbacks does not show up in the superadmin Feedback module

### Tenant Homepage
- Disable the default scrollbar and implement a custom green circle scrollbar.
- It should be have the exact same content, design, layout, and feel as the platform homepage, now with the dedicated register/login button and modal. Ensure that the brand colors are shown properly here for distinction.

### Apex Homepage [should not be seen from the find cooperatives selector]
- Disable the default scrollbar and implement a custom green circle scrollbar.
- Make minimal content here but still have details, now with the usual platform login button and modal.	

### Tanaw and Pintig Dashboards
- Disable the default scrollbar and implement a custom green circle scrollbar.
- Operators and Superadmins should no longer have the branch selector, only the Members have it
- Some modules are still indented in the sidebar
- Having a Vouch System would just complicate things, so let's remove it for both operators and members
- Remove the unnecessary three-dot button on the header, since we are still logged in per every session
- Module contents are still in Tagalog
- There are still hardcoded slate colors, and some action buttons miscolored across all tenants [ensure that the color branding is consistent per tenant]
- It should be "Powered by [agapay_titled.png]" at the sidebar
- There should be a warning/timeout modal popping out for 1 hour inactivity
- For the sidebar text, when the colors are too bright, the font color should be black. Vice versa
- Enable dark mode while retaining tenant branding
- Logging out should lead to their tenant homepage, not the Agapay platform homepage
- Form inputs should be saved even when accidentally exited
- All loading visuals should be skeleton
- Updates and changes do not happen or show up in realtime, but rather in every window refresh
- Error toasts could be more explicit in what went wrong

## ROLE-BASED ISSUES

### Superadmin
- Overview should not be responsible for tenant business. It should show KPIs and summary logs of the platform system itself
- Community should be with tenant operators only	
- Approvals should be for tenant application only
- Improve Global Management by showing better details and action buttons for every card, allow for restoring decommissioned tenants by uploading a saved backup of all tenant information. Visually sort every tenant by their region, then widen the tenant homepage & dashboard builder modal while adding more details and paid plan options. There should also be a view tenant homepage button
- At Homepage Content, superadmin can edit platform hero section video/content, toggle platform homepage sections, edit platform homepage content, FAQs and Tenant Testimonials. It should not approve other tenants' FAQ/Testimonial posting requests for their own homepages. When picking Tenant Testimonials for the Agapay Testimonies section, it should notify both the tenant operator and the targetted tenant member.
- Feedback has "entryies". I tried sending a feedback from the platform homepage, but it doesn't show up (it did send an email notification to my superadmin email). Audit Logs should be a separate module [since the actual Audit Log module access leads to a blank page
- Reports should be platform-related. There needs to be time ranges and more search-and-filter.
- System Health should be a part of the Reports.
- Settings is indented in the sidebar. Remove the customization in the Settings since it should be the Homepage Content [We might rename it]. There are no capabilities for personal information. Remove the SaaS subscription plan section since the superadmin doesn't need to change plans
- There's no way right now to monitor tenant lease payments and edit the plans' benefits. There's no email templates, no AI right now.
- There's no way for superadmin to toggle what modules each tenant will have according to their paid plan

### Tenant Operator
- Operators do not need an interest tier of their own [Overview]
- Approvals and Queues have unresponsive buttons and input fields
- Payment Intake has this error: Invalid `prisma.savingsTransaction.create()` invocation: { data: { account_id: 5, tenant_id: 2, transaction_type: "deposit", amount: new Prisma.Decimal("2000"), reference: "CASH-484582", processed_by: 2, notes: "Over-the-counter cash", ~~~~~ ? transaction_id?: Int, ? fee_amount?: Decimal, ? net_amount?: Decimal | Null, ? status?: PaymentStatus, ? method_label?: String | Null, ? external_reference?: String | Null, ? reconciliation_reference?: String | Null, ? ledger_transaction_id?: String | Null, ? issue_status?: String, ? issue_reported_at?: DateTime | Null, ? issue_notes?: String | Null, ? processed_at?: DateTime } } Unknown argument `notes`. Available options are marked with ?.
- Capital Top-Ups from the Members should be processed automatic (handled by the system), and has this error: approveWalletTopUp failed: Error: Ledger Error: Missing account codes: CASH_EQUIVALENTS, MEMBER_SAVINGS
    at s (.next/server/chunks/3853.js:5:1072)
    at async (.next/server/chunks/3853.js:5:13396)
    at async (.next/server/app/[tenant]/auth/login/page.js:22:3123)
    at async Proxy.$withTenant (.next/server/app/[tenant]/auth/login/page.js:22:3079)
    at async c (.next/server/chunks/3853.js:5:12560)
- Capital and Investments is indented in the sidebar, contains redundant KPIs, has system-related previews when it should be business-related
- Member Management is indented in the sidebar, is missing some three-dot actions, and it's seeing the members outside the current tenant
- Treasury and Reconciliation says "An imbalance was detected. You must provide a reason to adjust the ledger and sign off." even when the values are 0 (there ARE currently two active loans in the DB)
- At Homepage Content, Operator can edit tenant hero section video/content, toggle tenant homepage sections, edit tenant homepage content, FAQs and Tenant Testimonials. It should not mess with other tenants' homepage. There should be a notification section for superadmin testimony requests
- Community should allow the operator to chat as well, right now it's just a preview
- Support and Analytics is indented in the sidebar, and is really unclear. Support & Feedback should obtain data from within the tenant's members only. Audit Logs should be a separate module
- Settings is indented in the sidebar. Remove the customization in the Settings since it should be the Homepage Content [We might rename it]. There are no capabilities for personal information. For the SaaS subscription plan, there should be a billing process everytime an upgrade is requested.


### Tenant Member
- Loan Capability Meter should only have the min-max according to their remaining/existing balance
- Data Privacy and Consent, Terms and Conditions, and Tutorial of the cooperative should pop up as dialogs for newcomers, with the option to view them again in the settings
- At Wallet, whenever we make a deposit, we should provide deposit method, reference numbers, and proof of deposits somehow
- Loan Application's form could be widened further and better laid out, as well as having clearer terms, conditions, and policies.
- My Loans can also be Repayment, so we might as well remove the Repayment module. The card's elements could be laid out better with summary details and will be expanded by clicking on it, then the paid/overdue/defaulted loans should be presented via a grid format. Some action buttons cannot send data due to unusable input fields [possibly due to lack of data from the seed]
- Community module is still a mess in layout and functionalities. A user can click others' profile pfps so they'll be able to see member info and send them a direct message. Closely timed messages should be closer together
- Vouch System is now removed
- Support System is still a placeholder. 
- Settings should also allow profile image editing, account/personal information [except for member name and member code], preferences, security details, TnC and other policies, account deactivation, download backup, and more
- I can still apply for loans even when I haven't paid for my previous loan

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
