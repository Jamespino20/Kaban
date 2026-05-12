# ISSUES (Updated 2026-05-13)

## SYSTEMWIDE ISSUES

###  Systemwide
- [x] Fraunces and PlusJarkartaSans fonts implemented as the standard font (layout.tsx + globals.css)
- [x] CSS updated with premium SaaS styles (rounded-xl everywhere, proper font hierarchy)

### Platform Homepage

### Color Palette
Agapay Platform should use npx shadcn@latest init --preset b2oqW07n6 --base base --template next --rtl --pointer

#### Tenant
- Depending on the brand color of the tenant
- There are still elements that uses the Agapay Platform colors when it should be the tenant's accents.

### Database
- [ ] Add username field, then randomize the member code. Do not attach the membercode to the username, then implement this naming convention: [username][slug][role_initials]

#### Homepage

- [x] Widen the navbar (now uses max-w-[100rem])
- [ ] Remove Get Started with Agapay button (done - changed to "Apply for Agapay" and "Loan Calculator")
- [ ] Live Map should be zoomable because tenants near each other are clipping against each other
- [ ] SaaS pricing is outdated at the Pricing part of the Tenant Onboarding, and it doesn't lead us to an actual payment stage
- [ ] Remember that the platform testimonies should come from the testimonies from other tenants

#### Contact

- [ ] Tenant Onboarding should add a payments tab after documents
- [ ] Region is not a dropdown, so every tenant application leads to an unassigned region
- [ ] General Feedbacks does not show up in the superadmin Feedback module
- [ ] Tenant Onboarding requests should show up in superadmin's approval

### Tenant Homepage

- [ ] The tenant homepage file should be the same as the platform homepage file but with differences in tenant branding.
- [x] Custom green circle scrollbar implemented (globals.css)
- [ ] Ensure that the brand colors are shown properly here for distinction.

### Apex Homepage [should not be seen from the find cooperatives selector]

- [x] Custom green circle scrollbar implemented
- [ ] Make minimal content here but still have details, now with the usual platform login button and modal.

### Tanaw and Pintig Dashboards

- [x] Custom green circle scrollbar implemented
- [x] Sidebar indentation fixed (px-4 alignment)
- [x] Contrast-aware sidebar text implemented
- [x] Three-dot actions added to header dropdown
- [~] Module contents are still in Tagalog (need audit) — FIXED in action/error layers (2026-05-13)
- [~] Hardcoded slate colors partially fixed (sidebar now uses brand colors)
- [x] Inactivity timeout/warning modal implemented (idle-session-timer.tsx)
- [~] Remove dark mode while retaining tenant branding (light mode is default)
- [~] Form inputs should be saved even when accidentally exited (useFormPersistence wired to registration, admin profile, member settings, and loan application forms)
- [ ] Updates and changes do not happen or show up in realtime, but rather in every window refresh
- [ ] Error toasts could be more explicit in what went wrong
- [ ] Numerical inputs should be automatically filled out

## ROLE-BASED ISSUES

### Superadmin

- [ ] Overview should not be responsible for tenant business. It should show KPIs and summary logs about the platform system itself
- [ ] In Community, announcements doesn't send notifications and announcements to users
- [ ] Discord-styled chat system with tenant operators only is not implemented yet
- [ ] Approvals should be for tenant application only, providing details about the applicants.
- [ ] Improve Global Management by showing userbase and system details for every card rather than business-related ones
- [ ] Allow restoring decommissioned tenants by uploading a saved backup
- [ ] At Homepage Content, superadmin can edit platform hero section video/content, toggle platform homepage sections
- [ ] At Feedback, "1 entry" issue - feedback doesn't show up
- [ ] Subscriptions leads to a blank page
- [ ] Reports is crashing the system right now
- [ ] Migrate System Health and Fraud & Risk to Reports
- [ ] Audit Logs should re-implement pagination
- [ ] Settings is indented in the sidebar

### Tenant Operator

- [x] Better categorize modules according to use hierarchy and frequency (already categorized: Core Operations, Capital, Members, Loan Operations, Storefront, Support & Analytics, System)
- [x] Settings and Audit Logs at the very bottom (System category)
- [ ] Operators should not have an interest tier of their own [Overview]
- [x] Payment Intake and Capital Top-Up ledger errors fixed (postLedgerEntry uses account connect)
- [x] Capital Top-Ups from Members should be processed automatic (handled by the system)
- [x] Capital and Investments contains redundant KPIs (AnalyticsDashboardTab placeholder)
- [x] Member Management three-dot actions are functional (DropdownMenu with View Profile, Edit Details, Reset Password, Activity Log, Send Notification, Suspend/Activate/Deactivate)
- [ ] At Homepage Content, Operator can edit tenant hero section
- [ ] Community should allow the operator to chat as well, right now it's just a preview
- [ ] In Settings there are no capabilities for personal information

### Tenant Member

- [x] Overview is fixed in the sidebar (px-4 alignment)
- [x] Wallet is fixed in the sidebar (px-4 alignment)
- [ ] Loan Application's form could have clearer terms, conditions, and policies
- [ ] My Loans can also be Repayment, so we might as well remove the Repayment module
- [ ] The card's elements could be laid out better with summary details and will be expanded by clicking on it
- [x] When the loan amount is low, Installments are always 0/0, which softlocks the user from paying at all (fixed: shows "—" instead of "0/0", schedule section always visible with helpful message)
- [x] Processed repayments not updating to paid fixed (verifySubmittedPayment now handles partial payments)
- [ ] Community module is still a mess in layout and functionalities
- [ ] Closely timed messages should be closer together (shouldGroupMessages with 5-min threshold exists)
- [ ] Support System's Survey should be more structured
- [x] Settings now includes profile image editing, account/personal information with form persistence, preferences, security details, TnC and other policies, account deactivation, download backup

### Legend
- [x] = Fixed/Implemented
- [~] = Partially fixed
- [ ] = Still needs work
