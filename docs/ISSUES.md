# ISSUES

## SYSTEMWIDE ISSUES

### Platform Homepage

##  Systemwide
- Lost the Fraunces and PlusJarkartaSans fonts

### Database
- Add username field, then randomize the member code. Do not attach the membercode to the username, then implement this naming convention: [username][slug][role_initials]

#### Homepage

- Widen the navbar because the shortcuts are overlapping one another. Remove Get Started with Agapay button
- Live Map should be zoomable because tenants near each other are clipping against each other, making for a very complicated navigation. The static building icon should show the tenant logos instead, the button to visit the tenant homepage changes according to its brand color, and the members and loans repaid must be accurate to what the tenant actually has
- SaaS pricing is outdated at the Pricing part of the Tenant Onboarding, and it doesn't lead us to an actual payment stage
- Remember that the platform testimonies should come from the testimonies from other tenants, rooted from their homepages, and picked by the superadmin (the system automatically notifies the target testimonees)

#### Contact

- Tenant Onboarding should add a payments tab after documents. The Tenant can now pick plans and input necessary billing details. This should notify the superadmin about the tenant application. There's an issue where the region is not a dropdown, so every tenant application leads to an unassigned region.
- General Feedbacks does not show up in the superadmin Feedback module. Tenant Onboarding requests should show up in superadmin's approval

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
- Remove dark mode while retaining tenant branding
- Form inputs should be saved even when accidentally exited
- Updates and changes do not happen or show up in realtime, but rather in every window refresh
- Error toasts could be more explicit in what went wrong
- Numerical inputs should be automatically filled out
- Three-dot actions are still nonfunctional

## ROLE-BASED ISSUES

### Superadmin

- Overview should not be responsible for tenant business. It should show KPIs and summary logs about the platform system itself, as well as earnings from tenant subscription payments. Remove the tenant-related KPIs and summary logs.
- In Community, announcements doesn't send notifications and announcements to users, and the Discord-styled chat system with tenant operators only is not implemented yet.
- Approvals should be for tenant application only, providing details about the applicants.
- Improve Global Management by showing userbase and system details for every card rather than business-related ones, allow for restoring decommissioned tenants by uploading a saved backup of all tenant information (decommissioning a tenant will have you download the backup data). The issue where widening the tenant homepage & dashboard builder modal while adding more details and paid plan options is partially implemented with poor layout. Superadmin can have better toggles to every module each tenant will have according to their paid plan. There's an issue where in the header tagline, The "Iyong Tagumpay" is constant so maybe we could separate the taglines into two parts.
- At Homepage Content, superadmin can edit platform hero section video/content, toggle platform homepage sections, edit platform homepage content, FAQs and Tenant Testimonials. It should not approve other tenants' FAQ/Testimonial posting requests for their own homepages. When picking Tenant Testimonials for the Agapay Testimonies section, it should notify both the tenant operator and the targeted tenant member. Remove the top KPIs, it's not needed.
- At Feedback, "1 entry", etc. I tried sending a feedback from the platform homepage, but it doesn't show up (it did send an email notification to my superadmin email). It should only handle the general feedbacks from the platform homepage.
- Subscriptions leads to a blank page. It should with two tabs on it. The Policies tab is where the superadmin can edit the subscription plans' prices and attached benefits. Subscribers tab is where the superadmin can monitor tenant lease payments.
- Reports is crashing the system right now. It should be platform-related. There needs to be time ranges and more search-and-filter.
- Migrate System Health and Fraud & Risk to Reports.
- Audit Logs should re-implement pagination
- Settings is indented in the sidebar. There are partial capabilities for personal information. Remove the SaaS subscription plan section since the superadmin doesn't need to change plans. The Members have far more personalization capabilities than the superadmin

### Tenant Operator

- Better categorize modules according to use hierarchy and frequency. Settings and Audit Logs should be at the very bottom
- Operators should not have an interest tier of their own [Overview]
- Payment Intake has this error: Invalid `prisma.businessLedger.create()` invocation: { data: { transaction_id: "TX-1778550208155-bm2r66q9h", account_id: 1, loan_id: undefined, debit: new Prisma.Decimal("10000"), credit: new Prisma.Decimal("0"), description: "POS Cash Deposit: CASH-189158", metadata: { source: "pos_deposit", transactionId: 1 }, created_by: 2, + account: { + create: LedgerAccountCreateWithoutLedger_entriesInput | LedgerAccountUncheckedCreateWithoutLedger_entriesInput, + connectOrCreate: LedgerAccountCreateOrConnectWithoutLedger_entriesInput, + connect: LedgerAccountWhereUniqueInput + } } } Argument `account` is missing.
- Capital Top-Ups from the Members should be processed automatic (handled by the system), and has this error: approveWalletTopUp failed: Error [PrismaClientValidationError]: 
Invalid `prisma.businessLedger.create()` invocation:

{
  data: {
    transaction_id: "TX-1778550301960-442fcbl5i",
    account_id: 1,
    loan_id: undefined,
    debit: new Prisma.Decimal("1000"),
    credit: new Prisma.Decimal("0"),
    description: "Wallet Top-up Verified: Req #1",
    metadata: {
      source: "topup",
      transactionId: 2
    },
    created_by: 2,
+   account: {
+     create: LedgerAccountCreateWithoutLedger_entriesInput | LedgerAccountUncheckedCreateWithoutLedger_entriesInput,
+     connectOrCreate: LedgerAccountCreateOrConnectWithoutLedger_entriesInput,
+     connect: LedgerAccountWhereUniqueInput
+   }
  }
}

Argument `account` is missing.
    at async n (.next/server/chunks/9541.js:5:1482)
    at async (.next/server/chunks/9541.js:5:15163)
    at async (.next/server/chunks/809.js:33:6741) {
  clientVersion: '7.8.0'
}
- Capital and Investments contains redundant KPIs, has system-related previews when it should be business-related
- Member Management has nonfunctional three-dot actions
- At Homepage Content, Operator can edit tenant hero section video/content, toggle tenant homepage sections, edit tenant homepage content, FAQs and Tenant Testimonials. It should not mess with other tenants' homepage. There should be a notification section for superadmin testimony requests [not fully implemented]
- Community should allow the operator to chat as well, right now it's just a preview. Introduce Discord-styled chat system with tenant members only, with an exclusive contact to the superadmin. [partially implemented + poor layout and UI/UX]
- In Settings there are no capabilities for personal information. For the SaaS subscription plan, there should be a billing process everytime an upgrade is requested.

### Tenant Member

- Overview is indented in the sidebar
- Wallet is indented in the sidebar.
- Loan Application's form could have clearer terms, conditions, and policies.
- My Loans can also be Repayment, so we might as well remove the Repayment module. The card's elements could be laid out better with summary details and will be expanded by clicking on it, then the active/paid/overdue/defaulted loans should be presented via a grid format. Sometimes when the loan amount is low, Installments are always 0/0, which softlocks the user from paying at all. 
- Processed repayments are not being updated to paid, which softlocks the user from applying for another loan
- Community module is still a mess in layout and functionalities. A user can click others' profile pfps so they'll be able to see member info and send them a direct message. Closely timed messages should be closer together - Community should allow the operator to chat as well, right now it's just a preview. Introduce Discord-styled chat system with fellow tenant members, with an exclusive contact to the operator
- Support System's Survey should be more structured, the superadmin should have a module to configure what exactly the criteria for the survey will be. The Survey can also be for the members' trust scores.
- Settings should also allow profile image editing, account/personal information [except for member name and member code], preferences, security details, TnC and other policies, account deactivation, download backup, and more
