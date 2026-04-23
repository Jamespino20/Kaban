CREATE TABLE "homepage_faqs" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "question" VARCHAR(255) NOT NULL,
    "answer" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "homepage_faqs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "homepage_testimonials" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "role_label" VARCHAR(150) NOT NULL,
    "photo_url" VARCHAR(255),
    "content" TEXT NOT NULL,
    "season_tag" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "homepage_testimonials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "page_path" VARCHAR(255),
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "feedback_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "homepage_faqs_tenant_id_is_active_sort_order_idx"
ON "homepage_faqs"("tenant_id", "is_active", "sort_order");

CREATE INDEX "homepage_testimonials_tenant_id_is_active_sort_order_idx"
ON "homepage_testimonials"("tenant_id", "is_active", "sort_order");

CREATE INDEX "feedback_entries_tenant_id_status_created_at_idx"
ON "feedback_entries"("tenant_id", "status", "created_at");

CREATE INDEX "feedback_entries_user_id_created_at_idx"
ON "feedback_entries"("user_id", "created_at");

ALTER TABLE "homepage_faqs"
ADD CONSTRAINT "homepage_faqs_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "homepage_testimonials"
ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "feedback_entries"
ADD CONSTRAINT "feedback_entries_tenant_id_fkey"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "feedback_entries"
ADD CONSTRAINT "feedback_entries_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("user_id")
ON DELETE SET NULL ON UPDATE CASCADE;
