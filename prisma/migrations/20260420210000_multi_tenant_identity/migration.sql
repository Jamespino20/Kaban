DROP INDEX IF EXISTS "users_email_key";
DROP INDEX IF EXISTS "users_username_key";
DROP INDEX IF EXISTS "users_member_code_key";
CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");
CREATE UNIQUE INDEX "users_username_tenant_id_key" ON "users"("username", "tenant_id");
CREATE UNIQUE INDEX "users_member_code_tenant_id_key" ON "users"("member_code", "tenant_id");
UPDATE audit_logs SET action = 'IDENTITY_MIGRATION' WHERE action IS NULL;
