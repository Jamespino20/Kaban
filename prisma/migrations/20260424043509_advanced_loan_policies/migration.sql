-- CreateEnum
CREATE TYPE "RepaymentFrequency" AS ENUM ('weekly', 'bi_weekly', 'monthly');

-- CreateEnum
CREATE TYPE "CompassionActionType" AS ENUM ('grace_period', 'term_extension', 'penalty_freeze');

-- CreateEnum
CREATE TYPE "CompassionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "loan_products" ADD COLUMN     "allowed_frequencies" "RepaymentFrequency"[] DEFAULT ARRAY['monthly']::"RepaymentFrequency"[];

-- AlterTable
ALTER TABLE "loan_schedules" ADD COLUMN     "days_late" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "loans" ADD COLUMN     "repayment_frequency" "RepaymentFrequency" NOT NULL DEFAULT 'monthly';

-- CreateTable
CREATE TABLE "compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "action_type" "CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "CompassionStatus" NOT NULL DEFAULT 'pending',
    "requested_by" INTEGER NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_order_id" RENAME TO "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx";

-- RenameIndex
ALTER INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_sort_" RENAME TO "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx";
