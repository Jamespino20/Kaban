# AGAPAY Next-Phase Plan: Business Flow, Community, and Compact UX

## Summary
Move Agapay back onto the product-core track by finishing the cooperative microfinance flow around `loan lifecycle`, `guarantorship`, `mentorship`, `community messaging`, and `use-case testing`, while also tightening the dashboard UX for less technical users.

This phase assumes:
- `Direct + branch rooms` messaging for v1
- `Hybrid` mentorship: members can discover people, but formal mentorship/guarantor-fit relationships require admin endorsement
- `Moderately compact` dashboard/forms layout, not ultra-dense

The sequence stays aligned to your roadmap:
1. business-flow cleanup
2. use cases / edge testing
3. design / typography system
4. AI-assisted operations
5. PH-market tuning refinements

## Implementation Changes

### 1. Finish business-flow cleanup around the real microfinance lifecycle
- Normalize the loan lifecycle so every stage is explicit and consistent:
  - application
  - guarantor selection
  - guarantor confirmation / endorsement
  - admin review
  - approval / rejection
  - release
  - repayment
  - overdue / default
  - compassion / restructuring
  - recovery / guarantor liability
- Keep the existing shared policy layer as the source of truth for:
  - rate bands
  - tier caps
  - term limits
  - guarantor count
  - penalty schedule
  - compassion constraints
- Fix the remaining correctness gaps:
  - SOA balance should use ledger truth, not double-subtract payments
  - Tanaw trust metrics should represent the full 5-tier model, not a flattened 3-bucket summary
  - repayment state should distinguish:
    - current
    - due soon
    - overdue
    - under review
    - settled
- Keep repayment frequency support aligned to the schema:
  - `weekly`
  - `bi_weekly`
  - `monthly`
- Use the existing `RepaymentFrequency` model instead of leaving the system effectively monthly-only in behavior

### 2. Add mentorship and community operations as first-class cooperative features
- Build a tenant-scoped messaging system using the existing `Message` concept, but extend it to support:
  - direct conversations
  - branch rooms
- Direct messaging should support:
  - member ↔ member
  - member ↔ lender
  - member ↔ admin
  - admin ↔ lender
- Branch rooms should be tenant-scoped and intended for:
  - onboarding help
  - repayment reminders
  - mentorship discussions
  - community announcements
- Keep v1 messaging compact and operational:
  - conversation list
  - thread view
  - unread state
  - simple composer
  - no reactions/files/voice for this pass
- Formalize `mentorship` as a lightweight cooperative relation, not just free chat:
  - member can discover possible mentors / guarantor-fit users
  - admin or lender can endorse / confirm a mentorship pairing
  - endorsed mentors become visible in the member’s dashboard context
  - mentorship is advisory and community-supportive, not a financial override role
- Use the hybrid model for guarantorship/mentorship discovery:
  - members can find and contact other Ka-Agapay users
  - admin endorsement is required before a relationship is shown as formal/verified in the system
- Integrate this into existing flows:
  - guarantee request UX should allow “message first” before selecting a guarantor
  - members should see recommended “Ka-Agapay” contacts for support
  - Tanaw should expose mentorship/community activity summaries to staff

### 3. Compact the authenticated UX for low-system-literacy users
- Refactor `Tanaw` and `Pintig` screens toward a more compact, guided layout:
  - less oversized cards
  - fewer giant empty states
  - tighter tables and forms
  - less vertical spread between related controls
- Use layout rules consistently:
  - group related actions into one container
  - move secondary explanations into smaller helper text
  - prefer shorter headers and clearer labels
  - keep one primary CTA per surface
- Compact the highest-friction areas first:
  - `Loan Application`
  - `Repayment`
  - `Verification Queue`
  - `Homepage Content`
  - `Feedback Inbox`
  - `Audit Logs`
  - `Compassion Actions`
- Make the dashboards feel easier for non-technical users:
  - simpler status labels
  - stronger visual grouping
  - less decorative empty spacing
  - more obvious next actions
- Preserve accessibility and readability:
  - moderate compaction only
  - maintain large-enough tap targets and legible type

### 4. Use-case and edge testing pass
- Add focused test coverage for the flows that matter most to cooperative lending:
  - member applies within tier cap
  - member blocked when exceeding cap
  - guarantor count validation
  - guarantor must be same-tenant active member
  - repayment submission below next installment is rejected unless full settlement
  - overdue schedules are updated before verification
  - compassion request limit is enforced per loan cycle
  - superadmin global vs branch-scoped behavior
  - SOA shows correct outstanding balance
  - trust-tier aggregation reflects all 5 tiers
- Add scenario tests for messaging/community:
  - direct chat within same tenant
  - branch room visibility by tenant
  - mentorship endorsement flow
  - member cannot see cross-tenant conversations
- Prefer targeted business-rule tests over broad snapshot/UI-only tests for this phase

### 5. Prepare the design system and AI layer after the flow stabilizes
- After the business flow and compact UX are stable, define the shared design system pass:
  - spacing scale
  - card density
  - typography hierarchy
  - status color mapping
  - table and filter patterns
- After that, add AI-assisted operations on top of stable workflows:
  - quick report summaries
  - repayment risk explanations
  - feedback clustering
  - mentorship/help suggestions
  - support/copilot prompts for admins and lenders
- Do not start AI feature implementation before the messaging/business-flow contracts are stable

## Public / API / Type Changes
- Messaging will need a real conversation model instead of the current flat message record:
  - direct thread identity
  - room/thread type
  - tenant scoping
  - participants
  - unread/read state
- Mentorship will need a lightweight endorsed relationship model or equivalent explicit status layer.
- Loan and repayment flows should use `repayment_frequency` consistently end-to-end.
- Trust aggregation output should expose all 5 tiers for staff analytics, not only `starter/growth/elite`.
- SOA/report calculations should read from the corrected outstanding-balance logic.

## Test Plan
- Security / isolation
  - direct messages are tenant-scoped only
  - branch rooms are tenant-scoped only
  - endorsed mentorship cannot cross tenants
  - superadmin global and branch views remain correct after messaging/community additions
- Loan lifecycle
  - full flow from application to release to repayment to overdue/default
  - guarantor enforcement and liability triggers
  - compassion request approval / rejection behavior
- Reporting
  - SOA amount matches loan ledger and repayment state
  - Tanaw trust distribution shows all 5 tiers correctly
- UX
  - compact screens remain readable on common laptop widths and browser zoom
  - important actions remain reachable without excessive scrolling
  - users can discover mentorship/community actions without confusion
- Regression
  - existing dynamic homepage content workflow still works
  - feedback inbox still works
  - sidebar/global-branch behavior remains stable

## Assumptions and defaults
- `Direct + branch rooms` is the chosen v1 messaging scope.
- `Hybrid` is the chosen mentorship model.
- `Moderately compact` is the chosen layout density target.
- Messaging is for relationship-building, mentorship, guarantorship, and support first, not a full social network.
- AI-assisted operations stay out of scope for implementation until business flow and compact UX are stabilized.
- PH-market tuning should continue to respect the markdown-defined Agapay rate/tier bands rather than replacing them with external pricing logic.
