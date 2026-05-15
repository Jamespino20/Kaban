-- Agapay Database Dump (TiDB Serverless)
-- Generated: 2026-05-15T00:26:32.856Z

DROP TABLE IF EXISTS `ai_config`;
CREATE TABLE `ai_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `snapshot_prompts` json DEFAULT NULL,
  `risk_sensitivity` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `notification_settings` json DEFAULT NULL,
  `analysis_config` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `log_type` enum('AUDIT','TRAFFIC','INTERACTION') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AUDIT',
  `event_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `actor_role` enum('superadmin','operator','member') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actor_label` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `module` enum('tenant','identity','wallet','loan','repayment','guarantorship','compassion','trust','feedback','support','content','chat','reports','reconciliation','billing','system') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'system',
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_category` enum('create','update','delete','approve','reject','release','payment','status_change','signoff','login','security','export','system','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'other',
  `severity` enum('debug','info','warning','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `entity_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `entity_ref` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `session_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `changed_fields` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `route` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `http_method` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_cross_tenant_visible` tinyint(1) NOT NULL DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`log_id`) /*T![clustered_index] CLUSTERED */,
  KEY `audit_logs_tenant_id_module_created_at_idx` (`tenant_id`,`module`,`created_at`),
  KEY `audit_logs_user_id_created_at_idx` (`user_id`,`created_at`),
  KEY `audit_logs_entity_type_entity_id_idx` (`entity_type`,`entity_id`),
  KEY `audit_logs_entity_ref_idx` (`entity_ref`),
  KEY `audit_logs_action_category_severity_idx` (`action_category`,`severity`),
  KEY `audit_logs_request_id_idx` (`request_id`),
  KEY `audit_logs_session_id_idx` (`session_id`),
  KEY `audit_logs_is_cross_tenant_visible_created_at_idx` (`is_cross_tenant_visible`,`created_at`),
  CONSTRAINT `audit_logs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `auth_tokens`;
CREATE TABLE `auth_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL,
  `type` enum('VERIFICATION','TWO_FACTOR','PASSWORD_RESET') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `auth_tokens_token_key` (`token`),
  KEY `auth_tokens_tenant_id_email_type_idx` (`tenant_id`,`email`,`type`),
  UNIQUE KEY `auth_tokens_tenant_id_email_token_type_key` (`tenant_id`,`email`,`token`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `backup_records`;
CREATE TABLE `backup_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `schedule_id` int DEFAULT NULL,
  `status` enum('scheduled','running','completed','failed','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `storage_path` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` bigint DEFAULT NULL,
  `checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `affected_schemas` json DEFAULT NULL,
  `error_message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `backup_records_tenant_id_status_created_at_idx` (`tenant_id`,`status`,`created_at`),
  KEY `backup_records_schedule_id_idx` (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `backup_schedules`;
CREATE TABLE `backup_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `frequency` enum('daily','weekly','monthly','one_time') COLLATE utf8mb4_unicode_ci NOT NULL,
  `retention_days` int NOT NULL DEFAULT '30',
  `last_run_at` datetime(3) DEFAULT NULL,
  `next_run_at` datetime(3) DEFAULT NULL,
  `storage_path` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `backup_schedules_tenant_id_is_active_idx` (`tenant_id`,`is_active`),
  KEY `backup_schedules_next_run_at_idx` (`next_run_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `billing_invoices`;
CREATE TABLE `billing_invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `due_date` datetime(3) NOT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `payment_method` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `items` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `billing_invoices_invoice_number_key` (`invoice_number`),
  KEY `billing_invoices_tenant_id_status_idx` (`tenant_id`,`status`),
  KEY `billing_invoices_due_date_idx` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (1, 1, 'INV-MALOLOS-2026-001', '12001500.00', 'paid', 'Wed Jan 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'Thu Jan 15 2026 00:42:02 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object],[object Object]', 'Thu May 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (2, 1, 'INV-MALOLOS-2026-002', '1200.00', 'paid', 'Fri Feb 13 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'Sat Feb 14 2026 00:42:02 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:03 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:03 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (3, 1, 'INV-MALOLOS-2026-003', '1200.00', 'pending', 'Sun Mar 15 2026 23:42:02 GMT+0800 (Philippine Standard Time)', NULL, NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:03 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:03 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (4, 2, 'INV-SAN-JOSE-2026-001', '15001500.00', 'paid', 'Sat Mar 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Sun Mar 15 2026 00:42:18 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object],[object Object]', 'Thu May 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (5, 2, 'INV-SAN-JOSE-2026-002', '1500.00', 'paid', 'Mon Apr 13 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Tue Apr 14 2026 00:42:18 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (6, 2, 'INV-SAN-JOSE-2026-003', '1500.00', 'paid', 'Wed May 13 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 00:42:18 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:19 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:19 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (7, 3, 'INV-QC-VENDORS-2026-001', '20001500.00', 'paid', 'Sun Dec 14 2025 23:42:32 GMT+0800 (Philippine Standard Time)', 'Mon Dec 15 2025 00:42:32 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object],[object Object]', 'Thu May 14 2026 23:42:33 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:33 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (8, 3, 'INV-QC-VENDORS-2026-002', '2000.00', 'paid', 'Tue Jan 13 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'Wed Jan 14 2026 00:42:32 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:33 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:33 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (9, 3, 'INV-QC-VENDORS-2026-003', '2000.00', 'paid', 'Thu Feb 12 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'Fri Feb 13 2026 00:42:32 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:33 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:33 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (10, 4, 'INV-MAKATI-BUSINESS-2026-001', '12001500.00', 'paid', 'Sat Feb 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Sun Feb 15 2026 00:42:46 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object],[object Object]', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (11, 4, 'INV-MAKATI-BUSINESS-2026-002', '1200.00', 'paid', 'Mon Mar 16 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Tue Mar 17 2026 00:42:46 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (12, 4, 'INV-MAKATI-BUSINESS-2026-003', '1200.00', 'paid', 'Wed Apr 15 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Thu Apr 16 2026 00:42:46 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:42:47 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:47 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (13, 5, 'INV-CALAMBA-AGRI-2026-001', '15001500.00', 'paid', 'Wed Jan 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Thu Jan 15 2026 00:42:59 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object],[object Object]', 'Thu May 14 2026 23:43:00 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:00 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (14, 5, 'INV-CALAMBA-AGRI-2026-002', '1500.00', 'paid', 'Fri Feb 13 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Sat Feb 14 2026 00:42:59 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:43:00 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:00 GMT+0800 (Philippine Standard Time)');
INSERT INTO `billing_invoices` (`id`, `tenant_id`, `invoice_number`, `amount`, `status`, `due_date`, `paid_at`, `payment_method`, `reference`, `items`, `created_at`, `updated_at`) VALUES (15, 5, 'INV-CALAMBA-AGRI-2026-003', '1500.00', 'paid', 'Sun Mar 15 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Mon Mar 16 2026 00:42:59 GMT+0800 (Philippine Standard Time)', NULL, NULL, '[object Object]', 'Thu May 14 2026 23:43:00 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:00 GMT+0800 (Philippine Standard Time)');

DROP TABLE IF EXISTS `business_ledger`;
CREATE TABLE `business_ledger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT '0',
  `credit` decimal(15,2) NOT NULL DEFAULT '0',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_module` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reconciliation_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reconciled_at` datetime(3) DEFAULT NULL,
  `is_reversal` tinyint(1) NOT NULL DEFAULT '0',
  `reversed_entry_id` int DEFAULT NULL,
  `ledger_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_by` int DEFAULT NULL,
  `loan_id` int DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `business_ledger_tenant_id_idx` (`tenant_id`),
  KEY `business_ledger_transaction_id_idx` (`transaction_id`),
  KEY `business_ledger_source_module_source_reference_idx` (`source_module`,`source_reference`),
  KEY `business_ledger_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `business_ledger_reversed_entry_id_idx` (`reversed_entry_id`),
  KEY `business_ledger_account_id_fkey` (`account_id`),
  KEY `business_ledger_loan_id_fkey` (`loan_id`),
  CONSTRAINT `business_ledger_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `ledger_accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `business_ledger_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `business_ledger_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `compassion_actions`;
CREATE TABLE `compassion_actions` (
  `action_id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `action_type` enum('grace_period','term_extension','penalty_freeze') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `requested_by` int NOT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `effective_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `grace_period_days` int DEFAULT NULL,
  `restructured_term_months` int DEFAULT NULL,
  `restructured_payment_amount` decimal(15,2) DEFAULT NULL,
  `penalty_waived_amount` decimal(15,2) NOT NULL DEFAULT '0',
  `penalties_frozen_until` datetime(3) DEFAULT NULL,
  `freeze_status` enum('none','active','expired','lifted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `reminder_state` enum('not_started','scheduled','sent','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `reminder_sent_at` datetime(3) DEFAULT NULL,
  `restructuring_offer_status` enum('not_offered','offered','accepted','rejected','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_offered',
  `restructuring_offer_at` datetime(3) DEFAULT NULL,
  `final_write_off_at` datetime(3) DEFAULT NULL,
  `write_off_amount` decimal(15,2) DEFAULT NULL,
  `guarantor_charge_status` enum('not_applicable','pending','charged','waived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_applicable',
  `guarantor_charged_at` datetime(3) DEFAULT NULL,
  `trust_score_impact_points` int NOT NULL DEFAULT '0',
  `trust_score_impact_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `admin_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`action_id`) /*T![clustered_index] CLUSTERED */,
  KEY `compassion_actions_tenant_id_idx` (`tenant_id`),
  KEY `compassion_actions_loan_id_status_idx` (`loan_id`,`status`),
  KEY `compassion_actions_requested_by_status_idx` (`requested_by`,`status`),
  KEY `compassion_actions_approved_by_idx` (`approved_by`),
  KEY `compassion_actions_freeze_status_idx` (`freeze_status`),
  KEY `compassion_actions_reminder_state_idx` (`reminder_state`),
  KEY `compassion_actions_restructuring_offer_status_idx` (`restructuring_offer_status`),
  KEY `compassion_actions_guarantor_charge_status_idx` (`guarantor_charge_status`),
  KEY `compassion_actions_audit_log_id_idx` (`audit_log_id`),
  CONSTRAINT `compassion_actions_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `compassion_actions_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `compassion_actions_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `compassion_actions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `conversation_participants`;
CREATE TABLE `conversation_participants` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `joined_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `last_read_at` datetime(3) DEFAULT NULL,
  KEY `conversation_participants_tenant_id_idx` (`tenant_id`),
  KEY `conversation_participants_user_id_last_read_at_idx` (`user_id`,`last_read_at`),
  UNIQUE KEY `conversation_participants_conversation_id_user_id_key` (`conversation_id`,`user_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `conversation_participants_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversation_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversation_participants_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `type` enum('direct','operator_room','group_chat') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  KEY `conversations_tenant_id_type_updated_at_idx` (`tenant_id`,`type`,`updated_at`),
  UNIQUE KEY `conversations_tenant_id_type_slug_key` (`tenant_id`,`type`,`slug`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `conversations_created_by_fkey` (`created_by`),
  CONSTRAINT `conversations_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `conversations_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `daily_reconciliations`;
CREATE TABLE `daily_reconciliations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `business_date` date NOT NULL,
  `status` enum('draft','blocked','pending_approval','signed_off','adjusted','rejected','reopened') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `total_disbursed` decimal(15,2) NOT NULL DEFAULT '0',
  `disbursed_count` int NOT NULL DEFAULT '0',
  `total_collected` decimal(15,2) NOT NULL DEFAULT '0',
  `collected_count` int NOT NULL DEFAULT '0',
  `total_ledger_debits` decimal(15,2) NOT NULL DEFAULT '0',
  `total_ledger_credits` decimal(15,2) NOT NULL DEFAULT '0',
  `is_ledger_balanced` tinyint(1) NOT NULL DEFAULT '0',
  `total_tenant_savings` decimal(15,2) NOT NULL DEFAULT '0',
  `total_treasury_balance` decimal(15,2) NOT NULL DEFAULT '0',
  `imbalance_amount` decimal(15,2) NOT NULL DEFAULT '0',
  `has_discrepancy` tinyint(1) NOT NULL DEFAULT '0',
  `signoff_blocked` tinyint(1) NOT NULL DEFAULT '0',
  `block_reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reconciliation_reference` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imbalance_investigation_id` int DEFAULT NULL,
  `resolution_action` enum('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjustment_ledger_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `prepared_by` int DEFAULT NULL,
  `prepared_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `signed_off_by` int DEFAULT NULL,
  `signed_off_at` datetime(3) DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `approval_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `daily_reconciliations_reconciliation_reference_key` (`reconciliation_reference`),
  KEY `daily_reconciliations_tenant_id_status_business_date_idx` (`tenant_id`,`status`,`business_date`),
  KEY `daily_reconciliations_imbalance_investigation_id_idx` (`imbalance_investigation_id`),
  KEY `daily_reconciliations_resolution_reference_idx` (`resolution_reference`),
  KEY `daily_reconciliations_adjustment_ledger_transaction_id_idx` (`adjustment_ledger_transaction_id`),
  KEY `daily_reconciliations_audit_log_id_idx` (`audit_log_id`),
  KEY `daily_reconciliations_signed_off_by_idx` (`signed_off_by`),
  KEY `daily_reconciliations_approved_by_idx` (`approved_by`),
  UNIQUE KEY `daily_reconciliations_tenant_id_business_date_key` (`tenant_id`,`business_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `decommissioned_backups`;
CREATE TABLE `decommissioned_backups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `snapshot_date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `snapshot_content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `decommissioned_backups_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `decommissioned_backups_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `email_templates`;
CREATE TABLE `email_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `category` enum('verification','security','loan','repayment','wallet','support','report','announcement','onboarding','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `html_body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_body` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `variables` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `email_templates_tenant_id_category_idx` (`tenant_id`,`category`),
  KEY `email_templates_category_is_active_idx` (`category`,`is_active`),
  UNIQUE KEY `email_templates_tenant_id_slug_key` (`tenant_id`,`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `fraud_signals`;
CREATE TABLE `fraud_signals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `signal_type` enum('duplicate_identity','suspicious_transaction_pattern','rapid_loan_cycling','cross_tenant_default_risk','velocity_breach','device_anomaly','manual_flag') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('detected','under_review','confirmed','false_positive','resolved','escalated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'detected',
  `severity` enum('debug','info','warning','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'warning',
  `linked_user_id` int DEFAULT NULL,
  `linked_loan_id` int DEFAULT NULL,
  `linked_payment_id` int DEFAULT NULL,
  `linked_topup_id` int DEFAULT NULL,
  `duplicate_user_id` int DEFAULT NULL,
  `risk_score` int DEFAULT NULL,
  `threshold_breached` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signal_metadata` json DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `assigned_at` datetime(3) DEFAULT NULL,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `resolution_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `detected_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `resolved_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fraud_signals_tenant_id_signal_type_status_detected_at_idx` (`tenant_id`,`signal_type`,`status`,`detected_at`),
  KEY `fraud_signals_linked_user_id_status_idx` (`linked_user_id`,`status`),
  KEY `fraud_signals_linked_loan_id_idx` (`linked_loan_id`),
  KEY `fraud_signals_severity_status_idx` (`severity`,`status`),
  KEY `fraud_signals_assigned_to_status_idx` (`assigned_to`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `generated_reports`;
CREATE TABLE `generated_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `definition_id` int DEFAULT NULL,
  `tenant_id` int DEFAULT NULL,
  `requested_by` int DEFAULT NULL,
  `report_type` enum('cross_tenant_financial','tenant_performance','lender_summary','member_summary','loan_portfolio','repayment_summary','wallet_activity','reconciliation_summary','trust_analysis','audit_export') COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` enum('csv','pdf','json') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('queued','processing','ready','failed','expired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `file_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size_bytes` int DEFAULT NULL,
  `row_count` int DEFAULT NULL,
  `error_message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `period_start` datetime(3) DEFAULT NULL,
  `period_end` datetime(3) DEFAULT NULL,
  `dispatched_at` datetime(3) DEFAULT NULL,
  `dispatch_recipients` json DEFAULT NULL,
  `dispatch_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `generated_reports_tenant_id_report_type_created_at_idx` (`tenant_id`,`report_type`,`created_at`),
  KEY `generated_reports_status_created_at_idx` (`status`,`created_at`),
  KEY `generated_reports_definition_id_idx` (`definition_id`),
  CONSTRAINT `generated_reports_definition_id_fkey` FOREIGN KEY (`definition_id`) REFERENCES `report_definitions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `homepage_faqs`;
CREATE TABLE `homepage_faqs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `season_tag` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `workflow_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `review_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_by_user_id` int DEFAULT NULL,
  `reviewed_by_user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `homepage_faqs_tenant_id_workflow_status_is_active_sort_order_idx` (`tenant_id`,`workflow_status`,`is_active`,`sort_order`),
  KEY `homepage_faqs_submitted_by_user_id_fkey` (`submitted_by_user_id`),
  KEY `homepage_faqs_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  CONSTRAINT `homepage_faqs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `homepage_faqs_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `homepage_faqs_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `homepage_testimonials`;
CREATE TABLE `homepage_testimonials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_label` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `season_tag` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `workflow_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'published',
  `review_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_by_user_id` int DEFAULT NULL,
  `reviewed_by_user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `homepage_testimonials_tenant_id_workflow_status_is_active_so_idx` (`tenant_id`,`workflow_status`,`is_active`,`sort_order`),
  KEY `homepage_testimonials_submitted_by_user_id_fkey` (`submitted_by_user_id`),
  KEY `homepage_testimonials_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  CONSTRAINT `homepage_testimonials_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `homepage_testimonials_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `homepage_testimonials_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `imbalance_investigations`;
CREATE TABLE `imbalance_investigations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `source_module` enum('wallet','loan','repayment','ledger','reconciliation','topup','manual_adjustment','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_entity_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_entity_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expected_amount` decimal(15,2) NOT NULL,
  `actual_amount` decimal(15,2) NOT NULL,
  `difference_amount` decimal(15,2) NOT NULL,
  `status` enum('detected','assigned','investigating','awaiting_approval','resolved','dismissed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'detected',
  `priority` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `reconciliation_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_ledger_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_wallet_transaction_id` int DEFAULT NULL,
  `related_topup_request_id` int DEFAULT NULL,
  `related_loan_id` int DEFAULT NULL,
  `related_payment_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `assigned_at` datetime(3) DEFAULT NULL,
  `detected_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `investigated_at` datetime(3) DEFAULT NULL,
  `resolved_at` datetime(3) DEFAULT NULL,
  `resolved_by` int DEFAULT NULL,
  `resolution_action` enum('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjustment_ledger_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `adjustment_savings_transaction_id` int DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `imbalance_investigations_tenant_id_status_detected_at_idx` (`tenant_id`,`status`,`detected_at`),
  KEY `imbalance_investigations_source_module_source_entity_id_idx` (`source_module`,`source_entity_id`),
  KEY `imbalance_investigations_assigned_to_status_idx` (`assigned_to`,`status`),
  KEY `imbalance_investigations_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `imbalance_investigations_related_ledger_transaction_id_idx` (`related_ledger_transaction_id`),
  KEY `imbalance_investigations_related_wallet_transaction_id_idx` (`related_wallet_transaction_id`),
  KEY `imbalance_investigations_related_topup_request_id_idx` (`related_topup_request_id`),
  KEY `imbalance_investigations_related_loan_id_idx` (`related_loan_id`),
  KEY `imbalance_investigations_related_payment_id_idx` (`related_payment_id`),
  KEY `imbalance_investigations_audit_log_id_idx` (`audit_log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `interest_audit`;
CREATE TABLE `interest_audit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `formula_snapshot` json NOT NULL,
  `rate_applied` decimal(5,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `interest_audit_loan_id_key` (`loan_id`),
  KEY `interest_audit_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `interest_audit_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `interest_audit_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ledger_accounts`;
CREATE TABLE `ledger_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `ledger_accounts_code_key` (`code`),
  KEY `ledger_accounts_tenant_id_type_idx` (`tenant_id`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `ledger_accounts` (`id`, `name`, `code`, `type`, `tenant_id`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'Cash and Cash Equivalents', 'CASH_EQUIVALENTS', 'ASSET', NULL, 1, 'Thu May 14 2026 23:41:57 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:57 GMT+0800 (Philippine Standard Time)');
INSERT INTO `ledger_accounts` (`id`, `name`, `code`, `type`, `tenant_id`, `is_active`, `created_at`, `updated_at`) VALUES (2, 'Member Savings Deposits', 'MEMBER_SAVINGS', 'LIABILITY', NULL, 1, 'Thu May 14 2026 23:41:57 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:57 GMT+0800 (Philippine Standard Time)');
INSERT INTO `ledger_accounts` (`id`, `name`, `code`, `type`, `tenant_id`, `is_active`, `created_at`, `updated_at`) VALUES (3, 'Loan Receivables', 'LOAN_RECEIVABLES', 'ASSET', NULL, 1, 'Thu May 14 2026 23:41:57 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:57 GMT+0800 (Philippine Standard Time)');
INSERT INTO `ledger_accounts` (`id`, `name`, `code`, `type`, `tenant_id`, `is_active`, `created_at`, `updated_at`) VALUES (4, 'Interest Income', 'INTEREST_INCOME', 'REVENUE', NULL, 1, 'Thu May 14 2026 23:41:58 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:58 GMT+0800 (Philippine Standard Time)');
INSERT INTO `ledger_accounts` (`id`, `name`, `code`, `type`, `tenant_id`, `is_active`, `created_at`, `updated_at`) VALUES (5, 'Reconciliation Discrepancy', 'RECONC_DISCREPANCY', 'EXPENSE', NULL, 1, 'Thu May 14 2026 23:41:58 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:58 GMT+0800 (Philippine Standard Time)');

DROP TABLE IF EXISTS `loan_guarantees`;
CREATE TABLE `loan_guarantees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `guarantor_id` int NOT NULL,
  `status` enum('pending','vouched','rejected','voided','charged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `liability_percentage` decimal(5,2) NOT NULL DEFAULT '25.00',
  `liability_amount` decimal(15,2) DEFAULT NULL,
  `charged_amount` decimal(15,2) NOT NULL DEFAULT '0',
  `charge_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vouched_at` datetime(3) DEFAULT NULL,
  `soft_freeze_at` datetime(3) DEFAULT NULL,
  `hard_freeze_at` datetime(3) DEFAULT NULL,
  `default_triggered_at` datetime(3) DEFAULT NULL,
  `charged_at` datetime(3) DEFAULT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `reassigned_to_guarantee_id` int DEFAULT NULL,
  `notification_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `loan_guarantees_tenant_id_idx` (`tenant_id`),
  KEY `loan_guarantees_loan_id_status_idx` (`loan_id`,`status`),
  KEY `loan_guarantees_guarantor_id_status_idx` (`guarantor_id`,`status`),
  KEY `loan_guarantees_notification_id_idx` (`notification_id`),
  KEY `loan_guarantees_audit_log_id_idx` (`audit_log_id`),
  KEY `loan_guarantees_reassigned_to_guarantee_id_idx` (`reassigned_to_guarantee_id`),
  CONSTRAINT `loan_guarantees_guarantor_id_fkey` FOREIGN KEY (`guarantor_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `loan_guarantees_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `loan_guarantees_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `loan_products`;
CREATE TABLE `loan_products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_amount` decimal(15,2) NOT NULL,
  `max_amount` decimal(15,2) NOT NULL,
  `interest_rate_percent` decimal(5,2) NOT NULL,
  `max_term_months` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `tenant_id` int NOT NULL,
  `allowed_frequencies` json DEFAULT NULL,
  `guarantor_liability_rate` decimal(5,2) NOT NULL DEFAULT '25',
  PRIMARY KEY (`product_id`) /*T![clustered_index] CLUSTERED */,
  KEY `loan_products_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `loan_products_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `loan_schedules`;
CREATE TABLE `loan_schedules` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `installment_number` int NOT NULL,
  `due_date` date NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `total_due` decimal(15,2) NOT NULL,
  `status` enum('pending','paid','overdue') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at` datetime(3) DEFAULT NULL,
  `days_late` int NOT NULL DEFAULT '0',
  `penalty_applied` decimal(15,2) NOT NULL DEFAULT '0',
  PRIMARY KEY (`schedule_id`) /*T![clustered_index] CLUSTERED */,
  KEY `loan_schedules_tenant_id_idx` (`tenant_id`),
  KEY `loan_schedules_loan_id_fkey` (`loan_id`),
  CONSTRAINT `loan_schedules_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `loan_schedules_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `loans`;
CREATE TABLE `loans` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `loan_reference` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `purpose` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `term_months` int NOT NULL,
  `interest_applied` decimal(15,2) NOT NULL,
  `principal_receivable` decimal(15,2) NOT NULL DEFAULT '0',
  `interest_receivable` decimal(15,2) NOT NULL DEFAULT '0',
  `fees_applied` decimal(15,2) NOT NULL DEFAULT '0',
  `total_payable` decimal(15,2) NOT NULL,
  `balance_remaining` decimal(15,2) NOT NULL,
  `status` enum('pending','approved','active','paid','defaulted','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `applied_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `approved_at` datetime(3) DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `rejection_reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `repayment_frequency` enum('weekly','bi_weekly','monthly') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `recovery_parent_loan_id` int DEFAULT NULL,
  `is_recovery_loan` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`loan_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `loans_loan_reference_key` (`loan_reference`),
  KEY `loans_approved_by_fkey` (`approved_by`),
  KEY `loans_product_id_fkey` (`product_id`),
  KEY `loans_recovery_parent_loan_id_fkey` (`recovery_parent_loan_id`),
  KEY `loans_tenant_id_fkey` (`tenant_id`),
  KEY `loans_user_id_fkey` (`user_id`),
  CONSTRAINT `loans_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `loans_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `loan_products` (`product_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `loans_recovery_parent_loan_id_fkey` FOREIGN KEY (`recovery_parent_loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `loans_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `loans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `mentorship_connections`;
CREATE TABLE `mentorship_connections` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `requester_id` int NOT NULL,
  `mentor_id` int NOT NULL,
  `endorsed_by` int DEFAULT NULL,
  `status` enum('pending_endorsement','endorsed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_endorsement',
  `focus_area` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endorsed_at` datetime(3) DEFAULT NULL,
  KEY `mentorship_connections_tenant_id_status_created_at_idx` (`tenant_id`,`status`,`created_at`),
  UNIQUE KEY `mentorship_connections_tenant_id_requester_id_mentor_id_key` (`tenant_id`,`requester_id`,`mentor_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `mentorship_connections_endorsed_by_fkey` (`endorsed_by`),
  KEY `mentorship_connections_mentor_id_fkey` (`mentor_id`),
  KEY `mentorship_connections_requester_id_fkey` (`requester_id`),
  CONSTRAINT `mentorship_connections_endorsed_by_fkey` FOREIGN KEY (`endorsed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mentorship_connections_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mentorship_connections_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mentorship_connections_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `message_attachments`;
CREATE TABLE `message_attachments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size_bytes` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY `message_attachments_tenant_id_idx` (`tenant_id`),
  KEY `message_attachments_message_id_created_at_idx` (`message_id`,`created_at`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `message_attachments_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_attachments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `message_reactions`;
CREATE TABLE `message_reactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `emoji` varchar(24) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY `message_reactions_tenant_id_idx` (`tenant_id`),
  KEY `message_reactions_user_id_created_at_idx` (`user_id`,`created_at`),
  UNIQUE KEY `message_reactions_message_id_user_id_emoji_key` (`message_id`,`user_id`,`emoji`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `message_reactions_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_reactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_reactions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_broadcast` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `conversation_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reply_to_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  KEY `messages_conversation_id_created_at_idx` (`conversation_id`,`created_at`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `messages_reply_to_id_fkey` (`reply_to_id`),
  KEY `messages_sender_id_fkey` (`sender_id`),
  KEY `messages_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_reply_to_id_fkey` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notification_templates`;
CREATE TABLE `notification_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `variables` json DEFAULT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `notification_templates_type_category_idx` (`type`,`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  `type` enum('email_verification','identity_verified','identity_rejected','tenant_application_received','tenant_approved','tenant_suspended','wallet_deposit_pending','wallet_deposit_approved','wallet_deposit_rejected','wallet_withdrawal_pending','wallet_withdrawal_approved','wallet_withdrawal_rejected','wallet_issue_reported','loan_application_received','loan_approved','loan_rejected','loan_disbursed','loan_defaulted','repayment_reminder','loan_paid','repayment_received','repayment_overdue','guarantor_request','guarantor_accepted','guarantor_rejected','guarantor_charged','trust_voting_assigned','trust_voting_due_soon','trust_voting_missed','compassion_requested','compassion_approved','compassion_rejected','feedback_received','support_ticket_opened','support_ticket_updated','support_ticket_resolved','report_ready','report_failed','mentorship_request','mentorship_endorsed','mentorship_rejected','direct_message','tenant_announcement','login_new_device','password_changed','two_fa_enabled','two_fa_disabled','system_alert','system_maintenance','platform_announcement') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `channel` enum('in_app','email','both') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in_app',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `emailed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY `notifications_user_id_is_read_created_at_idx` (`user_id`,`is_read`,`created_at`),
  KEY `notifications_tenant_id_type_created_at_idx` (`tenant_id`,`type`,`created_at`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `notifications_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `method_id` int NOT NULL AUTO_INCREMENT,
  `provider_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `tenant_id` int NOT NULL,
  PRIMARY KEY (`method_id`) /*T![clustered_index] CLUSTERED */,
  KEY `payment_methods_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `payment_methods_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (1, 'GCash', NULL, 1, 1);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (2, 'Bank Transfer', NULL, 1, 1);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (3, 'Cash', NULL, 1, 1);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (4, 'Maya', NULL, 1, 1);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (5, 'GCash', NULL, 1, 2);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (6, 'Bank Transfer', NULL, 1, 2);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (7, 'Cash', NULL, 1, 2);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (8, 'Maya', NULL, 1, 2);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (9, 'GCash', NULL, 1, 3);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (10, 'Bank Transfer', NULL, 1, 3);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (11, 'Cash', NULL, 1, 3);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (12, 'Maya', NULL, 1, 3);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (13, 'GCash', NULL, 1, 4);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (14, 'Bank Transfer', NULL, 1, 4);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (15, 'Cash', NULL, 1, 4);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (16, 'Maya', NULL, 1, 4);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (17, 'GCash', NULL, 1, 5);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (18, 'Bank Transfer', NULL, 1, 5);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (19, 'Cash', NULL, 1, 5);
INSERT INTO `payment_methods` (`method_id`, `provider_name`, `account_number`, `is_active`, `tenant_id`) VALUES (20, 'Maya', NULL, 1, 5);

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `loan_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `method_id` int NOT NULL,
  `payment_reference` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `receipt_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `submitted_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `verified_at` datetime(3) DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`payment_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `payments_payment_reference_key` (`payment_reference`),
  KEY `payments_tenant_id_idx` (`tenant_id`),
  KEY `payments_loan_id_fkey` (`loan_id`),
  KEY `payments_method_id_fkey` (`method_id`),
  KEY `payments_verified_by_fkey` (`verified_by`),
  CONSTRAINT `payments_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `payments_method_id_fkey` FOREIGN KEY (`method_id`) REFERENCES `payment_methods` (`method_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `payments_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `payments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `platform_announcements`;
CREATE TABLE `platform_announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_audience` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `priority` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `published_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `platform_announcements_target_audience_is_published_idx` (`target_audience`,`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `platform_config`;
CREATE TABLE `platform_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scoring_weights` json DEFAULT NULL,
  `risk_thresholds` json DEFAULT NULL,
  `default_loan_config` json DEFAULT NULL,
  `platform_settings` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `receipts`;
CREATE TABLE `receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `receipt_number` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_type` enum('wallet_deposit','wallet_withdrawal','loan_disbursement','loan_repayment','loan_fee','fund_release','top_up','admin_adjustment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('generated','voided','reissued') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'generated',
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PHP',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `savings_transaction_id` int DEFAULT NULL,
  `loan_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `topup_request_id` int DEFAULT NULL,
  `file_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voided_by` int DEFAULT NULL,
  `voided_at` datetime(3) DEFAULT NULL,
  `void_reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reissued_receipt_id` int DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `issued_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `receipts_receipt_number_key` (`receipt_number`),
  KEY `receipts_tenant_id_receipt_type_issued_at_idx` (`tenant_id`,`receipt_type`,`issued_at`),
  KEY `receipts_user_id_issued_at_idx` (`user_id`,`issued_at`),
  KEY `receipts_receipt_number_idx` (`receipt_number`),
  KEY `receipts_loan_id_idx` (`loan_id`),
  KEY `receipts_payment_id_idx` (`payment_id`),
  KEY `receipts_topup_request_id_idx` (`topup_request_id`),
  KEY `receipts_savings_transaction_id_idx` (`savings_transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `report_definitions`;
CREATE TABLE `report_definitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` enum('cross_tenant_financial','tenant_performance','lender_summary','member_summary','loan_portfolio','repayment_summary','wallet_activity','reconciliation_summary','trust_analysis','audit_export') COLLATE utf8mb4_unicode_ci NOT NULL,
  `format` enum('csv','pdf','json') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'csv',
  `filters` json DEFAULT NULL,
  `is_scheduled` tinyint(1) NOT NULL DEFAULT '0',
  `schedule_freq` enum('daily','weekly','monthly','one_time') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `schedule_day` int DEFAULT NULL,
  `next_run_at` datetime(3) DEFAULT NULL,
  `recipients` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `report_definitions_tenant_id_report_type_idx` (`tenant_id`,`report_type`),
  KEY `report_definitions_is_scheduled_next_run_at_idx` (`is_scheduled`,`next_run_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `restore_requests`;
CREATE TABLE `restore_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `backup_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `status` enum('requested','validating','restoring','completed','failed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'requested',
  `target_schemas` json DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `audit_log_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `restore_requests_tenant_id_status_idx` (`tenant_id`,`status`),
  KEY `restore_requests_backup_id_idx` (`backup_id`),
  KEY `restore_requests_requested_by_idx` (`requested_by`),
  CONSTRAINT `restore_requests_backup_id_fkey` FOREIGN KEY (`backup_id`) REFERENCES `backup_records` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `savings_accounts`;
CREATE TABLE `savings_accounts` (
  `account_id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `account_type` enum('share_capital','regular_savings','personal_wallet') COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_role` enum('superadmin','operator','member') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT '0',
  `is_locked` tinyint(1) NOT NULL DEFAULT '0',
  `lock_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opened_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`account_id`) /*T![clustered_index] CLUSTERED */,
  KEY `savings_accounts_tenant_id_account_type_idx` (`tenant_id`,`account_type`),
  KEY `savings_accounts_tenant_id_owner_role_idx` (`tenant_id`,`owner_role`),
  UNIQUE KEY `savings_accounts_user_id_account_type_key` (`user_id`,`account_type`),
  CONSTRAINT `savings_accounts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `savings_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `savings_transactions`;
CREATE TABLE `savings_transactions` (
  `transaction_id` int NOT NULL AUTO_INCREMENT,
  `account_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `transaction_type` enum('deposit','withdrawal','dividend','fee','default_recovery_debit','default_recovery_credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `fee_amount` decimal(15,2) NOT NULL DEFAULT '0',
  `net_amount` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'verified',
  `method_label` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reconciliation_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ledger_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `issue_reported_at` datetime(3) DEFAULT NULL,
  `issue_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `processed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `processed_by` int DEFAULT NULL,
  PRIMARY KEY (`transaction_id`) /*T![clustered_index] CLUSTERED */,
  KEY `savings_transactions_tenant_id_idx` (`tenant_id`),
  KEY `savings_transactions_account_id_status_processed_at_idx` (`account_id`,`status`,`processed_at`),
  KEY `savings_transactions_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `savings_transactions_ledger_transaction_id_idx` (`ledger_transaction_id`),
  KEY `savings_transactions_issue_status_idx` (`issue_status`),
  KEY `savings_transactions_processed_by_fkey` (`processed_by`),
  CONSTRAINT `savings_transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `savings_accounts` (`account_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `savings_transactions_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `savings_transactions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `security_settings`;
CREATE TABLE `security_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password_policy` json DEFAULT NULL,
  `session_settings` json DEFAULT NULL,
  `two_factor_required` tinyint(1) NOT NULL DEFAULT '0',
  `two_factor_roles` json DEFAULT NULL,
  `ip_whitelist` json DEFAULT NULL,
  `allowed_domains` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tier_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_monthly` decimal(10,2) NOT NULL,
  `price_quarterly` decimal(10,2) NOT NULL DEFAULT '0',
  `price_semi_annually` decimal(10,2) NOT NULL DEFAULT '0',
  `price_annually` decimal(10,2) NOT NULL,
  `max_members` int NOT NULL,
  `max_storage_mb` int NOT NULL,
  `features` json DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_addon` tinyint(1) NOT NULL DEFAULT '0',
  `tenant_price` int DEFAULT '3000',
  `tenant_storage` int DEFAULT '10000',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `subscription_plans_tier_name_key` (`tier_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `subscription_plans` (`id`, `tier_name`, `price_monthly`, `price_quarterly`, `price_semi_annually`, `price_annually`, `max_members`, `max_storage_mb`, `features`, `is_active`, `is_addon`, `tenant_price`, `tenant_storage`, `created_at`, `updated_at`) VALUES (1, 'Agapay Core', '1200.00', '3500.00', '0.00', '0.00', 500, 5000, 'Basic Admin Dashboard,Audit Logs,Email Support', 1, 0, 3000, 10000, 'Thu May 14 2026 23:41:59 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:59 GMT+0800 (Philippine Standard Time)');
INSERT INTO `subscription_plans` (`id`, `tier_name`, `price_monthly`, `price_quarterly`, `price_semi_annually`, `price_annually`, `max_members`, `max_storage_mb`, `features`, `is_active`, `is_addon`, `tenant_price`, `tenant_storage`, `created_at`, `updated_at`) VALUES (2, 'Agapay Pro', '1500.00', '0.00', '6500.00', '0.00', 2500, 25000, 'Custom Branding,Priority Support,Compassion Workflow', 1, 0, 3000, 10000, 'Thu May 14 2026 23:41:59 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:59 GMT+0800 (Philippine Standard Time)');
INSERT INTO `subscription_plans` (`id`, `tier_name`, `price_monthly`, `price_quarterly`, `price_semi_annually`, `price_annually`, `max_members`, `max_storage_mb`, `features`, `is_active`, `is_addon`, `tenant_price`, `tenant_storage`, `created_at`, `updated_at`) VALUES (3, 'Agapay Enterprise', '2000.00', '0.00', '0.00', '12000.00', 1000000, 100000, 'Analytics Module,Technical Support,Reputation System', 1, 0, 3000, 10000, 'Thu May 14 2026 23:41:59 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:41:59 GMT+0800 (Philippine Standard Time)');

DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ticket_type` enum('SUPPORT','FEEDBACK','DISPUTE','BUG') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SUPPORT',
  `tenant_id` int DEFAULT NULL,
  `requester_id` int DEFAULT NULL,
  `category` enum('wallet_issue','loan_issue','payment_issue','member_complaint','system_issue','feature_request','homepage_concern','general_support','testimonial','concern','general') COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_context` enum('general','wallet','loan','repayment','payment','homepage','system','chat','reports') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `status` enum('open','in_review','waiting_on_member','waiting_on_admin','resolved','closed','escalated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `priority` enum('low','normal','high','urgent') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  `rating` int DEFAULT '5',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_entity_type` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_entity_id` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wallet_transaction_id` int DEFAULT NULL,
  `loan_id` int DEFAULT NULL,
  `payment_id` int DEFAULT NULL,
  `topup_request_id` int DEFAULT NULL,
  `assigned_to` int DEFAULT NULL,
  `assigned_at` datetime(3) DEFAULT NULL,
  `first_response_at` datetime(3) DEFAULT NULL,
  `resolved_by` int DEFAULT NULL,
  `resolved_at` datetime(3) DEFAULT NULL,
  `closed_at` datetime(3) DEFAULT NULL,
  `resolution_summary` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `escalation_level` int NOT NULL DEFAULT '0',
  `audit_log_id` int DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `support_tickets_ticket_number_key` (`ticket_number`),
  KEY `support_tickets_tenant_id_status_priority_created_at_idx` (`tenant_id`,`status`,`priority`,`created_at`),
  KEY `support_tickets_requester_id_created_at_idx` (`requester_id`,`created_at`),
  KEY `support_tickets_category_status_idx` (`category`,`status`),
  KEY `support_tickets_module_context_status_idx` (`module_context`,`status`),
  KEY `support_tickets_related_entity_type_related_entity_id_idx` (`related_entity_type`,`related_entity_id`),
  KEY `support_tickets_wallet_transaction_id_idx` (`wallet_transaction_id`),
  KEY `support_tickets_loan_id_idx` (`loan_id`),
  KEY `support_tickets_payment_id_idx` (`payment_id`),
  KEY `support_tickets_topup_request_id_idx` (`topup_request_id`),
  KEY `support_tickets_assigned_to_status_idx` (`assigned_to`,`status`),
  KEY `support_tickets_audit_log_id_idx` (`audit_log_id`),
  KEY `support_tickets_resolved_by_fkey` (`resolved_by`),
  CONSTRAINT `support_tickets_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (1, 'TKT-MALOLOS-1778802133285-0', 'FEEDBACK', 1, 21, 'general', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:13 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:13 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (2, 'TKT-MALOLOS-1778802133655-1', 'FEEDBACK', 1, 4, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:13 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:13 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (3, 'TKT-MALOLOS-1778802133860-2', 'FEEDBACK', 1, 25, 'testimonial', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:13 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:13 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (4, 'TKT-MALOLOS-1778802134144-3', 'FEEDBACK', 1, 24, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:14 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:14 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (5, 'TKT-MALOLOS-1778802134347-4', 'FEEDBACK', 1, 15, 'concern', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:14 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:14 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (6, 'TKT-SAN-JOSE-1778802147571-0', 'FEEDBACK', 2, 38, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (7, 'TKT-SAN-JOSE-1778802147736-1', 'FEEDBACK', 2, 28, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (8, 'TKT-SAN-JOSE-1778802147934-2', 'FEEDBACK', 2, 35, 'concern', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (9, 'TKT-SAN-JOSE-1778802148118-3', 'FEEDBACK', 2, 45, 'concern', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:28 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:28 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (10, 'TKT-SAN-JOSE-1778802148310-4', 'FEEDBACK', 2, 37, 'testimonial', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:28 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:28 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (11, 'TKT-QC-VENDORS-1778802161782-0', 'FEEDBACK', 3, 54, 'concern', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:41 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:41 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (12, 'TKT-QC-VENDORS-1778802162004-1', 'FEEDBACK', 3, 60, 'concern', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (13, 'TKT-QC-VENDORS-1778802162170-2', 'FEEDBACK', 3, 74, 'concern', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (14, 'TKT-QC-VENDORS-1778802162398-3', 'FEEDBACK', 3, 71, 'general', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (15, 'TKT-QC-VENDORS-1778802162692-4', 'FEEDBACK', 3, 58, 'concern', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:42 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (16, 'TKT-MAKATI-BUSINESS-1778802175489-0', 'FEEDBACK', 4, 99, 'testimonial', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (17, 'TKT-MAKATI-BUSINESS-1778802175679-1', 'FEEDBACK', 4, 80, 'testimonial', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (18, 'TKT-MAKATI-BUSINESS-1778802175861-2', 'FEEDBACK', 4, 84, 'general', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (19, 'TKT-MAKATI-BUSINESS-1778802176027-3', 'FEEDBACK', 4, 83, 'testimonial', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:56 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:56 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (20, 'TKT-MAKATI-BUSINESS-1778802176236-4', 'FEEDBACK', 4, 79, 'general', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:42:56 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:56 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (21, 'TKT-CALAMBA-AGRI-1778802187284-0', 'FEEDBACK', 5, 103, 'testimonial', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (22, 'TKT-CALAMBA-AGRI-1778802187453-1', 'FEEDBACK', 5, 115, 'concern', 'general', 'resolved', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (23, 'TKT-CALAMBA-AGRI-1778802187660-2', 'FEEDBACK', 5, 113, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (24, 'TKT-CALAMBA-AGRI-1778802187826-3', 'FEEDBACK', 5, 103, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:07 GMT+0800 (Philippine Standard Time)');
INSERT INTO `support_tickets` (`id`, `ticket_number`, `ticket_type`, `tenant_id`, `requester_id`, `category`, `module_context`, `status`, `priority`, `rating`, `subject`, `description`, `related_entity_type`, `related_entity_id`, `wallet_transaction_id`, `loan_id`, `payment_id`, `topup_request_id`, `assigned_to`, `assigned_at`, `first_response_at`, `resolved_by`, `resolved_at`, `closed_at`, `resolution_summary`, `escalation_level`, `audit_log_id`, `metadata`, `created_at`, `updated_at`) VALUES (25, 'TKT-CALAMBA-AGRI-1778802188035-4', 'FEEDBACK', 5, 104, 'testimonial', 'general', 'open', 'normal', 5, 'Sample Feedback from Member', 'Maganda ang serbisyo ng Agapay. Malaking tulong sa aking negosyo.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '[object Object]', 'Thu May 14 2026 23:43:08 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:08 GMT+0800 (Philippine Standard Time)');

DROP TABLE IF EXISTS `system_files`;
CREATE TABLE `system_files` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_id` int DEFAULT NULL,
  `uploader_id` int NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_base64` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  KEY `system_files_tenant_id_idx` (`tenant_id`),
  KEY `system_files_uploader_id_idx` (`uploader_id`),
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  CONSTRAINT `system_files_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `system_files_uploader_id_fkey` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `system_health_snapshots`;
CREATE TABLE `system_health_snapshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `snapshot_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `api_uptime_percent` decimal(5,2) DEFAULT NULL,
  `avg_response_ms` int DEFAULT NULL,
  `error_rate_percent` decimal(5,2) DEFAULT NULL,
  `active_connections` int DEFAULT NULL,
  `queue_depth` int DEFAULT NULL,
  `ai_queue_depth` int DEFAULT NULL,
  `ai_processing_ok` tinyint(1) NOT NULL DEFAULT '1',
  `db_size_bytes` bigint DEFAULT NULL,
  `tenant_schema_sizes` json DEFAULT NULL,
  `alert_state` enum('ok','degraded','critical') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ok',
  `alert_details` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `system_health_snapshots_snapshot_at_idx` (`snapshot_at`),
  KEY `system_health_snapshots_alert_state_snapshot_at_idx` (`alert_state`,`snapshot_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tenant_applications`;
CREATE TABLE `tenant_applications` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `tenant_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tenant_slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `applicant_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `applicant_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estimated_members` int DEFAULT '100',
  `tenant_group_id` int DEFAULT NULL,
  `brand_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accent_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `submitted_by` int NOT NULL,
  `reviewed_by` int DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `review_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documents` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`application_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tenant_applications_tenant_slug_key` (`tenant_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tenant_groups`;
CREATE TABLE `tenant_groups` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reg_code` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tenant_groups_reg_code_key` (`reg_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `tenant_groups` (`id`, `name`, `reg_code`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'NCR Sector', 'AGP_NCR', 1, 'Thu May 14 2026 23:42:00 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:00 GMT+0800 (Philippine Standard Time)');
INSERT INTO `tenant_groups` (`id`, `name`, `reg_code`, `is_active`, `created_at`, `updated_at`) VALUES (2, 'Central Luzon Sector', 'AGP_CL', 1, 'Thu May 14 2026 23:42:00 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:00 GMT+0800 (Philippine Standard Time)');
INSERT INTO `tenant_groups` (`id`, `name`, `reg_code`, `is_active`, `created_at`, `updated_at`) VALUES (3, 'Southern Tagalog Sector', 'AGP_ST', 1, 'Thu May 14 2026 23:42:00 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:00 GMT+0800 (Philippine Standard Time)');

DROP TABLE IF EXISTS `tenant_subscriptions`;
CREATE TABLE `tenant_subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `billing_cycle` enum('monthly','quarterly','semi_annually','annually') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `start_date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `end_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `activated_modules` json DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tenant_subscriptions_tenant_id_key` (`tenant_id`),
  KEY `tenant_subscriptions_tenant_id_idx` (`tenant_id`),
  KEY `tenant_subscriptions_plan_id_fkey` (`plan_id`),
  CONSTRAINT `tenant_subscriptions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tenant_subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `tenant_subscriptions` (`id`, `tenant_id`, `plan_id`, `billing_cycle`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`, `activated_modules`) VALUES (1, 1, 1, 'monthly', 'active', 'Wed Jan 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'Sat Feb 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:02 GMT+0800 (Philippine Standard Time)', 'wallet,loans,community,audit');
INSERT INTO `tenant_subscriptions` (`id`, `tenant_id`, `plan_id`, `billing_cycle`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`, `activated_modules`) VALUES (2, 2, 2, 'annually', 'active', 'Sat Mar 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Sun Mar 14 2027 23:42:18 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:18 GMT+0800 (Philippine Standard Time)', 'wallet,loans,community,audit');
INSERT INTO `tenant_subscriptions` (`id`, `tenant_id`, `plan_id`, `billing_cycle`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`, `activated_modules`) VALUES (3, 3, 3, 'semi_annually', 'active', 'Sun Dec 14 2025 23:42:32 GMT+0800 (Philippine Standard Time)', 'Sun Jun 14 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'wallet,loans,community,audit');
INSERT INTO `tenant_subscriptions` (`id`, `tenant_id`, `plan_id`, `billing_cycle`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`, `activated_modules`) VALUES (4, 4, 1, 'quarterly', 'active', 'Sat Feb 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:46 GMT+0800 (Philippine Standard Time)', 'wallet,loans,community,audit');
INSERT INTO `tenant_subscriptions` (`id`, `tenant_id`, `plan_id`, `billing_cycle`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`, `activated_modules`) VALUES (5, 5, 2, 'monthly', 'active', 'Wed Jan 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Sat Feb 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'wallet,loans,community,audit');

DROP TABLE IF EXISTS `tenant_trust_policies`;
CREATE TABLE `tenant_trust_policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `payment_weight` decimal(5,2) NOT NULL DEFAULT '40.00',
  `business_weight` decimal(5,2) NOT NULL DEFAULT '20.00',
  `peer_weight` decimal(5,2) NOT NULL DEFAULT '20.00',
  `guarantor_weight` decimal(5,2) NOT NULL DEFAULT '20.00',
  `minimum_voting_quota` int NOT NULL DEFAULT '3',
  `randomized_sample_size` int NOT NULL DEFAULT '10',
  `missed_vote_lockout_days` int NOT NULL DEFAULT '7',
  `low_rating_threshold` int NOT NULL DEFAULT '55',
  `tier_review_day` int NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tenant_trust_policies_tenant_id_key` (`tenant_id`),
  KEY `tenant_trust_policies_tenant_id_is_active_idx` (`tenant_id`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants` (
  `tenant_id` int NOT NULL AUTO_INCREMENT,
  `tenant_group_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accent_color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `font_pairing` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'inter_outfit',
  `logo_url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `entitlement_status` enum('prospect','availed','active','suspended') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'prospect',
  `lifetime_availed_at` datetime(3) DEFAULT NULL,
  `availed_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `entitlement_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entitlement_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entitled_by_user_id` int DEFAULT NULL,
  PRIMARY KEY (`tenant_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `tenants_slug_key` (`slug`),
  KEY `tenants_tenant_group_id_fkey` (`tenant_group_id`),
  CONSTRAINT `tenants_tenant_group_id_fkey` FOREIGN KEY (`tenant_group_id`) REFERENCES `tenant_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `tenants` (`tenant_id`, `tenant_group_id`, `name`, `slug`, `brand_color`, `accent_color`, `font_pairing`, `logo_url`, `is_active`, `created_at`, `updated_at`, `entitlement_status`, `lifetime_availed_at`, `availed_type`, `region`, `metadata`, `entitlement_reference`, `entitlement_notes`, `entitled_by_user_id`) VALUES (1, 2, 'Malolos Market Vendors Cooperative', 'malolos', '#2563eb', NULL, 'inter_outfit', NULL, 1, 'Thu May 14 2026 23:42:01 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:01 GMT+0800 (Philippine Standard Time)', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `tenants` (`tenant_id`, `tenant_group_id`, `name`, `slug`, `brand_color`, `accent_color`, `font_pairing`, `logo_url`, `is_active`, `created_at`, `updated_at`, `entitlement_status`, `lifetime_availed_at`, `availed_type`, `region`, `metadata`, `entitlement_reference`, `entitlement_notes`, `entitled_by_user_id`) VALUES (2, 2, 'San Jose Rural Workers Coop', 'san-jose', '#059669', NULL, 'inter_outfit', NULL, 1, 'Thu May 14 2026 23:42:17 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:17 GMT+0800 (Philippine Standard Time)', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `tenants` (`tenant_id`, `tenant_group_id`, `name`, `slug`, `brand_color`, `accent_color`, `font_pairing`, `logo_url`, `is_active`, `created_at`, `updated_at`, `entitlement_status`, `lifetime_availed_at`, `availed_type`, `region`, `metadata`, `entitlement_reference`, `entitlement_notes`, `entitled_by_user_id`) VALUES (3, 1, 'Quezon City Vendors Trust', 'qc-vendors', '#d97706', NULL, 'inter_outfit', NULL, 1, 'Thu May 14 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:32 GMT+0800 (Philippine Standard Time)', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `tenants` (`tenant_id`, `tenant_group_id`, `name`, `slug`, `brand_color`, `accent_color`, `font_pairing`, `logo_url`, `is_active`, `created_at`, `updated_at`, `entitlement_status`, `lifetime_availed_at`, `availed_type`, `region`, `metadata`, `entitlement_reference`, `entitlement_notes`, `entitled_by_user_id`) VALUES (4, 1, 'Makati Business Sari-Sari Coop', 'makati-business', '#dc2626', NULL, 'inter_outfit', NULL, 1, 'Thu May 14 2026 23:42:45 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:45 GMT+0800 (Philippine Standard Time)', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `tenants` (`tenant_id`, `tenant_group_id`, `name`, `slug`, `brand_color`, `accent_color`, `font_pairing`, `logo_url`, `is_active`, `created_at`, `updated_at`, `entitlement_status`, `lifetime_availed_at`, `availed_type`, `region`, `metadata`, `entitlement_reference`, `entitlement_notes`, `entitled_by_user_id`) VALUES (5, 3, 'Calamba Agricultural Cooperative', 'calamba-agri', '#7c3aed', NULL, 'inter_outfit', NULL, 1, 'Thu May 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:59 GMT+0800 (Philippine Standard Time)', 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

DROP TABLE IF EXISTS `topup_requests`;
CREATE TABLE `topup_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `request_type` enum('deposit','withdrawal') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'deposit',
  `amount` decimal(15,2) NOT NULL,
  `fee_amount` decimal(15,2) NOT NULL DEFAULT '0',
  `net_amount` decimal(15,2) DEFAULT NULL,
  `method_label` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `external_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `receipt_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `issue_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reconciliation_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ledger_transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `processed_at` datetime(3) DEFAULT NULL,
  `processed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `topup_requests_tenant_id_request_type_status_idx` (`tenant_id`,`request_type`,`status`),
  KEY `topup_requests_user_id_request_type_created_at_idx` (`user_id`,`request_type`,`created_at`),
  KEY `topup_requests_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `topup_requests_ledger_transaction_id_idx` (`ledger_transaction_id`),
  KEY `topup_requests_issue_status_idx` (`issue_status`),
  KEY `topup_requests_processed_by_fkey` (`processed_by`),
  CONSTRAINT `topup_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `topup_requests_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `topup_requests_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `trust_rating_assignments`;
CREATE TABLE `trust_rating_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `period_id` int NOT NULL,
  `rater_id` int NOT NULL,
  `ratee_id` int NOT NULL,
  `rating_source_role` enum('superadmin','operator','member') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('assigned','completed','missed','excused','locked_out') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'assigned',
  `score` int DEFAULT NULL,
  `comment` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sampled_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `due_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `missed_at` datetime(3) DEFAULT NULL,
  `lockout_until` datetime(3) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `trust_rating_assignments_tenant_id_status_due_at_idx` (`tenant_id`,`status`,`due_at`),
  KEY `trust_rating_assignments_rater_id_status_idx` (`rater_id`,`status`),
  KEY `trust_rating_assignments_ratee_id_status_idx` (`ratee_id`,`status`),
  KEY `trust_rating_assignments_lockout_until_idx` (`lockout_until`),
  UNIQUE KEY `trust_rating_assignments_period_id_rater_id_ratee_id_rating__key` (`period_id`,`rater_id`,`ratee_id`,`rating_source_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `trust_rating_periods`;
CREATE TABLE `trust_rating_periods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `status` enum('planned','active','closed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `minimum_voting_quota` int NOT NULL DEFAULT '3',
  `randomized_sample_size` int NOT NULL DEFAULT '10',
  `generated_at` datetime(3) DEFAULT NULL,
  `closed_at` datetime(3) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `trust_rating_periods_tenant_id_status_period_start_idx` (`tenant_id`,`status`,`period_start`),
  UNIQUE KEY `trust_rating_periods_tenant_id_period_start_period_end_key` (`tenant_id`,`period_start`,`period_end`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `trust_score_snapshots`;
CREATE TABLE `trust_score_snapshots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `period_id` int DEFAULT NULL,
  `score` int NOT NULL,
  `payment_score` int NOT NULL,
  `business_score` int NOT NULL,
  `peer_score` int NOT NULL,
  `guarantor_score` int NOT NULL,
  `payment_weight` decimal(5,2) NOT NULL,
  `business_weight` decimal(5,2) NOT NULL,
  `peer_weight` decimal(5,2) NOT NULL,
  `guarantor_weight` decimal(5,2) NOT NULL,
  `tier_before` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tier_after` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `low_rating_action_state` enum('none','warning','review_required','restricted','tier_downgraded') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `low_rating_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `calculated_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `trust_score_snapshots_tenant_id_user_id_calculated_at_idx` (`tenant_id`,`user_id`,`calculated_at`),
  KEY `trust_score_snapshots_period_id_idx` (`period_id`),
  KEY `trust_score_snapshots_tier_after_idx` (`tier_after`),
  KEY `trust_score_snapshots_low_rating_action_state_idx` (`low_rating_action_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `trust_tier_audits`;
CREATE TABLE `trust_tier_audits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `snapshot_id` int DEFAULT NULL,
  `previous_tier` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_tier` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int NOT NULL,
  `change_reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `changed_by` int DEFAULT NULL,
  `changed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `metadata` json DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `trust_tier_audits_tenant_id_user_id_changed_at_idx` (`tenant_id`,`user_id`,`changed_at`),
  KEY `trust_tier_audits_snapshot_id_idx` (`snapshot_id`),
  KEY `trust_tier_audits_previous_tier_new_tier_idx` (`previous_tier`,`new_tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `two_factor_auth`;
CREATE TABLE `two_factor_auth` (
  `tfa_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `totp_secret` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `recovery_codes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`tfa_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `two_factor_auth_user_id_key` (`user_id`),
  CONSTRAINT `two_factor_auth_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_documents`;
CREATE TABLE `user_documents` (
  `document_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `document_type` enum('valid_id','proof_of_billing','residency_cert','brgy_cert','business_permit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_type_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `uploaded_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`document_id`) /*T![clustered_index] CLUSTERED */,
  KEY `user_documents_tenant_id_idx` (`tenant_id`),
  KEY `user_documents_user_id_fkey` (`user_id`),
  CONSTRAINT `user_documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_documents_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `profile_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tenant_id` int NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `middle_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_name` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marital_status` enum('single','married','widowed','separated','annulled') COLLATE utf8mb4_unicode_ci DEFAULT 'single',
  `occupation` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `place_of_birth` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tin` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `province` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barangay` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `photo_url` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`profile_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `user_profiles_user_id_key` (`user_id`),
  KEY `user_profiles_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_profiles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (1, 1, 1, 'James', NULL, 'Bryant', NULL, NULL, NULL, NULL, 'single', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (2, 2, 1, 'Jocelyn', NULL, 'Domingo', 'female', NULL, 'Brgy. Holy Spirit, Malolos Market Vendors Cooperative', NULL, 'single', 'Cooperative Operator', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (3, 3, 1, 'Gregorio', NULL, 'Bautista', 'male', NULL, '47 Rizal St, Brgy. Jaro', 'Panaderia De Manila', 'single', 'Water Refilling Operator', NULL, '125-406-285', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (4, 4, 1, 'Arturo', NULL, 'Zamora', 'male', NULL, '70 Rizal St, Brgy. Macabling', 'Panaderia De Manila', 'single', 'Laundry Service', NULL, '154-719-743', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (5, 5, 1, 'Miguel', NULL, 'Reyes', 'male', NULL, '57 Rizal St, Brgy. Holy Spirit', 'Kuya Eddie''s General Mdse', 'single', 'Rice Trader', NULL, '745-439-42', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (6, 6, 1, 'Roberto', NULL, 'Mercado', 'male', NULL, '33 Rizal St, Brgy. Sto. Domingo', 'Buko King Enterprise', 'single', 'Market Vendor', NULL, '991-381-791', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (7, 7, 1, 'Gloria', NULL, 'Gonzales', 'female', NULL, '48 Rizal St, Brgy. Mandurriao', 'Isdaan Fish Trading', 'single', 'Rice Trader', NULL, '934-689-983', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (8, 8, 1, 'Emilio', NULL, 'Valencia', 'male', NULL, '67 Rizal St, Brgy. Batasan Hills', 'Taho Master PH', 'single', 'Fish Vendor', NULL, '115-547-588', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (9, 9, 1, 'Corazon', NULL, 'Navarro', 'female', NULL, '27 Rizal St, Brgy. San Nicolas', 'Ate Rose Mini Mart', 'single', 'Water Refilling Operator', NULL, '614-617-914', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (10, 10, 1, 'Roberto', NULL, 'Flores', 'male', NULL, '60 Rizal St, Brgy. Sto. Domingo', 'Aling Nena''s Sari-Sari', 'single', 'Ukay-Ukay Vendor', NULL, '966-273-908', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (11, 11, 1, 'Rolando', NULL, 'Cruz', 'male', NULL, '15 Rizal St, Brgy. Commonwealth', 'Taho Master PH', 'single', 'Freelancer', NULL, '839-631-228', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (12, 12, 1, 'Angelica', NULL, 'Mercado', 'female', NULL, '28 Rizal St, Brgy. Commonwealth', 'Palengke Express', 'single', 'Fish Vendor', NULL, '804-397-490', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (13, 13, 1, 'Esperanza', NULL, 'Navarro', 'female', NULL, '84 Rizal St, Brgy. Commonwealth', 'Kuya Eddie''s General Mdse', 'single', 'Ukay-Ukay Vendor', NULL, '707-429-500', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (14, 14, 1, 'Manuel', NULL, 'Dela Cruz', 'male', NULL, '68 Rizal St, Brgy. Balibago', 'Lucky 7 Sari-Sari', 'single', 'Fish Vendor', NULL, '490-916-750', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (15, 15, 1, 'Eduardo', NULL, 'Flores', 'male', NULL, '97 Rizal St, Brgy. Commonwealth', 'Tres Marias Store', 'single', 'Ukay-Ukay Vendor', NULL, '899-620-866', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (16, 16, 1, 'Antonio', NULL, 'Mendoza', 'male', NULL, '42 Rizal St, Brgy. Jaro', 'Taho Master PH', 'single', 'Laundry Service', NULL, '373-799-944', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (17, 17, 1, 'Corazon', NULL, 'Zamora', 'female', NULL, '61 Rizal St, Brgy. Commonwealth', 'Golden Star Variety', 'single', 'Laundry Service', NULL, '676-397-33', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (18, 18, 1, 'Antonio', NULL, 'Mendoza', 'male', NULL, '11 Rizal St, Brgy. Holy Spirit', 'Mabuhay Mart', 'single', 'Farmer', NULL, '331-615-792', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (19, 19, 1, 'Gregorio', NULL, 'Zamora', 'male', NULL, '71 Rizal St, Brgy. San Nicolas', 'Mabuhay Mart', 'single', 'Street Food Vendor', NULL, '138-648-216', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (20, 20, 1, 'Ramon', NULL, 'Pascual', 'male', NULL, '26 Rizal St, Brgy. Mandurriao', 'Lucky 7 Sari-Sari', 'single', 'Laundry Service', NULL, '165-257-133', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (21, 21, 1, 'Roberto', NULL, 'Rivera', 'male', NULL, '31 Rizal St, Brgy. San Nicolas', 'Tres Marias Store', 'single', 'Carinderia Owner', NULL, '106-784-926', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (22, 22, 1, 'Ernesto', NULL, 'Garcia', 'male', NULL, '92 Rizal St, Brgy. Commonwealth', 'Taho Master PH', 'single', 'Rice Trader', NULL, '258-621-988', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (23, 23, 1, 'Carmen', NULL, 'Soriano', 'female', NULL, '63 Rizal St, Brgy. Jaro', 'Sampaguita Store', 'single', 'Carinderia Owner', NULL, '617-683-587', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (24, 24, 1, 'Andres', NULL, 'Villanueva', 'male', NULL, '88 Rizal St, Brgy. Holy Spirit', 'Lucky 7 Sari-Sari', 'single', 'Laundry Service', NULL, '251-142-165', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (25, 25, 1, 'Leonardo', NULL, 'Cruz', 'male', NULL, '18 Rizal St, Brgy. Jaro', 'Mabuhay Mart', 'single', 'Ukay-Ukay Vendor', NULL, '180-812-465', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (26, 26, 1, 'Manuel', NULL, 'Zamora', 'male', NULL, '63 Rizal St, Brgy. Mandurriao', 'Bahay Kubo Trading', 'single', 'Ukay-Ukay Vendor', NULL, '761-556-923', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (27, 27, 2, 'Andres', NULL, 'Domingo', 'male', NULL, 'Brgy. Macabling, San Jose Rural Workers Coop', NULL, 'single', 'Cooperative Operator', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (28, 28, 2, 'Antonio', NULL, 'Aquino', 'male', NULL, '17 Rizal St, Brgy. Mandurriao', 'Tiangge ni Mang Bert', 'single', 'Water Refilling Operator', NULL, '885-779-557', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (29, 29, 2, 'Patricia', NULL, 'Salazar', 'female', NULL, '64 Rizal St, Brgy. Mandurriao', 'Buko King Enterprise', 'single', 'Carinderia Owner', NULL, '495-177-277', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (30, 30, 2, 'Miguel', NULL, 'Pascual', 'male', NULL, '9 Rizal St, Brgy. Sto. Domingo', 'Mabuhay Mart', 'single', 'Freelancer', NULL, '551-587-88', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (31, 31, 2, 'Ramon', NULL, 'Mendoza', 'male', NULL, '5 Rizal St, Brgy. Batasan Hills', 'Golden Star Variety', 'single', 'Laundry Service', NULL, '600-724-587', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (32, 32, 2, 'Teresa', NULL, 'Cruz', 'female', NULL, '17 Rizal St, Brgy. Holy Spirit', 'Mabuhay Mart', 'single', 'Street Food Vendor', NULL, '571-759-614', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (33, 33, 2, 'Reynaldo', NULL, 'Pascual', 'male', NULL, '87 Rizal St, Brgy. Batasan Hills', 'Kakanin Corner', 'single', 'Sari-Sari Store Owner', NULL, '429-141-227', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (34, 34, 2, 'Remedios', NULL, 'Rivera', 'female', NULL, '29 Rizal St, Brgy. Holy Spirit', 'Lutong Bahay Catering', 'single', 'Fish Vendor', NULL, '497-316-595', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (35, 35, 2, 'Remedios', NULL, 'Soriano', 'female', NULL, '43 Rizal St, Brgy. Balibago', 'Lucky 7 Sari-Sari', 'single', 'Water Refilling Operator', NULL, '733-619-585', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (36, 36, 2, 'Marites', NULL, 'Lopez', 'female', NULL, '62 Rizal St, Brgy. Sto. Domingo', 'Bahay Kubo Trading', 'single', 'Rice Trader', NULL, '911-519-639', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (37, 37, 2, 'Ligaya', NULL, 'Domingo', 'female', NULL, '45 Rizal St, Brgy. Holy Spirit', 'Buko King Enterprise', 'single', 'Sari-Sari Store Owner', NULL, '159-292-346', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (38, 38, 2, 'Jocelyn', NULL, 'Lopez', 'female', NULL, '92 Rizal St, Brgy. Mandurriao', 'Kabayan Grocery', 'single', 'Laundry Service', NULL, '914-230-387', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (39, 39, 2, 'Carmen', NULL, 'Villanueva', 'female', NULL, '19 Rizal St, Brgy. Jaro', 'Mabuhay Mart', 'single', 'Freelancer', NULL, '487-893-56', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (40, 40, 2, 'Luisa', NULL, 'Domingo', 'female', NULL, '61 Rizal St, Brgy. Commonwealth', 'Panaderia De Manila', 'single', 'Ukay-Ukay Vendor', NULL, '577-741-290', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (41, 41, 2, 'Eduardo', NULL, 'Salazar', 'male', NULL, '59 Rizal St, Brgy. Sto. Domingo', 'Ate Rose Mini Mart', 'single', 'Freelancer', NULL, '471-130-604', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (42, 42, 2, 'Ramon', NULL, 'Santos', 'male', NULL, '45 Rizal St, Brgy. Sto. Domingo', 'Lucky 7 Sari-Sari', 'single', 'Street Food Vendor', NULL, '139-510-297', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (43, 43, 2, 'Victoria', NULL, 'Salazar', 'female', NULL, '41 Rizal St, Brgy. Batasan Hills', 'Sampaguita Store', 'single', 'Market Vendor', NULL, '947-914-316', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (44, 44, 2, 'Jose', NULL, 'Ramos', 'male', NULL, '54 Rizal St, Brgy. Jaro', 'Aling Nena''s Sari-Sari', 'single', 'Market Vendor', NULL, '502-326-167', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (45, 45, 2, 'Miguel', NULL, 'Mendoza', 'male', NULL, '26 Rizal St, Brgy. Batasan Hills', 'J&R Trading', 'single', 'Freelancer', NULL, '217-693-776', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (46, 46, 2, 'Ligaya', NULL, 'Ramos', 'female', NULL, '96 Rizal St, Brgy. Macabling', 'Tiangge ni Mang Bert', 'single', 'Ukay-Ukay Vendor', NULL, '770-290-53', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (47, 47, 2, 'Gregorio', NULL, 'Castillo', 'male', NULL, '52 Rizal St, Brgy. Balibago', 'Tiangge ni Mang Bert', 'single', 'Rice Trader', NULL, '972-252-375', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (48, 48, 2, 'Luisa', NULL, 'Dela Cruz', 'female', NULL, '60 Rizal St, Brgy. San Nicolas', 'Lutong Bahay Catering', 'single', 'Freelancer', NULL, '291-938-291', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (49, 49, 2, 'Carlos', NULL, 'Ramos', 'male', NULL, '21 Rizal St, Brgy. Macabling', 'Isdaan Fish Trading', 'single', 'Rice Trader', NULL, '640-962-97', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (50, 50, 2, 'Miguel', NULL, 'Flores', 'male', NULL, '21 Rizal St, Brgy. Macabling', 'J&R Trading', 'single', 'Laundry Service', NULL, '676-337-356', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (51, 51, 2, 'Carmen', NULL, 'Villanueva', 'female', NULL, '87 Rizal St, Brgy. Balibago', 'Golden Star Variety', 'single', 'Market Vendor', NULL, '119-344-479', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (52, 52, 2, 'Marites', NULL, 'Domingo', 'female', NULL, '25 Rizal St, Brgy. Balibago', 'Aling Nena''s Sari-Sari', 'single', 'Sari-Sari Store Owner', NULL, '937-552-750', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (53, 53, 3, 'Fernando', NULL, 'Cruz', 'male', NULL, 'Brgy. San Nicolas, Quezon City Vendors Trust', NULL, 'single', 'Cooperative Operator', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (54, 54, 3, 'Ernesto', NULL, 'Cruz', 'male', NULL, '57 Rizal St, Brgy. Jaro', 'Kakanin Corner', 'single', 'Carinderia Owner', NULL, '808-714-671', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (55, 55, 3, 'Roberto', NULL, 'Domingo', 'male', NULL, '95 Rizal St, Brgy. Macabling', 'Sampaguita Store', 'single', 'Street Food Vendor', NULL, '422-586-369', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (56, 56, 3, 'Luisa', NULL, 'Soriano', 'female', NULL, '3 Rizal St, Brgy. Commonwealth', 'Lutong Bahay Catering', 'single', 'Sari-Sari Store Owner', NULL, '843-193-439', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (57, 57, 3, 'Maria', NULL, 'Santos', 'female', NULL, '4 Rizal St, Brgy. Sto. Domingo', 'Lucky 7 Sari-Sari', 'single', 'Carinderia Owner', NULL, '126-220-811', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (58, 58, 3, 'Ricardo', NULL, 'Cruz', 'male', NULL, '30 Rizal St, Brgy. Jaro', 'Aling Nena''s Sari-Sari', 'single', 'Carinderia Owner', NULL, '220-373-928', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (59, 59, 3, 'Remedios', NULL, 'Domingo', 'female', NULL, '86 Rizal St, Brgy. Batasan Hills', 'Kuya Eddie''s General Mdse', 'single', 'Sari-Sari Store Owner', NULL, '949-374-338', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (60, 60, 3, 'Andres', NULL, 'Reyes', 'male', NULL, '5 Rizal St, Brgy. Commonwealth', 'Tiangge ni Mang Bert', 'single', 'Tricycle Driver', NULL, '755-446-796', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (61, 61, 3, 'Luisa', NULL, 'Dela Cruz', 'female', NULL, '16 Rizal St, Brgy. Commonwealth', 'Aling Nena''s Sari-Sari', 'single', 'Freelancer', NULL, '297-616-699', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (62, 62, 3, 'Rafael', NULL, 'Zamora', 'male', NULL, '67 Rizal St, Brgy. Jaro', 'Kuya Eddie''s General Mdse', 'single', 'Water Refilling Operator', NULL, '467-288-224', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (63, 63, 3, 'Manuel', NULL, 'Santos', 'male', NULL, '45 Rizal St, Brgy. Sto. Domingo', 'Kabayan Grocery', 'single', 'Market Vendor', NULL, '748-609-781', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (64, 64, 3, 'Elena', NULL, 'Garcia', 'female', NULL, '73 Rizal St, Brgy. Macabling', 'Golden Star Variety', 'single', 'Street Food Vendor', NULL, '330-132-109', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (65, 65, 3, 'Rowena', NULL, 'Domingo', 'female', NULL, '93 Rizal St, Brgy. Balibago', 'Buko King Enterprise', 'single', 'Ukay-Ukay Vendor', NULL, '628-978-872', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (66, 66, 3, 'Arturo', NULL, 'Santos', 'male', NULL, '18 Rizal St, Brgy. Batasan Hills', 'Sampaguita Store', 'single', 'Water Refilling Operator', NULL, '200-208-427', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (67, 67, 3, 'Gregorio', NULL, 'Lopez', 'male', NULL, '80 Rizal St, Brgy. Batasan Hills', 'J&R Trading', 'single', 'Carinderia Owner', NULL, '735-292-644', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (68, 68, 3, 'Luisa', NULL, 'Flores', 'female', NULL, '77 Rizal St, Brgy. Balibago', 'Ate Rose Mini Mart', 'single', 'Water Refilling Operator', NULL, '534-415-571', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (69, 69, 3, 'Ricardo', NULL, 'Mercado', 'male', NULL, '11 Rizal St, Brgy. Holy Spirit', 'Lutong Bahay Catering', 'single', 'Market Vendor', NULL, '986-535-719', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (70, 70, 3, 'Merlinda', NULL, 'Bautista', 'female', NULL, '52 Rizal St, Brgy. Batasan Hills', 'J&R Trading', 'single', 'Fish Vendor', NULL, '635-920-974', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (71, 71, 3, 'Cecilia', NULL, 'Lopez', 'female', NULL, '14 Rizal St, Brgy. Balibago', 'Bahay Kubo Trading', 'single', 'Sari-Sari Store Owner', NULL, '896-473-163', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (72, 72, 3, 'Rowena', NULL, 'Pascual', 'female', NULL, '53 Rizal St, Brgy. Commonwealth', 'Ate Rose Mini Mart', 'single', 'Ukay-Ukay Vendor', NULL, '407-888-561', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (73, 73, 3, 'Gregorio', NULL, 'Villanueva', 'male', NULL, '56 Rizal St, Brgy. Commonwealth', 'Aling Nena''s Sari-Sari', 'single', 'Fish Vendor', NULL, '455-696-676', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (74, 74, 3, 'Cecilia', NULL, 'Mercado', 'female', NULL, '53 Rizal St, Brgy. Batasan Hills', 'Tres Marias Store', 'single', 'Tricycle Driver', NULL, '101-821-961', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (75, 75, 3, 'Victoria', NULL, 'Fernandez', 'female', NULL, '13 Rizal St, Brgy. Holy Spirit', 'Buko King Enterprise', 'single', 'Street Food Vendor', NULL, '396-983-277', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (76, 76, 4, 'Rosario', NULL, 'Torres', 'female', NULL, 'Brgy. San Nicolas, Makati Business Sari-Sari Coop', NULL, 'single', 'Cooperative Operator', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (77, 77, 4, 'Arturo', NULL, 'Reyes', 'male', NULL, '85 Rizal St, Brgy. Batasan Hills', 'Tindahan ni Nanay', 'single', 'Street Food Vendor', NULL, '937-279-559', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (78, 78, 4, 'Roberto', NULL, 'Ramos', 'male', NULL, '31 Rizal St, Brgy. Mandurriao', 'Bahay Kubo Trading', 'single', 'Rice Trader', NULL, '729-691-896', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (79, 79, 4, 'Angelica', NULL, 'Reyes', 'female', NULL, '5 Rizal St, Brgy. Commonwealth', 'Palengke Express', 'single', 'Rice Trader', NULL, '174-924-376', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (80, 80, 4, 'Rolando', NULL, 'Flores', 'male', NULL, '74 Rizal St, Brgy. Sto. Domingo', 'Aling Nena''s Sari-Sari', 'single', 'Carinderia Owner', NULL, '464-671-718', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (81, 81, 4, 'Rowena', NULL, 'Fernandez', 'female', NULL, '19 Rizal St, Brgy. Macabling', 'J&R Trading', 'single', 'Freelancer', NULL, '157-916-32', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (82, 82, 4, 'Eduardo', NULL, 'Castillo', 'male', NULL, '23 Rizal St, Brgy. Batasan Hills', 'Golden Star Variety', 'single', 'Street Food Vendor', NULL, '759-608-157', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (83, 83, 4, 'Rafael', NULL, 'Gonzales', 'male', NULL, '16 Rizal St, Brgy. Macabling', 'Mabuhay Mart', 'single', 'Sari-Sari Store Owner', NULL, '234-355-680', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (84, 84, 4, 'Danilo', NULL, 'Flores', 'male', NULL, '3 Rizal St, Brgy. Sto. Domingo', 'Panaderia De Manila', 'single', 'Market Vendor', NULL, '632-987-331', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (85, 85, 4, 'Ramon', NULL, 'Domingo', 'male', NULL, '99 Rizal St, Brgy. Commonwealth', 'Palengke Express', 'single', 'Fish Vendor', NULL, '169-359-324', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (86, 86, 4, 'Miguel', NULL, 'Flores', 'male', NULL, '59 Rizal St, Brgy. Holy Spirit', 'Sampaguita Store', 'single', 'Farmer', NULL, '874-943-142', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (87, 87, 4, 'Fernando', NULL, 'Mercado', 'male', NULL, '69 Rizal St, Brgy. Holy Spirit', 'Kabayan Grocery', 'single', 'Water Refilling Operator', NULL, '932-614-214', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (88, 88, 4, 'Teresa', NULL, 'Villanueva', 'female', NULL, '61 Rizal St, Brgy. Balibago', 'Panaderia De Manila', 'single', 'Freelancer', NULL, '261-504-470', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (89, 89, 4, 'Ligaya', NULL, 'Cruz', 'female', NULL, '33 Rizal St, Brgy. Holy Spirit', 'Buko King Enterprise', 'single', 'Carinderia Owner', NULL, '251-271-118', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (90, 90, 4, 'Esperanza', NULL, 'Cruz', 'female', NULL, '13 Rizal St, Brgy. Macabling', 'Kabayan Grocery', 'single', 'Market Vendor', NULL, '672-231-153', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (91, 91, 4, 'Maria', NULL, 'Aquino', 'female', NULL, '69 Rizal St, Brgy. San Nicolas', 'Tres Marias Store', 'single', 'Tricycle Driver', NULL, '177-265-432', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (92, 92, 4, 'Eduardo', NULL, 'Gonzales', 'male', NULL, '96 Rizal St, Brgy. Holy Spirit', 'Tindahan ni Nanay', 'single', 'Market Vendor', NULL, '915-926-864', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (93, 93, 4, 'Maria', NULL, 'Mercado', 'female', NULL, '18 Rizal St, Brgy. Jaro', 'Tindahan ni Nanay', 'single', 'Laundry Service', NULL, '106-436-285', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (94, 94, 4, 'Patricia', NULL, 'Ramos', 'female', NULL, '53 Rizal St, Brgy. Macabling', 'Tiangge ni Mang Bert', 'single', 'Sari-Sari Store Owner', NULL, '483-886-278', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (95, 95, 4, 'Rolando', NULL, 'Valencia', 'male', NULL, '98 Rizal St, Brgy. Mandurriao', 'Tindahan ni Nanay', 'single', 'Laundry Service', NULL, '390-431-258', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (96, 96, 4, 'Fernando', NULL, 'Navarro', 'male', NULL, '51 Rizal St, Brgy. Holy Spirit', 'Bahay Kubo Trading', 'single', 'Market Vendor', NULL, '449-901-685', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (97, 97, 4, 'Jose', NULL, 'Salazar', 'male', NULL, '42 Rizal St, Brgy. Sto. Domingo', 'J&R Trading', 'single', 'Laundry Service', NULL, '920-957-156', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (98, 98, 4, 'Lourdes', NULL, 'Domingo', 'female', NULL, '67 Rizal St, Brgy. Jaro', 'Palengke Express', 'single', 'Ukay-Ukay Vendor', NULL, '863-821-422', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (99, 99, 4, 'Merlinda', NULL, 'Gonzales', 'female', NULL, '15 Rizal St, Brgy. San Nicolas', 'J&R Trading', 'single', 'Laundry Service', NULL, '553-989-603', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (100, 100, 4, 'Ernesto', NULL, 'Fernandez', 'male', NULL, '9 Rizal St, Brgy. Commonwealth', 'Mabuhay Mart', 'single', 'Farmer', NULL, '304-969-419', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (101, 101, 5, 'Jose', NULL, 'Bautista', 'male', NULL, 'Brgy. San Nicolas, Calamba Agricultural Cooperative', NULL, 'single', 'Cooperative Operator', NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (102, 102, 5, 'Victoria', NULL, 'Rivera', 'female', NULL, '6 Rizal St, Brgy. Balibago', 'J&R Trading', 'single', 'Sari-Sari Store Owner', NULL, '354-115-262', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (103, 103, 5, 'Cecilia', NULL, 'Lopez', 'female', NULL, '18 Rizal St, Brgy. Batasan Hills', 'Lutong Bahay Catering', 'single', 'Freelancer', NULL, '359-569-189', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (104, 104, 5, 'Leonardo', NULL, 'Flores', 'male', NULL, '84 Rizal St, Brgy. Sto. Domingo', 'Aling Nena''s Sari-Sari', 'single', 'Ukay-Ukay Vendor', NULL, '940-406-98', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (105, 105, 5, 'Maria', NULL, 'Mendoza', 'female', NULL, '29 Rizal St, Brgy. Batasan Hills', 'Palengke Express', 'single', 'Ukay-Ukay Vendor', NULL, '227-232-188', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (106, 106, 5, 'Rosario', NULL, 'Dela Cruz', 'female', NULL, '1 Rizal St, Brgy. Jaro', 'Kuya Eddie''s General Mdse', 'single', 'Market Vendor', NULL, '970-454-865', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (107, 107, 5, 'Ligaya', NULL, 'Torres', 'female', NULL, '44 Rizal St, Brgy. Macabling', 'Sampaguita Store', 'single', 'Fish Vendor', NULL, '826-186-62', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (108, 108, 5, 'Leonardo', NULL, 'Mercado', 'male', NULL, '54 Rizal St, Brgy. Mandurriao', 'Taho Master PH', 'single', 'Carinderia Owner', NULL, '428-770-373', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (109, 109, 5, 'Esperanza', NULL, 'Santos', 'female', NULL, '9 Rizal St, Brgy. Jaro', 'Sampaguita Store', 'single', 'Laundry Service', NULL, '992-298-89', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (110, 110, 5, 'Marites', NULL, 'Torres', 'female', NULL, '92 Rizal St, Brgy. Commonwealth', 'Tindahan ni Nanay', 'single', 'Laundry Service', NULL, '682-750-542', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (111, 111, 5, 'Reynaldo', NULL, 'Navarro', 'male', NULL, '68 Rizal St, Brgy. Balibago', 'Tiangge ni Mang Bert', 'single', 'Fish Vendor', NULL, '449-236-867', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (112, 112, 5, 'Jose', NULL, 'Dela Cruz', 'male', NULL, '23 Rizal St, Brgy. Balibago', 'Kakanin Corner', 'single', 'Tricycle Driver', NULL, '868-368-268', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (113, 113, 5, 'Rolando', NULL, 'Castillo', 'male', NULL, '76 Rizal St, Brgy. Holy Spirit', 'Lucky 7 Sari-Sari', 'single', 'Freelancer', NULL, '290-548-440', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (114, 114, 5, 'Leonardo', NULL, 'Ramos', 'male', NULL, '46 Rizal St, Brgy. Mandurriao', 'Palengke Express', 'single', 'Farmer', NULL, '373-101-466', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (115, 115, 5, 'Angelica', NULL, 'Domingo', 'female', NULL, '48 Rizal St, Brgy. Sto. Domingo', 'Tindahan ni Nanay', 'single', 'Ukay-Ukay Vendor', NULL, '831-848-699', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (116, 116, 5, 'Fernando', NULL, 'Ramos', 'male', NULL, '48 Rizal St, Brgy. Commonwealth', 'J&R Trading', 'single', 'Water Refilling Operator', NULL, '571-297-160', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (117, 117, 5, 'Reynaldo', NULL, 'Castillo', 'male', NULL, '49 Rizal St, Brgy. Balibago', 'Lutong Bahay Catering', 'single', 'Water Refilling Operator', NULL, '164-290-789', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (118, 118, 5, 'Miguel', NULL, 'Bautista', 'male', NULL, '7 Rizal St, Brgy. Jaro', 'Lucky 7 Sari-Sari', 'single', 'Tricycle Driver', NULL, '406-410-136', NULL, NULL, NULL, NULL, NULL);
INSERT INTO `user_profiles` (`profile_id`, `user_id`, `tenant_id`, `first_name`, `middle_name`, `last_name`, `gender`, `birthdate`, `address`, `business_name`, `marital_status`, `occupation`, `place_of_birth`, `tin`, `region`, `province`, `city`, `barangay`, `photo_url`) VALUES (119, 119, 5, 'Eduardo', NULL, 'Santos', 'male', NULL, '13 Rizal St, Brgy. San Nicolas', 'J&R Trading', 'single', 'Ukay-Ukay Vendor', NULL, '545-864-958', NULL, NULL, NULL, NULL, NULL);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int DEFAULT NULL,
  `member_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('superadmin','operator','member') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `status` enum('pending','active','suspended','inactive','deactivated') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `interest_tier` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'T1_5_PERCENT',
  `is_deactivation_locked` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  `consent_accepted_at` datetime(3) DEFAULT NULL,
  `consent_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `users_email_tenant_id_key` (`email`,`tenant_id`),
  UNIQUE KEY `users_username_tenant_id_key` (`username`,`tenant_id`),
  UNIQUE KEY `users_member_code_tenant_id_key` (`member_code`,`tenant_id`),
  KEY `users_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;

INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (1, 1, 'AGP-S-000001', 'superadmin', 'agapay.saas@gmail.com', NULL, '$2b$10$0.SZk125t.gpbyevu/L07uhqivEoqozeC1rEuhR8rpO.pGoK3S4TK', 'superadmin', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:01 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:01 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (2, 1, 'MALOLOS-O-WC7Z-0001', 'jocelyn-domingo-MALOLOS-O-WC7Z-0001', 'jocelyn.domingo.MALOLOS-O-WC7Z-0001@gmail.com', NULL, '$2b$10$0.SZk125t.gpbyevu/L07uhqivEoqozeC1rEuhR8rpO.pGoK3S4TK', 'operator', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:03 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:03 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (3, 1, 'MALOLOS-M-F48K-0001', 'gregorio-bautista-MALOLOS-M-F48K-0001', 'gregorio.bautista.MALOLOS-M-F48K-0001@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:04 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:04 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (4, 1, 'MALOLOS-M-HWR4-0002', 'arturo-zamora-MALOLOS-M-HWR4-0002', 'arturo.zamora.MALOLOS-M-HWR4-0002@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:05 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:05 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (5, 1, 'MALOLOS-M-K3EN-0003', 'miguel-reyes-MALOLOS-M-K3EN-0003', 'miguel.reyes.MALOLOS-M-K3EN-0003@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:05 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:05 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (6, 1, 'MALOLOS-M-SPJM-0004', 'roberto-mercado-MALOLOS-M-SPJM-0004', 'roberto.mercado.MALOLOS-M-SPJM-0004@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:05 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:05 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (7, 1, 'MALOLOS-M-M50K-0005', 'gloria-gonzales-MALOLOS-M-M50K-0005', 'gloria.gonzales.MALOLOS-M-M50K-0005@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (8, 1, 'MALOLOS-M-89SB-0006', 'emilio-valencia-MALOLOS-M-89SB-0006', 'emilio.valencia.MALOLOS-M-89SB-0006@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (9, 1, 'MALOLOS-M-00LA-0007', 'corazon-navarro-MALOLOS-M-00LA-0007', 'corazon.navarro.MALOLOS-M-00LA-0007@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (10, 1, 'MALOLOS-M-NP1R-0008', 'roberto-flores-MALOLOS-M-NP1R-0008', 'roberto.flores.MALOLOS-M-NP1R-0008@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:07 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (11, 1, 'MALOLOS-M-KIHV-0009', 'rolando-cruz-MALOLOS-M-KIHV-0009', 'rolando.cruz.MALOLOS-M-KIHV-0009@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:07 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (12, 1, 'MALOLOS-M-9423-0010', 'angelica-mercado-MALOLOS-M-9423-0010', 'angelica.mercado.MALOLOS-M-9423-0010@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:07 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:07 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (13, 1, 'MALOLOS-M-A1TN-0011', 'esperanza-navarro-MALOLOS-M-A1TN-0011', 'esperanza.navarro.MALOLOS-M-A1TN-0011@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:08 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:08 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (14, 1, 'MALOLOS-M-90A6-0012', 'manuel-delacruz-MALOLOS-M-90A6-0012', 'manuel.delacruz.MALOLOS-M-90A6-0012@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:08 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:08 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (15, 1, 'MALOLOS-M-JKVJ-0013', 'eduardo-flores-MALOLOS-M-JKVJ-0013', 'eduardo.flores.MALOLOS-M-JKVJ-0013@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:09 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:09 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (16, 1, 'MALOLOS-M-SXUW-0014', 'antonio-mendoza-MALOLOS-M-SXUW-0014', 'antonio.mendoza.MALOLOS-M-SXUW-0014@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:09 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:09 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (17, 1, 'MALOLOS-M-VUJD-0015', 'corazon-zamora-MALOLOS-M-VUJD-0015', 'corazon.zamora.MALOLOS-M-VUJD-0015@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:09 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:09 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (18, 1, 'MALOLOS-M-O138-0016', 'antonio-mendoza-MALOLOS-M-O138-0016', 'antonio.mendoza.MALOLOS-M-O138-0016@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:10 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:10 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (19, 1, 'MALOLOS-M-R0W8-0017', 'gregorio-zamora-MALOLOS-M-R0W8-0017', 'gregorio.zamora.MALOLOS-M-R0W8-0017@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:10 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:10 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (20, 1, 'MALOLOS-M-U54D-0018', 'ramon-pascual-MALOLOS-M-U54D-0018', 'ramon.pascual.MALOLOS-M-U54D-0018@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:10 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:10 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (21, 1, 'MALOLOS-M-1DXW-0019', 'roberto-rivera-MALOLOS-M-1DXW-0019', 'roberto.rivera.MALOLOS-M-1DXW-0019@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:11 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:11 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (22, 1, 'MALOLOS-M-X7TK-0020', 'ernesto-garcia-MALOLOS-M-X7TK-0020', 'ernesto.garcia.MALOLOS-M-X7TK-0020@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:11 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:11 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (23, 1, 'MALOLOS-M-QS1G-0021', 'carmen-soriano-MALOLOS-M-QS1G-0021', 'carmen.soriano.MALOLOS-M-QS1G-0021@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:11 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:11 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (24, 1, 'MALOLOS-M-OS8B-0022', 'andres-villanueva-MALOLOS-M-OS8B-0022', 'andres.villanueva.MALOLOS-M-OS8B-0022@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:12 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:12 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (25, 1, 'MALOLOS-M-4FPN-0023', 'leonardo-cruz-MALOLOS-M-4FPN-0023', 'leonardo.cruz.MALOLOS-M-4FPN-0023@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:12 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:12 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (26, 1, 'MALOLOS-M-G7OQ-0024', 'manuel-zamora-MALOLOS-M-G7OQ-0024', 'manuel.zamora.MALOLOS-M-G7OQ-0024@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:12 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:12 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (27, 2, 'SAN-JOSE-O-6JKU-0001', 'andres-domingo-SAN-JOSE-O-6JKU-0001', 'andres.domingo.SAN-JOSE-O-6JKU-0001@gmail.com', NULL, '$2b$10$0.SZk125t.gpbyevu/L07uhqivEoqozeC1rEuhR8rpO.pGoK3S4TK', 'operator', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:19 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:19 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (28, 2, 'SAN-JOSE-M-O3NM-0001', 'antonio-aquino-SAN-JOSE-M-O3NM-0001', 'antonio.aquino.SAN-JOSE-M-O3NM-0001@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:19 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:19 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (29, 2, 'SAN-JOSE-M-DI0R-0002', 'patricia-salazar-SAN-JOSE-M-DI0R-0002', 'patricia.salazar.SAN-JOSE-M-DI0R-0002@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:20 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:20 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (30, 2, 'SAN-JOSE-M-AVST-0003', 'miguel-pascual-SAN-JOSE-M-AVST-0003', 'miguel.pascual.SAN-JOSE-M-AVST-0003@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:20 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:20 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (31, 2, 'SAN-JOSE-M-FQVG-0004', 'ramon-mendoza-SAN-JOSE-M-FQVG-0004', 'ramon.mendoza.SAN-JOSE-M-FQVG-0004@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:20 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:20 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (32, 2, 'SAN-JOSE-M-91QQ-0005', 'teresa-cruz-SAN-JOSE-M-91QQ-0005', 'teresa.cruz.SAN-JOSE-M-91QQ-0005@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (33, 2, 'SAN-JOSE-M-IEID-0006', 'reynaldo-pascual-SAN-JOSE-M-IEID-0006', 'reynaldo.pascual.SAN-JOSE-M-IEID-0006@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (34, 2, 'SAN-JOSE-M-SJNC-0007', 'remedios-rivera-SAN-JOSE-M-SJNC-0007', 'remedios.rivera.SAN-JOSE-M-SJNC-0007@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (35, 2, 'SAN-JOSE-M-QZ47-0008', 'remedios-soriano-SAN-JOSE-M-QZ47-0008', 'remedios.soriano.SAN-JOSE-M-QZ47-0008@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:21 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (36, 2, 'SAN-JOSE-M-HE68-0009', 'marites-lopez-SAN-JOSE-M-HE68-0009', 'marites.lopez.SAN-JOSE-M-HE68-0009@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:22 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:22 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (37, 2, 'SAN-JOSE-M-R9C4-0010', 'ligaya-domingo-SAN-JOSE-M-R9C4-0010', 'ligaya.domingo.SAN-JOSE-M-R9C4-0010@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:22 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:22 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (38, 2, 'SAN-JOSE-M-KQ8P-0011', 'jocelyn-lopez-SAN-JOSE-M-KQ8P-0011', 'jocelyn.lopez.SAN-JOSE-M-KQ8P-0011@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:22 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:22 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (39, 2, 'SAN-JOSE-M-UHRO-0012', 'carmen-villanueva-SAN-JOSE-M-UHRO-0012', 'carmen.villanueva.SAN-JOSE-M-UHRO-0012@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:23 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:23 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (40, 2, 'SAN-JOSE-M-S5OX-0013', 'luisa-domingo-SAN-JOSE-M-S5OX-0013', 'luisa.domingo.SAN-JOSE-M-S5OX-0013@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:23 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:23 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (41, 2, 'SAN-JOSE-M-DUO0-0014', 'eduardo-salazar-SAN-JOSE-M-DUO0-0014', 'eduardo.salazar.SAN-JOSE-M-DUO0-0014@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:23 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:23 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (42, 2, 'SAN-JOSE-M-M80W-0015', 'ramon-santos-SAN-JOSE-M-M80W-0015', 'ramon.santos.SAN-JOSE-M-M80W-0015@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:24 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:24 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (43, 2, 'SAN-JOSE-M-4M6Q-0016', 'victoria-salazar-SAN-JOSE-M-4M6Q-0016', 'victoria.salazar.SAN-JOSE-M-4M6Q-0016@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:24 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:24 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (44, 2, 'SAN-JOSE-M-5COV-0017', 'jose-ramos-SAN-JOSE-M-5COV-0017', 'jose.ramos.SAN-JOSE-M-5COV-0017@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:24 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:24 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (45, 2, 'SAN-JOSE-M-25QJ-0018', 'miguel-mendoza-SAN-JOSE-M-25QJ-0018', 'miguel.mendoza.SAN-JOSE-M-25QJ-0018@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (46, 2, 'SAN-JOSE-M-I2AH-0019', 'ligaya-ramos-SAN-JOSE-M-I2AH-0019', 'ligaya.ramos.SAN-JOSE-M-I2AH-0019@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (47, 2, 'SAN-JOSE-M-QRWJ-0020', 'gregorio-castillo-SAN-JOSE-M-QRWJ-0020', 'gregorio.castillo.SAN-JOSE-M-QRWJ-0020@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (48, 2, 'SAN-JOSE-M-KPA1-0021', 'luisa-delacruz-SAN-JOSE-M-KPA1-0021', 'luisa.delacruz.SAN-JOSE-M-KPA1-0021@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:25 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (49, 2, 'SAN-JOSE-M-6M4E-0022', 'carlos-ramos-SAN-JOSE-M-6M4E-0022', 'carlos.ramos.SAN-JOSE-M-6M4E-0022@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:26 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:26 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (50, 2, 'SAN-JOSE-M-7NDF-0023', 'miguel-flores-SAN-JOSE-M-7NDF-0023', 'miguel.flores.SAN-JOSE-M-7NDF-0023@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:26 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:26 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (51, 2, 'SAN-JOSE-M-6PDF-0024', 'carmen-villanueva-SAN-JOSE-M-6PDF-0024', 'carmen.villanueva.SAN-JOSE-M-6PDF-0024@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:26 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:26 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (52, 2, 'SAN-JOSE-M-L5AF-0025', 'marites-domingo-SAN-JOSE-M-L5AF-0025', 'marites.domingo.SAN-JOSE-M-L5AF-0025@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:27 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (53, 3, 'QC-VENDORS-O-2B7C-0001', 'fernando-cruz-QC-VENDORS-O-2B7C-0001', 'fernando.cruz.QC-VENDORS-O-2B7C-0001@gmail.com', NULL, '$2b$10$0.SZk125t.gpbyevu/L07uhqivEoqozeC1rEuhR8rpO.pGoK3S4TK', 'operator', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:34 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:34 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (54, 3, 'QC-VENDORS-M-LJBL-0001', 'ernesto-cruz-QC-VENDORS-M-LJBL-0001', 'ernesto.cruz.QC-VENDORS-M-LJBL-0001@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:34 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:34 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (55, 3, 'QC-VENDORS-M-GKSQ-0002', 'roberto-domingo-QC-VENDORS-M-GKSQ-0002', 'roberto.domingo.QC-VENDORS-M-GKSQ-0002@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:35 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:35 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (56, 3, 'QC-VENDORS-M-7921-0003', 'luisa-soriano-QC-VENDORS-M-7921-0003', 'luisa.soriano.QC-VENDORS-M-7921-0003@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:35 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:35 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (57, 3, 'QC-VENDORS-M-3XGQ-0004', 'maria-santos-QC-VENDORS-M-3XGQ-0004', 'maria.santos.QC-VENDORS-M-3XGQ-0004@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:35 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:35 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (58, 3, 'QC-VENDORS-M-53TX-0005', 'ricardo-cruz-QC-VENDORS-M-53TX-0005', 'ricardo.cruz.QC-VENDORS-M-53TX-0005@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:36 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:36 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (59, 3, 'QC-VENDORS-M-COHH-0006', 'remedios-domingo-QC-VENDORS-M-COHH-0006', 'remedios.domingo.QC-VENDORS-M-COHH-0006@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:36 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:36 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (60, 3, 'QC-VENDORS-M-YFV3-0007', 'andres-reyes-QC-VENDORS-M-YFV3-0007', 'andres.reyes.QC-VENDORS-M-YFV3-0007@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:36 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:36 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (61, 3, 'QC-VENDORS-M-PHSD-0008', 'luisa-delacruz-QC-VENDORS-M-PHSD-0008', 'luisa.delacruz.QC-VENDORS-M-PHSD-0008@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:37 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:37 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (62, 3, 'QC-VENDORS-M-0LKG-0009', 'rafael-zamora-QC-VENDORS-M-0LKG-0009', 'rafael.zamora.QC-VENDORS-M-0LKG-0009@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:37 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:37 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (63, 3, 'QC-VENDORS-M-ADIX-0010', 'manuel-santos-QC-VENDORS-M-ADIX-0010', 'manuel.santos.QC-VENDORS-M-ADIX-0010@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:37 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:37 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (64, 3, 'QC-VENDORS-M-0KUQ-0011', 'elena-garcia-QC-VENDORS-M-0KUQ-0011', 'elena.garcia.QC-VENDORS-M-0KUQ-0011@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (65, 3, 'QC-VENDORS-M-OTEA-0012', 'rowena-domingo-QC-VENDORS-M-OTEA-0012', 'rowena.domingo.QC-VENDORS-M-OTEA-0012@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (66, 3, 'QC-VENDORS-M-GY1G-0013', 'arturo-santos-QC-VENDORS-M-GY1G-0013', 'arturo.santos.QC-VENDORS-M-GY1G-0013@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (67, 3, 'QC-VENDORS-M-1KKR-0014', 'gregorio-lopez-QC-VENDORS-M-1KKR-0014', 'gregorio.lopez.QC-VENDORS-M-1KKR-0014@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:38 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (68, 3, 'QC-VENDORS-M-0BV7-0015', 'luisa-flores-QC-VENDORS-M-0BV7-0015', 'luisa.flores.QC-VENDORS-M-0BV7-0015@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:39 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:39 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (69, 3, 'QC-VENDORS-M-75P4-0016', 'ricardo-mercado-QC-VENDORS-M-75P4-0016', 'ricardo.mercado.QC-VENDORS-M-75P4-0016@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:39 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:39 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (70, 3, 'QC-VENDORS-M-HSZU-0017', 'merlinda-bautista-QC-VENDORS-M-HSZU-0017', 'merlinda.bautista.QC-VENDORS-M-HSZU-0017@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:39 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:39 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (71, 3, 'QC-VENDORS-M-U9UH-0018', 'cecilia-lopez-QC-VENDORS-M-U9UH-0018', 'cecilia.lopez.QC-VENDORS-M-U9UH-0018@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (72, 3, 'QC-VENDORS-M-AS9Q-0019', 'rowena-pascual-QC-VENDORS-M-AS9Q-0019', 'rowena.pascual.QC-VENDORS-M-AS9Q-0019@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (73, 3, 'QC-VENDORS-M-LBDA-0020', 'gregorio-villanueva-QC-VENDORS-M-LBDA-0020', 'gregorio.villanueva.QC-VENDORS-M-LBDA-0020@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (74, 3, 'QC-VENDORS-M-KX07-0021', 'cecilia-mercado-QC-VENDORS-M-KX07-0021', 'cecilia.mercado.QC-VENDORS-M-KX07-0021@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:40 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (75, 3, 'QC-VENDORS-M-M0VQ-0022', 'victoria-fernandez-QC-VENDORS-M-M0VQ-0022', 'victoria.fernandez.QC-VENDORS-M-M0VQ-0022@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:41 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:41 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (76, 4, 'MAKATI-BUSINESS-O-RKTR-0001', 'rosario-torres-MAKATI-BUSINESS-O-RKTR-0001', 'rosario.torres.MAKATI-BUSINESS-O-RKTR-0001@gmail.com', NULL, '$2b$10$0.SZk125t.gpbyevu/L07uhqivEoqozeC1rEuhR8rpO.pGoK3S4TK', 'operator', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:48 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:48 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (77, 4, 'MAKATI-BUSINESS-M-CX3N-0001', 'arturo-reyes-MAKATI-BUSINESS-M-CX3N-0001', 'arturo.reyes.MAKATI-BUSINESS-M-CX3N-0001@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:48 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:48 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (78, 4, 'MAKATI-BUSINESS-M-J1XO-0002', 'roberto-ramos-MAKATI-BUSINESS-M-J1XO-0002', 'roberto.ramos.MAKATI-BUSINESS-M-J1XO-0002@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:48 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:48 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (79, 4, 'MAKATI-BUSINESS-M-UUO9-0003', 'angelica-reyes-MAKATI-BUSINESS-M-UUO9-0003', 'angelica.reyes.MAKATI-BUSINESS-M-UUO9-0003@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (80, 4, 'MAKATI-BUSINESS-M-JRQT-0004', 'rolando-flores-MAKATI-BUSINESS-M-JRQT-0004', 'rolando.flores.MAKATI-BUSINESS-M-JRQT-0004@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (81, 4, 'MAKATI-BUSINESS-M-94V2-0005', 'rowena-fernandez-MAKATI-BUSINESS-M-94V2-0005', 'rowena.fernandez.MAKATI-BUSINESS-M-94V2-0005@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (82, 4, 'MAKATI-BUSINESS-M-WBJE-0006', 'eduardo-castillo-MAKATI-BUSINESS-M-WBJE-0006', 'eduardo.castillo.MAKATI-BUSINESS-M-WBJE-0006@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:49 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (83, 4, 'MAKATI-BUSINESS-M-Z6XZ-0007', 'rafael-gonzales-MAKATI-BUSINESS-M-Z6XZ-0007', 'rafael.gonzales.MAKATI-BUSINESS-M-Z6XZ-0007@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:50 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:50 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (84, 4, 'MAKATI-BUSINESS-M-CYVN-0008', 'danilo-flores-MAKATI-BUSINESS-M-CYVN-0008', 'danilo.flores.MAKATI-BUSINESS-M-CYVN-0008@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:50 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:50 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (85, 4, 'MAKATI-BUSINESS-M-JUZK-0009', 'ramon-domingo-MAKATI-BUSINESS-M-JUZK-0009', 'ramon.domingo.MAKATI-BUSINESS-M-JUZK-0009@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:50 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:50 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (86, 4, 'MAKATI-BUSINESS-M-L02T-0010', 'miguel-flores-MAKATI-BUSINESS-M-L02T-0010', 'miguel.flores.MAKATI-BUSINESS-M-L02T-0010@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:51 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:51 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (87, 4, 'MAKATI-BUSINESS-M-TGRL-0011', 'fernando-mercado-MAKATI-BUSINESS-M-TGRL-0011', 'fernando.mercado.MAKATI-BUSINESS-M-TGRL-0011@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:51 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:51 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (88, 4, 'MAKATI-BUSINESS-M-LT3L-0012', 'teresa-villanueva-MAKATI-BUSINESS-M-LT3L-0012', 'teresa.villanueva.MAKATI-BUSINESS-M-LT3L-0012@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (89, 4, 'MAKATI-BUSINESS-M-7ZX1-0013', 'ligaya-cruz-MAKATI-BUSINESS-M-7ZX1-0013', 'ligaya.cruz.MAKATI-BUSINESS-M-7ZX1-0013@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (90, 4, 'MAKATI-BUSINESS-M-BJ7H-0014', 'esperanza-cruz-MAKATI-BUSINESS-M-BJ7H-0014', 'esperanza.cruz.MAKATI-BUSINESS-M-BJ7H-0014@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (91, 4, 'MAKATI-BUSINESS-M-3XGA-0015', 'maria-aquino-MAKATI-BUSINESS-M-3XGA-0015', 'maria.aquino.MAKATI-BUSINESS-M-3XGA-0015@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:52 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (92, 4, 'MAKATI-BUSINESS-M-K0UV-0016', 'eduardo-gonzales-MAKATI-BUSINESS-M-K0UV-0016', 'eduardo.gonzales.MAKATI-BUSINESS-M-K0UV-0016@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (93, 4, 'MAKATI-BUSINESS-M-M6QV-0017', 'maria-mercado-MAKATI-BUSINESS-M-M6QV-0017', 'maria.mercado.MAKATI-BUSINESS-M-M6QV-0017@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (94, 4, 'MAKATI-BUSINESS-M-UMPR-0018', 'patricia-ramos-MAKATI-BUSINESS-M-UMPR-0018', 'patricia.ramos.MAKATI-BUSINESS-M-UMPR-0018@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (95, 4, 'MAKATI-BUSINESS-M-PLQX-0019', 'rolando-valencia-MAKATI-BUSINESS-M-PLQX-0019', 'rolando.valencia.MAKATI-BUSINESS-M-PLQX-0019@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:53 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (96, 4, 'MAKATI-BUSINESS-M-47MA-0020', 'fernando-navarro-MAKATI-BUSINESS-M-47MA-0020', 'fernando.navarro.MAKATI-BUSINESS-M-47MA-0020@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (97, 4, 'MAKATI-BUSINESS-M-4KT0-0021', 'jose-salazar-MAKATI-BUSINESS-M-4KT0-0021', 'jose.salazar.MAKATI-BUSINESS-M-4KT0-0021@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (98, 4, 'MAKATI-BUSINESS-M-0SVQ-0022', 'lourdes-domingo-MAKATI-BUSINESS-M-0SVQ-0022', 'lourdes.domingo.MAKATI-BUSINESS-M-0SVQ-0022@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (99, 4, 'MAKATI-BUSINESS-M-N97Y-0023', 'merlinda-gonzales-MAKATI-BUSINESS-M-N97Y-0023', 'merlinda.gonzales.MAKATI-BUSINESS-M-N97Y-0023@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:54 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (100, 4, 'MAKATI-BUSINESS-M-84RD-0024', 'ernesto-fernandez-MAKATI-BUSINESS-M-84RD-0024', 'ernesto.fernandez.MAKATI-BUSINESS-M-84RD-0024@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:42:55 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (101, 5, 'CALAMBA-AGRI-O-1JBZ-0001', 'jose-bautista-CALAMBA-AGRI-O-1JBZ-0001', 'jose.bautista.CALAMBA-AGRI-O-1JBZ-0001@gmail.com', NULL, '$2b$10$0.SZk125t.gpbyevu/L07uhqivEoqozeC1rEuhR8rpO.pGoK3S4TK', 'operator', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:01 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:01 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (102, 5, 'CALAMBA-AGRI-M-SSIC-0001', 'victoria-rivera-CALAMBA-AGRI-M-SSIC-0001', 'victoria.rivera.CALAMBA-AGRI-M-SSIC-0001@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:01 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:01 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (103, 5, 'CALAMBA-AGRI-M-JKNF-0002', 'cecilia-lopez-CALAMBA-AGRI-M-JKNF-0002', 'cecilia.lopez.CALAMBA-AGRI-M-JKNF-0002@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:01 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:01 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (104, 5, 'CALAMBA-AGRI-M-3DWF-0003', 'leonardo-flores-CALAMBA-AGRI-M-3DWF-0003', 'leonardo.flores.CALAMBA-AGRI-M-3DWF-0003@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:02 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:02 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (105, 5, 'CALAMBA-AGRI-M-RB61-0004', 'maria-mendoza-CALAMBA-AGRI-M-RB61-0004', 'maria.mendoza.CALAMBA-AGRI-M-RB61-0004@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:02 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:02 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (106, 5, 'CALAMBA-AGRI-M-P448-0005', 'rosario-delacruz-CALAMBA-AGRI-M-P448-0005', 'rosario.delacruz.CALAMBA-AGRI-M-P448-0005@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:02 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:02 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (107, 5, 'CALAMBA-AGRI-M-NF5X-0006', 'ligaya-torres-CALAMBA-AGRI-M-NF5X-0006', 'ligaya.torres.CALAMBA-AGRI-M-NF5X-0006@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:03 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:03 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (108, 5, 'CALAMBA-AGRI-M-UJMW-0007', 'leonardo-mercado-CALAMBA-AGRI-M-UJMW-0007', 'leonardo.mercado.CALAMBA-AGRI-M-UJMW-0007@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:03 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:03 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (109, 5, 'CALAMBA-AGRI-M-55V7-0008', 'esperanza-santos-CALAMBA-AGRI-M-55V7-0008', 'esperanza.santos.CALAMBA-AGRI-M-55V7-0008@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:03 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:03 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (110, 5, 'CALAMBA-AGRI-M-05PC-0009', 'marites-torres-CALAMBA-AGRI-M-05PC-0009', 'marites.torres.CALAMBA-AGRI-M-05PC-0009@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (111, 5, 'CALAMBA-AGRI-M-L8TR-0010', 'reynaldo-navarro-CALAMBA-AGRI-M-L8TR-0010', 'reynaldo.navarro.CALAMBA-AGRI-M-L8TR-0010@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (112, 5, 'CALAMBA-AGRI-M-BLOM-0011', 'jose-delacruz-CALAMBA-AGRI-M-BLOM-0011', 'jose.delacruz.CALAMBA-AGRI-M-BLOM-0011@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (113, 5, 'CALAMBA-AGRI-M-V87J-0012', 'rolando-castillo-CALAMBA-AGRI-M-V87J-0012', 'rolando.castillo.CALAMBA-AGRI-M-V87J-0012@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:04 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (114, 5, 'CALAMBA-AGRI-M-1S3R-0013', 'leonardo-ramos-CALAMBA-AGRI-M-1S3R-0013', 'leonardo.ramos.CALAMBA-AGRI-M-1S3R-0013@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:05 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:05 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (115, 5, 'CALAMBA-AGRI-M-PZET-0014', 'angelica-domingo-CALAMBA-AGRI-M-PZET-0014', 'angelica.domingo.CALAMBA-AGRI-M-PZET-0014@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:05 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:05 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (116, 5, 'CALAMBA-AGRI-M-MPVD-0015', 'fernando-ramos-CALAMBA-AGRI-M-MPVD-0015', 'fernando.ramos.CALAMBA-AGRI-M-MPVD-0015@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (117, 5, 'CALAMBA-AGRI-M-7IUM-0016', 'reynaldo-castillo-CALAMBA-AGRI-M-7IUM-0016', 'reynaldo.castillo.CALAMBA-AGRI-M-7IUM-0016@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T3_4_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (118, 5, 'CALAMBA-AGRI-M-CCKM-0017', 'miguel-bautista-CALAMBA-AGRI-M-CCKM-0017', 'miguel.bautista.CALAMBA-AGRI-M-CCKM-0017@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T2_4_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);
INSERT INTO `users` (`user_id`, `tenant_id`, `member_code`, `username`, `email`, `phone`, `password_hash`, `role`, `status`, `interest_tier`, `is_deactivation_locked`, `deleted_at`, `created_at`, `updated_at`, `consent_accepted_at`, `consent_version`) VALUES (119, 5, 'CALAMBA-AGRI-M-HCL8-0018', 'eduardo-santos-CALAMBA-AGRI-M-HCL8-0018', 'eduardo.santos.CALAMBA-AGRI-M-HCL8-0018@gmail.com', NULL, '$2b$10$5Ii..Pgw9pyfF59YJPFLtuXGy9RAhfObIwDIoz0OkCS0vNaTgNqea', 'member', 'active', 'T1_5_PERCENT', 0, NULL, 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', 'Thu May 14 2026 23:43:06 GMT+0800 (Philippine Standard Time)', NULL, NULL);

