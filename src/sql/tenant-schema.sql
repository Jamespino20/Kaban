-- ============================================================
-- Agapay Per-Tenant Schema Blueprint
-- Run against: CREATE DATABASE agapay_{slug}; USE agapay_{slug};
-- Contains ONLY tenant-specific tables (no platform shared tables)
-- ============================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  member_code VARCHAR(20) NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin','operator','member') DEFAULT 'member',
  status ENUM('pending','active','suspended','inactive','deactivated') DEFAULT 'pending',
  interest_tier ENUM('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') DEFAULT 'T1_5_PERCENT',
  is_deactivation_locked TINYINT(1) DEFAULT 0,
  deleted_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  consent_accepted_at DATETIME NULL,
  consent_version VARCHAR(20) NULL,
  trust_score INT DEFAULT 0,
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_username (username),
  UNIQUE KEY uq_member_code (member_code),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  tenant_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NULL,
  birthdate DATE NULL,
  address TEXT NULL,
  business_name VARCHAR(150) NULL,
  marital_status VARCHAR(30) DEFAULT NULL,
  occupation VARCHAR(150) NULL,
  place_of_birth VARCHAR(150) NULL,
  tin VARCHAR(20) NULL,
  region VARCHAR(255) NULL,
  province VARCHAR(255) NULL,
  city VARCHAR(255) NULL,
  barangay VARCHAR(255) NULL,
  income_range VARCHAR(50) NULL,
  savings DECIMAL(15,2) NULL,
  photo_url TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. User Documents
