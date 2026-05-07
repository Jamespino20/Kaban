-- CreateEnum
CREATE TYPE "WalletRequestType" AS ENUM ('deposit', 'withdrawal');

-- AlterTable
ALTER TABLE "savings_accounts"
ADD COLUMN "owner_role" "Role",
ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lock_reason" VARCHAR(255),
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "savings_transactions"
ADD COLUMN "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN "net_amount" DECIMAL(15,2),
ADD COLUMN "status" "PaymentStatus" NOT NULL DEFAULT 'verified',
ADD COLUMN "method_label" VARCHAR(80),
ADD COLUMN "external_reference" VARCHAR(120),
ADD COLUMN "reconciliation_reference" VARCHAR(120),
ADD COLUMN "ledger_transaction_id" TEXT,
ADD COLUMN "issue_status" VARCHAR(50) NOT NULL DEFAULT 'none',
ADD COLUMN "issue_reported_at" TIMESTAMP(3),
ADD COLUMN "issue_notes" TEXT;

-- AlterTable
ALTER TABLE "business_ledger"
ADD COLUMN "source_module" VARCHAR(80),
ADD COLUMN "source_reference" VARCHAR(120),
ADD COLUMN "reconciliation_reference" VARCHAR(120),
ADD COLUMN "reconciled_at" TIMESTAMP(3),
ADD COLUMN "is_reversal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reversed_entry_id" INTEGER;

-- AlterTable
ALTER TABLE "ledger_accounts"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "topup_requests"
ADD COLUMN "request_type" "WalletRequestType" NOT NULL DEFAULT 'deposit',
ADD COLUMN "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN "net_amount" DECIMAL(15,2),
ADD COLUMN "method_label" VARCHAR(80),
ADD COLUMN "external_reference" VARCHAR(120),
ADD COLUMN "issue_status" VARCHAR(50) NOT NULL DEFAULT 'none',
ADD COLUMN "issue_notes" TEXT,
ADD COLUMN "admin_notes" TEXT,
ADD COLUMN "reconciliation_reference" VARCHAR(120),
ADD COLUMN "ledger_transaction_id" TEXT;

-- CreateIndex
CREATE INDEX "savings_accounts_tenant_id_account_type_idx" ON "savings_accounts"("tenant_id", "account_type");

-- CreateIndex
CREATE INDEX "savings_accounts_tenant_id_owner_role_idx" ON "savings_accounts"("tenant_id", "owner_role");

-- CreateIndex
CREATE INDEX "savings_transactions_account_id_status_processed_at_idx" ON "savings_transactions"("account_id", "status", "processed_at");

-- CreateIndex
CREATE INDEX "savings_transactions_reconciliation_reference_idx" ON "savings_transactions"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "savings_transactions_ledger_transaction_id_idx" ON "savings_transactions"("ledger_transaction_id");

-- CreateIndex
CREATE INDEX "savings_transactions_issue_status_idx" ON "savings_transactions"("issue_status");

-- CreateIndex
CREATE INDEX "business_ledger_transaction_id_idx" ON "business_ledger"("transaction_id");

-- CreateIndex
CREATE INDEX "business_ledger_source_module_source_reference_idx" ON "business_ledger"("source_module", "source_reference");

-- CreateIndex
CREATE INDEX "business_ledger_reconciliation_reference_idx" ON "business_ledger"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "business_ledger_reversed_entry_id_idx" ON "business_ledger"("reversed_entry_id");

-- CreateIndex
CREATE INDEX "ledger_accounts_tenant_id_type_idx" ON "ledger_accounts"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "topup_requests_tenant_id_request_type_status_idx" ON "topup_requests"("tenant_id", "request_type", "status");

-- CreateIndex
CREATE INDEX "topup_requests_user_id_request_type_created_at_idx" ON "topup_requests"("user_id", "request_type", "created_at");

-- CreateIndex
CREATE INDEX "topup_requests_reconciliation_reference_idx" ON "topup_requests"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "topup_requests_ledger_transaction_id_idx" ON "topup_requests"("ledger_transaction_id");

-- CreateIndex
CREATE INDEX "topup_requests_issue_status_idx" ON "topup_requests"("issue_status");
