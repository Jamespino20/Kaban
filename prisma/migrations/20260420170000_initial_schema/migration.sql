-- Initial AGAPAY schema baseline

CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'lender', 'member');
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'widowed', 'separated', 'annulled');
CREATE TYPE "InterestTier" AS ENUM ('T1_5_PERCENT', 'T2_4_5_PERCENT', 'T3_4_PERCENT', 'T4_3_5_PERCENT', 'T5_3_PERCENT');
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'suspended', 'inactive', 'deactivated');
CREATE TYPE "DocumentType" AS ENUM ('valid_id', 'proof_of_billing', 'residency_cert', 'brgy_cert', 'business_permit');
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE "LoanStatus" AS ENUM ('pending', 'approved', 'active', 'paid', 'defaulted', 'rejected');
CREATE TYPE "ScheduleStatus" AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE "GuaranteeStatus" AS ENUM ('pending', 'vouched', 'rejected', 'voided');
CREATE TYPE "LedgerAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE "AccountType" AS ENUM ('share_capital', 'regular_savings');
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'dividend', 'fee');

CREATE TABLE "tenant_groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "reg_code" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenant_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tenants" (
    "tenant_id" SERIAL NOT NULL,
    "tenant_group_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "brand_color" VARCHAR(20),
    "logo_url" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("tenant_id")
);

CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" "Role" NOT NULL DEFAULT 'member',
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" "InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" "MaritalStatus" DEFAULT 'single',
    "occupation" VARCHAR(150),
    "mothers_maiden_name" VARCHAR(150),
    "place_of_birth" VARCHAR(150),
    "tin" VARCHAR(20),
    "region" VARCHAR(100),
    "province" VARCHAR(100),
    "city" VARCHAR(100),
    "barangay" VARCHAR(100),
    "photo_url" VARCHAR(255),
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

CREATE TABLE "user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" VARCHAR(255) NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

CREATE TABLE "two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,
    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

CREATE TABLE "loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

CREATE TABLE "loans" (
    "loan_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "loan_reference" VARCHAR(50) NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "purpose" TEXT NOT NULL,
    "term_months" INTEGER NOT NULL,
    "interest_applied" DECIMAL(15,2) NOT NULL,
    "principal_receivable" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "interest_receivable" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "fees_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_payable" DECIMAL(15,2) NOT NULL,
    "balance_remaining" DECIMAL(15,2) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

CREATE TABLE "loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

CREATE TABLE "payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

CREATE TABLE "savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

CREATE TABLE "savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "reference" VARCHAR(100),
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_by" INTEGER,
    CONSTRAINT "savings_transactions_pkey" PRIMARY KEY ("transaction_id")
);

CREATE TABLE "audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" INTEGER,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

CREATE TABLE "verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_broadcast" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "branch_transfer_requests" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "from_tenant_id" INTEGER NOT NULL,
    "to_tenant_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "branch_transfer_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" "GuaranteeStatus" NOT NULL DEFAULT 'pending',
    "vouched_at" TIMESTAMP(3),
    "soft_freeze_at" TIMESTAMP(3),
    "hard_freeze_at" TIMESTAMP(3),
    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "ledger_hash" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    CONSTRAINT "business_ledger_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "social_vouches" (
    "id" SERIAL NOT NULL,
    "voucher_id" INTEGER NOT NULL,
    "vouchee_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_groups_reg_code_key" ON "tenant_groups"("reg_code");
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_member_code_key" ON "users"("member_code");
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");
CREATE UNIQUE INDEX "two_factor_auth_user_id_key" ON "two_factor_auth"("user_id");
CREATE UNIQUE INDEX "loans_loan_reference_key" ON "loans"("loan_reference");
CREATE UNIQUE INDEX "payments_payment_reference_key" ON "payments"("payment_reference");
CREATE UNIQUE INDEX "savings_accounts_user_id_account_type_key" ON "savings_accounts"("user_id", "account_type");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_email_token_key" ON "verification_tokens"("email", "token");
CREATE UNIQUE INDEX "two_factor_tokens_token_key" ON "two_factor_tokens"("token");
CREATE UNIQUE INDEX "two_factor_tokens_email_token_key" ON "two_factor_tokens"("email", "token");
CREATE INDEX "branch_transfer_requests_status_idx" ON "branch_transfer_requests"("status");
CREATE UNIQUE INDEX "ledger_accounts_code_key" ON "ledger_accounts"("code");
CREATE UNIQUE INDEX "interest_audit_loan_id_key" ON "interest_audit"("loan_id");

ALTER TABLE "tenants" ADD CONSTRAINT "tenants_tenant_group_id_fkey" FOREIGN KEY ("tenant_group_id") REFERENCES "tenant_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_transfer_requests" ADD CONSTRAINT "branch_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_transfer_requests" ADD CONSTRAINT "branch_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_transfer_requests" ADD CONSTRAINT "branch_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;
