ALTER TABLE "homepage_faqs"
ADD COLUMN "season_tag" VARCHAR(100),
ADD COLUMN "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'published',
ADD COLUMN "review_notes" TEXT,
ADD COLUMN "submitted_by_user_id" INTEGER,
ADD COLUMN "reviewed_by_user_id" INTEGER;

ALTER TABLE "homepage_testimonials"
ADD COLUMN "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'published',
ADD COLUMN "review_notes" TEXT,
ADD COLUMN "submitted_by_user_id" INTEGER,
ADD COLUMN "reviewed_by_user_id" INTEGER;

DROP INDEX IF EXISTS "homepage_faqs_tenant_id_is_active_sort_order_idx";
DROP INDEX IF EXISTS "homepage_testimonials_tenant_id_is_active_sort_order_idx";

CREATE INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_order_idx"
ON "homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

CREATE INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_sort_order_idx"
ON "homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");
