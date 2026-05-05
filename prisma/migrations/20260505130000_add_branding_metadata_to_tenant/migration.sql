-- AlterTable Tenant (Repair missing branding & metadata)
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "accent_color" VARCHAR(20);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "font_pairing" VARCHAR(50) DEFAULT 'inter_outfit';
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "availed_type" VARCHAR(50);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "region" VARCHAR(100);
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- AlterTable User (Repair missing consent tracks)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "consent_accepted_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "consent_version" VARCHAR(20);
