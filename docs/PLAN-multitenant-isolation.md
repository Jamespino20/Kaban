# Project Plan: Multi-Tenant Isolation & Branding

## 1. Goal

Implement strict multi-tenant data isolation (allowing the same email across different tenants) and dynamic tenant-based customization as per the academic presentation rubric, while mitigating UX confusion.

## 2. Approach: Schema Isolation + Post-Login Routing (Option D)

1. **Schema Modifications:**
   - Update `User` model uniqueness from global `email` to compound `@@unique([email, tenant_id])`.
   - Add `brand_color` and `logo_url` to the `Tenant` model.
   - Remove global `@unique` on `username` and `member_code` if they should also be scoped per tenant.
2. **Authentication Flow (NextAuth):**
   - Rework the login flow. The user enters their email.
   - System identifies all linked tenants. If multiple exist, display a "Select your Branch" UI.
   - Once the branch is selected, prompt for the password specific to that tenant account.
3. **Admin Branding UI:**
   - Create a Settings page under `Agapay Tanaw` allowing Admins to set a custom hex color and upload a logo.
4. **UI Dynamic Styling:**
   - Inject the tenant's `brand_color` into the `root` layout of both the web and (future) mobile apps to prove backend-driven customization to the evaluators.

## 3. Tasks

- [ ] Schema: Modify uniqueness constraints and add branding fields in `schema.prisma`.
- [ ] Database: Run DB push and generate updated client.
- [ ] API: Update `register` action to respect the new compound unique constraint.
- [ ] Auth/UI: Rework the `login` flow to accept `tenantId` and handle the "Select Branch" intermediate step.
- [ ] Admin UI: Build the Tenant Branding configuration page in the Command Center.
- [ ] Frontend: Implement dynamic theme ingestion in the application layout.
