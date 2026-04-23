ALTER TABLE "verification_tokens"
ADD COLUMN "tenant_id" INTEGER;

ALTER TABLE "two_factor_tokens"
ADD COLUMN "tenant_id" INTEGER;

UPDATE "verification_tokens"
SET
  "tenant_id" = NULLIF(split_part("email", '::', 1), 'global')::INTEGER,
  "email" = split_part("email", '::', 2)
WHERE "email" LIKE '%::%';

UPDATE "two_factor_tokens"
SET
  "tenant_id" = NULLIF(split_part("email", '::', 1), 'global')::INTEGER,
  "email" = split_part("email", '::', 2)
WHERE "email" LIKE '%::%';

UPDATE "verification_tokens" vt
SET "expires" = NOW()
WHERE vt."tenant_id" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "users" u
    WHERE lower(u."email") = lower(vt."email")
      AND u."tenant_id" IS NOT NULL
  );

UPDATE "two_factor_tokens" tft
SET "expires" = NOW()
WHERE tft."tenant_id" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "users" u
    WHERE lower(u."email") = lower(tft."email")
      AND u."tenant_id" IS NOT NULL
  );

DROP INDEX IF EXISTS "verification_tokens_email_token_key";
DROP INDEX IF EXISTS "two_factor_tokens_email_token_key";

CREATE INDEX "verification_tokens_tenant_id_email_idx"
ON "verification_tokens"("tenant_id", "email");

CREATE UNIQUE INDEX "verification_tokens_tenant_id_email_token_key"
ON "verification_tokens"("tenant_id", "email", "token");

CREATE INDEX "two_factor_tokens_tenant_id_email_idx"
ON "two_factor_tokens"("tenant_id", "email");

CREATE UNIQUE INDEX "two_factor_tokens_tenant_id_email_token_key"
ON "two_factor_tokens"("tenant_id", "email", "token");
