-- ============================================================
-- Agapay Cooperative Microfinance Platform — UNIFIED SCHEMA
-- Consolidated from:
--   schema.sql (original)
--   migrations/006_platform_config.sql
--   migrations/007_loan_closure_tour.sql
--   migrations/008_unique_tenant_data.sql
--   migrations/009_subscription_gating.sql
-- All tables in one database. Explicit PK naming. No vouch.
-- ============================================================

CREATE DATABASE IF NOT EXISTS agapay_db;
USE agapay_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS
  billing_invoices, notification_templates, platform_announcements,
  ai_config, platform_config, system_health_snapshots, fraud_signals,
  ai_snapshots, backup_records, restore_requests, backup_schedules,
  receipts, tenant_subscriptions, subscription_plans,
  ledger_accounts, business_ledger, trust_tier_audits,
  trust_score_snapshots, trust_rating_assignments, trust_rating_periods,
  tenant_trust_policies, messages, message_attachments, message_reactions,
  conversation_participants, conversations, mentorship_connections,
  notifications, notification_preferences, two_factor_auth,
  verification_tokens, password_reset_tokens, support_tickets,
  ticket_replies, feedback_entries, homepage_testimonials, homepage_faqs,
  interaction_logs, traffic_logs, daily_reconciliations,
  imbalance_investigations, interest_audit,
  loan_schedules, payments, payment_methods, savings_transactions,
  savings_accounts, loan_guarantees, compassion_actions, user_documents,
  user_profiles, loans, loan_products, users, tenants, tenant_groups,
  decommissioned_backups, tenant_applications, topup_requests,
  report_definitions, generated_reports, email_templates, trigger_tasks,
  api_tokens, system_files,
  _enum_account_type_ref, _enum_ledger_account_type_ref,
  security_settings;

