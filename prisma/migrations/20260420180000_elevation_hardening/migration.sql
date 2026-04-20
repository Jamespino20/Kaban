-- Agapay: Database Hardening Migration
-- Phase 1: Stateless RLS & Stored Procedures

-- 1. Setup Tenant Session Configuration
-- This allows us to use SET LOCAL app.tenant_id = 123;
-- We'll use this in our RLS policies.

-- 2. LOAN MATH: Declining Balance Stored Procedure
CREATE OR REPLACE FUNCTION fn_calculate_repayment_schedule(
    p_loan_id INTEGER,
    p_principal DECIMAL,
    p_monthly_rate DECIMAL,
    p_term_months INTEGER,
    p_disbursed_at DATE
) RETURNS VOID AS $$
DECLARE
    v_remaining_balance DECIMAL := p_principal;
    v_interest_payment DECIMAL;
    v_principal_payment DECIMAL := p_principal / p_term_months; -- Simplified for this version
    v_due_date DATE := p_disbursed_at;
    i INTEGER;
BEGIN
    -- Clear existing schedules
    DELETE FROM loan_schedules WHERE loan_id = p_loan_id;

    FOR i IN 1..p_term_months LOOP
        v_due_date := v_due_date + INTERVAL '1 month';
        
        -- Interest = Remaining Principal * Rate
        v_interest_payment := v_remaining_balance * p_monthly_rate;
        
        INSERT INTO loan_schedules (
            loan_id, 
            installment_number, 
            due_date, 
            principal_amount, 
            interest_amount, 
            total_due, 
            status
        ) VALUES (
            p_loan_id,
            i,
            v_due_date,
            v_principal_payment,
            v_interest_payment,
            v_principal_payment + v_interest_payment,
            'pending'
        );

        v_remaining_balance := v_remaining_balance - v_principal_payment;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. AUDIT LOGGING: Mutation Trigger
CREATE OR REPLACE FUNCTION fn_audit_mutation() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        tenant_id,
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        NEW.tenant_id,
        (SELECT current_setting('app.user_id', true)::integer),
        TG_OP,
        TG_TABLE_NAME,
        NEW.loan_id, -- Note: This needs to be generic or per table
        to_jsonb(OLD),
        to_jsonb(NEW),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (Stateless)
-- Helper to get current tenant
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS INTEGER AS $$
    SELECT current_setting('app.tenant_id', true)::integer;
$$ LANGUAGE sql STABLE;

-- Users Policy
CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = current_tenant_id() OR role = 'superadmin');

-- Loans Policy
CREATE POLICY tenant_isolation_policy ON loans
    USING (tenant_id = current_tenant_id());

-- Schedules Policy (Inherited via Loan)
CREATE POLICY tenant_isolation_policy ON loan_schedules
    USING (EXISTS (
        SELECT 1 FROM loans WHERE loans.loan_id = loan_schedules.loan_id 
        AND loans.tenant_id = current_tenant_id()
    ));

-- Payments Policy
CREATE POLICY tenant_isolation_policy ON payments
    USING (EXISTS (
        SELECT 1 FROM loans WHERE loans.loan_id = payments.loan_id 
        AND loans.tenant_id = current_tenant_id()
    ));

-- Savings (Wallet) Policy
CREATE POLICY tenant_isolation_policy ON savings_accounts
    USING (tenant_id = current_tenant_id());

-- Audit Logs Policy
CREATE POLICY tenant_isolation_policy ON audit_logs
    USING (tenant_id = current_tenant_id() OR role = 'superadmin');
