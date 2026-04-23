-- Agapay: Database hardening migration
-- Kept replay-safe for shadow databases and clean resets.

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
    v_principal_payment DECIMAL := p_principal / p_term_months;
    v_due_date DATE := p_disbursed_at;
    i INTEGER;
BEGIN
    DELETE FROM loan_schedules WHERE loan_id = p_loan_id;

    FOR i IN 1..p_term_months LOOP
        v_due_date := v_due_date + INTERVAL '1 month';
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

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS INTEGER AS $$
    SELECT NULLIF(current_setting('app.tenant_id', true), '')::integer;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_user_id() RETURNS INTEGER AS $$
    SELECT NULLIF(current_setting('app.user_id', true), '')::integer;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION fn_audit_mutation() RETURNS TRIGGER AS $$
DECLARE
    v_entity_id INTEGER;
    v_tenant_id INTEGER;
BEGIN
    v_entity_id := COALESCE(
        NULLIF(to_jsonb(NEW) ->> 'loan_id', '')::integer,
        NULLIF(to_jsonb(NEW) ->> 'user_id', '')::integer,
        NULLIF(to_jsonb(NEW) ->> 'tenant_id', '')::integer,
        NULLIF(to_jsonb(NEW) ->> 'id', '')::integer
    );

    v_tenant_id := COALESCE(
        NULLIF(to_jsonb(NEW) ->> 'tenant_id', '')::integer,
        current_tenant_id()
    );

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
        v_tenant_id,
        current_user_id(),
        TG_OP,
        TG_TABLE_NAME,
        v_entity_id,
        CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
        to_jsonb(NEW),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_isolation_policy ON users;
CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = current_tenant_id() OR role = 'superadmin');

DROP POLICY IF EXISTS tenant_isolation_policy ON loans;
CREATE POLICY tenant_isolation_policy ON loans
    USING (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_policy ON loan_schedules;
CREATE POLICY tenant_isolation_policy ON loan_schedules
    USING (EXISTS (
        SELECT 1 FROM loans
        WHERE loans.loan_id = loan_schedules.loan_id
          AND loans.tenant_id = current_tenant_id()
    ));

DROP POLICY IF EXISTS tenant_isolation_policy ON payments;
CREATE POLICY tenant_isolation_policy ON payments
    USING (EXISTS (
        SELECT 1 FROM loans
        WHERE loans.loan_id = payments.loan_id
          AND loans.tenant_id = current_tenant_id()
    ));

DROP POLICY IF EXISTS tenant_isolation_policy ON savings_accounts;
CREATE POLICY tenant_isolation_policy ON savings_accounts
    USING (tenant_id = current_tenant_id());

DROP POLICY IF EXISTS tenant_isolation_policy ON audit_logs;
CREATE POLICY tenant_isolation_policy ON audit_logs
    USING (
        tenant_id = current_tenant_id()
        OR EXISTS (
            SELECT 1
            FROM users
            WHERE users.user_id = current_user_id()
              AND users.role = 'superadmin'
        )
    );
