/*
  Warnings:

  - The values [branch_room] on the enum `ConversationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [admin,lender] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `branch_transfer_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TenantApplicationStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterEnum
BEGIN;
CREATE TYPE "ConversationType_new" AS ENUM ('direct', 'operator_room', 'group_chat');
ALTER TABLE "conversations" ALTER COLUMN "type" TYPE "ConversationType_new" USING ("type"::text::"ConversationType_new");
ALTER TYPE "ConversationType" RENAME TO "ConversationType_old";
ALTER TYPE "ConversationType_new" RENAME TO "ConversationType";
DROP TYPE "public"."ConversationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('superadmin', 'operator', 'member');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "savings_accounts" ALTER COLUMN "owner_role" TYPE "Role_new" USING ("owner_role"::text::"Role_new");
ALTER TABLE "audit_logs" ALTER COLUMN "actor_role" TYPE "Role_new" USING ("actor_role"::text::"Role_new");
ALTER TABLE "trust_rating_assignments" ALTER COLUMN "rating_source_role" TYPE "Role_new" USING ("rating_source_role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'member';
COMMIT;

-- DropForeignKey
ALTER TABLE "branch_transfer_requests" DROP CONSTRAINT "branch_transfer_requests_from_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "branch_transfer_requests" DROP CONSTRAINT "branch_transfer_requests_to_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "branch_transfer_requests" DROP CONSTRAINT "branch_transfer_requests_user_id_fkey";

-- DropTable
DROP TABLE "branch_transfer_requests";

-- CreateTable
CREATE TABLE "tenant_applications" (
    "application_id" SERIAL NOT NULL,
    "tenant_name" VARCHAR(100) NOT NULL,
    "tenant_slug" VARCHAR(50) NOT NULL,
    "applicant_name" VARCHAR(150),
    "applicant_email" VARCHAR(150) NOT NULL,
    "applicant_phone" VARCHAR(20),
    "estimated_members" INTEGER DEFAULT 100,
    "tenant_group_id" INTEGER,
    "brand_color" VARCHAR(20),
    "accent_color" VARCHAR(20),
    "logo_url" TEXT,
    "status" "TenantApplicationStatus" NOT NULL DEFAULT 'pending',
    "submitted_by" INTEGER NOT NULL,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "documents" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_applications_pkey" PRIMARY KEY ("application_id")
);

-- CreateTable
CREATE TABLE "platform_config" (
    "id" SERIAL NOT NULL,
    "scoring_weights" JSONB,
    "risk_thresholds" JSONB,
    "default_loan_config" JSONB,
    "platform_settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_config" (
    "id" SERIAL NOT NULL,
    "snapshot_prompts" JSONB,
    "risk_sensitivity" TEXT DEFAULT 'medium',
    "notification_settings" JSONB,
    "analysis_config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_settings" (
    "id" SERIAL NOT NULL,
    "password_policy" JSONB,
    "session_settings" JSONB,
    "two_factor_required" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_roles" TEXT[],
    "ip_whitelist" TEXT[],
    "allowed_domains" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_announcements" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL DEFAULT 'all',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "platform_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" TEXT NOT NULL,
    "subject" VARCHAR(255),
    "body" TEXT NOT NULL,
    "variables" TEXT[],
    "category" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoices" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "invoice_number" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "payment_method" TEXT,
    "reference" TEXT,
    "items" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_applications_tenant_slug_key" ON "tenant_applications"("tenant_slug");

-- CreateIndex
CREATE INDEX "platform_announcements_target_audience_is_published_idx" ON "platform_announcements"("target_audience", "is_published");

-- CreateIndex
CREATE INDEX "notification_templates_type_category_idx" ON "notification_templates"("type", "category");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoices_invoice_number_key" ON "billing_invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "billing_invoices_tenant_id_status_idx" ON "billing_invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "billing_invoices_due_date_idx" ON "billing_invoices"("due_date");

-- AddForeignKey
ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
