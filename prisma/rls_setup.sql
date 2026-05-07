-- ── AGAPAY RLS SETUP ──
-- This script enables Row-Level Security on all tenant-aware tables.
-- Session variable: 'app.current_tenant_id'

-- Helper to enable RLS and create policy
DO $$
DECLARE
    t text;
    tables_to_isolate text[] := ARRAY[
        'users',
        'user_profiles',
        'user_documents',
        'loan_products',
        'loans',
        'loan_schedules',
        'payment_methods',
        'payments',
        'savings_accounts',
        'savings_transactions',
        'audit_logs',
        'traffic_logs',
        'interaction_logs',
        'homepage_faqs',
        'homepage_testimonials',
        'feedback_entries',
        'support_tickets',
        'verification_tokens',
        'two_factor_tokens',
        'password_reset_tokens',
        'messages',
        'conversations',
        'conversation_participants',
        'mentorship_connections',
        'message_attachments',
        'message_reactions',
        'notifications',
        'business_ledger',
        'ledger_accounts',
        'topup_requests',
        'tenant_subscriptions',
        'email_templates',
        'report_definitions',
        'generated_reports',
        'receipts',
        'backup_schedules',
        'backup_records',
        'restore_requests',
        'ai_configs',
        'ai_snapshots',
        'fraud_signals',
        'imbalance_investigations',
        'daily_reconciliations',
        'system_files'
    ];
BEGIN
    FOREACH t IN ARRAY tables_to_isolate
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        
        -- Drop if exists and recreate
        EXECUTE format('DROP POLICY IF EXISTS %I_isolation_policy ON %I', t, t);
        
        -- The Policy:
        -- 1. Match tenant_id to the session variable
        -- 2. OR bypass if the session variable is null/empty (Apex context)
        EXECUTE format(
            'CREATE POLICY %I_isolation_policy ON %I USING (
                tenant_id = NULLIF(current_setting(''app.current_tenant_id'', true), '''')::integer
                OR current_setting(''app.current_tenant_id'', true) IS NULL 
                OR current_setting(''app.current_tenant_id'', true) = ''''
            )', 
            t, t
        );
        
        -- Also enable for ALL operations (SELECT, INSERT, UPDATE, DELETE)
        -- 'USING' covers SELECT, UPDATE, DELETE. 
        -- 'WITH CHECK' covers INSERT and UPDATE.
        EXECUTE format(
            'ALTER POLICY %I_isolation_policy ON %I WITH CHECK (
                tenant_id = NULLIF(current_setting(''app.current_tenant_id'', true), '''')::integer
                OR current_setting(''app.current_tenant_id'', true) IS NULL 
                OR current_setting(''app.current_tenant_id'', true) = ''''
            )',
            t, t
        );
    END LOOP;
END $$;