-- ============================================================
-- 1. platform_config
-- ============================================================
CREATE TABLE platform_config (
  config_id            INT AUTO_INCREMENT PRIMARY KEY,
  scoring_weights      JSON NULL,
  risk_thresholds      JSON NULL,
  default_loan_config  JSON NULL,
  platform_settings    JSON NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. subscription_plans
-- ============================================================
CREATE TABLE subscription_plans (
  plan_id        INT AUTO_INCREMENT PRIMARY KEY,
  tier_name      VARCHAR(50) NOT NULL UNIQUE,
  price_3months  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_6months  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_12months DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_monthly  DECIMAL(10,2) NOT NULL,
  price_annually DECIMAL(10,2) NOT NULL,
  max_members    INT NOT NULL,
  max_storage_mb INT NOT NULL,
  features       JSON DEFAULT '[]',
  is_active      TINYINT(1) DEFAULT 1,
  is_addon       TINYINT(1) DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. tenant_subscriptions
-- ============================================================
CREATE TABLE tenant_subscriptions (
  subscription_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id         INT NOT NULL UNIQUE,
  plan_id           INT NOT NULL,
  billing_cycle     ENUM('monthly','annually','3months','6months','12months') DEFAULT '3months',
  status            VARCHAR(20) DEFAULT 'active',
  start_date        DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date          DATETIME NULL,
  activated_modules JSON DEFAULT '[]',
  created_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(plan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. tenant_groups
-- ============================================================
CREATE TABLE tenant_groups (
  group_id       INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  reg_code       VARCHAR(10) NOT NULL UNIQUE,
  is_active      TINYINT(1) DEFAULT 1,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tg_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. tenants
-- ============================================================
CREATE TABLE tenants (
  tenant_id             INT AUTO_INCREMENT PRIMARY KEY,
  tenant_group_id       INT NULL,
  name                  VARCHAR(100) NOT NULL,
  slug                  VARCHAR(50) NOT NULL UNIQUE,
  brand_color           VARCHAR(20) NULL,
  accent_color          VARCHAR(20) NULL,
  font_pairing          VARCHAR(50) DEFAULT 'inter_outfit',
  logo_url              TEXT NULL,
  is_active             TINYINT(1) DEFAULT 1,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  entitlement_status    ENUM('prospect','availed','active','suspended') DEFAULT 'prospect',
  lifetime_availed_at   DATETIME NULL,
  availed_type          VARCHAR(50) NULL COMMENT 'One-Time, Core, Pro',
  region                VARCHAR(100) NULL,
  metadata              JSON NULL,
  entitlement_reference VARCHAR(120) NULL,
  entitlement_notes     TEXT NULL,
  entitled_by_user_id   INT NULL,
  FOREIGN KEY (tenant_group_id) REFERENCES tenant_groups(group_id) ON DELETE SET NULL,
  INDEX idx_tenant_entitlement (entitlement_status),
  INDEX idx_tenant_active (is_active),
  INDEX idx_tenant_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. users
-- ============================================================
CREATE TABLE users (
  user_id              INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id            INT NOT NULL,
  member_code          VARCHAR(20) NULL,
  username             VARCHAR(50) NOT NULL,
  email                VARCHAR(150) NOT NULL,
  phone                VARCHAR(20) NULL,
  password_hash        VARCHAR(255) NOT NULL,
  role                 ENUM('superadmin','operator','member') DEFAULT 'member',
  status               ENUM('pending','active','suspended','inactive','deactivated') DEFAULT 'pending',
  interest_tier        ENUM('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') DEFAULT 'T1_5_PERCENT',
  is_deactivation_locked TINYINT(1) DEFAULT 0,
  deleted_at           DATETIME NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  consent_accepted_at  DATETIME NULL,
  consent_version      VARCHAR(20) NULL,
  trust_score          INT DEFAULT 0 COMMENT '0-100 derived from payment/peer/guarantor metrics',
  UNIQUE KEY uq_user_email_tid (email, tenant_id),
  UNIQUE KEY uq_user_username_tid (username, tenant_id),
  UNIQUE KEY uq_user_membercode_tid (member_code, tenant_id),
  INDEX idx_user_role (role),
  INDEX idx_user_status (status),
  INDEX idx_user_tid (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. user_profiles
-- ============================================================
CREATE TABLE user_profiles (
  profile_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  tenant_id     INT NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  middle_name   VARCHAR(100) NULL,
  last_name     VARCHAR(100) NOT NULL,
  gender        VARCHAR(20) NULL,
  birthdate     DATE NULL,
  address       TEXT NULL,
  business_name VARCHAR(150) NULL,
  marital_status VARCHAR(30) DEFAULT NULL,
  occupation    VARCHAR(150) NULL,
  place_of_birth VARCHAR(150) NULL,
  tin           VARCHAR(20) NULL,
  region        VARCHAR(255) NULL,
  province      VARCHAR(255) NULL,
  city          VARCHAR(255) NULL,
  barangay      VARCHAR(255) NULL,
  income_range  VARCHAR(50) NULL,
  savings       DECIMAL(15,2) NULL,
  photo_url     TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_up_tid (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. two_factor_auth
-- ============================================================
CREATE TABLE two_factor_auth (
  tfa_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL UNIQUE,
  totp_secret VARCHAR(255) NOT NULL,
  is_enabled TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. verification_tokens
-- ============================================================
CREATE TABLE verification_tokens (
  token_id   INT AUTO_INCREMENT PRIMARY KEY,
  token_type ENUM('verification','two_factor','password_reset') NOT NULL,
  email      VARCHAR(150) NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires    DATETIME NOT NULL,
  tenant_id  INT NULL,
  used       TINYINT(1) DEFAULT 0,
  INDEX idx_vt_type (token_type),
  INDEX idx_vt_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. password_reset_tokens
-- ============================================================
CREATE TABLE password_reset_tokens (
  reset_id   INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(150) NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires    DATETIME NOT NULL,
  used       TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prt_email (email),
  INDEX idx_prt_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. loan_products
-- ============================================================
CREATE TABLE loan_products (
  product_id              INT AUTO_INCREMENT PRIMARY KEY,
  name                    VARCHAR(100) NOT NULL,
  description             TEXT NULL,
  min_amount              DECIMAL(15,2) NOT NULL,
  max_amount              DECIMAL(15,2) NOT NULL,
  interest_rate_percent   DECIMAL(5,2) NOT NULL,
  max_term_months         INT NOT NULL,
  is_active               TINYINT(1) DEFAULT 1,
  tenant_id               INT NOT NULL,
  allowed_frequencies     JSON DEFAULT '["monthly"]',
  guarantor_liability_rate DECIMAL(5,2) DEFAULT 25.00,
  INDEX idx_lp_tid (tenant_id),
  INDEX idx_lp_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. loans
-- ============================================================
CREATE TABLE loans (
  loan_id              INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id            INT NOT NULL,
  user_id              INT NOT NULL,
  product_id           INT NOT NULL,
  loan_reference       VARCHAR(50) NOT NULL UNIQUE,
  principal_amount     DECIMAL(15,2) NOT NULL,
  purpose              TEXT NOT NULL,
  term_months          INT NOT NULL,
  interest_applied     DECIMAL(15,2) NOT NULL,
  principal_receivable DECIMAL(15,2) DEFAULT 0.00,
  interest_receivable  DECIMAL(15,2) DEFAULT 0.00,
  fees_applied         DECIMAL(15,2) DEFAULT 0.00,
  total_payable        DECIMAL(15,2) NOT NULL,
  balance_remaining    DECIMAL(15,2) NOT NULL,
  total_paid           DECIMAL(15,2) DEFAULT 0.00,
  total_interest_paid  DECIMAL(15,2) DEFAULT 0.00,
  status               ENUM('pending','approved','active','paid','defaulted','rejected') DEFAULT 'pending',
  applied_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at          DATETIME NULL,
  approved_by          INT NULL,
  paid_at              DATETIME NULL,
  repayment_frequency  VARCHAR(20) DEFAULT 'monthly',
  recovery_parent_loan_id INT NULL,
  is_recovery_loan     TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES loan_products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_loan_tid (tenant_id),
  INDEX idx_loan_user (user_id),
  INDEX idx_loan_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. loan_schedules
-- ============================================================
CREATE TABLE loan_schedules (
  schedule_id       INT AUTO_INCREMENT PRIMARY KEY,
  loan_id           INT NOT NULL,
  tenant_id         INT NOT NULL,
  installment_number INT NOT NULL,
  due_date          DATE NOT NULL,
  principal_amount  DECIMAL(15,2) NOT NULL,
  interest_amount   DECIMAL(15,2) NOT NULL,
  total_due         DECIMAL(15,2) NOT NULL,
  status            ENUM('pending','paid','overdue') DEFAULT 'pending',
  paid_at           DATETIME NULL,
  days_late         INT DEFAULT 0,
  penalty_applied   DECIMAL(15,2) DEFAULT 0.00,
  amount_paid       DECIMAL(15,2) DEFAULT 0.00,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  INDEX idx_ls_loan_status (loan_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. payment_methods
-- ============================================================
CREATE TABLE payment_methods (
  method_id      INT AUTO_INCREMENT PRIMARY KEY,
  provider_name  VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NULL,
  is_active      TINYINT(1) DEFAULT 1,
  tenant_id      INT NOT NULL,
  INDEX idx_pm_tid (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. payments
-- ============================================================
CREATE TABLE payments (
  payment_id        INT AUTO_INCREMENT PRIMARY KEY,
  loan_id           INT NOT NULL,
  tenant_id         INT NOT NULL,
  method_id         INT NOT NULL,
  payment_reference VARCHAR(100) NOT NULL UNIQUE,
  amount_paid       DECIMAL(15,2) NOT NULL,
  receipt_url       VARCHAR(255) NULL,
  status            ENUM('pending','verified','rejected') DEFAULT 'pending',
  submitted_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at       DATETIME NULL,
  verified_by       INT NULL,
  notes             TEXT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (method_id) REFERENCES payment_methods(method_id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_pay_tid (tenant_id),
  INDEX idx_pay_status (status),
  INDEX idx_pay_ref (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. loan_guarantees
-- ============================================================
CREATE TABLE loan_guarantees (
  guarantee_id         INT AUTO_INCREMENT PRIMARY KEY,
  loan_id              INT NOT NULL,
  tenant_id            INT NOT NULL,
  guarantor_id         INT NOT NULL,
  status               ENUM('pending','vouched','rejected','voided','charged') DEFAULT 'pending',
  liability_percentage DECIMAL(5,2) DEFAULT 25.00,
  liability_amount     DECIMAL(15,2) NULL,
  charged_amount       DECIMAL(15,2) DEFAULT 0.00,
  charge_reason        VARCHAR(255) NULL,
  vouched_at           DATETIME NULL,
  charged_at           DATETIME NULL,
  revoked_at           DATETIME NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (guarantor_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_lg_loan (loan_id, status),
  INDEX idx_lg_guarantor (guarantor_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. savings_accounts
-- ============================================================
CREATE TABLE savings_accounts (
  account_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id    INT NOT NULL,
  user_id      INT NOT NULL,
  account_type ENUM('share_capital','regular_savings','personal_wallet') NOT NULL DEFAULT 'regular_savings',
  owner_role   ENUM('superadmin','operator','member') NULL,
  balance      DECIMAL(15,2) DEFAULT 0.00,
  is_locked    TINYINT(1) DEFAULT 0,
  lock_reason  VARCHAR(255) NULL,
  opened_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_sa_user_type (user_id, account_type),
  INDEX idx_sa_tenant_type (tenant_id, account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. savings_transactions
-- ============================================================
CREATE TABLE savings_transactions (
  transaction_id        INT AUTO_INCREMENT PRIMARY KEY,
  account_id            INT NOT NULL,
  tenant_id             INT NOT NULL,
  transaction_type      ENUM('deposit','withdrawal','dividend','fee','default_recovery_debit','default_recovery_credit') NOT NULL,
  amount                DECIMAL(15,2) NOT NULL,
  fee_amount            DECIMAL(15,2) DEFAULT 0.00,
  net_amount            DECIMAL(15,2) NULL,
  status                ENUM('pending','verified','rejected') DEFAULT 'verified',
  method_label          VARCHAR(80) NULL,
  external_reference    VARCHAR(120) NULL,
  reference             VARCHAR(100) NULL,
  reconciliation_ref    VARCHAR(120) NULL,
  ledger_txn_id         VARCHAR(255) NULL,
  issue_status          VARCHAR(50) DEFAULT 'none',
  issue_reported_at     DATETIME NULL,
  issue_notes           TEXT NULL,
  processed_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_by          INT NULL,
  FOREIGN KEY (account_id) REFERENCES savings_accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_st_tid (tenant_id),
  INDEX idx_st_account (account_id, status, processed_at),
  INDEX idx_st_recon_ref (reconciliation_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. topup_requests
-- ============================================================
CREATE TABLE topup_requests (
  request_id          INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id           INT NOT NULL,
  user_id             INT NOT NULL,
  request_type        ENUM('deposit','withdrawal') DEFAULT 'deposit',
  amount              DECIMAL(15,2) NOT NULL,
  fee_amount          DECIMAL(15,2) DEFAULT 0.00,
  net_amount          DECIMAL(15,2) NULL,
  method_label        VARCHAR(80) NULL,
  external_reference  VARCHAR(120) NULL,
  status              ENUM('pending','verified','rejected') DEFAULT 'pending',
  receipt_url         VARCHAR(255) NULL,
  issue_status        VARCHAR(50) DEFAULT 'none',
  admin_notes         TEXT NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at        DATETIME NULL,
  processed_by        INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_tr_tid (tenant_id, request_type, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. conversations
-- ============================================================
CREATE TABLE conversations (
  conv_id    VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id  INT NOT NULL,
  conv_type  ENUM('direct','operator_room','group_chat') NOT NULL DEFAULT 'direct',
  title      VARCHAR(150) NULL,
  slug       VARCHAR(100) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_conv_tenant_slug (tenant_id, conv_type, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 21. conversation_participants
-- ============================================================
CREATE TABLE conversation_participants (
  participant_id  VARCHAR(25) NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(25) NOT NULL,
  user_id         INT NOT NULL,
  tenant_id       INT NOT NULL,
  joined_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_read_at    DATETIME NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conv_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_cp_conv_user (conversation_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 22. messages
-- ============================================================
CREATE TABLE messages (
  msg_id          VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id       INT NOT NULL,
  sender_id       INT NOT NULL,
  content         TEXT NOT NULL,
  is_broadcast    TINYINT(1) DEFAULT 0,
  conversation_id VARCHAR(25) NOT NULL,
  reply_to_id     VARCHAR(25) NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conv_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_id) REFERENCES messages(msg_id) ON DELETE SET NULL,
  INDEX idx_msg_conv (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 23. message_reactions
-- ============================================================
CREATE TABLE message_reactions (
  reaction_id VARCHAR(25) NOT NULL PRIMARY KEY,
  message_id  VARCHAR(25) NOT NULL,
  user_id     INT NOT NULL,
  tenant_id   INT NOT NULL,
  emoji       VARCHAR(24) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(msg_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_reaction_msg_user (message_id, user_id, emoji)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 24. support_tickets
-- ============================================================
CREATE TABLE support_tickets (
  ticket_id       INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number   VARCHAR(50) NOT NULL UNIQUE,
  tenant_id       INT NULL,
  requester_id    INT NULL,
  category        VARCHAR(30) NOT NULL,
  status          ENUM('open','in_review','waiting_on_member','waiting_on_admin','resolved','closed','escalated') DEFAULT 'open',
  priority        ENUM('low','normal','high','urgent') DEFAULT 'normal',
  subject         VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  assigned_to     INT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_st_tenant (tenant_id, status, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 25. ticket_replies
-- ============================================================
CREATE TABLE ticket_replies (
  reply_id   INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id  INT NOT NULL,
  user_id    INT NULL,
  message    TEXT NOT NULL,
  is_staff   TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_tr_ticket (ticket_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 26. feedback_entries
-- ============================================================
CREATE TABLE feedback_entries (
  entry_id    INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id   INT NULL,
  user_id     INT NULL,
  name        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) NULL,
  category    VARCHAR(100) NOT NULL,
  message     TEXT NOT NULL,
  status      VARCHAR(50) DEFAULT 'open',
  priority    ENUM('low','normal','high','urgent') DEFAULT 'normal',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 27. notifications
-- ============================================================
CREATE TABLE notifications (
  notif_id    VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id   INT NULL,
  user_id     INT NOT NULL,
  notif_type  VARCHAR(30) NOT NULL,
  title       VARCHAR(150) NOT NULL,
  body        TEXT NOT NULL,
  action_url  VARCHAR(255) NULL,
  channel     ENUM('in_app','email','both') DEFAULT 'in_app',
  is_read     TINYINT(1) DEFAULT 0,
  emailed_at  DATETIME NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 28. notification_preferences
-- ============================================================
CREATE TABLE notification_preferences (
  pref_id    INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  tenant_id  INT NOT NULL,
  notif_type VARCHAR(30) NOT NULL,
  channel    ENUM('in_app','email','sms','none') DEFAULT 'in_app',
  enabled    TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_np_user_type (user_id, notif_type, channel),
  INDEX idx_np_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 29. compassion_actions
-- ============================================================
CREATE TABLE compassion_actions (
  action_id          INT AUTO_INCREMENT PRIMARY KEY,
  loan_id            INT NOT NULL,
  tenant_id          INT NOT NULL,
  action_type        ENUM('grace_period','term_extension','penalty_freeze') NOT NULL,
  reason             TEXT NOT NULL,
  status             ENUM('pending','approved','rejected') DEFAULT 'pending',
  requested_by       INT NOT NULL,
  requested_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by        INT NULL,
  approved_at        DATETIME NULL,
  effective_at       DATETIME NULL,
  expires_at         DATETIME NULL,
  grace_period_days  INT NULL,
  restructured_term  INT NULL,
  penalty_waived     DECIMAL(15,2) DEFAULT 0.00,
  freeze_status      ENUM('none','active','expired','lifted') DEFAULT 'none',
  guarantor_charge   ENUM('not_applicable','pending','charged','waived') DEFAULT 'not_applicable',
  trust_score_impact INT DEFAULT 0,
  admin_notes        TEXT NULL,
  metadata           JSON NULL,
  created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_ca_loan (loan_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 30. ledger_accounts
-- ============================================================
CREATE TABLE ledger_accounts (
  account_id   INT AUTO_INCREMENT PRIMARY KEY,
  account_name VARCHAR(100) NOT NULL,
  account_code VARCHAR(20) NOT NULL UNIQUE,
  account_type ENUM('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL DEFAULT 'ASSET',
  tenant_id    INT NULL,
  is_active    TINYINT(1) DEFAULT 1,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_la_tenant_type (tenant_id, account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 31. business_ledger
-- ============================================================
CREATE TABLE business_ledger (
  entry_id              INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id        VARCHAR(50) NOT NULL DEFAULT '',
  account_id            INT NOT NULL,
  tenant_id             INT NOT NULL,
  debit                 DECIMAL(15,2) DEFAULT 0.00,
  credit                DECIMAL(15,2) DEFAULT 0.00,
  description           TEXT NOT NULL,
  source_module         VARCHAR(80) NULL,
  source_reference      VARCHAR(120) NULL,
  reconciliation_ref    VARCHAR(120) NULL,
  reconciled_at         DATETIME NULL,
  is_reversal           TINYINT(1) DEFAULT 0,
  reversed_entry_id     INT NULL,
  ledger_hash           VARCHAR(255) NULL,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by            INT NULL,
  loan_id               INT NULL,
  metadata              JSON NULL,
  FOREIGN KEY (account_id) REFERENCES ledger_accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE SET NULL,
  INDEX idx_bl_tid (tenant_id),
  INDEX idx_bl_source (source_module, source_reference),
  INDEX idx_bl_recon (reconciliation_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 32. daily_reconciliations
-- ============================================================
CREATE TABLE daily_reconciliations (
  reconciliation_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id           INT NOT NULL,
  business_date       DATE NOT NULL,
  status              ENUM('draft','blocked','pending_approval','signed_off','adjusted','rejected','reopened') DEFAULT 'draft',
  total_disbursed     DECIMAL(15,2) DEFAULT 0.00,
  total_collected     DECIMAL(15,2) DEFAULT 0.00,
  total_ledger_debits DECIMAL(15,2) DEFAULT 0.00,
  total_ledger_credits DECIMAL(15,2) DEFAULT 0.00,
  reconciliation_ref  VARCHAR(120) NOT NULL UNIQUE,
  resolution_action   ENUM('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') NULL,
  prepared_by         INT NULL,
  prepared_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  signed_off_by       INT NULL,
  signed_off_at       DATETIME NULL,
  notes               TEXT NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_dr_tenant_date (tenant_id, business_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 33. audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  log_id        INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id     INT NULL,
  user_id       INT NULL,
  actor_role    ENUM('superadmin','operator','member') NULL,
  actor_label   VARCHAR(150) NULL,
  module        VARCHAR(20) DEFAULT 'system',
  action        VARCHAR(100) NOT NULL,
  action_cat    VARCHAR(20) DEFAULT 'other',
  severity      ENUM('debug','info','warning','critical') DEFAULT 'info',
  entity_type   VARCHAR(80) NOT NULL,
  entity_id     INT NULL,
  entity_ref    VARCHAR(120) NULL,
  old_values    JSON NULL,
  new_values    JSON NULL,
  ip_address    VARCHAR(45) NULL,
  user_agent    TEXT NULL,
  is_cross_tenant TINYINT(1) DEFAULT 0,
  metadata      JSON NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_al_tid (tenant_id),
  INDEX idx_al_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 34. trust_rating_periods
-- ============================================================
CREATE TABLE trust_rating_periods (
  period_id    INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id    INT NOT NULL,
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  status       ENUM('planned','active','closed','cancelled') DEFAULT 'planned',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trp_tenant_dates (tenant_id, period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 35. trust_rating_assignments
-- ============================================================
CREATE TABLE trust_rating_assignments (
  assignment_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id       INT NOT NULL,
  period_id       INT NOT NULL,
  rater_id        INT NOT NULL,
  ratee_id        INT NOT NULL,
  rater_role      ENUM('superadmin','operator','member') NOT NULL,
  status          ENUM('assigned','completed','missed','excused','locked_out') DEFAULT 'assigned',
  score           INT NULL,
  comment         TEXT NULL,
  due_at          DATETIME NULL,
  completed_at    DATETIME NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (period_id) REFERENCES trust_rating_periods(period_id) ON DELETE CASCADE,
  UNIQUE KEY uq_tra_period_rater_ratee (period_id, rater_id, ratee_id, rater_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 36. trust_score_snapshots
-- ============================================================
CREATE TABLE trust_score_snapshots (
  snapshot_id           INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id             INT NOT NULL,
  user_id               INT NOT NULL,
  score                 INT NOT NULL,
  tier_before           VARCHAR(20) NULL,
  tier_after            VARCHAR(20) NOT NULL,
  low_rating_state      VARCHAR(18) DEFAULT 'none',
  calculated_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  period_id             INT NULL,
  FOREIGN KEY (period_id) REFERENCES trust_rating_periods(period_id) ON DELETE SET NULL,
  INDEX idx_tss_user (tenant_id, user_id, calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 37. trust_tier_audits
-- ============================================================
CREATE TABLE trust_tier_audits (
  audit_id      INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id     INT NOT NULL,
  user_id       INT NOT NULL,
  snapshot_id   INT NULL,
  previous_tier VARCHAR(20) NULL,
  new_tier      VARCHAR(20) NOT NULL,
  score         INT NOT NULL,
  change_reason VARCHAR(255) NOT NULL,
  changed_by    INT NULL,
  changed_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (snapshot_id) REFERENCES trust_score_snapshots(snapshot_id) ON DELETE SET NULL,
  INDEX idx_tta_user (tenant_id, user_id, changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 38. user_documents
-- ============================================================
CREATE TABLE user_documents (
  document_id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  tenant_id           INT NOT NULL,
  document_type       ENUM('valid_id','proof_of_billing','residency_cert','brgy_cert','business_permit') NOT NULL,
  id_type_name        VARCHAR(100) NULL COMMENT 'e.g. UMID, Passport, Driver''s License',
  file_url            TEXT NOT NULL,
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  uploaded_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_ud_tid (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 39. mentorship_connections
-- ============================================================
CREATE TABLE mentorship_connections (
  connection_id VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id     INT NOT NULL,
  requester_id  INT NOT NULL,
  mentor_id     INT NOT NULL,
  endorsed_by   INT NULL,
  status        ENUM('pending_endorsement','endorsed','rejected') DEFAULT 'pending_endorsement',
  focus_area    VARCHAR(150) NULL,
  notes         TEXT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  endorsed_at   DATETIME NULL,
  FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (endorsed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_mc_pair (tenant_id, requester_id, mentor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 40. decommissioned_backups
-- ============================================================
CREATE TABLE decommissioned_backups (
  decomm_id      VARCHAR(25) NOT NULL PRIMARY KEY DEFAULT (SUBSTRING(MD5(CONCAT(RAND(), UUID())) FROM 1 FOR 25)),
  tenant_id      INT NOT NULL,
  file_url       VARCHAR(255) NOT NULL,
  snapshot_date  DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  snapshot_content TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 41. report_definitions
-- ============================================================
CREATE TABLE report_definitions (
  definition_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id       INT NULL,
  created_by      INT NOT NULL,
  report_name     VARCHAR(150) NOT NULL,
  report_type     VARCHAR(25) NOT NULL,
  report_format   ENUM('csv','pdf','json') DEFAULT 'csv',
  filters         JSON NULL,
  is_scheduled    TINYINT(1) DEFAULT 0,
  next_run_at     DATETIME NULL,
  recipients      JSON DEFAULT '[]',
  is_active       TINYINT(1) DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 42. email_templates
-- ============================================================
CREATE TABLE email_templates (
  template_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id     INT NULL,
  category      VARCHAR(20) NOT NULL,
  slug          VARCHAR(80) NOT NULL,
  subject_line  VARCHAR(255) NOT NULL,
  html_body     TEXT NOT NULL,
  text_body     TEXT NULL,
  variables     JSON DEFAULT '[]',
  is_active     TINYINT(1) DEFAULT 1,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_et_tenant_slug (tenant_id, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 43. system_files
-- ============================================================
CREATE TABLE system_files (
  file_id      INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id    INT NULL,
  uploaded_by  INT NULL,
  filename     VARCHAR(255) NOT NULL,
  filepath     VARCHAR(512) NOT NULL,
  mime_type    VARCHAR(100) NULL,
  file_size    BIGINT DEFAULT 0,
  category     VARCHAR(50) DEFAULT 'general',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_sf_tenant (tenant_id),
  INDEX idx_sf_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- OTHER PLATFORM TABLES
-- ============================================================

-- Security Settings
CREATE TABLE security_settings (
  setting_id           INT AUTO_INCREMENT PRIMARY KEY,
  password_policy      JSON NULL,
  two_factor_required  TINYINT(1) DEFAULT 0,
  two_factor_roles     JSON DEFAULT '["superadmin","admin"]',
  ip_whitelist         JSON DEFAULT '[]',
  allowed_domains      JSON DEFAULT '[]',
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Config
CREATE TABLE ai_config (
  config_id            INT AUTO_INCREMENT PRIMARY KEY,
  risk_sensitivity     VARCHAR(20) DEFAULT 'medium',
  notification_settings JSON NULL,
  analysis_config      JSON NULL,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Platform Announcements
CREATE TABLE platform_announcements (
  announcement_id INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  target_audience VARCHAR(10) DEFAULT 'all',
  priority        ENUM('low','normal','high','urgent') DEFAULT 'normal',
  is_published    TINYINT(1) DEFAULT 0,
  created_by      INT NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at    DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notification Templates
CREATE TABLE notification_templates (
  template_id    INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  type           VARCHAR(10) NOT NULL COMMENT 'email, sms, push',
  subject_action VARCHAR(255) NULL,
  body           TEXT NOT NULL,
  variables      JSON DEFAULT '[]',
  category       VARCHAR(20) NOT NULL,
  is_active      TINYINT(1) DEFAULT 1,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nt_type_cat (type, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System Health Snapshots
CREATE TABLE system_health_snapshots (
  snapshot_id       INT AUTO_INCREMENT PRIMARY KEY,
  snapshot_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  db_size_bytes     BIGINT NULL,
  tenant_schema_sizes JSON NULL,
  alert_state       VARCHAR(10) DEFAULT 'ok',
  alert_details     TEXT NULL,
  metadata          JSON NULL,
  created_by        INT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Billing Invoices
CREATE TABLE billing_invoices (
  invoice_id          INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id           INT NOT NULL,
  invoice_number      VARCHAR(50) NOT NULL UNIQUE,
  amount              DECIMAL(12,2) NOT NULL,
  status              ENUM('pending','paid','overdue','cancelled') DEFAULT 'pending',
  due_date            DATETIME NOT NULL,
  paid_at             DATETIME NULL,
  payment_method_used VARCHAR(50) NULL,
  reference           VARCHAR(255) NULL,
  items               JSON NULL,
  created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bi_tenant (tenant_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger Tasks
CREATE TABLE trigger_tasks (
  task_id         VARCHAR(255) NOT NULL PRIMARY KEY,
  idempotency_key VARCHAR(255) NOT NULL,
  payload         JSON NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending',
  priority        INT DEFAULT 0,
  max_attempts    INT DEFAULT 3,
  current_attempt INT DEFAULT 0,
  last_error      TEXT NULL,
  scheduled_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  executed_at     DATETIME NULL,
  completed_at    DATETIME NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API Tokens
CREATE TABLE api_tokens (
  token_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tenant Applications
CREATE TABLE tenant_applications (
  application_id   INT AUTO_INCREMENT PRIMARY KEY,
  tenant_name      VARCHAR(100) NOT NULL,
  tenant_slug      VARCHAR(50) NOT NULL UNIQUE,
  applicant_name   VARCHAR(150) NULL,
  applicant_email  VARCHAR(150) NOT NULL,
  applicant_phone  VARCHAR(20) NULL,
  estimated_members INT DEFAULT 100,
  brand_color      VARCHAR(20) NULL,
  accent_color     VARCHAR(20) NULL,
  logo_url         TEXT NULL,
  status           ENUM('pending','approved','rejected') DEFAULT 'pending',
  submitted_by     INT NOT NULL,
  reviewed_by      INT NULL,
  reviewed_at      DATETIME NULL,
  review_notes     TEXT NULL,
  documents        JSON NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Homepage Content
CREATE TABLE homepage_faqs (
  faq_id      INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id   INT NULL,
  question    VARCHAR(255) NOT NULL,
  answer      TEXT NOT NULL,
  is_active   TINYINT(1) DEFAULT 1,
  sort_order  INT DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE homepage_testimonials (
  testimonial_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      INT NULL,
  name           VARCHAR(150) NOT NULL,
  role_label     VARCHAR(150) NOT NULL,
  photo_url      VARCHAR(255) NULL,
  content        TEXT NOT NULL,
  is_active      TINYINT(1) DEFAULT 1,
  sort_order     INT DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Message Attachments
CREATE TABLE message_attachments (
  attach_id  VARCHAR(25) NOT NULL PRIMARY KEY,
  message_id VARCHAR(25) NOT NULL,
  tenant_id  INT NOT NULL,
  file_name  VARCHAR(255) NOT NULL,
  file_url   VARCHAR(255) NOT NULL,
  mime_type  VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(msg_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trust Policies
CREATE TABLE tenant_trust_policies (
  policy_id            INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id            INT NOT NULL UNIQUE,
  payment_weight       DECIMAL(5,2) DEFAULT 40.00,
  business_weight      DECIMAL(5,2) DEFAULT 20.00,
  peer_weight          DECIMAL(5,2) DEFAULT 20.00,
  guarantor_weight     DECIMAL(5,2) DEFAULT 20.00,
  minimum_voting_quota INT DEFAULT 3,
  low_rating_threshold INT DEFAULT 55,
  is_active            TINYINT(1) DEFAULT 1,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Generated Reports
CREATE TABLE generated_reports (
  report_id     INT AUTO_INCREMENT PRIMARY KEY,
  definition_id INT NULL,
  tenant_id     INT NULL,
  requested_by  INT NULL,
  report_type   VARCHAR(25) NOT NULL,
  report_format ENUM('csv','pdf','json') NOT NULL,
  status        ENUM('queued','processing','ready','failed','expired') DEFAULT 'queued',
  file_url      VARCHAR(512) NULL,
  error_message TEXT NULL,
  period_start  DATETIME NULL,
  period_end    DATETIME NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (definition_id) REFERENCES report_definitions(definition_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Receipts
CREATE TABLE receipts (
  receipt_id     INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      INT NOT NULL,
  user_id        INT NULL,
  receipt_number VARCHAR(60) NOT NULL UNIQUE,
  receipt_type   VARCHAR(20) NOT NULL,
  status         ENUM('generated','voided','reissued') DEFAULT 'generated',
  amount         DECIMAL(15,2) NOT NULL,
  currency       VARCHAR(10) DEFAULT 'PHP',
  description    TEXT NULL,
  file_url       VARCHAR(512) NULL,
  issued_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backup Schedules
CREATE TABLE backup_schedules (
  schedule_id    INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id      INT NULL,
  frequency      VARCHAR(10) NOT NULL,
  retention_days INT DEFAULT 30,
  last_run_at    DATETIME NULL,
  next_run_at    DATETIME NULL,
  storage_path   VARCHAR(512) NULL,
  is_active      TINYINT(1) DEFAULT 1,
  created_by     INT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Backup Records
CREATE TABLE backup_records (
  record_id     INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id     INT NULL,
  schedule_id   INT NULL,
  status        ENUM('scheduled','running','completed','failed','expired') DEFAULT 'scheduled',
  storage_path  VARCHAR(512) NULL,
  file_size     BIGINT NULL,
  checksum      VARCHAR(128) NULL,
  error_message TEXT NULL,
  started_at    DATETIME NULL,
  completed_at  DATETIME NULL,
  created_by    INT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES backup_schedules(schedule_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restore Requests
CREATE TABLE restore_requests (
  request_id    INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id     INT NULL,
  backup_id     INT NOT NULL,
  requested_by  INT NOT NULL,
  status        ENUM('requested','validating','restoring','completed','failed','cancelled') DEFAULT 'requested',
  notes         TEXT NULL,
  error_message TEXT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (backup_id) REFERENCES backup_records(record_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logs
CREATE TABLE traffic_logs (
  log_id      VARCHAR(25) NOT NULL PRIMARY KEY DEFAULT (SUBSTRING(MD5(CONCAT(RAND(), UUID())) FROM 1 FOR 25)),
  tenant_id   INT NULL,
  path_action VARCHAR(255) NOT NULL,
  ip_address  VARCHAR(45) NULL,
  user_agent  TEXT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tl_tenant (tenant_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE interaction_logs (
  log_id     VARCHAR(25) NOT NULL PRIMARY KEY DEFAULT (SUBSTRING(MD5(CONCAT(RAND(), UUID())) FROM 1 FOR 25)),
  tenant_id  INT NULL,
  user_id    INT NULL,
  event_type VARCHAR(100) NOT NULL,
  metadata   JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fraud & AI
CREATE TABLE fraud_signals (
  signal_id       INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id       INT NULL,
  signal_type     VARCHAR(30) NOT NULL,
  status          VARCHAR(18) DEFAULT 'detected',
  severity        ENUM('debug','info','warning','critical') DEFAULT 'warning',
  linked_user_id  INT NULL,
  risk_score      INT NULL,
  signal_metadata JSON NULL,
  detected_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at     DATETIME NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_snapshots (
  snapshot_id      INT AUTO_INCREMENT PRIMARY KEY,
  config_id        INT NULL,
  tenant_id        INT NULL,
  use_case         VARCHAR(25) NOT NULL,
  status           ENUM('queued','processing','completed','failed','skipped') DEFAULT 'queued',
  output_text      TEXT NULL,
  confidence_score DECIMAL(5,2) NULL,
  error_message    TEXT NULL,
  created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Interest Audit
CREATE TABLE interest_audit (
  audit_id       INT AUTO_INCREMENT PRIMARY KEY,
  loan_id        INT NOT NULL UNIQUE,
  tenant_id      INT NOT NULL,
  formula_snapshot JSON NOT NULL,
  rate_applied   DECIMAL(5,2) NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  INDEX idx_ia_tid (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Imbalance Investigations
CREATE TABLE imbalance_investigations (
  investigation_id       INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id              INT NULL,
  source_module          VARCHAR(30) NOT NULL,
  expected_amount        DECIMAL(15,2) NOT NULL,
  actual_amount          DECIMAL(15,2) NOT NULL,
  difference_amount      DECIMAL(15,2) NOT NULL,
  status                 ENUM('detected','assigned','investigating','awaiting_approval','resolved','dismissed') DEFAULT 'detected',
  resolution_action      ENUM('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') NULL,
  notes                  TEXT NULL,
  created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reference enums
CREATE TABLE _enum_account_type_ref (value VARCHAR(20) PRIMARY KEY);
INSERT IGNORE INTO _enum_account_type_ref VALUES ('share_capital'),('regular_savings'),('personal_wallet');

CREATE TABLE _enum_ledger_account_type_ref (value VARCHAR(15) PRIMARY KEY);
INSERT IGNORE INTO _enum_ledger_account_type_ref VALUES ('ASSET'),('LIABILITY'),('EQUITY'),('REVENUE'),('EXPENSE');

-- ============================================================
-- INSERT SEED DATA
-- ============================================================

-- Platform config defaults
INSERT IGNORE INTO platform_config (scoring_weights, risk_thresholds, default_loan_config, platform_settings) VALUES
('{
  "payment_history": 40,
  "business_stability": 20,
  "peer_rating": 20,
  "guarantor_history": 20
}', '{
  "low_risk_min": 80,
  "medium_risk_min": 60,
  "high_risk_min": 0
}', '{
  "default_interest_rate": 5.00,
  "default_term_months": 12,
  "max_loan_to_savings_ratio": 3.0
}', '{
  "platform_name": "Agapay",
  "support_email": "support@agapay.coop",
  "currency": "PHP",
  "timezone": "Asia/Manila"
}');

-- 3 subscription plans
INSERT IGNORE INTO subscription_plans (tier_name, price_monthly, price_annually, max_members, max_storage_mb, features, is_active) VALUES
('Core', 499.00, 4990.00, 50, 500,
 '["loan_management","savings_accounts","basic_reports","member_management","mobile_access"]',
 1),
('Pro', 999.00, 9990.00, 200, 2000,
 '["loan_management","savings_accounts","advanced_reports","member_management","mobile_access","messaging","guarantor_system","trust_scoring","compassion_actions","email_templates"]',
 1),
('Enterprise', 2499.00, 24990.00, 9999, 10000,
 '["loan_management","savings_accounts","advanced_reports","member_management","mobile_access","messaging","guarantor_system","trust_scoring","compassion_actions","email_templates","audit_logging","reconciliation","ai_insights","multi_branch","dedicated_support"]',
 1);

-- 6 tenant groups
INSERT IGNORE INTO tenant_groups (name, reg_code) VALUES
('National Capital Region', 'AGP_NCR'),
('Central Luzon Sector',    'AGP_CL'),
('Northern Luzon Sector',   'AGP_NL'),
('Visayas Sector',          'AGP_VS'),
('Mindanao Sector',         'AGP_MS'),
('Southern Luzon Sector',   'AGP_SL');

-- 6 unique tenants (upsert logic: INSERT if slug not exists)
INSERT INTO tenants (name, slug, tenant_group_id, brand_color, accent_color, region, is_active, entitlement_status, metadata)
SELECT 'Malolos City Cooperative',    'malolos', (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_CL'), '#2563eb', '#60a5fa', 'Central Luzon', 1, 'active',
 '{"mission":"Magbigay ng accessible at abot-kayang serbisyong pinansyal sa bawat Malolenyo.","vision":"Isang malaya at maunlad na pamayanan ng Malolos.","category":"Multipurpose Cooperative","heroHeadline":"Ang Agapay ng Bawat Malolenyo","heroSubheadline":"Sama-sama sa pag-unlad, walang naiiwan.","official_email":"malolos@agapay.coop","phone":"(044) 791-2345","address":"2F Malolos Public Market Bldg., Brgy. San Vicente, Malolos City, Bulacan 3000","values":[{"icon":"fa-heart","label":"Malasakit"},{"icon":"fa-shield-halved","label":"Integridad"},{"icon":"fa-handshake","label":"Pagkakaisa"},{"icon":"fa-people-arrows","label":"Serbisyo Publiko"}],"testimonials":[{"quote":"Dahil sa cooperative, nakapagpautang ako ng dagdag puhunan para sa aking karenderya.","author":"Aling Rosa Mercado","role":"Food Vendor, 3 years member"},{"quote":"Ang laki ng natipid ko sa interes kumpara sa 5-6.","author":"Ka Lito Villanueva","role":"Tricycle Operator, Member since 2021"},{"quote":"Dito ko unang nakatikim ng loan na walang hidden charges.","author":"Maricel Reyes","role":"Sari-Sari Store Owner"}]}'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'malolos');

INSERT INTO tenants (name, slug, tenant_group_id, brand_color, accent_color, region, is_active, entitlement_status, metadata)
SELECT 'Baguio City Cooperative',     'baguio',  (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_NL'), '#16a34a', '#4ade80', 'Northern Luzon', 1, 'active',
 '{"mission":"Suportahan ang mga magsasaka at maliit na negosyante sa Cordillera sa pamamagitan ng patas na presyo at accessible na pautang.","vision":"Isang rehiyong bulubundukin kung saan ang bawat magsasaka ay may kakayahang magsaka nang may dignidad.","category":"Farmers & Producers Cooperative","heroHeadline":"Pagyamanin ang Lupa, Pagyamanin ang Buhay","heroSubheadline":"Taguyod ng magsasaka, alagá ng kalikasan.","official_email":"baguio@agapay.coop","phone":"(074) 442-3123","address":"Km. 4 La Trinidad-Baguio Rd., Brgy. Balili, La Trinidad, Benguet 2601","values":[{"icon":"fa-mountain","label":"Pagpupunyagi"},{"icon":"fa-seedling","label":"Kooperasyon"},{"icon":"fa-leaf","label":"Kalikasan"},{"icon":"fa-scale-balanced","label":"Katapatan"}],"testimonials":[{"quote":"Dati, sa mga middleman ako bumebenta. Ngayon, sa cooperative, mas mataas ang kita.","author":"Mang Pedro Bangsoy","role":"Strawberry Farmer"},{"quote":"Ang cooperative ang nagturo sa akin ng tamang pagtatanim at pagbebenta.","author":"Nena Cariño","role":"Vegetable Vendor, La Trinidad"},{"quote":"Nakabili ako ng sariling pickup truck dahil sa pautang ng kooperatiba.","author":"Johnny Wandagan","role":"Farmer & Transporter"}]}'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'baguio');

INSERT INTO tenants (name, slug, tenant_group_id, brand_color, accent_color, region, is_active, entitlement_status, metadata)
SELECT 'Cebu City Cooperative',       'cebu',    (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_VS'), '#dc2626', '#f87171', 'Visayas', 1, 'active',
 '{"mission":"Paglingkuran ang sektor ng transportasyon at maliliit na negosyo sa Cebu sa pamamagitan ng mabilis at maaasahang serbisyong pinansyal.","vision":"Isang Cebu kung saan ang bawat driver, operator, at maliit na negosyante ay may kakayahang makamit ang kanilang mga pangarap.","category":"Transport & Service Cooperative","heroHeadline":"Lig-on ang Pundasyon, Hayag ang Kaugmaon","heroSubheadline":"Sakay na sa pag-unlad!","official_email":"cebu@agapay.coop","phone":"(032) 412-5678","address":"Unit 8, Cebu South Terminal Bldg., Brgy. San Nicolas, Cebu City 6000","values":[{"icon":"fa-route","label":"Paglaum (Hope)"},{"icon":"fa-people-group","label":"Panaghiusa (Unity)"},{"icon":"fa-clock","label":"Kasaligan (Reliability)"}],"testimonials":[{"quote":"Dahil sa cooperative loan, na-renew ko ang aking jeepney at dumami ang pasahero.","author":"Mang Juanito Flores","role":"Jeepney Driver-Operator"},{"quote":"Mula sa pagtitinda sa kanto, may sarili na akong maliit na grocery.","author":"Ate Maria Gonzales","role":"Sari-Sari Store Owner"},{"quote":"Ang cooperative ay parang pamilya.","author":"Ricky Sante","role":"Multicab Operator"}]}'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'cebu');

INSERT INTO tenants (name, slug, tenant_group_id, brand_color, accent_color, region, is_active, entitlement_status, metadata)
SELECT 'Iloilo City Cooperative',     'iloilo',  (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_VS'), '#d946ef', '#e879f9', 'Visayas', 1, 'active',
 '{"mission":"Palakasin ang kakayahan ng bawat Kababaihang Ilonggo sa pamamagitan ng livelihood programs, financial literacy, at patas na pagkakataon sa negosyo.","vision":"Isang Iloilo kung saan ang bawat babae ay may kakayahang pinansyal, may sariling kita, at may boses sa komunidad.","category":"Women''s Cooperative","heroHeadline":"Babae, Kaya Mo!","heroSubheadline":"Nagkakaisa para sa progresibong kababaihan ng Iloilo.","official_email":"iloilo@agapay.coop","phone":"(033) 503-7890","address":"2F Robinson''s Place Jaro, Brgy. San Pedro, Jaro, Iloilo City 5000","values":[{"icon":"fa-hands-holding-child","label":"Pagpakabana (Care)"},{"icon":"fa-hand-holding-hand","label":"Pagbuligay (Helping)"},{"icon":"fa-face-smile","label":"Pagrespeto (Respect)"}],"testimonials":[{"quote":"Mula sa paglalaba para sa iba, ngayon may-ari na ako ng sariling laundry shop.","author":"Emma Salvacion","role":"Laundry Shop Owner"},{"quote":"Tinuruan ako ng cooperative paano mag-ipon at mag-manage ng pera.","author":"Luzviminda Dalisay","role":"Home Baker & Caterer"},{"quote":"Dati takot akong mangutang. Ngayon, alam ko na ang aking karapatan at responsibilidad.","author":"Teresa Javelosa","role":"Ukay-Ukay Vendor"}]}'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'iloilo');

INSERT INTO tenants (name, slug, tenant_group_id, brand_color, accent_color, region, is_active, entitlement_status, metadata)
SELECT 'Davao City Cooperative',      'davao',   (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_MS'), '#0891b2', '#22d3ee', 'Mindanao', 1, 'active',
 '{"mission":"Itaguyod ang mga mangingisda at magsasaka sa Davao Region sa pamamagitan ng access sa puhunan, makabagong kagamitan, at direktang merkado.","vision":"Isang Davao kung saan ang sektor ng agrikultura at pangingisda ay yumayabong — may sapat na kita at modernong teknolohiya.","category":"Fisherfolk & Farmers Cooperative","heroHeadline":"Mula sa Dagat at Lupa, Tungo sa Kaunlaran","heroSubheadline":"Bawat hirap ay may katumbas na tagumpay.","official_email":"davao@agapay.coop","phone":"(082) 224-3456","address":"Bankerohan Public Market Compound, Brgy. 5-A, Davao City 8000","values":[{"icon":"fa-droplet","label":"Dignidad"},{"icon":"fa-hand-holding-heart","label":"Pagtinabangay"},{"icon":"fa-truck-ramp-box","label":"Kalamidad"}],"testimonials":[{"quote":"Ang cooperative ang nagbigay sa amin ng bangka at lambat. Dumoble ang huli ko.","author":"Mang Ben Tampus","role":"Fisherfolk, Island Garden City of Samal"},{"quote":"Dahil sa cooperative, nakabili ako ng mas maayos na sakahan at patubig.","author":"Rolando Katipunan","role":"Rice & Corn Farmer"},{"quote":"Kaya naming magproseso ng sarili naming mangga at saging para ibenta sa mall.","author":"Lorna Ayson","role":"Fruit Processor & Vendor"}]}'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'davao');

INSERT INTO tenants (name, slug, tenant_group_id, brand_color, accent_color, region, is_active, entitlement_status, metadata)
SELECT 'Manila Cooperative',          'manila',  (SELECT group_id FROM tenant_groups WHERE reg_code = 'AGP_NCR'), '#ea580c', '#fb923c', 'NCR', 1, 'active',
 '{"mission":"Bigyan ng pagkakataon ang mga urban poor, informal settlers, at maliliit na negosyante sa Maynila na makaahon sa kahirapan sa pamamagitan ng microfinance na may puso.","vision":"Isang Maynila kung saan ang bawat pamilya sa urban poor community ay may matatag na kabuhayan, disenteng tirahan, at pag-asa.","category":"Urban Poor Cooperative","heroHeadline":"Sa Puso ng Maynila, Nagbabayanihan Tayo","heroSubheadline":"Bawat pamilyang Pilipino ay may karapatan sa maunlad na kinabukasan.","official_email":"manila@agapay.coop","phone":"(02) 8523-4567","address":"2266 Baseco Compound, Brgy. 649, Port Area, Manila 1018","values":[{"icon":"fa-hand-holding-hand","label":"Bayanihan"},{"icon":"fa-shield","label":"Tatag"},{"icon":"fa-sun","label":"Pag-asa"}],"testimonials":[{"quote":"Maliit na sari-sari store lang ang simula ko. Ngayon apat na tindahan na.","author":"Aling Nena Santos","role":"Sari-Sari Store Chain Owner"},{"quote":"Akala ko hindi na ako makakaahon sa utang. Pero tinulungan ako ng cooperative.","author":"Boy Ramirez","role":"Tricycle Driver"},{"quote":"Ang cooperative ay hindi lang nagpapahiram ng pera. Tinuturuan ka nila.","author":"Cecilia Dimagiba","role":"Carinderia Owner"}]}'
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'manila');

-- Update Malolos metadata if it already existed from previous seed
UPDATE tenants SET
  brand_color = '#2563eb',
  region      = 'Central Luzon',
  metadata    = '{"mission":"Magbigay ng accessible at abot-kayang serbisyong pinansyal sa bawat Malolenyo.","vision":"Isang malaya at maunlad na pamayanan ng Malolos.","category":"Multipurpose Cooperative","heroHeadline":"Ang Agapay ng Bawat Malolenyo","heroSubheadline":"Sama-sama sa pag-unlad, walang naiiwan.","official_email":"malolos@agapay.coop","phone":"(044) 791-2345","address":"2F Malolos Public Market Bldg., Brgy. San Vicente, Malolos City, Bulacan 3000"}'
WHERE slug = 'malolos' AND (metadata IS NULL OR metadata = '{}' OR JSON_EXTRACT(metadata, '$.mission') IS NULL);

-- Default subscription assignments
INSERT IGNORE INTO tenant_subscriptions (tenant_id, plan_id, billing_cycle, status, activated_modules)
SELECT t.tenant_id, p.plan_id, 'monthly', 'active',
  CASE
    WHEN t.slug IN ('malolos', 'cebu', 'davao') THEN '["loan_management","savings_accounts","basic_reports","member_management","mobile_access","messaging","guarantor_system","trust_scoring","compassion_actions"]'
    ELSE '["loan_management","savings_accounts","basic_reports","member_management","mobile_access"]'
  END
FROM tenants t
CROSS JOIN subscription_plans p
WHERE p.tier_name = 'Pro'
  AND t.slug IN ('malolos', 'baguio', 'cebu', 'iloilo', 'davao', 'manila')
  AND NOT EXISTS (SELECT 1 FROM tenant_subscriptions ts WHERE ts.tenant_id = t.tenant_id);

-- Sample loan products (for Malolos)
INSERT IGNORE INTO loan_products (name, description, min_amount, max_amount, interest_rate_percent, max_term_months, tenant_id, allowed_frequencies)
SELECT 'Micro Enterprise Loan',   'For small business capital needs',        5000.00,  50000.00,  5.00,  12, tenant_id, '["monthly"]'
FROM tenants WHERE slug = 'malolos';
INSERT IGNORE INTO loan_products (name, description, min_amount, max_amount, interest_rate_percent, max_term_months, tenant_id, allowed_frequencies)
SELECT 'Agri Loan',               'For farmers and agricultural workers',    3000.00,  30000.00,  4.50,  6,  tenant_id, '["monthly","quarterly"]'
FROM tenants WHERE slug = 'malolos';
INSERT IGNORE INTO loan_products (name, description, min_amount, max_amount, interest_rate_percent, max_term_months, tenant_id, allowed_frequencies)
SELECT 'Emergency Loan',          'Quick relief for urgent needs',           1000.00,  10000.00,  3.00,  3,  tenant_id, '["monthly"]'
FROM tenants WHERE slug = 'malolos';
INSERT IGNORE INTO loan_products (name, description, min_amount, max_amount, interest_rate_percent, max_term_months, tenant_id, allowed_frequencies)
SELECT 'Education Loan',          'Support for tuition and school needs',     5000.00,  40000.00,  4.00,  24, tenant_id, '["monthly"]'
FROM tenants WHERE slug = 'malolos';
INSERT IGNORE INTO loan_products (name, description, min_amount, max_amount, interest_rate_percent, max_term_months, tenant_id, allowed_frequencies)
SELECT 'Housing Improvement Loan','For home repairs and improvements',       10000.00, 100000.00,  6.00,  36, tenant_id, '["monthly"]'
FROM tenants WHERE slug = 'malolos';

-- Pre-seed: global ledger accounts
INSERT IGNORE INTO ledger_accounts (account_name, account_code, account_type, tenant_id, is_active) VALUES
('Cash & Cash Equivalents', 'CASH_EQUIVALENTS', 'ASSET', NULL, 1),
('Member Savings', 'MEMBER_SAVINGS', 'LIABILITY', NULL, 1),
('Loan Receivables', 'LOAN_RECEIVABLES', 'ASSET', NULL, 1),
('Interest Income', 'INTEREST_INCOME', 'REVENUE', NULL, 1),
('Operating Expenses', 'OPERATING_EXPENSES', 'EXPENSE', NULL, 1),
('Reconciliation Discrepancy', 'RECONC_DISCREPANCY', 'EXPENSE', NULL, 1),
('Processing Fees', 'PROCESSING_FEES', 'REVENUE', NULL, 1),
('Provision for Doubtful Accounts', 'PROVISION_DOUBTFUL', 'EXPENSE', NULL, 1);

SET FOREIGN_KEY_CHECKS = 1;
