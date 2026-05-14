-- ============================================================
-- Migration 009: Subscription Plans & Tenant Gating
-- Enables plan-based and role-based module gating
-- ============================================================

-- 1. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    plan_id          INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL UNIQUE,
    description      TEXT,
    price_monthly    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    activated_modules JSON NOT NULL,
    max_members      INT NOT NULL DEFAULT 0,
    is_active        TINYINT(1) NOT NULL DEFAULT 1,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tenant Subscriptions (assigns plan to tenant)
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    subscription_id   INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id         INT NOT NULL,
    plan_id           INT NOT NULL,
    activated_modules JSON NOT NULL,
    status            ENUM('active', 'cancelled', 'expired', 'trial') NOT NULL DEFAULT 'trial',
    started_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at        TIMESTAMP NULL,
    cancelled_at      TIMESTAMP NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insert Plans
INSERT IGNORE INTO subscription_plans (name, description, price_monthly, price_yearly, activated_modules, max_members, is_active) VALUES
(
    'Core',
    'Essential cooperative management — loans, wallet, and community chat.',
    0.00, 0.00,
    '["loans", "wallet", "community"]',
    100,
    1
),
(
    'Pro',
    'Advanced features for growing cooperatives — adds branding, audit, and compassion fund.',
    0.00, 0.00,
    '["loans", "wallet", "community", "branding", "audit", "compassion"]',
    500,
    1
),
(
    'Enterprise',
    'Full platform access — includes reports, analytics, and system configuration.',
    0.00, 0.00,
    '["loans", "wallet", "community", "branding", "audit", "compassion", "reports", "analytics", "system_config"]',
    9999,
    1
);

-- 4. Assign Core plan to all existing tenants (migration only applies if tenant doesn't have a subscription yet)
INSERT IGNORE INTO tenant_subscriptions (tenant_id, plan_id, activated_modules, status, started_at)
SELECT t.tenant_id, sp.plan_id, sp.activated_modules, 'active', NOW()
FROM tenants t
CROSS JOIN subscription_plans sp
WHERE sp.name = 'Core'
AND NOT EXISTS (
    SELECT 1 FROM tenant_subscriptions ts WHERE ts.tenant_id = t.tenant_id
);
