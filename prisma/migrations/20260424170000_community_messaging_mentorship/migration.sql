-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('direct', 'branch_room');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('pending_endorsement', 'endorsed', 'rejected');

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" "ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "messages" ADD COLUMN "conversation_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_tenant_id_type_slug_key" ON "conversations"("tenant_id", "type", "slug");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_type_updated_at_idx" ON "conversations"("tenant_id", "type", "updated_at");

-- Backfill legacy branch-room conversations for existing messages, if any.
INSERT INTO "conversations" ("id", "tenant_id", "type", "title", "slug", "created_at", "updated_at")
SELECT
    md5(random()::text || clock_timestamp()::text || tenant_id::text),
    tenant_id,
    'branch_room'::"ConversationType",
    'Legacy Community Feed',
    'legacy-feed',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT tenant_id
    FROM "messages"
    WHERE "conversation_id" IS NULL
) message_tenants
ON CONFLICT ("tenant_id", "type", "slug") DO NOTHING;

UPDATE "messages" m
SET "conversation_id" = c."id"
FROM "conversations" c
WHERE
    m."tenant_id" = c."tenant_id"
    AND c."type" = 'branch_room'
    AND c."slug" = 'legacy-feed'
    AND m."conversation_id" IS NULL;

ALTER TABLE "messages" ALTER COLUMN "conversation_id" SET NOT NULL;


-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_last_read_at_idx" ON "conversation_participants"("user_id", "last_read_at");

-- CreateIndex
CREATE UNIQUE INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- CreateIndex
CREATE INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "mentorship_connections"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
