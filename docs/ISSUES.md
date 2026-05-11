# ISSUES

## SYSTEMWIDE ISSUES

### Platform Homepage

#### Homepage

- Add more section shortcuts to the navbar
- Disable the default scrollbar and implement a custom green circle scrollbar.
- Remove Get Started with Agapay button from the platform navbar.
- Hero button should be Apply for Agapay (which leads to the tenant onboarding form) and the Loan Calculator
- Loan Calculator should emphasize that this is an example set of business operation and that things may depend on the actual cooperative policies
- Showcase that Agapay is a platform system that offers microfinancing cooperative services, not a microfinancing cooperative company itself.
- Live Map should be zoomable because tenants near each other are clipping against each other, making for a very complicated navigation. The static building icon should show the tenant logos instead, the button to visit the tenant homepage changes according to its brand color, and the members and loans repaid must be accurate to what the tenant actually has
- SaaS pricing is outdated at the Pricing page
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

- The tenant homepage file should be the same as the platform homepage file but with differences in tenant branding.
- Disable the default scrollbar and implement a custom green circle scrollbar.
- It should be have the exact same content, design, layout, and feel as the platform homepage, now with the dedicated register/login button and modal. Ensure that the brand colors are shown properly here for distinction.

### Apex Homepage [should not be seen from the find cooperatives selector]

- Disable the default scrollbar and implement a custom green circle scrollbar.
- Make minimal content here but still have details, now with the usual platform login button and modal.

### Tanaw and Pintig Dashboards

- Disable the default scrollbar and implement a custom green circle scrollbar.- Some modules are still indented in the sidebar
- Module contents are still in Tagalog
- There are still hardcoded slate colors, and some action buttons miscolored across all tenants [ensure that the color branding is consistent per tenant]
- There should be a warning/timeout modal popping out for 1 hour inactivity
- For the sidebar text, when the colors are too bright, the font color should be black. Vice versa. Some modules are indented and not aligned properly.
- Enable dark mode while retaining tenant branding
- Form inputs should be saved even when accidentally exited
- Updates and changes do not happen or show up in realtime, but rather in every window refresh
- Error toasts could be more explicit in what went wrong
- Numerical inputs should be automatically filled out

## ROLE-BASED ISSUES

### Superadmin

- Overview should not be responsible for tenant business. It should show KPIs and summary logs about the platform system itself, as well as earnings from tenant subscription payments. Remove the tenant-related KPIs and summary logs.
- In Community, remove the Community Operations section. Have two tabs for the announcements, and for the Discord-styled chat system with tenant operators only
- Approvals should be for tenant application only, providing details about the applicants.
- Improve Global Management by showing better details and action buttons for every card, allow for restoring decommissioned tenants by uploading a saved backup of all tenant information. Visually sort every tenant by their region, then widen the tenant homepage & dashboard builder modal while adding more details and paid plan options. Superadmin can have better toggles to every module each tenant will have according to their paid plan. There's an issue where in the header tagline, The "Iyong Tagumpay" is constant so maybe we could separate the taglines into two parts.
- At Homepage Content, superadmin can edit platform hero section video/content, toggle platform homepage sections, edit platform homepage content, FAQs and Tenant Testimonials. It should not approve other tenants' FAQ/Testimonial posting requests for their own homepages. When picking Tenant Testimonials for the Agapay Testimonies section, it should notify both the tenant operator and the targeted tenant member. Remove the top KPIs, it's not needed.
- Feedback has "entryies" when it should be "0 entries", "1 entry", etc. I tried sending a feedback from the platform homepage, but it doesn't show up (it did send an email notification to my superadmin email). It should only handle the general feedbacks from the platform homepage. Audit Logs should be a separate module [since the actual Audit Log module access leads to a blank page
- Reports is crashing the system right now. It should be platform-related. There needs to be time ranges and more search-and-filter.
- System Health should be a part of the Reports.
- Audit Logs should re-implement pagination
- Settings is indented in the sidebar. Remove the customization in the Settings since it should be at the Homepage Content [Rename it to Content & Branding]. There are no capabilities for personal information. Remove the SaaS subscription plan section since the superadmin doesn't need to change plans
- Add Subscriptions with two tabs on it. The Policies tab is where the superadmin can edit the subscription plans' prices and attached benefits. Subscribers tab is where the superadmin can monitor tenant lease payments.
- There's no email templates, no AI right now.

