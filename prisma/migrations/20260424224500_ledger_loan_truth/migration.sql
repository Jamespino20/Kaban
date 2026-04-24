-- AlterTable
ALTER TABLE "business_ledger" ADD COLUMN     "loan_id" INTEGER,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;
