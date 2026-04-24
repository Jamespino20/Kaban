ALTER TABLE "loan_products"
ADD COLUMN "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25;

ALTER TABLE "loans"
ADD COLUMN "recovery_parent_loan_id" INTEGER,
ADD COLUMN "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "loans"
ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey"
FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TYPE "AccountType" ADD VALUE IF NOT EXISTS 'personal_wallet';
ALTER TYPE "GuaranteeStatus" ADD VALUE IF NOT EXISTS 'charged';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'default_recovery_debit';
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'default_recovery_credit';