### Tenant Operator

- Operators should not have an interest tier of their own [Overview]
- Approvals and Queues have unresponsive buttons and input fields
- Payment Intake has this error: Invalid `prisma.savingsTransaction.create()` invocation: { data: { account_id: 5, tenant_id: 2, transaction_type: "deposit", amount: new Prisma.Decimal("2000"), reference: "CASH-484582", processed_by: 2, notes: "Over-the-counter cash", ~~~~~ ? transaction_id?: Int, ? fee_amount?: Decimal, ? net_amount?: Decimal | Null, ? status?: PaymentStatus, ? method_label?: String | Null, ? external_reference?: String | Null, ? reconciliation_reference?: String | Null, ? ledger_transaction_id?: String | Null, ? issue_status?: String, ? issue_reported_at?: DateTime | Null, ? issue_notes?: String | Null, ? processed_at?: DateTime } } Unknown argument `notes`. Available options are marked with ?.
- Capital Top-Ups from the Members should be processed automatic (handled by the system), and has this error: approveWalletTopUp failed: Error: Ledger Error: Missing account codes: CASH_EQUIVALENTS, MEMBER_SAVINGS
  at s (.next/server/chunks/3853.js:5:1072)
  at async (.next/server/chunks/3853.js:5:13396)
  at async (.next/server/app/[tenant]/auth/login/page.js:22:3123)
  at async Proxy.$withTenant (.next/server/app/[tenant]/auth/login/page.js:22:3079)
  at async c (.next/server/chunks/3853.js:5:12560)
- Loan Products should have a field for the policies per product.
- Capital and Investments is indented in the sidebar, contains redundant KPIs, has system-related previews when it should be business-related
- Member Management is indented in the sidebar, is missing some three-dot actions, and it's seeing the members outside the current tenant
- Treasury and Reconciliation says "An imbalance was detected. You must provide a reason to adjust the ledger and sign off." even when the values are 0 (there ARE currently two active loans in the DB) CSV export is not functional.
- At Homepage Content, Operator can edit tenant hero section video/content, toggle tenant homepage sections, edit tenant homepage content, FAQs and Tenant Testimonials. It should not mess with other tenants' homepage. There should be a notification section for superadmin testimony requests
- Community should allow the operator to chat as well, right now it's just a preview. Introduce Discord-styled chat system with tenant members only, with an exclusive contact to the superadmin
- Support and Analytics is indented in the sidebar, and is really unclear. Support & Feedback should obtain data from within the tenant's members only. Audit Logs should be a separate module.
- Audit Logs should re-implement pagination
- Settings is indented in the sidebar. Remove the customization in the Settings since it should be the Homepage Content [We might rename it]. There are no capabilities for personal information. For the SaaS subscription plan, there should be a billing process everytime an upgrade is requested.

### Tenant Member

- Loan Capability Meter should only have the min-max according to their remaining/existing balance
- Data Privacy and Consent, Terms and Conditions, and Tutorial of the cooperative should pop up as dialogs for newcomers, with the option to view them again in the settings
- Overview is indented in the sidebar
- Wallet is indented in the sidebar. In here, whenever we make a deposit, we should provide deposit method, reference numbers, and proof of deposits somehow
- Loan Application's form could be widened horizontally and better laid out, as well as having clearer terms, conditions, and policies.
- My Loans can also be Repayment, so we might as well remove the Repayment module. The card's elements could be laid out better with summary details and will be expanded by clicking on it, then the paid/overdue/defaulted loans should be presented via a grid format. Some action buttons cannot send data due to unusable input fields [possibly due to lack of data from the seed]
- Community module is still a mess in layout and functionalities. A user can click others' profile pfps so they'll be able to see member info and send them a direct message. Closely timed messages should be closer together - Community should allow the operator to chat as well, right now it's just a preview. Introduce Discord-styled chat system with fellow tenant members, with an exclusive contact to the operator
- Support System's Survey should be more structured, the superadmin will configure what exactly the criteria for the survey will be.
- Settings should also allow profile image editing, account/personal information [except for member name and member code], preferences, security details, TnC and other policies, account deactivation, download backup, and more
