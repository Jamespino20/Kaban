\# ISSUES (Updated 2026-05-13)



\## Legend



\* `\[x]` = Fixed / Implemented

\* `\[\~]` = Partially Fixed

\* `\[ ]` = Existing Issue



\---



\# SYSTEMWIDE ISSUES



\## Systemwide



\* \[ ] Fraunces and PlusJakartaSans are not yet implemented systemwide as the standard fonts (`layout.tsx` + `globals.css`)

\* \[ ] CSS still lacks consistent premium SaaS styling (`rounded-xl`, proper font hierarchy, spacing consistency)

\* \[ ] Tenant-specific font switching (Inter/Outfit, Playfair/Mono, etc.) is not fully supported despite existing imports



\---



\## Platform Homepage



\### Color Palette



\* \[ ] Agapay Platform Dashboard and Superadmin still inherit Malolos logo and palette values instead of overriding with `emerald-600` and `emerald-700`



\### Tenant Branding



\* \[ ] Multiple tenant-view elements still use Agapay Platform accent colors instead of tenant-specific branding (buttons, enhanced login form, cards, etc.)



\---



\## Database



\* \[x] Username generation still incorrectly attaches `membercode`; naming convention `\[username]\[slug]\[role\_initials]` is not fully implemented

\* \[ ] 



\---



\### Homepage



\* \[x] Navbar width remains constrained despite widening adjustments (`max-w-\[100rem]`)

\* \[x] “Get Started” flow still partially routes through the Agapay Platform Contact Page instead of the Tenant Onboarding flow

\* \[ ] Live Map is not properly zoomable, causing nearby tenant pins to clip and overlap due to inaccurate proximity mapping

\* \[\~] SaaS pricing values are inconsistent between the Pricing page and Tenant Onboarding flow, and payment processing is still missing

\* \[ ] Platform testimonies are not dynamically sourced from tenant testimonies

\* \[ ] Lacks an editable vision and mission section from the homepage content



\---



\## Contact / Tenant Onboarding



\* \[ ] Tenant Onboarding payments do not show up in the superadmin, turning it into ghost money

\* \[x] Region input is not implemented as a dropdown, causing tenant applications to become unassigned

\* \[ ] General Feedback submissions do not appear in the Superadmin Feedback module

\* \[ ] Tenant onboarding requests are not appearing in Superadmin approvals

\* \[ ] There should be a down payment option for one month, price and downpayment changes depending on their chosen plan



\---



\## Tenant Homepage



\* \[ ] Tenant homepage structure has diverged from the platform homepage instead of reusing the same file with branding overrides

\* \[x] Custom green circle scrollbar is not yet implemented (`globals.css`)

\* \[ ] Tenant brand colors are inconsistently applied across the homepage

\* \[ ] Tenant homepage still contains "Iyong Agapay, Ating Tagumpay" and other Agapay-related branding and content.

\* \[ ] Navbar logo does not change depending on the cooperative's logo. It also does not have a fallback, which will be the initials of the cooperative.

\* \[ ] Lacking in media like the platform homepage \[hero section video, pictures, testimony section, FAQs]



\---



\## Tanaw \& Pintig Dashboards



\* \[x] Custom green circle scrollbar is still missing

\* \[ ] Sidebar indentation/alignment issues persist (`px-4`)

\* \[ ] Sidebar text is not consistently contrast-aware against tenant branding

\* \[ ] Three-dot action menus are missing in modules that should support them

\* \[ ] Several module contents remain untranslated from Tagalog

\* \[ ] Hardcoded slate colors still appear in many elements; should use dynamic tenant branding

\* \[ ] Inactivity timeout/warning modal (`idle-session-timer.tsx`) is not implemented

\* \[\~] Form persistence is incomplete across registration, admin profile, member settngs, and loan application forms

\* \[ ] Real-time updates are missing; most data changes only appear after manual refresh

\* \[ ] Error toasts remain too vague and do not clearly explain failures and a suggested course of action

\* \[ ] Numerical inputs are not automatically formatted or auto-filled where expected

\* \[ ] Superadmin can log in regardless of which tenant they are in \[should only be in Malolos]

\* \[ ] When logging in, the page leads to only /agapay-tanaw rather than agapay-saas.vercel.app\[tenant\_slug]/agapay-pintig or tanaw. This is fixed whenever I reload

\* \[ ] Community Tab should function and look/feel a whole lot like Discord.

\* \[ ] You can press someone's profile and a modal pops up showing the details of the user



\---



\# ROLE-BASED ISSUES



\## Superadmin



\* \[ ] Overview module still contains tenant business logic instead of platform-wide KPIs and system summaries. It should contain insights on tenants' subscription leases, the money earned, charts, and more.

