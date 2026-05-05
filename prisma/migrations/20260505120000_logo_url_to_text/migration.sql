-- AlterTable: Formalise logo_url to TEXT (previously applied via raw script)
ALTER TABLE "tenants" ALTER COLUMN "logo_url" TYPE TEXT;
