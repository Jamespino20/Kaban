-- Add a first-class tenant entitlement layer so Agapay access can be
-- activated by the superadmin after a one-time lifetime availing.

CREATE TYPE "TenantEntitlementStatus" AS ENUM ('prospect', 'active', 'suspended');

ALTER TABLE "tenants"
ADD COLUMN "entitlement_status" "TenantEntitlementStatus" NOT NULL DEFAULT 'prospect',
ADD COLUMN "lifetime_availed_at" TIMESTAMP(3),
ADD COLUMN "entitlement_reference" VARCHAR(120),
ADD COLUMN "entitlement_notes" TEXT,
ADD COLUMN "entitled_by_user_id" INTEGER;

CREATE INDEX "tenants_entitlement_status_is_active_idx"
ON "tenants"("entitlement_status", "is_active");