CREATE TABLE IF NOT EXISTS user_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  document_type ENUM('valid_id','proof_of_billing','residency_cert','brgy_cert','business_permit') NOT NULL,
  id_type_name VARCHAR(100) NULL,
  file_url TEXT NOT NULL,
  verification_status ENUM('pending','verified','rejected') DEFAULT 'pending',
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Two-Factor Auth
CREATE TABLE IF NOT EXISTS two_factor_auth (
  tfa_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  totp_secret VARCHAR(255) NOT NULL,
  is_enabled TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Verification Tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token_type ENUM('verification','two_factor','password_reset') NOT NULL,
  email VARCHAR(150) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires DATETIME NOT NULL,
  tenant_id INT NULL,
  used TINYINT(1) DEFAULT 0,
  INDEX idx_token_type (token_type),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Loan Products
CREATE TABLE IF NOT EXISTS loan_products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  interest_rate_percent DECIMAL(5,2) NOT NULL,
  max_term_months INT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  tenant_id INT NOT NULL,
  allowed_frequencies JSON NULL,
  guarantor_liability_rate DECIMAL(5,2) DEFAULT 25.00,
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Loans
CREATE TABLE IF NOT EXISTS loans (
  loan_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  loan_reference VARCHAR(50) NOT NULL UNIQUE,
  principal_amount DECIMAL(15,2) NOT NULL,
  purpose TEXT NOT NULL,
  term_months INT NOT NULL,
  interest_applied DECIMAL(15,2) NOT NULL,
  principal_receivable DECIMAL(15,2) DEFAULT 0.00,
  interest_receivable DECIMAL(15,2) DEFAULT 0.00,
  fees_applied DECIMAL(15,2) DEFAULT 0.00,
  total_payable DECIMAL(15,2) NOT NULL,
  balance_remaining DECIMAL(15,2) NOT NULL,
  status ENUM('pending','approved','active','paid','defaulted','rejected') DEFAULT 'pending',
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL,
  approved_by INT NULL,
  paid_at DATETIME NULL,
  total_paid DECIMAL(15,2) DEFAULT 0.00,
  total_interest_paid DECIMAL(15,2) DEFAULT 0.00,
  repayment_frequency VARCHAR(20) DEFAULT 'monthly',
  recovery_parent_loan_id INT NULL,
  is_recovery_loan TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES loan_products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Loan Schedules
CREATE TABLE IF NOT EXISTS loan_schedules (
  schedule_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  tenant_id INT NOT NULL,
  installment_number INT NOT NULL,
  due_date DATE NOT NULL,
  principal_amount DECIMAL(15,2) NOT NULL,
  interest_amount DECIMAL(15,2) NOT NULL,
  total_due DECIMAL(15,2) NOT NULL,
  status ENUM('pending','paid','overdue') DEFAULT 'pending',
  paid_at DATETIME NULL,
  days_late INT DEFAULT 0,
  penalty_applied DECIMAL(15,2) DEFAULT 0.00,
  amount_paid DECIMAL(15,2) DEFAULT 0.00,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  INDEX idx_loan_status (loan_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
  method_id INT AUTO_INCREMENT PRIMARY KEY,
  provider_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(100) NULL,
  is_active TINYINT(1) DEFAULT 1,
  tenant_id INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Payments
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  tenant_id INT NOT NULL,
  method_id INT NOT NULL,
  payment_reference VARCHAR(100) NOT NULL UNIQUE,
  amount_paid DECIMAL(15,2) NOT NULL,
  receipt_url VARCHAR(255) NULL,
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME NULL,
  verified_by INT NULL,
  notes TEXT NULL,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (method_id) REFERENCES payment_methods(method_id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_payment_ref (payment_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Savings Accounts
CREATE TABLE IF NOT EXISTS savings_accounts (
  account_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  account_type ENUM('share_capital','regular_savings','personal_wallet') NOT NULL DEFAULT 'regular_savings',
  owner_role ENUM('superadmin','operator','member') NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  is_locked TINYINT(1) DEFAULT 0,
  lock_reason VARCHAR(255) NULL,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_type (user_id, account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Savings Transactions
CREATE TABLE IF NOT EXISTS savings_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  account_id INT NOT NULL,
  tenant_id INT NOT NULL,
  transaction_type ENUM('deposit','withdrawal','dividend','fee','default_recovery_debit','default_recovery_credit') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  fee_amount DECIMAL(15,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NULL,
  status ENUM('pending','verified','rejected') DEFAULT 'verified',
  method_label VARCHAR(80) NULL,
  external_reference VARCHAR(120) NULL,
  reference VARCHAR(100) NULL,
  reconciliation_reference VARCHAR(120) NULL,
  ledger_transaction_id VARCHAR(255) NULL,
  issue_status VARCHAR(50) DEFAULT 'none',
  issue_reported_at DATETIME NULL,
  issue_notes TEXT NULL,
  processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_by INT NULL,
  FOREIGN KEY (account_id) REFERENCES savings_accounts(account_id) ON DELETE CASCADE,
  FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_account_status (account_id, status, processed_at),
  INDEX idx_reconciliation_ref (reconciliation_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Ledger Accounts
CREATE TABLE IF NOT EXISTS ledger_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  type ENUM('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL DEFAULT 'ASSET',
  tenant_id INT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Business Ledger
CREATE TABLE IF NOT EXISTS business_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id VARCHAR(50) NOT NULL DEFAULT '',
  account_id INT NOT NULL,
  tenant_id INT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0.00,
  credit DECIMAL(15,2) DEFAULT 0.00,
  description TEXT NOT NULL,
  source_module VARCHAR(80) NULL,
  source_reference VARCHAR(120) NULL,
  reconciliation_reference VARCHAR(120) NULL,
  reconciled_at DATETIME NULL,
  is_reversal TINYINT(1) DEFAULT 0,
  reversed_entry_id INT NULL,
  ledger_hash VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  loan_id INT NULL,
  metadata JSON NULL,
  FOREIGN KEY (account_id) REFERENCES ledger_accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE SET NULL,
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_reconciliation_ref (reconciliation_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id INT NOT NULL,
  type ENUM('direct','operator_room','group_chat') NOT NULL DEFAULT 'direct',
  title VARCHAR(150) NULL,
  slug VARCHAR(100) NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_type_slug (type, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Messages
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  is_broadcast TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  conversation_id VARCHAR(25) NOT NULL,
  reply_to_id VARCHAR(25) NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL,
  INDEX idx_conversation_created (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17-19. Message Attachments, Reactions, Participants
CREATE TABLE IF NOT EXISTS message_attachments (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  message_id VARCHAR(25) NOT NULL,
  tenant_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  INDEX idx_message_created (message_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS message_reactions (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  message_id VARCHAR(25) NOT NULL,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  emoji VARCHAR(24) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_msg_user_emoji (message_id, user_id, emoji)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conversation_participants (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  conversation_id VARCHAR(25) NOT NULL,
  user_id INT NOT NULL,
  tenant_id INT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_read_at DATETIME NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY uq_conv_user (conversation_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id INT NULL,
  user_id INT NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  action_url VARCHAR(255) NULL,
  channel ENUM('in_app','email','both') DEFAULT 'in_app',
  is_read TINYINT(1) DEFAULT 0,
  emailed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_read_created (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  user_id INT NULL,
  actor_role ENUM('superadmin','operator','member') NULL,
  actor_label VARCHAR(150) NULL,
  module VARCHAR(20) DEFAULT 'system',
  action VARCHAR(100) NOT NULL,
  action_category VARCHAR(20) DEFAULT 'other',
  severity ENUM('debug','info','warning','critical') DEFAULT 'info',
  entity_type VARCHAR(80) NOT NULL,
  entity_id INT NULL,
  entity_ref VARCHAR(120) NULL,
  request_id VARCHAR(120) NULL,
  session_id VARCHAR(120) NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  changed_fields JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  route_action VARCHAR(255) NULL,
  http_method VARCHAR(12) NULL,
  city VARCHAR(100) NULL,
  region VARCHAR(100) NULL,
  is_cross_tenant_visible TINYINT(1) DEFAULT 0,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Mentorship
CREATE TABLE IF NOT EXISTS mentorship_connections (
  id VARCHAR(25) NOT NULL PRIMARY KEY,
  tenant_id INT NOT NULL,
  requester_id INT NOT NULL,
  mentor_id INT NOT NULL,
  endorsed_by INT NULL,
  status ENUM('pending_endorsement','endorsed','rejected') DEFAULT 'pending_endorsement',
  focus_area VARCHAR(150) NULL,
  notes TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  endorsed_at DATETIME NULL,
  FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (endorsed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  UNIQUE KEY uq_requester_mentor (requester_id, mentor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  tenant_id INT NULL,
  requester_id INT NULL,
  feedback_entry_id INT NULL,
  category VARCHAR(30) NOT NULL,
  module_context VARCHAR(20) DEFAULT 'general',
  status ENUM('open','in_review','waiting_on_member','waiting_on_admin','resolved','closed','escalated') DEFAULT 'open',
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  related_entity_type VARCHAR(80) NULL,
  related_entity_id VARCHAR(120) NULL,
  wallet_transaction_id INT NULL,
  loan_id INT NULL,
  payment_id INT NULL,
  topup_request_id INT NULL,
  assigned_to INT NULL,
  assigned_at DATETIME NULL,
  first_response_at DATETIME NULL,
  resolved_by INT NULL,
  resolved_at DATETIME NULL,
  closed_at DATETIME NULL,
  resolution_summary TEXT NULL,
  escalation_level INT DEFAULT 0,
  audit_log_id INT NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_requester_created (requester_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. Feedback
CREATE TABLE IF NOT EXISTS feedback_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  user_id INT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NULL,
  category VARCHAR(100) NOT NULL,
  feedback_type VARCHAR(20) DEFAULT 'general',
  module_context VARCHAR(20) DEFAULT 'general',
  page_path VARCHAR(255) NULL,
  subject VARCHAR(255) NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  assigned_to INT NULL,
  assigned_at DATETIME NULL,
  resolved_by INT NULL,
  resolved_at DATETIME NULL,
  resolution_notes TEXT NULL,
  audit_log_id INT NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25-26. Homepage Content
CREATE TABLE IF NOT EXISTS homepage_faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  workflow_status VARCHAR(50) DEFAULT 'published',
  review_notes TEXT NULL,
  submitted_by_user_id INT NULL,
  reviewed_by_user_id INT NULL,
  FOREIGN KEY (submitted_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS homepage_testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  name VARCHAR(150) NOT NULL,
  role_label VARCHAR(150) NOT NULL,
  photo_url VARCHAR(255) NULL,
  content TEXT NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  workflow_status VARCHAR(50) DEFAULT 'published',
  review_notes TEXT NULL,
  submitted_by_user_id INT NULL,
  reviewed_by_user_id INT NULL,
  FOREIGN KEY (submitted_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 27. Loan Guarantees
CREATE TABLE IF NOT EXISTS loan_guarantees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  tenant_id INT NOT NULL,
  guarantor_id INT NOT NULL,
  status ENUM('pending','vouched','rejected','voided','charged') DEFAULT 'pending',
  liability_percentage DECIMAL(5,2) DEFAULT 25.00,
  liability_amount DECIMAL(15,2) NULL,
  charged_amount DECIMAL(15,2) DEFAULT 0.00,
  charge_reason VARCHAR(255) NULL,
  vouched_at DATETIME NULL,
  soft_freeze_at DATETIME NULL,
  hard_freeze_at DATETIME NULL,
  default_triggered_at DATETIME NULL,
  charged_at DATETIME NULL,
  revoked_at DATETIME NULL,
  reassigned_to_guarantee_id INT NULL,
  audit_log_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (guarantor_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_loan_status (loan_id, status),
  INDEX idx_guarantor_status (guarantor_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 28. Compassion Actions
CREATE TABLE IF NOT EXISTS compassion_actions (
  action_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  tenant_id INT NOT NULL,
  action_type ENUM('grace_period','term_extension','penalty_freeze') NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  requested_by INT NOT NULL,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  effective_at DATETIME NULL,
  expires_at DATETIME NULL,
  grace_period_days INT NULL,
  restructured_term_months INT NULL,
  restructured_payment_amount DECIMAL(15,2) NULL,
  penalty_waived_amount DECIMAL(15,2) DEFAULT 0.00,
  penalties_frozen_until DATETIME NULL,
  freeze_status ENUM('none','active','expired','lifted') DEFAULT 'none',
  reminder_state ENUM('not_started','scheduled','sent','completed','cancelled') DEFAULT 'not_started',
  reminder_sent_at DATETIME NULL,
  restructuring_offer_status ENUM('not_offered','offered','accepted','rejected','expired') DEFAULT 'not_offered',
  restructuring_offer_at DATETIME NULL,
  final_write_off_at DATETIME NULL,
  write_off_amount DECIMAL(15,2) NULL,
  guarantor_charge_status ENUM('not_applicable','pending','charged','waived') DEFAULT 'not_applicable',
  guarantor_charged_at DATETIME NULL,
  trust_score_impact_points INT DEFAULT 0,
  trust_score_impact_reason VARCHAR(255) NULL,
  audit_log_id INT NULL,
  admin_notes TEXT NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_loan_status (loan_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 29. Daily Reconciliations
CREATE TABLE IF NOT EXISTS daily_reconciliations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  business_date DATE NOT NULL,
  status ENUM('draft','blocked','pending_approval','signed_off','adjusted','rejected','reopened') DEFAULT 'draft',
  total_disbursed DECIMAL(15,2) DEFAULT 0.00,
  disbursed_count INT DEFAULT 0,
  total_collected DECIMAL(15,2) DEFAULT 0.00,
  collected_count INT DEFAULT 0,
  total_ledger_debits DECIMAL(15,2) DEFAULT 0.00,
  total_ledger_credits DECIMAL(15,2) DEFAULT 0.00,
  is_ledger_balanced TINYINT(1) DEFAULT 0,
  total_tenant_savings DECIMAL(15,2) DEFAULT 0.00,
  total_treasury_balance DECIMAL(15,2) DEFAULT 0.00,
  imbalance_amount DECIMAL(15,2) DEFAULT 0.00,
  has_discrepancy TINYINT(1) DEFAULT 0,
  signoff_blocked TINYINT(1) DEFAULT 0,
  block_reason TEXT NULL,
  reconciliation_reference VARCHAR(120) NOT NULL UNIQUE,
  imbalance_investigation_id INT NULL,
  resolution_action ENUM('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') NULL,
  resolution_reference VARCHAR(120) NULL,
  adjustment_ledger_transaction_id VARCHAR(255) NULL,
  audit_log_id INT NULL,
  prepared_by INT NULL,
  prepared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  signed_off_by INT NULL,
  signed_off_at DATETIME NULL,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  approval_notes TEXT NULL,
  notes TEXT NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_business_date (business_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 30-31. Logs
CREATE TABLE IF NOT EXISTS traffic_logs (
  id VARCHAR(25) NOT NULL PRIMARY KEY DEFAULT (SUBSTRING(MD5(CONCAT(RAND(), UUID())) FROM 1 FOR 25)),
  tenant_id INT NULL,
  path_action VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS interaction_logs (
  id VARCHAR(25) NOT NULL PRIMARY KEY DEFAULT (SUBSTRING(MD5(CONCAT(RAND(), UUID())) FROM 1 FOR 25)),
  tenant_id INT NULL,
  user_id INT NULL,
  event_type VARCHAR(100) NOT NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 32. Decommissioned Backups
CREATE TABLE IF NOT EXISTS decommissioned_backups (
  id VARCHAR(25) NOT NULL PRIMARY KEY DEFAULT (SUBSTRING(MD5(CONCAT(RAND(), UUID())) FROM 1 FOR 25)),
  tenant_id INT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  snapshot_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  snapshot_content TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 33. Tenant Applications
CREATE TABLE IF NOT EXISTS tenant_applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_name VARCHAR(100) NOT NULL,
  tenant_slug VARCHAR(50) NOT NULL UNIQUE,
  applicant_name VARCHAR(150) NULL,
  applicant_email VARCHAR(150) NOT NULL,
  applicant_phone VARCHAR(20) NULL,
  estimated_members INT DEFAULT 100,
  tenant_group_id INT NULL,
  brand_color VARCHAR(20) NULL,
  accent_color VARCHAR(20) NULL,
  logo_url TEXT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  submitted_by INT NOT NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL,
  documents JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 34. Top-Up Requests
CREATE TABLE IF NOT EXISTS topup_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  request_type ENUM('deposit','withdrawal') DEFAULT 'deposit',
  amount DECIMAL(15,2) NOT NULL,
  fee_amount DECIMAL(15,2) DEFAULT 0.00,
  net_amount DECIMAL(15,2) NULL,
  method_label VARCHAR(80) NULL,
  external_reference VARCHAR(120) NULL,
  status ENUM('pending','verified','rejected') DEFAULT 'pending',
  receipt_url VARCHAR(255) NULL,
  issue_status VARCHAR(50) DEFAULT 'none',
  issue_notes TEXT NULL,
  admin_notes TEXT NULL,
  reconciliation_reference VARCHAR(120) NULL,
  ledger_transaction_id VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  processed_by INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_type_created (user_id, request_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 35. Tenant Subscriptions
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL UNIQUE,
  plan_id INT NOT NULL,
  billing_cycle ENUM('monthly','annually') DEFAULT 'monthly',
  status VARCHAR(20) DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_date DATETIME NULL,
  activated_modules JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 36. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  category VARCHAR(20) NOT NULL,
  slug VARCHAR(80) NOT NULL,
  subject_action VARCHAR(255) NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NULL,
  variables JSON NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 37-38. Reports
CREATE TABLE IF NOT EXISTS report_definitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  created_by INT NOT NULL,
  name_report VARCHAR(150) NOT NULL,
  report_type VARCHAR(25) NOT NULL,
  report_format ENUM('csv','pdf','json') DEFAULT 'csv',
  filters JSON NULL,
  is_scheduled TINYINT(1) DEFAULT 0,
  schedule_freq VARCHAR(10) NULL,
  schedule_day INT NULL,
  next_run_at DATETIME NULL,
  recipients JSON NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS generated_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  definition_id INT NULL,
  tenant_id INT NULL,
  requested_by INT NULL,
  report_type VARCHAR(25) NOT NULL,
  report_format ENUM('csv','pdf','json') NOT NULL,
  status ENUM('queued','processing','ready','failed','expired') DEFAULT 'queued',
  file_url VARCHAR(512) NULL,
  file_size_bytes INT NULL,
  row_count INT NULL,
  error_message TEXT NULL,
  period_start DATETIME NULL,
  period_end DATETIME NULL,
  dispatched_at DATETIME NULL,
  dispatch_recipients JSON NULL,
  dispatch_status VARCHAR(50) NULL,
  expires_at DATETIME NULL,
  audit_log_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (definition_id) REFERENCES report_definitions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 39. Receipts
CREATE TABLE IF NOT EXISTS receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NULL,
  receipt_number VARCHAR(60) NOT NULL UNIQUE,
  receipt_type VARCHAR(20) NOT NULL,
  status ENUM('generated','voided','reissued') DEFAULT 'generated',
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PHP',
  description TEXT NULL,
  savings_transaction_id INT NULL,
  loan_id INT NULL,
  payment_id INT NULL,
  topup_request_id INT NULL,
  file_url VARCHAR(512) NULL,
  voided_by INT NULL,
  voided_at DATETIME NULL,
  void_reason TEXT NULL,
  reissued_receipt_id INT NULL,
  audit_log_id INT NULL,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_issued (user_id, issued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 40-42. Backups
CREATE TABLE IF NOT EXISTS backup_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  frequency VARCHAR(10) NOT NULL,
  retention_days INT DEFAULT 30,
  last_run_at DATETIME NULL,
  next_run_at DATETIME NULL,
  storage_path VARCHAR(512) NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_next_run (next_run_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS backup_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  schedule_id INT NULL,
  status ENUM('scheduled','running','completed','failed','expired') DEFAULT 'scheduled',
  storage_path VARCHAR(512) NULL,
  file_size_bytes BIGINT NULL,
  checksum VARCHAR(128) NULL,
  affected_schemas JSON NULL,
  error_message TEXT NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES backup_schedules(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS restore_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  backup_id INT NOT NULL,
  requested_by INT NOT NULL,
  status ENUM('requested','validating','restoring','completed','failed','cancelled') DEFAULT 'requested',
  target_schemas JSON NULL,
  notes TEXT NULL,
  error_message TEXT NULL,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  audit_log_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (backup_id) REFERENCES backup_records(id) ON DELETE CASCADE,
  INDEX idx_backup_id (backup_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 43-49. Social, Trust, Vouch
CREATE TABLE IF NOT EXISTS social_vouches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  voucher_id INT NOT NULL,
  vouchee_id INT NOT NULL,
  requester_id INT NULL,
  relationship_type ENUM('peer','family','business_partner','guarantor','mentor','admin_observed') DEFAULT 'peer',
  score INT DEFAULT 5,
  score_scale INT DEFAULT 10,
  score_base INT DEFAULT 10,
  status ENUM('active','revoked','expired','disputed') DEFAULT 'active',
  discount_eligibility_state VARCHAR(18) DEFAULT 'not_evaluated',
  discount_eligible TINYINT(1) DEFAULT 0,
  trust_network_visibility VARCHAR(20) DEFAULT 'tenant_network',
  visibility_metadata JSON NULL,
  comment TEXT NULL,
  expires_at DATETIME NULL,
  revoked_at DATETIME NULL,
  audit_log_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (voucher_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (vouchee_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vouch_score_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  user_id INT NOT NULL,
  average_score DECIMAL(5,2) NOT NULL,
  score_scale INT DEFAULT 10,
  score_base INT DEFAULT 10,
  vouch_count INT DEFAULT 0,
  active_vouch_count INT DEFAULT 0,
  discount_eligibility_state VARCHAR(18) DEFAULT 'not_evaluated',
  discount_eligible TINYINT(1) DEFAULT 0,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenant_trust_policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL UNIQUE,
  payment_weight DECIMAL(5,2) DEFAULT 40.00,
  business_weight DECIMAL(5,2) DEFAULT 20.00,
  peer_weight DECIMAL(5,2) DEFAULT 20.00,
  guarantor_weight DECIMAL(5,2) DEFAULT 20.00,
  minimum_voting_quota INT DEFAULT 3,
  randomized_sample_size INT DEFAULT 10,
  missed_vote_lockout_days INT DEFAULT 7,
  low_rating_threshold INT DEFAULT 55,
  tier_review_day INT DEFAULT 1,
  is_active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trust_rating_periods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status ENUM('planned','active','closed','cancelled') DEFAULT 'planned',
  minimum_voting_quota INT DEFAULT 3,
  randomized_sample_size INT DEFAULT 10,
  generated_at DATETIME NULL,
  closed_at DATETIME NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_period (period_start, period_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trust_rating_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  period_id INT NOT NULL,
  rater_id INT NOT NULL,
  ratee_id INT NOT NULL,
  rating_source_role ENUM('superadmin','operator','member') NOT NULL,
  status ENUM('assigned','completed','missed','excused','locked_out') DEFAULT 'assigned',
  score INT NULL,
  comment TEXT NULL,
  sampled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_at DATETIME NULL,
  completed_at DATETIME NULL,
  missed_at DATETIME NULL,
  lockout_until DATETIME NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (period_id) REFERENCES trust_rating_periods(id) ON DELETE CASCADE,
  UNIQUE KEY uq_period_rater_ratee_role (period_id, rater_id, ratee_id, rating_source_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trust_score_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  period_id INT NULL,
  score INT NOT NULL,
  payment_score INT NOT NULL,
  business_score INT NOT NULL,
  peer_score INT NOT NULL,
  guarantor_score INT NOT NULL,
  payment_weight DECIMAL(5,2) NOT NULL,
  business_weight DECIMAL(5,2) NOT NULL,
  peer_weight DECIMAL(5,2) NOT NULL,
  guarantor_weight DECIMAL(5,2) NOT NULL,
  tier_before VARCHAR(20) NULL,
  tier_after VARCHAR(20) NOT NULL,
  low_rating_action_state VARCHAR(18) DEFAULT 'none',
  low_rating_reason VARCHAR(255) NULL,
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL,
  FOREIGN KEY (period_id) REFERENCES trust_rating_periods(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS trust_tier_audits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  user_id INT NOT NULL,
  snapshot_id INT NULL,
  previous_tier VARCHAR(20) NULL,
  new_tier VARCHAR(20) NOT NULL,
  score INT NOT NULL,
  change_reason VARCHAR(255) NOT NULL,
  changed_by INT NULL,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON NULL,
  FOREIGN KEY (snapshot_id) REFERENCES trust_score_snapshots(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 50. Interest Audit
CREATE TABLE IF NOT EXISTS interest_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL UNIQUE,
  tenant_id INT NOT NULL,
  formula_snapshot JSON NOT NULL,
  rate_applied DECIMAL(5,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 51. Imbalance Investigations
CREATE TABLE IF NOT EXISTS imbalance_investigations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  source_module VARCHAR(30) NOT NULL,
  source_entity_type VARCHAR(80) NULL,
  source_entity_id VARCHAR(120) NULL,
  expected_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) NOT NULL,
  difference_amount DECIMAL(15,2) NOT NULL,
  status ENUM('detected','assigned','investigating','awaiting_approval','resolved','dismissed') DEFAULT 'detected',
  priority VARCHAR(30) DEFAULT 'normal',
  reconciliation_reference VARCHAR(120) NULL,
  related_ledger_transaction_id VARCHAR(255) NULL,
  related_wallet_transaction_id INT NULL,
  related_topup_request_id INT NULL,
  related_loan_id INT NULL,
  related_payment_id INT NULL,
  assigned_to INT NULL,
  assigned_at DATETIME NULL,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  investigated_at DATETIME NULL,
  resolved_at DATETIME NULL,
  resolved_by INT NULL,
  resolution_action ENUM('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') NULL,
  adjustment_ledger_transaction_id VARCHAR(255) NULL,
  adjustment_savings_transaction_id INT NULL,
  audit_log_id INT NULL,
  notes TEXT NULL,
  resolution_notes TEXT NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_source_entity (source_module, source_entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 52-53. Fraud & AI
CREATE TABLE IF NOT EXISTS fraud_signals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NULL,
  signal_type VARCHAR(30) NOT NULL,
  status VARCHAR(18) DEFAULT 'detected',
  severity ENUM('debug','info','warning','critical') DEFAULT 'warning',
  linked_user_id INT NULL,
  linked_loan_id INT NULL,
  linked_payment_id INT NULL,
  linked_topup_id INT NULL,
  duplicate_user_id INT NULL,
  risk_score INT NULL,
  threshold_breached VARCHAR(120) NULL,
  signal_metadata JSON NULL,
  assigned_to INT NULL,
  assigned_at DATETIME NULL,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  resolution_notes TEXT NULL,
  audit_log_id INT NULL,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_linked_user_status (linked_user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_snapshots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_id INT NULL,
  tenant_id INT NULL,
  use_case VARCHAR(25) NOT NULL,
  status ENUM('queued','processing','completed','failed','skipped') DEFAULT 'queued',
  input_summary JSON NULL,
  output_text TEXT NULL,
  risk_level VARCHAR(20) NULL,
  confidence_score DECIMAL(5,2) NULL,
  requires_review TINYINT(1) DEFAULT 0,
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  review_notes TEXT NULL,
  error_message TEXT NULL,
  processing_ms INT NULL,
  period_start DATETIME NULL,
  period_end DATETIME NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
