-- CreateEnum
CREATE TYPE "ImbalanceSourceModule" AS ENUM ('wallet', 'loan', 'repayment', 'ledger', 'reconciliation', 'topup', 'manual_adjustment', 'system');

-- CreateEnum
CREATE TYPE "ImbalanceInvestigationStatus" AS ENUM ('detected', 'assigned', 'investigating', 'awaiting_approval', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "ImbalanceResolutionAction" AS ENUM ('no_adjustment_needed', 'wallet_adjustment', 'ledger_adjustment', 'loan_adjustment', 'repayment_adjustment', 'write_off', 'escalated');

-- CreateTable
CREATE TABLE "imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" "ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" "ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
    "priority" VARCHAR(30) NOT NULL DEFAULT 'normal',
    "reconciliation_reference" VARCHAR(120),
    "related_ledger_transaction_id" TEXT,
    "related_wallet_transaction_id" INTEGER,
    "related_topup_request_id" INTEGER,
    "related_loan_id" INTEGER,
    "related_payment_id" INTEGER,
    "assigned_to" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigated_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "resolution_action" "ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "imbalance_investigations"("tenant_id", "status", "detected_at");

-- CreateIndex
CREATE INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "imbalance_investigations"("source_module", "source_entity_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_assigned_to_status_idx" ON "imbalance_investigations"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "imbalance_investigations_reconciliation_reference_idx" ON "imbalance_investigations"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "imbalance_investigations"("related_ledger_transaction_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "imbalance_investigations"("related_wallet_transaction_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_topup_request_id_idx" ON "imbalance_investigations"("related_topup_request_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_loan_id_idx" ON "imbalance_investigations"("related_loan_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_payment_id_idx" ON "imbalance_investigations"("related_payment_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_audit_log_id_idx" ON "imbalance_investigations"("audit_log_id");
