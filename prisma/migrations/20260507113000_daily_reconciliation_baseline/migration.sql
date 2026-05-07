-- CreateEnum
CREATE TYPE "DailyReconciliationStatus" AS ENUM ('draft', 'blocked', 'pending_approval', 'signed_off', 'adjusted', 'rejected', 'reopened');

-- CreateTable
CREATE TABLE "daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" "DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
    "total_disbursed" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "disbursed_count" INTEGER NOT NULL DEFAULT 0,
    "total_collected" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "collected_count" INTEGER NOT NULL DEFAULT 0,
    "total_ledger_debits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_ledger_credits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_ledger_balanced" BOOLEAN NOT NULL DEFAULT false,
    "total_branch_savings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_treasury_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "imbalance_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "has_discrepancy" BOOLEAN NOT NULL DEFAULT false,
    "signoff_blocked" BOOLEAN NOT NULL DEFAULT false,
    "block_reason" TEXT,
    "reconciliation_reference" VARCHAR(120) NOT NULL,
    "imbalance_investigation_id" INTEGER,
    "resolution_action" "ImbalanceResolutionAction",
    "resolution_reference" VARCHAR(120),
    "adjustment_ledger_transaction_id" TEXT,
    "audit_log_id" INTEGER,
    "prepared_by" INTEGER,
    "prepared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signed_off_by" INTEGER,
    "signed_off_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "approval_notes" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_reconciliations_reconciliation_reference_key" ON "daily_reconciliations"("reconciliation_reference");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reconciliations_tenant_id_business_date_key" ON "daily_reconciliations"("tenant_id", "business_date");

-- CreateIndex
CREATE INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "daily_reconciliations"("tenant_id", "status", "business_date");

-- CreateIndex
CREATE INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "daily_reconciliations"("imbalance_investigation_id");

-- CreateIndex
CREATE INDEX "daily_reconciliations_resolution_reference_idx" ON "daily_reconciliations"("resolution_reference");

-- CreateIndex
CREATE INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "daily_reconciliations"("adjustment_ledger_transaction_id");

-- CreateIndex
CREATE INDEX "daily_reconciliations_audit_log_id_idx" ON "daily_reconciliations"("audit_log_id");

-- CreateIndex
CREATE INDEX "daily_reconciliations_signed_off_by_idx" ON "daily_reconciliations"("signed_off_by");

-- CreateIndex
CREATE INDEX "daily_reconciliations_approved_by_idx" ON "daily_reconciliations"("approved_by");