\* \[ ] Community announcements do not send notifications to users

\* \[ ] Discord-style operator chat system is still unimplemented and improperly laid out. There's no way to actually find a tenant operator and the message doesn't even send

\* \[ ] Approvals module lacks proper tenant application detail handling, and does not receive the 

\* \[ ] Global Management Website Builder has only 6 modules when it should be a complete set of modules. Auto-checking of modules depending on the plan. I'm thinking that the website builder contains a dropdown selector of tenant applicants for automatic configuration of modules depending on their processed subscription plan.

\* \[ ] Decommissioned tenants cannot yet be restored through backup uploads

\* \[ ] Homepage Content module cannot fully manage platform hero content, section toggles, and subpage contents. Missing vision and mission section. It should be change the platform navbar icon as well. It should be able to change the main tagline and so on.

\* \[ ] Feedback module still shows the “1 entry” issue while feedback data fails to appear

\* \[ ] Subscriptions module is missing some details.

\* \[ ] Reports module is no longer crashing but reports are non-functional, no real report data, and so on.

\* \[ ] Audit Logs pagination was removed and not reimplemented

\* \[ ] Settings module is not laid out as same as the members' Settings module. And remove the SaaS subscription plan section in the settings, the superadmin does not need any purchase more.



\---



\## Tenant Operator



\* \[ ] Module categorization hierarchy still needs refinement despite partial grouping improvements

\* \[ ] Settings and Audit Logs are not consistently positioned at the bottom under the System category

\* \[ ] Operators incorrectly have their own interest tier in Overview

\* \[ ] Payment Intake and Capital Top-Up ledger issues persist (`postLedgerEntry` account connection issues)

\* \[ ] Capital Top-Ups from Members are not yet automatically processed by the system

\* \[ ] Capital and Investments still contain redundant KPI placeholders (`AnalyticsDashboardTab`)

\* \[ ] Member Management three-dot actions are still non-functional or incomplete

\* \[ ] Homepage Content module cannot fully edit tenant hero sections

\* \[ ] Community chat for operators is still preview-only and non-functional

\* \[ ] Settings lacks personal information management capabilities

\* \[ ] Some modules still are indented



\---



\## Tenant Member



\* \[ ] Overview sidebar alignment issue persists (`px-4`)

\* \[ ] Wallet sidebar alignment issue persists (`px-4`)

\* \[ ] Loan Application forms still lack sufficiently clear terms, conditions, and policies

\* \[ ] “Repayment” functionality remains redundant with “My Loans”

\* \[ ] Loan cards need improved layout hierarchy and expandable summary details

\* \[ ] Community module still has major layout and functionality inconsistencies. It is also indented in the sidebar

\* \[ ] Closely timed chat messages are not visually grouped tightly enough despite existing grouping logic

\* \[ ] Support System survey functionality is still too rigid and lacks dynamic survey management

\* \[ ] Settings module enhancements (profile image editing, personal information, persistence, preferences, security, policies, deactivation, backup download) remain incomplete



\---



\## Previously Addressed / Partially Fixed



\* \[x] Low-amount loan installment issue no longer displays `0/0`; now shows `—` with visible schedule messaging

\* \[x] Processed repayments now properly update paid status with partial payment handling

\* \[\~] Hardcoded slate color usage partially fixed through sidebar brand color support

\* \[\~] Username convention partially fixed

\* \[\~] Navbar width partially widened

\* \[\~] Get Started rerouting partially implemented







prisma:error 

Invalid `prisma.loan.aggregate()` invocation:



{

&#x20; select: {

&#x20;   \_sum: {

&#x20;     select: {

&#x20;       amount\_approved: true,

&#x20;       \~\~\~\~\~\~\~\~\~\~\~\~\~\~\~

?       loan\_id?: true,

?       tenant\_id?: true,

?       user\_id?: true,

?       product\_id?: true,

?       principal\_amount?: true,

?       term\_months?: true,

?       interest\_applied?: true,

?       principal\_receivable?: true,

?       interest\_receivable?: true,

?       fees\_applied?: true,

?       total\_payable?: true,

?       balance\_remaining?: true,

?       approved\_by?: true,

?       recovery\_parent\_loan\_id?: true

&#x20;     }

&#x20;   },

&#x20;   \_count: {

&#x20;     select: {

&#x20;       \_all: true

&#x20;     }

&#x20;   }

&#x20; },

&#x20; where: {

&#x20;   tenant\_id: 30001

&#x20; }

}



Unknown field `amount\_approved` for select statement on model `LoanSumAggregateOutputType`. Available options are marked with ?.



