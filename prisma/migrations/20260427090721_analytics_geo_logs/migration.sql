-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "region" VARCHAR(100);

-- CreateTable
CREATE TABLE "traffic_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "path" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "event_type" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "traffic_logs_tenant_id_created_at_idx" ON "traffic_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "interaction_logs"("tenant_id", "event_type", "created_at");

-- AddForeignKey
ALTER TABLE "traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
