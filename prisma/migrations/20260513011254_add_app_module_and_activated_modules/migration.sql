-- CreateEnum
CREATE TYPE "AppModule" AS ENUM ('wallet', 'loans', 'community', 'branding', 'reports', 'audit', 'analytics', 'system_config', 'compassion');

-- AlterTable
ALTER TABLE "tenant_subscriptions" ADD COLUMN     "activated_modules" "AppModule"[] DEFAULT ARRAY[]::"AppModule"[];
