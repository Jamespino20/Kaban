-- AlterTable
ALTER TABLE "loan_guarantees"
ADD COLUMN "liability_percentage" DECIMAL(5,2) NOT NULL DEFAULT 25.00,
ADD COLUMN "liability_amount" DECIMAL(15,2),
ADD COLUMN "charged_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN "charge_reason" VARCHAR(255),
ADD COLUMN "default_triggered_at" TIMESTAMP(3),
ADD COLUMN "charged_at" TIMESTAMP(3),
ADD COLUMN "revoked_at" TIMESTAMP(3),
ADD COLUMN "reassigned_to_guarantee_id" INTEGER,
ADD COLUMN "notification_id" TEXT,
ADD COLUMN "audit_log_id" INTEGER,
ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "loan_guarantees_loan_id_status_idx" ON "loan_guarantees"("loan_id", "status");

-- CreateIndex
CREATE INDEX "loan_guarantees_guarantor_id_status_idx" ON "loan_guarantees"("guarantor_id", "status");

-- CreateIndex
CREATE INDEX "loan_guarantees_notification_id_idx" ON "loan_guarantees"("notification_id");

-- CreateIndex
CREATE INDEX "loan_guarantees_audit_log_id_idx" ON "loan_guarantees"("audit_log_id");

-- CreateIndex
CREATE INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "loan_guarantees"("reassigned_to_guarantee_id");
