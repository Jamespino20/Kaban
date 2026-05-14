-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: agapay_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ai_config`
--

DROP TABLE IF EXISTS `ai_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ai_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `snapshot_prompts` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`snapshot_prompts`)),
  `risk_sensitivity` varchar(191) DEFAULT 'medium',
  `notification_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_settings`)),
  `analysis_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`analysis_config`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `log_type` enum('AUDIT','TRAFFIC','INTERACTION') NOT NULL DEFAULT 'AUDIT',
  `event_type` varchar(100) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `actor_role` enum('superadmin','operator','member') DEFAULT NULL,
  `actor_label` varchar(150) DEFAULT NULL,
  `module` enum('tenant','identity','wallet','loan','repayment','guarantorship','compassion','trust','feedback','support','content','chat','reports','reconciliation','billing','system') NOT NULL DEFAULT 'system',
  `action` varchar(100) NOT NULL,
  `action_category` enum('create','update','delete','approve','reject','release','payment','status_change','signoff','login','security','export','system','other') NOT NULL DEFAULT 'other',
  `severity` enum('debug','info','warning','critical') NOT NULL DEFAULT 'info',
  `entity_type` varchar(80) NOT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `entity_ref` varchar(120) DEFAULT NULL,
  `request_id` varchar(120) DEFAULT NULL,
  `session_id` varchar(120) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `changed_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changed_fields`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(191) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `http_method` varchar(12) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `is_cross_tenant_visible` tinyint(1) NOT NULL DEFAULT 0,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`log_id`),
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `auth_tokens`
--

DROP TABLE IF EXISTS `auth_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  `type` enum('VERIFICATION','TWO_FACTOR','PASSWORD_RESET') NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_tokens_token_key` (`token`),
  UNIQUE KEY `auth_tokens_tenant_id_email_token_type_key` (`tenant_id`,`email`,`token`,`type`),
  KEY `auth_tokens_tenant_id_email_type_idx` (`tenant_id`,`email`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `backup_records`
--

DROP TABLE IF EXISTS `backup_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `backup_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `status` enum('scheduled','running','completed','failed','expired') NOT NULL DEFAULT 'scheduled',
  `storage_path` varchar(512) DEFAULT NULL,
  `file_size_bytes` bigint(20) DEFAULT NULL,
  `checksum` varchar(128) DEFAULT NULL,
  `affected_schemas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`affected_schemas`)),
  `error_message` varchar(191) DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `backup_records_tenant_id_status_created_at_idx` (`tenant_id`,`status`,`created_at`),
  KEY `backup_records_schedule_id_idx` (`schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `backup_schedules`
--

DROP TABLE IF EXISTS `backup_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `backup_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `frequency` enum('daily','weekly','monthly','one_time') NOT NULL,
  `retention_days` int(11) NOT NULL DEFAULT 30,
  `last_run_at` datetime(3) DEFAULT NULL,
  `next_run_at` datetime(3) DEFAULT NULL,
  `storage_path` varchar(512) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `backup_schedules_tenant_id_is_active_idx` (`tenant_id`,`is_active`),
  KEY `backup_schedules_next_run_at_idx` (`next_run_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `billing_invoices`
--

DROP TABLE IF EXISTS `billing_invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `billing_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'pending',
  `due_date` datetime(3) NOT NULL,
  `paid_at` datetime(3) DEFAULT NULL,
  `payment_method` varchar(191) DEFAULT NULL,
  `reference` varchar(191) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_invoices_invoice_number_key` (`invoice_number`),
  KEY `billing_invoices_tenant_id_status_idx` (`tenant_id`,`status`),
  KEY `billing_invoices_due_date_idx` (`due_date`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_ledger`
--

DROP TABLE IF EXISTS `business_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `business_ledger` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transaction_id` varchar(191) NOT NULL,
  `account_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `debit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(15,2) NOT NULL DEFAULT 0.00,
  `description` varchar(191) NOT NULL,
  `source_module` varchar(80) DEFAULT NULL,
  `source_reference` varchar(120) DEFAULT NULL,
  `reconciliation_reference` varchar(120) DEFAULT NULL,
  `reconciled_at` datetime(3) DEFAULT NULL,
  `is_reversal` tinyint(1) NOT NULL DEFAULT 0,
  `reversed_entry_id` int(11) DEFAULT NULL,
  `ledger_hash` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_by` int(11) DEFAULT NULL,
  `loan_id` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  PRIMARY KEY (`id`),
  KEY `business_ledger_tenant_id_idx` (`tenant_id`),
  KEY `business_ledger_transaction_id_idx` (`transaction_id`),
  KEY `business_ledger_source_module_source_reference_idx` (`source_module`,`source_reference`),
  KEY `business_ledger_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `business_ledger_reversed_entry_id_idx` (`reversed_entry_id`),
  KEY `business_ledger_account_id_fkey` (`account_id`),
  KEY `business_ledger_loan_id_fkey` (`loan_id`),
  CONSTRAINT `business_ledger_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `ledger_accounts` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `business_ledger_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `business_ledger_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compassion_actions`
--

DROP TABLE IF EXISTS `compassion_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compassion_actions` (
  `action_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `action_type` enum('grace_period','term_extension','penalty_freeze') NOT NULL,
  `reason` varchar(191) NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `requested_by` int(11) NOT NULL,
  `requested_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `effective_at` datetime(3) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `grace_period_days` int(11) DEFAULT NULL,
  `restructured_term_months` int(11) DEFAULT NULL,
  `restructured_payment_amount` decimal(15,2) DEFAULT NULL,
  `penalty_waived_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `penalties_frozen_until` datetime(3) DEFAULT NULL,
  `freeze_status` enum('none','active','expired','lifted') NOT NULL DEFAULT 'none',
  `reminder_state` enum('not_started','scheduled','sent','completed','cancelled') NOT NULL DEFAULT 'not_started',
  `reminder_sent_at` datetime(3) DEFAULT NULL,
  `restructuring_offer_status` enum('not_offered','offered','accepted','rejected','expired') NOT NULL DEFAULT 'not_offered',
  `restructuring_offer_at` datetime(3) DEFAULT NULL,
  `final_write_off_at` datetime(3) DEFAULT NULL,
  `write_off_amount` decimal(15,2) DEFAULT NULL,
  `guarantor_charge_status` enum('not_applicable','pending','charged','waived') NOT NULL DEFAULT 'not_applicable',
  `guarantor_charged_at` datetime(3) DEFAULT NULL,
  `trust_score_impact_points` int(11) NOT NULL DEFAULT 0,
  `trust_score_impact_reason` varchar(255) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `admin_notes` varchar(191) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`action_id`),
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
  CONSTRAINT `compassion_actions_requested_by_fkey` FOREIGN KEY (`requested_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `compassion_actions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversation_participants` (
  `id` varchar(191) NOT NULL,
  `conversation_id` varchar(191) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `joined_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `last_read_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversation_participants_conversation_id_user_id_key` (`conversation_id`,`user_id`),
  KEY `conversation_participants_tenant_id_idx` (`tenant_id`),
  KEY `conversation_participants_user_id_last_read_at_idx` (`user_id`,`last_read_at`),
  CONSTRAINT `conversation_participants_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversation_participants_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `conversation_participants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversations` (
  `id` varchar(191) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `type` enum('direct','operator_room','group_chat') NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_tenant_id_type_slug_key` (`tenant_id`,`type`,`slug`),
  KEY `conversations_tenant_id_type_updated_at_idx` (`tenant_id`,`type`,`updated_at`),
  KEY `conversations_created_by_fkey` (`created_by`),
  CONSTRAINT `conversations_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `conversations_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `daily_reconciliations`
--

DROP TABLE IF EXISTS `daily_reconciliations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `daily_reconciliations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `business_date` date NOT NULL,
  `status` enum('draft','blocked','pending_approval','signed_off','adjusted','rejected','reopened') NOT NULL DEFAULT 'draft',
  `total_disbursed` decimal(15,2) NOT NULL DEFAULT 0.00,
  `disbursed_count` int(11) NOT NULL DEFAULT 0,
  `total_collected` decimal(15,2) NOT NULL DEFAULT 0.00,
  `collected_count` int(11) NOT NULL DEFAULT 0,
  `total_ledger_debits` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_ledger_credits` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_ledger_balanced` tinyint(1) NOT NULL DEFAULT 0,
  `total_tenant_savings` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_treasury_balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `imbalance_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `has_discrepancy` tinyint(1) NOT NULL DEFAULT 0,
  `signoff_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `block_reason` varchar(191) DEFAULT NULL,
  `reconciliation_reference` varchar(120) NOT NULL,
  `imbalance_investigation_id` int(11) DEFAULT NULL,
  `resolution_action` enum('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') DEFAULT NULL,
  `resolution_reference` varchar(120) DEFAULT NULL,
  `adjustment_ledger_transaction_id` varchar(191) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `prepared_by` int(11) DEFAULT NULL,
  `prepared_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `signed_off_by` int(11) DEFAULT NULL,
  `signed_off_at` datetime(3) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `approval_notes` varchar(191) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `daily_reconciliations_reconciliation_reference_key` (`reconciliation_reference`),
  UNIQUE KEY `daily_reconciliations_tenant_id_business_date_key` (`tenant_id`,`business_date`),
  KEY `daily_reconciliations_tenant_id_status_business_date_idx` (`tenant_id`,`status`,`business_date`),
  KEY `daily_reconciliations_imbalance_investigation_id_idx` (`imbalance_investigation_id`),
  KEY `daily_reconciliations_resolution_reference_idx` (`resolution_reference`),
  KEY `daily_reconciliations_adjustment_ledger_transaction_id_idx` (`adjustment_ledger_transaction_id`),
  KEY `daily_reconciliations_audit_log_id_idx` (`audit_log_id`),
  KEY `daily_reconciliations_signed_off_by_idx` (`signed_off_by`),
  KEY `daily_reconciliations_approved_by_idx` (`approved_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `decommissioned_backups`
--

DROP TABLE IF EXISTS `decommissioned_backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `decommissioned_backups` (
  `id` varchar(191) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `snapshot_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `snapshot_content` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `decommissioned_backups_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `decommissioned_backups_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `email_templates`
--

DROP TABLE IF EXISTS `email_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `category` enum('verification','security','loan','repayment','wallet','support','report','announcement','onboarding','system') NOT NULL,
  `slug` varchar(80) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `html_body` text NOT NULL,
  `text_body` text DEFAULT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_templates_tenant_id_slug_key` (`tenant_id`,`slug`),
  KEY `email_templates_tenant_id_category_idx` (`tenant_id`,`category`),
  KEY `email_templates_category_is_active_idx` (`category`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fraud_signals`
--

DROP TABLE IF EXISTS `fraud_signals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fraud_signals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `signal_type` enum('duplicate_identity','suspicious_transaction_pattern','rapid_loan_cycling','cross_tenant_default_risk','velocity_breach','device_anomaly','manual_flag') NOT NULL,
  `status` enum('detected','under_review','confirmed','false_positive','resolved','escalated') NOT NULL DEFAULT 'detected',
  `severity` enum('debug','info','warning','critical') NOT NULL DEFAULT 'warning',
  `linked_user_id` int(11) DEFAULT NULL,
  `linked_loan_id` int(11) DEFAULT NULL,
  `linked_payment_id` int(11) DEFAULT NULL,
  `linked_topup_id` int(11) DEFAULT NULL,
  `duplicate_user_id` int(11) DEFAULT NULL,
  `risk_score` int(11) DEFAULT NULL,
  `threshold_breached` varchar(120) DEFAULT NULL,
  `signal_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`signal_metadata`)),
  `assigned_to` int(11) DEFAULT NULL,
  `assigned_at` datetime(3) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `resolution_notes` varchar(191) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `detected_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `resolved_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fraud_signals_tenant_id_signal_type_status_detected_at_idx` (`tenant_id`,`signal_type`,`status`,`detected_at`),
  KEY `fraud_signals_linked_user_id_status_idx` (`linked_user_id`,`status`),
  KEY `fraud_signals_linked_loan_id_idx` (`linked_loan_id`),
  KEY `fraud_signals_severity_status_idx` (`severity`,`status`),
  KEY `fraud_signals_assigned_to_status_idx` (`assigned_to`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `generated_reports`
--

DROP TABLE IF EXISTS `generated_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `generated_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `definition_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `requested_by` int(11) DEFAULT NULL,
  `report_type` enum('cross_tenant_financial','tenant_performance','lender_summary','member_summary','loan_portfolio','repayment_summary','wallet_activity','reconciliation_summary','trust_analysis','audit_export') NOT NULL,
  `format` enum('csv','pdf','json') NOT NULL,
  `status` enum('queued','processing','ready','failed','expired') NOT NULL DEFAULT 'queued',
  `file_url` varchar(512) DEFAULT NULL,
  `file_size_bytes` int(11) DEFAULT NULL,
  `row_count` int(11) DEFAULT NULL,
  `error_message` varchar(191) DEFAULT NULL,
  `period_start` datetime(3) DEFAULT NULL,
  `period_end` datetime(3) DEFAULT NULL,
  `dispatched_at` datetime(3) DEFAULT NULL,
  `dispatch_recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dispatch_recipients`)),
  `dispatch_status` varchar(50) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `generated_reports_tenant_id_report_type_created_at_idx` (`tenant_id`,`report_type`,`created_at`),
  KEY `generated_reports_status_created_at_idx` (`status`,`created_at`),
  KEY `generated_reports_definition_id_idx` (`definition_id`),
  CONSTRAINT `generated_reports_definition_id_fkey` FOREIGN KEY (`definition_id`) REFERENCES `report_definitions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `homepage_faqs`
--

DROP TABLE IF EXISTS `homepage_faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homepage_faqs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `question` varchar(255) NOT NULL,
  `answer` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `season_tag` varchar(100) DEFAULT NULL,
  `workflow_status` varchar(50) NOT NULL DEFAULT 'published',
  `review_notes` varchar(191) DEFAULT NULL,
  `submitted_by_user_id` int(11) DEFAULT NULL,
  `reviewed_by_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `homepage_faqs_tenant_id_workflow_status_is_active_sort_order_idx` (`tenant_id`,`workflow_status`,`is_active`,`sort_order`),
  KEY `homepage_faqs_submitted_by_user_id_fkey` (`submitted_by_user_id`),
  KEY `homepage_faqs_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  CONSTRAINT `homepage_faqs_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `homepage_faqs_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `homepage_faqs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `homepage_testimonials`
--

DROP TABLE IF EXISTS `homepage_testimonials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `homepage_testimonials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `role_label` varchar(150) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `content` varchar(191) NOT NULL,
  `season_tag` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `workflow_status` varchar(50) NOT NULL DEFAULT 'published',
  `review_notes` varchar(191) DEFAULT NULL,
  `submitted_by_user_id` int(11) DEFAULT NULL,
  `reviewed_by_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `homepage_testimonials_tenant_id_workflow_status_is_active_so_idx` (`tenant_id`,`workflow_status`,`is_active`,`sort_order`),
  KEY `homepage_testimonials_submitted_by_user_id_fkey` (`submitted_by_user_id`),
  KEY `homepage_testimonials_reviewed_by_user_id_fkey` (`reviewed_by_user_id`),
  CONSTRAINT `homepage_testimonials_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `homepage_testimonials_submitted_by_user_id_fkey` FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `homepage_testimonials_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `imbalance_investigations`
--

DROP TABLE IF EXISTS `imbalance_investigations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `imbalance_investigations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `source_module` enum('wallet','loan','repayment','ledger','reconciliation','topup','manual_adjustment','system') NOT NULL,
  `source_entity_type` varchar(80) DEFAULT NULL,
  `source_entity_id` varchar(120) DEFAULT NULL,
  `expected_amount` decimal(15,2) NOT NULL,
  `actual_amount` decimal(15,2) NOT NULL,
  `difference_amount` decimal(15,2) NOT NULL,
  `status` enum('detected','assigned','investigating','awaiting_approval','resolved','dismissed') NOT NULL DEFAULT 'detected',
  `priority` varchar(30) NOT NULL DEFAULT 'normal',
  `reconciliation_reference` varchar(120) DEFAULT NULL,
  `related_ledger_transaction_id` varchar(191) DEFAULT NULL,
  `related_wallet_transaction_id` int(11) DEFAULT NULL,
  `related_topup_request_id` int(11) DEFAULT NULL,
  `related_loan_id` int(11) DEFAULT NULL,
  `related_payment_id` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `assigned_at` datetime(3) DEFAULT NULL,
  `detected_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `investigated_at` datetime(3) DEFAULT NULL,
  `resolved_at` datetime(3) DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolution_action` enum('no_adjustment_needed','wallet_adjustment','ledger_adjustment','loan_adjustment','repayment_adjustment','write_off','escalated') DEFAULT NULL,
  `adjustment_ledger_transaction_id` varchar(191) DEFAULT NULL,
  `adjustment_savings_transaction_id` int(11) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `resolution_notes` varchar(191) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `interest_audit`
--

DROP TABLE IF EXISTS `interest_audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interest_audit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `formula_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`formula_snapshot`)),
  `rate_applied` decimal(5,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `interest_audit_loan_id_key` (`loan_id`),
  KEY `interest_audit_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `interest_audit_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `interest_audit_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ledger_accounts`
--

DROP TABLE IF EXISTS `ledger_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ledger_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) NOT NULL,
  `type` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ledger_accounts_code_key` (`code`),
  KEY `ledger_accounts_tenant_id_type_idx` (`tenant_id`,`type`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loan_guarantees`
--

DROP TABLE IF EXISTS `loan_guarantees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_guarantees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `guarantor_id` int(11) NOT NULL,
  `status` enum('pending','vouched','rejected','voided','charged') NOT NULL DEFAULT 'pending',
  `liability_percentage` decimal(5,2) NOT NULL DEFAULT 25.00,
  `liability_amount` decimal(15,2) DEFAULT NULL,
  `charged_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `charge_reason` varchar(255) DEFAULT NULL,
  `vouched_at` datetime(3) DEFAULT NULL,
  `soft_freeze_at` datetime(3) DEFAULT NULL,
  `hard_freeze_at` datetime(3) DEFAULT NULL,
  `default_triggered_at` datetime(3) DEFAULT NULL,
  `charged_at` datetime(3) DEFAULT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `reassigned_to_guarantee_id` int(11) DEFAULT NULL,
  `notification_id` varchar(191) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `loan_guarantees_tenant_id_idx` (`tenant_id`),
  KEY `loan_guarantees_loan_id_status_idx` (`loan_id`,`status`),
  KEY `loan_guarantees_guarantor_id_status_idx` (`guarantor_id`,`status`),
  KEY `loan_guarantees_notification_id_idx` (`notification_id`),
  KEY `loan_guarantees_audit_log_id_idx` (`audit_log_id`),
  KEY `loan_guarantees_reassigned_to_guarantee_id_idx` (`reassigned_to_guarantee_id`),
  CONSTRAINT `loan_guarantees_guarantor_id_fkey` FOREIGN KEY (`guarantor_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `loan_guarantees_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `loan_guarantees_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loan_products`
--

DROP TABLE IF EXISTS `loan_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_products` (
  `product_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `min_amount` decimal(15,2) NOT NULL,
  `max_amount` decimal(15,2) NOT NULL,
  `interest_rate_percent` decimal(5,2) NOT NULL,
  `max_term_months` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `tenant_id` int(11) NOT NULL,
  `allowed_frequencies` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_frequencies`)),
  `guarantor_liability_rate` decimal(5,2) NOT NULL DEFAULT 25.00,
  PRIMARY KEY (`product_id`),
  KEY `loan_products_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `loan_products_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loan_schedules`
--

DROP TABLE IF EXISTS `loan_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loan_schedules` (
  `schedule_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `installment_number` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `total_due` decimal(15,2) NOT NULL,
  `status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
  `paid_at` datetime(3) DEFAULT NULL,
  `days_late` int(11) NOT NULL DEFAULT 0,
  `penalty_applied` decimal(15,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`schedule_id`),
  KEY `loan_schedules_tenant_id_idx` (`tenant_id`),
  KEY `loan_schedules_loan_id_fkey` (`loan_id`),
  CONSTRAINT `loan_schedules_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `loan_schedules_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loans` (
  `loan_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `loan_reference` varchar(50) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `purpose` varchar(191) NOT NULL,
  `term_months` int(11) NOT NULL,
  `interest_applied` decimal(15,2) NOT NULL,
  `principal_receivable` decimal(15,2) NOT NULL DEFAULT 0.00,
  `interest_receivable` decimal(15,2) NOT NULL DEFAULT 0.00,
  `fees_applied` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_payable` decimal(15,2) NOT NULL,
  `balance_remaining` decimal(15,2) NOT NULL,
  `status` enum('pending','approved','active','paid','defaulted','rejected') NOT NULL DEFAULT 'pending',
  `applied_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `approved_at` datetime(3) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `repayment_frequency` enum('weekly','bi_weekly','monthly') NOT NULL DEFAULT 'monthly',
  `recovery_parent_loan_id` int(11) DEFAULT NULL,
  `is_recovery_loan` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`loan_id`),
  UNIQUE KEY `loans_loan_reference_key` (`loan_reference`),
  KEY `loans_approved_by_fkey` (`approved_by`),
  KEY `loans_product_id_fkey` (`product_id`),
  KEY `loans_recovery_parent_loan_id_fkey` (`recovery_parent_loan_id`),
  KEY `loans_tenant_id_fkey` (`tenant_id`),
  KEY `loans_user_id_fkey` (`user_id`),
  CONSTRAINT `loans_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `loans_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `loan_products` (`product_id`) ON UPDATE CASCADE,
  CONSTRAINT `loans_recovery_parent_loan_id_fkey` FOREIGN KEY (`recovery_parent_loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `loans_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `loans_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mentorship_connections`
--

DROP TABLE IF EXISTS `mentorship_connections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mentorship_connections` (
  `id` varchar(191) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `mentor_id` int(11) NOT NULL,
  `endorsed_by` int(11) DEFAULT NULL,
  `status` enum('pending_endorsement','endorsed','rejected') NOT NULL DEFAULT 'pending_endorsement',
  `focus_area` varchar(150) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `endorsed_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mentorship_connections_tenant_id_requester_id_mentor_id_key` (`tenant_id`,`requester_id`,`mentor_id`),
  KEY `mentorship_connections_tenant_id_status_created_at_idx` (`tenant_id`,`status`,`created_at`),
  KEY `mentorship_connections_endorsed_by_fkey` (`endorsed_by`),
  KEY `mentorship_connections_mentor_id_fkey` (`mentor_id`),
  KEY `mentorship_connections_requester_id_fkey` (`requester_id`),
  CONSTRAINT `mentorship_connections_endorsed_by_fkey` FOREIGN KEY (`endorsed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `mentorship_connections_mentor_id_fkey` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mentorship_connections_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `mentorship_connections_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_attachments`
--

DROP TABLE IF EXISTS `message_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message_attachments` (
  `id` varchar(191) NOT NULL,
  `message_id` varchar(191) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size_bytes` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `message_attachments_tenant_id_idx` (`tenant_id`),
  KEY `message_attachments_message_id_created_at_idx` (`message_id`,`created_at`),
  CONSTRAINT `message_attachments_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_attachments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_reactions`
--

DROP TABLE IF EXISTS `message_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message_reactions` (
  `id` varchar(191) NOT NULL,
  `message_id` varchar(191) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `emoji` varchar(24) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_reactions_message_id_user_id_emoji_key` (`message_id`,`user_id`,`emoji`),
  KEY `message_reactions_tenant_id_idx` (`tenant_id`),
  KEY `message_reactions_user_id_created_at_idx` (`user_id`,`created_at`),
  CONSTRAINT `message_reactions_message_id_fkey` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_reactions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `message_reactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `messages` (
  `id` varchar(191) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `content` varchar(191) NOT NULL,
  `is_broadcast` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `conversation_id` varchar(191) NOT NULL,
  `reply_to_id` varchar(191) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_conversation_id_created_at_idx` (`conversation_id`,`created_at`),
  KEY `messages_reply_to_id_fkey` (`reply_to_id`),
  KEY `messages_sender_id_fkey` (`sender_id`),
  KEY `messages_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_reply_to_id_fkey` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notification_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(191) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text NOT NULL,
  `variables` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`variables`)),
  `category` varchar(191) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_templates_type_category_idx` (`type`,`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('email_verification','identity_verified','identity_rejected','tenant_application_received','tenant_approved','tenant_suspended','wallet_deposit_pending','wallet_deposit_approved','wallet_deposit_rejected','wallet_withdrawal_pending','wallet_withdrawal_approved','wallet_withdrawal_rejected','wallet_issue_reported','loan_application_received','loan_approved','loan_rejected','loan_disbursed','loan_defaulted','repayment_reminder','repayment_received','repayment_overdue','guarantor_request','guarantor_accepted','guarantor_rejected','guarantor_charged','trust_voting_assigned','trust_voting_due_soon','trust_voting_missed','compassion_requested','compassion_approved','compassion_rejected','feedback_received','support_ticket_opened','support_ticket_updated','support_ticket_resolved','report_ready','report_failed','mentorship_request','mentorship_endorsed','mentorship_rejected','direct_message','tenant_announcement','login_new_device','password_changed','two_fa_enabled','two_fa_disabled','system_alert','system_maintenance','platform_announcement') NOT NULL,
  `title` varchar(150) NOT NULL,
  `body` varchar(191) NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `channel` enum('in_app','email','both') NOT NULL DEFAULT 'in_app',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `emailed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `notifications_user_id_is_read_created_at_idx` (`user_id`,`is_read`,`created_at`),
  KEY `notifications_tenant_id_type_created_at_idx` (`tenant_id`,`type`,`created_at`),
  CONSTRAINT `notifications_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_methods` (
  `method_id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_name` varchar(100) NOT NULL,
  `account_number` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `tenant_id` int(11) NOT NULL,
  PRIMARY KEY (`method_id`),
  KEY `payment_methods_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `payment_methods_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `loan_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `method_id` int(11) NOT NULL,
  `payment_reference` varchar(100) NOT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `receipt_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `submitted_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `verified_at` datetime(3) DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `notes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `payments_payment_reference_key` (`payment_reference`),
  KEY `payments_tenant_id_idx` (`tenant_id`),
  KEY `payments_loan_id_fkey` (`loan_id`),
  KEY `payments_method_id_fkey` (`method_id`),
  KEY `payments_verified_by_fkey` (`verified_by`),
  CONSTRAINT `payments_loan_id_fkey` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON UPDATE CASCADE,
  CONSTRAINT `payments_method_id_fkey` FOREIGN KEY (`method_id`) REFERENCES `payment_methods` (`method_id`) ON UPDATE CASCADE,
  CONSTRAINT `payments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `payments_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `platform_announcements`
--

DROP TABLE IF EXISTS `platform_announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `target_audience` varchar(191) NOT NULL DEFAULT 'all',
  `priority` varchar(191) NOT NULL DEFAULT 'normal',
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_by` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `published_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `platform_announcements_target_audience_is_published_idx` (`target_audience`,`is_published`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `platform_config`
--

DROP TABLE IF EXISTS `platform_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scoring_weights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`scoring_weights`)),
  `risk_thresholds` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`risk_thresholds`)),
  `default_loan_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`default_loan_config`)),
  `platform_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`platform_settings`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `receipts`
--

DROP TABLE IF EXISTS `receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `receipt_number` varchar(60) NOT NULL,
  `receipt_type` enum('wallet_deposit','wallet_withdrawal','loan_disbursement','loan_repayment','loan_fee','fund_release','top_up','admin_adjustment') NOT NULL,
  `status` enum('generated','voided','reissued') NOT NULL DEFAULT 'generated',
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'PHP',
  `description` varchar(191) DEFAULT NULL,
  `savings_transaction_id` int(11) DEFAULT NULL,
  `loan_id` int(11) DEFAULT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `topup_request_id` int(11) DEFAULT NULL,
  `file_url` varchar(512) DEFAULT NULL,
  `voided_by` int(11) DEFAULT NULL,
  `voided_at` datetime(3) DEFAULT NULL,
  `void_reason` varchar(191) DEFAULT NULL,
  `reissued_receipt_id` int(11) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `issued_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `receipts_receipt_number_key` (`receipt_number`),
  KEY `receipts_tenant_id_receipt_type_issued_at_idx` (`tenant_id`,`receipt_type`,`issued_at`),
  KEY `receipts_user_id_issued_at_idx` (`user_id`,`issued_at`),
  KEY `receipts_receipt_number_idx` (`receipt_number`),
  KEY `receipts_loan_id_idx` (`loan_id`),
  KEY `receipts_payment_id_idx` (`payment_id`),
  KEY `receipts_topup_request_id_idx` (`topup_request_id`),
  KEY `receipts_savings_transaction_id_idx` (`savings_transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `report_definitions`
--

DROP TABLE IF EXISTS `report_definitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `report_definitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `report_type` enum('cross_tenant_financial','tenant_performance','lender_summary','member_summary','loan_portfolio','repayment_summary','wallet_activity','reconciliation_summary','trust_analysis','audit_export') NOT NULL,
  `format` enum('csv','pdf','json') NOT NULL DEFAULT 'csv',
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `is_scheduled` tinyint(1) NOT NULL DEFAULT 0,
  `schedule_freq` enum('daily','weekly','monthly','one_time') DEFAULT NULL,
  `schedule_day` int(11) DEFAULT NULL,
  `next_run_at` datetime(3) DEFAULT NULL,
  `recipients` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`recipients`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `report_definitions_tenant_id_report_type_idx` (`tenant_id`,`report_type`),
  KEY `report_definitions_is_scheduled_next_run_at_idx` (`is_scheduled`,`next_run_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `restore_requests`
--

DROP TABLE IF EXISTS `restore_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `restore_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `backup_id` int(11) NOT NULL,
  `requested_by` int(11) NOT NULL,
  `status` enum('requested','validating','restoring','completed','failed','cancelled') NOT NULL DEFAULT 'requested',
  `target_schemas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_schemas`)),
  `notes` varchar(191) DEFAULT NULL,
  `error_message` varchar(191) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `restore_requests_tenant_id_status_idx` (`tenant_id`,`status`),
  KEY `restore_requests_backup_id_idx` (`backup_id`),
  KEY `restore_requests_requested_by_idx` (`requested_by`),
  CONSTRAINT `restore_requests_backup_id_fkey` FOREIGN KEY (`backup_id`) REFERENCES `backup_records` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `savings_accounts`
--

DROP TABLE IF EXISTS `savings_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `savings_accounts` (
  `account_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_type` enum('share_capital','regular_savings','personal_wallet') NOT NULL,
  `owner_role` enum('superadmin','operator','member') DEFAULT NULL,
  `balance` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_locked` tinyint(1) NOT NULL DEFAULT 0,
  `lock_reason` varchar(255) DEFAULT NULL,
  `opened_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `savings_accounts_user_id_account_type_key` (`user_id`,`account_type`),
  KEY `savings_accounts_tenant_id_account_type_idx` (`tenant_id`,`account_type`),
  KEY `savings_accounts_tenant_id_owner_role_idx` (`tenant_id`,`owner_role`),
  CONSTRAINT `savings_accounts_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `savings_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `savings_transactions`
--

DROP TABLE IF EXISTS `savings_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `savings_transactions` (
  `transaction_id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `transaction_type` enum('deposit','withdrawal','dividend','fee','default_recovery_debit','default_recovery_credit') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `fee_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(15,2) DEFAULT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'verified',
  `method_label` varchar(80) DEFAULT NULL,
  `external_reference` varchar(120) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `reconciliation_reference` varchar(120) DEFAULT NULL,
  `ledger_transaction_id` varchar(191) DEFAULT NULL,
  `issue_status` varchar(50) NOT NULL DEFAULT 'none',
  `issue_reported_at` datetime(3) DEFAULT NULL,
  `issue_notes` varchar(191) DEFAULT NULL,
  `processed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `processed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `savings_transactions_tenant_id_idx` (`tenant_id`),
  KEY `savings_transactions_account_id_status_processed_at_idx` (`account_id`,`status`,`processed_at`),
  KEY `savings_transactions_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `savings_transactions_ledger_transaction_id_idx` (`ledger_transaction_id`),
  KEY `savings_transactions_issue_status_idx` (`issue_status`),
  KEY `savings_transactions_processed_by_fkey` (`processed_by`),
  CONSTRAINT `savings_transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `savings_accounts` (`account_id`) ON UPDATE CASCADE,
  CONSTRAINT `savings_transactions_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `savings_transactions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `security_settings`
--

DROP TABLE IF EXISTS `security_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `security_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `password_policy` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`password_policy`)),
  `session_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`session_settings`)),
  `two_factor_required` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`two_factor_roles`)),
  `ip_whitelist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ip_whitelist`)),
  `allowed_domains` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_domains`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `social_vouches`
--

DROP TABLE IF EXISTS `social_vouches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `social_vouches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `voucher_id` int(11) NOT NULL,
  `vouchee_id` int(11) NOT NULL,
  `requester_id` int(11) DEFAULT NULL,
  `relationship_type` enum('peer','family','business_partner','guarantor','mentor','admin_observed') NOT NULL DEFAULT 'peer',
  `score` int(11) NOT NULL DEFAULT 5,
  `score_scale` int(11) NOT NULL DEFAULT 10,
  `score_base` int(11) NOT NULL DEFAULT 10,
  `status` enum('active','revoked','expired','disputed') NOT NULL DEFAULT 'active',
  `discount_eligibility_state` enum('not_evaluated','eligible','ineligible','suspended') NOT NULL DEFAULT 'not_evaluated',
  `discount_eligible` tinyint(1) NOT NULL DEFAULT 0,
  `trust_network_visibility` enum('private_record','tenant_network','admin_only','cross_tenant_risk') NOT NULL DEFAULT 'tenant_network',
  `visibility_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`visibility_metadata`)),
  `comment` varchar(191) DEFAULT NULL,
  `expires_at` datetime(3) DEFAULT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `audit_log_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `social_vouches_tenant_id_status_created_at_idx` (`tenant_id`,`status`,`created_at`),
  KEY `social_vouches_voucher_id_status_idx` (`voucher_id`,`status`),
  KEY `social_vouches_vouchee_id_status_idx` (`vouchee_id`,`status`),
  KEY `social_vouches_requester_id_idx` (`requester_id`),
  KEY `social_vouches_discount_eligibility_state_idx` (`discount_eligibility_state`),
  KEY `social_vouches_trust_network_visibility_idx` (`trust_network_visibility`),
  KEY `social_vouches_audit_log_id_idx` (`audit_log_id`),
  CONSTRAINT `social_vouches_vouchee_id_fkey` FOREIGN KEY (`vouchee_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `social_vouches_voucher_id_fkey` FOREIGN KEY (`voucher_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tier_name` varchar(50) NOT NULL,
  `price_monthly` decimal(10,2) NOT NULL,
  `price_quarterly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_semi_annually` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_annually` decimal(10,2) NOT NULL,
  `max_members` int(11) NOT NULL,
  `max_storage_mb` int(11) NOT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_addon` tinyint(1) NOT NULL DEFAULT 0,
  `tenant_price` int(11) DEFAULT 3000,
  `tenant_storage` int(11) DEFAULT 10000,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_plans_tier_name_key` (`tier_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(50) NOT NULL,
  `ticket_type` enum('SUPPORT','FEEDBACK','DISPUTE','BUG') NOT NULL DEFAULT 'SUPPORT',
  `tenant_id` int(11) DEFAULT NULL,
  `requester_id` int(11) DEFAULT NULL,
  `category` enum('wallet_issue','loan_issue','payment_issue','member_complaint','system_issue','feature_request','homepage_concern','general_support','testimonial','concern','general') NOT NULL,
  `module_context` enum('general','wallet','loan','repayment','payment','homepage','system','chat','reports') NOT NULL DEFAULT 'general',
  `status` enum('open','in_review','waiting_on_member','waiting_on_admin','resolved','closed','escalated') NOT NULL DEFAULT 'open',
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `rating` int(11) DEFAULT 5,
  `subject` varchar(255) NOT NULL,
  `description` varchar(191) NOT NULL,
  `related_entity_type` varchar(80) DEFAULT NULL,
  `related_entity_id` varchar(120) DEFAULT NULL,
  `wallet_transaction_id` int(11) DEFAULT NULL,
  `loan_id` int(11) DEFAULT NULL,
  `payment_id` int(11) DEFAULT NULL,
  `topup_request_id` int(11) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `assigned_at` datetime(3) DEFAULT NULL,
  `first_response_at` datetime(3) DEFAULT NULL,
  `resolved_by` int(11) DEFAULT NULL,
  `resolved_at` datetime(3) DEFAULT NULL,
  `closed_at` datetime(3) DEFAULT NULL,
  `resolution_summary` varchar(191) DEFAULT NULL,
  `escalation_level` int(11) NOT NULL DEFAULT 0,
  `audit_log_id` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
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
  CONSTRAINT `support_tickets_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `support_tickets_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_files`
--

DROP TABLE IF EXISTS `system_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_files` (
  `id` varchar(191) NOT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `uploader_id` int(11) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `content_base64` text NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size` int(11) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `system_files_tenant_id_idx` (`tenant_id`),
  KEY `system_files_uploader_id_idx` (`uploader_id`),
  CONSTRAINT `system_files_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `system_files_uploader_id_fkey` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `system_health_snapshots`
--

DROP TABLE IF EXISTS `system_health_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_health_snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `snapshot_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `api_uptime_percent` decimal(5,2) DEFAULT NULL,
  `avg_response_ms` int(11) DEFAULT NULL,
  `error_rate_percent` decimal(5,2) DEFAULT NULL,
  `active_connections` int(11) DEFAULT NULL,
  `queue_depth` int(11) DEFAULT NULL,
  `ai_queue_depth` int(11) DEFAULT NULL,
  `ai_processing_ok` tinyint(1) NOT NULL DEFAULT 1,
  `db_size_bytes` bigint(20) DEFAULT NULL,
  `tenant_schema_sizes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tenant_schema_sizes`)),
  `alert_state` enum('ok','degraded','critical') NOT NULL DEFAULT 'ok',
  `alert_details` varchar(191) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `system_health_snapshots_snapshot_at_idx` (`snapshot_at`),
  KEY `system_health_snapshots_alert_state_snapshot_at_idx` (`alert_state`,`snapshot_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenant_applications`
--

DROP TABLE IF EXISTS `tenant_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_applications` (
  `application_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_name` varchar(100) NOT NULL,
  `tenant_slug` varchar(50) NOT NULL,
  `applicant_name` varchar(150) DEFAULT NULL,
  `applicant_email` varchar(150) NOT NULL,
  `applicant_phone` varchar(20) DEFAULT NULL,
  `estimated_members` int(11) DEFAULT 100,
  `tenant_group_id` int(11) DEFAULT NULL,
  `brand_color` varchar(20) DEFAULT NULL,
  `accent_color` varchar(20) DEFAULT NULL,
  `logo_url` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `submitted_by` int(11) NOT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime(3) DEFAULT NULL,
  `review_notes` varchar(191) DEFAULT NULL,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`application_id`),
  UNIQUE KEY `tenant_applications_tenant_slug_key` (`tenant_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenant_groups`
--

DROP TABLE IF EXISTS `tenant_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `reg_code` varchar(10) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_groups_reg_code_key` (`reg_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenant_subscriptions`
--

DROP TABLE IF EXISTS `tenant_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `billing_cycle` enum('monthly','quarterly','semi_annually','annually') NOT NULL DEFAULT 'monthly',
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `start_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `end_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `activated_modules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`activated_modules`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_subscriptions_tenant_id_key` (`tenant_id`),
  KEY `tenant_subscriptions_tenant_id_idx` (`tenant_id`),
  KEY `tenant_subscriptions_plan_id_fkey` (`plan_id`),
  CONSTRAINT `tenant_subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `tenant_subscriptions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenant_trust_policies`
--

DROP TABLE IF EXISTS `tenant_trust_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_trust_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `payment_weight` decimal(5,2) NOT NULL DEFAULT 40.00,
  `business_weight` decimal(5,2) NOT NULL DEFAULT 20.00,
  `peer_weight` decimal(5,2) NOT NULL DEFAULT 20.00,
  `guarantor_weight` decimal(5,2) NOT NULL DEFAULT 20.00,
  `minimum_voting_quota` int(11) NOT NULL DEFAULT 3,
  `randomized_sample_size` int(11) NOT NULL DEFAULT 10,
  `missed_vote_lockout_days` int(11) NOT NULL DEFAULT 7,
  `low_rating_threshold` int(11) NOT NULL DEFAULT 55,
  `tier_review_day` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_trust_policies_tenant_id_key` (`tenant_id`),
  KEY `tenant_trust_policies_tenant_id_is_active_idx` (`tenant_id`,`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `tenant_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_group_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `brand_color` varchar(20) DEFAULT NULL,
  `accent_color` varchar(20) DEFAULT NULL,
  `font_pairing` varchar(50) DEFAULT 'inter_outfit',
  `logo_url` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `entitlement_status` enum('prospect','availed','active','suspended') NOT NULL DEFAULT 'prospect',
  `lifetime_availed_at` datetime(3) DEFAULT NULL,
  `availed_type` varchar(50) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `entitlement_reference` varchar(120) DEFAULT NULL,
  `entitlement_notes` varchar(191) DEFAULT NULL,
  `entitled_by_user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tenant_id`),
  UNIQUE KEY `tenants_slug_key` (`slug`),
  KEY `tenants_tenant_group_id_fkey` (`tenant_group_id`),
  CONSTRAINT `tenants_tenant_group_id_fkey` FOREIGN KEY (`tenant_group_id`) REFERENCES `tenant_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `topup_requests`
--

DROP TABLE IF EXISTS `topup_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `topup_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `request_type` enum('deposit','withdrawal') NOT NULL DEFAULT 'deposit',
  `amount` decimal(15,2) NOT NULL,
  `fee_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `net_amount` decimal(15,2) DEFAULT NULL,
  `method_label` varchar(80) DEFAULT NULL,
  `external_reference` varchar(120) DEFAULT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `receipt_url` varchar(255) DEFAULT NULL,
  `issue_status` varchar(50) NOT NULL DEFAULT 'none',
  `issue_notes` varchar(191) DEFAULT NULL,
  `admin_notes` varchar(191) DEFAULT NULL,
  `reconciliation_reference` varchar(120) DEFAULT NULL,
  `ledger_transaction_id` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `processed_at` datetime(3) DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topup_requests_tenant_id_request_type_status_idx` (`tenant_id`,`request_type`,`status`),
  KEY `topup_requests_user_id_request_type_created_at_idx` (`user_id`,`request_type`,`created_at`),
  KEY `topup_requests_reconciliation_reference_idx` (`reconciliation_reference`),
  KEY `topup_requests_ledger_transaction_id_idx` (`ledger_transaction_id`),
  KEY `topup_requests_issue_status_idx` (`issue_status`),
  KEY `topup_requests_processed_by_fkey` (`processed_by`),
  CONSTRAINT `topup_requests_processed_by_fkey` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `topup_requests_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `topup_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trust_rating_assignments`
--

DROP TABLE IF EXISTS `trust_rating_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trust_rating_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `period_id` int(11) NOT NULL,
  `rater_id` int(11) NOT NULL,
  `ratee_id` int(11) NOT NULL,
  `rating_source_role` enum('superadmin','operator','member') NOT NULL,
  `status` enum('assigned','completed','missed','excused','locked_out') NOT NULL DEFAULT 'assigned',
  `score` int(11) DEFAULT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `sampled_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `due_at` datetime(3) DEFAULT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `missed_at` datetime(3) DEFAULT NULL,
  `lockout_until` datetime(3) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trust_rating_assignments_period_id_rater_id_ratee_id_rating__key` (`period_id`,`rater_id`,`ratee_id`,`rating_source_role`),
  KEY `trust_rating_assignments_tenant_id_status_due_at_idx` (`tenant_id`,`status`,`due_at`),
  KEY `trust_rating_assignments_rater_id_status_idx` (`rater_id`,`status`),
  KEY `trust_rating_assignments_ratee_id_status_idx` (`ratee_id`,`status`),
  KEY `trust_rating_assignments_lockout_until_idx` (`lockout_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trust_rating_periods`
--

DROP TABLE IF EXISTS `trust_rating_periods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trust_rating_periods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `status` enum('planned','active','closed','cancelled') NOT NULL DEFAULT 'planned',
  `minimum_voting_quota` int(11) NOT NULL DEFAULT 3,
  `randomized_sample_size` int(11) NOT NULL DEFAULT 10,
  `generated_at` datetime(3) DEFAULT NULL,
  `closed_at` datetime(3) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `trust_rating_periods_tenant_id_period_start_period_end_key` (`tenant_id`,`period_start`,`period_end`),
  KEY `trust_rating_periods_tenant_id_status_period_start_idx` (`tenant_id`,`status`,`period_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trust_score_snapshots`
--

DROP TABLE IF EXISTS `trust_score_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trust_score_snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `period_id` int(11) DEFAULT NULL,
  `score` int(11) NOT NULL,
  `payment_score` int(11) NOT NULL,
  `business_score` int(11) NOT NULL,
  `peer_score` int(11) NOT NULL,
  `guarantor_score` int(11) NOT NULL,
  `payment_weight` decimal(5,2) NOT NULL,
  `business_weight` decimal(5,2) NOT NULL,
  `peer_weight` decimal(5,2) NOT NULL,
  `guarantor_weight` decimal(5,2) NOT NULL,
  `tier_before` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') DEFAULT NULL,
  `tier_after` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') NOT NULL,
  `low_rating_action_state` enum('none','warning','review_required','restricted','tier_downgraded') NOT NULL DEFAULT 'none',
  `low_rating_reason` varchar(255) DEFAULT NULL,
  `calculated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  PRIMARY KEY (`id`),
  KEY `trust_score_snapshots_tenant_id_user_id_calculated_at_idx` (`tenant_id`,`user_id`,`calculated_at`),
  KEY `trust_score_snapshots_period_id_idx` (`period_id`),
  KEY `trust_score_snapshots_tier_after_idx` (`tier_after`),
  KEY `trust_score_snapshots_low_rating_action_state_idx` (`low_rating_action_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trust_tier_audits`
--

DROP TABLE IF EXISTS `trust_tier_audits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trust_tier_audits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `snapshot_id` int(11) DEFAULT NULL,
  `previous_tier` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') DEFAULT NULL,
  `new_tier` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') NOT NULL,
  `score` int(11) NOT NULL,
  `change_reason` varchar(255) NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `changed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  PRIMARY KEY (`id`),
  KEY `trust_tier_audits_tenant_id_user_id_changed_at_idx` (`tenant_id`,`user_id`,`changed_at`),
  KEY `trust_tier_audits_snapshot_id_idx` (`snapshot_id`),
  KEY `trust_tier_audits_previous_tier_new_tier_idx` (`previous_tier`,`new_tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `two_factor_auth`
--

DROP TABLE IF EXISTS `two_factor_auth`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `two_factor_auth` (
  `tfa_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `totp_secret` varchar(255) NOT NULL,
  `is_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `recovery_codes` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`tfa_id`),
  UNIQUE KEY `two_factor_auth_user_id_key` (`user_id`),
  CONSTRAINT `two_factor_auth_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_documents`
--

DROP TABLE IF EXISTS `user_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_documents` (
  `document_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `document_type` enum('valid_id','proof_of_billing','residency_cert','brgy_cert','business_permit') NOT NULL,
  `id_type_name` varchar(100) DEFAULT NULL,
  `file_url` text NOT NULL,
  `verification_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `uploaded_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`document_id`),
  KEY `user_documents_tenant_id_idx` (`tenant_id`),
  KEY `user_documents_user_id_fkey` (`user_id`),
  CONSTRAINT `user_documents_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_profiles` (
  `profile_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `business_name` varchar(150) DEFAULT NULL,
  `marital_status` enum('single','married','widowed','separated','annulled') DEFAULT 'single',
  `occupation` varchar(150) DEFAULT NULL,
  `place_of_birth` varchar(150) DEFAULT NULL,
  `tin` varchar(20) DEFAULT NULL,
  `region` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `barangay` varchar(255) DEFAULT NULL,
  `photo_url` text DEFAULT NULL,
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `user_profiles_user_id_key` (`user_id`),
  KEY `user_profiles_tenant_id_idx` (`tenant_id`),
  CONSTRAINT `user_profiles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `member_code` varchar(20) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superadmin','operator','member') NOT NULL DEFAULT 'member',
  `status` enum('pending','active','suspended','inactive','deactivated') NOT NULL DEFAULT 'pending',
  `interest_tier` enum('T1_5_PERCENT','T2_4_5_PERCENT','T3_4_PERCENT','T4_3_5_PERCENT','T5_3_PERCENT') NOT NULL DEFAULT 'T1_5_PERCENT',
  `is_deactivation_locked` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `consent_accepted_at` datetime(3) DEFAULT NULL,
  `consent_version` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_email_tenant_id_key` (`email`,`tenant_id`),
  UNIQUE KEY `users_username_tenant_id_key` (`username`,`tenant_id`),
  UNIQUE KEY `users_member_code_tenant_id_key` (`member_code`,`tenant_id`),
  KEY `users_tenant_id_fkey` (`tenant_id`),
  CONSTRAINT `users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vouch_score_snapshots`
--

DROP TABLE IF EXISTS `vouch_score_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vouch_score_snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `average_score` decimal(5,2) NOT NULL,
  `score_scale` int(11) NOT NULL DEFAULT 10,
  `score_base` int(11) NOT NULL DEFAULT 10,
  `vouch_count` int(11) NOT NULL DEFAULT 0,
  `active_vouch_count` int(11) NOT NULL DEFAULT 0,
  `discount_eligibility_state` enum('not_evaluated','eligible','ineligible','suspended') NOT NULL DEFAULT 'not_evaluated',
  `discount_eligible` tinyint(1) NOT NULL DEFAULT 0,
  `calculated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  PRIMARY KEY (`id`),
  KEY `vouch_score_snapshots_tenant_id_user_id_calculated_at_idx` (`tenant_id`,`user_id`,`calculated_at`),
  KEY `vouch_score_snapshots_discount_eligibility_state_idx` (`discount_eligibility_state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-14 11:33:46
-- ============================================
-- SEED DATA
-- ============================================
-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: agapay_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `tenant_groups`
--

LOCK TABLES `tenant_groups` WRITE;
/*!40000 ALTER TABLE `tenant_groups` DISABLE KEYS */;
INSERT INTO `tenant_groups` VALUES (1,'NCR Sector','AGP_NCR',1,'2026-05-13 15:57:31.999','2026-05-13 15:57:31.999');
INSERT INTO `tenant_groups` VALUES (2,'Central Luzon Sector','AGP_CL',1,'2026-05-13 15:57:32.004','2026-05-13 15:57:32.004');
INSERT INTO `tenant_groups` VALUES (3,'Southern Tagalog Sector','AGP_ST',1,'2026-05-13 15:57:32.011','2026-05-13 15:57:32.011');
/*!40000 ALTER TABLE `tenant_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,NULL,'Agapay System','apex','#009966',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.017','2026-05-13 15:57:32.017','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (2,2,'Malolos Market Vendors Cooperative','malolos','#2563eb',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.049','2026-05-13 15:57:32.049','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (3,2,'San Jose Rural Workers Coop','san_jose','#059669',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.209','2026-05-13 15:57:32.209','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (4,1,'Quezon City Vendors Trust','qc_vendors','#d97706',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.355','2026-05-13 15:57:32.355','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (5,1,'Makati Business Sari-Sari Coop','makati_business','#dc2626',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.459','2026-05-13 15:57:32.459','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `tenants` VALUES (6,3,'Calamba Agricultural Cooperative','calamba_agri','#7c3aed',NULL,'inter_outfit',NULL,1,'2026-05-13 15:57:32.632','2026-05-13 15:57:32.632','prospect',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'Agapay Core',1200.00,3500.00,0.00,0.00,500,5000,'[\"Basic Admin Dashboard\",\"Audit Logs\",\"Email Support\"]',1,0,3000,10000,'2026-05-13 15:57:31.982','2026-05-13 15:57:31.982');
INSERT INTO `subscription_plans` VALUES (2,'Agapay Pro',1500.00,0.00,6500.00,0.00,2500,25000,'[\"Custom Branding\",\"Priority Support\",\"Compassion Workflow\"]',1,0,3000,10000,'2026-05-13 15:57:31.988','2026-05-13 15:57:31.988');
INSERT INTO `subscription_plans` VALUES (3,'Agapay Enterprise',2000.00,0.00,0.00,12000.00,1000000,100000,'[\"Analytics Module\",\"Technical Support\",\"Reputation System\"]',1,0,3000,10000,'2026-05-13 15:57:31.994','2026-05-13 15:57:31.994');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tenant_subscriptions`
--

LOCK TABLES `tenant_subscriptions` WRITE;
/*!40000 ALTER TABLE `tenant_subscriptions` DISABLE KEYS */;
INSERT INTO `tenant_subscriptions` VALUES (1,2,1,'monthly','active','2025-12-13 15:57:32.054','2026-01-13 15:57:32.054','2026-05-13 15:57:32.057','2026-05-13 15:57:32.057','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (2,3,2,'annually','active','2026-01-13 15:57:32.211','2027-01-13 15:57:32.211','2026-05-13 15:57:32.212','2026-05-13 15:57:32.212','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (3,4,3,'semi_annually','active','2026-03-13 15:57:32.358','2026-09-13 15:57:32.358','2026-05-13 15:57:32.360','2026-05-13 15:57:32.360','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (4,5,1,'quarterly','active','2026-03-13 15:57:32.464','2026-06-13 15:57:32.464','2026-05-13 15:57:32.466','2026-05-13 15:57:32.466','[\"wallet\",\"loans\",\"community\",\"audit\"]');
INSERT INTO `tenant_subscriptions` VALUES (5,6,2,'monthly','active','2026-03-13 15:57:32.636','2026-04-13 15:57:32.636','2026-05-13 15:57:32.636','2026-05-13 15:57:32.636','[\"wallet\",\"loans\",\"community\",\"audit\"]');
/*!40000 ALTER TABLE `tenant_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `loan_products`
--

LOCK TABLES `loan_products` WRITE;
/*!40000 ALTER TABLE `loan_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `loan_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'AGP-S-000001','superadmin','agapay.saas@gmail.com',NULL,'$2y$12$PDtktQWkazOFp293DOey9OIA1D3mXv1Z1zlMtQwI/V88UadCh1yzu','superadmin','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.039','2026-05-13 15:57:32.039',NULL,NULL);
INSERT INTO `users` VALUES (2,2,'MALOLOS-O-ILP7-0001','fernando-aquino-MALOLOS-O-ILP7-0001','fernando.aquino.MALOLOS-O-ILP7-0001@gmail.com',NULL,'$2y$12$Ka7lQG2otG9QMlf8lHJUD.esXxJiSHOkDuO/uHoKHwQwNYN1gYf.e','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.082','2026-05-13 15:57:32.082',NULL,NULL);
INSERT INTO `users` VALUES (3,2,'MALOLOS-M-7793-0001','eduardo-navarro-MALOLOS-M-7793-0001','eduardo.navarro.MALOLOS-M-7793-0001@gmail.com',NULL,'$2y$12$52UdfhnKfkReiy8fRgjVyOaM37H2pTB8C7vyL0tYiFJpmM9BAsKyO','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.089','2026-05-13 15:57:32.089',NULL,NULL);
INSERT INTO `users` VALUES (4,2,'MALOLOS-M-A579-0002','angelica-bautista-MALOLOS-M-A579-0002','angelica.bautista.MALOLOS-M-A579-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.092','2026-05-13 15:57:32.092',NULL,NULL);
INSERT INTO `users` VALUES (5,2,'MALOLOS-M-OKVL-0003','ernesto-navarro-MALOLOS-M-OKVL-0003','ernesto.navarro.MALOLOS-M-OKVL-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.096','2026-05-13 15:57:32.096',NULL,NULL);
INSERT INTO `users` VALUES (6,2,'MALOLOS-M-7XLR-0004','eduardo-valencia-MALOLOS-M-7XLR-0004','eduardo.valencia.MALOLOS-M-7XLR-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.099','2026-05-13 15:57:32.099',NULL,NULL);
INSERT INTO `users` VALUES (7,2,'MALOLOS-M-BIX2-0005','fernando-soriano-MALOLOS-M-BIX2-0005','fernando.soriano.MALOLOS-M-BIX2-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.103','2026-05-13 15:57:32.103',NULL,NULL);
INSERT INTO `users` VALUES (8,2,'MALOLOS-M-RGFX-0006','cecilia-pascual-MALOLOS-M-RGFX-0006','cecilia.pascual.MALOLOS-M-RGFX-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.106','2026-05-13 15:57:32.106',NULL,NULL);
INSERT INTO `users` VALUES (9,2,'MALOLOS-M-OTX7-0007','lourdes-gonzales-MALOLOS-M-OTX7-0007','lourdes.gonzales.MALOLOS-M-OTX7-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.109','2026-05-13 15:57:32.109',NULL,NULL);
INSERT INTO `users` VALUES (10,2,'MALOLOS-M-PL4P-0008','gloria-pascual-MALOLOS-M-PL4P-0008','gloria.pascual.MALOLOS-M-PL4P-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.111','2026-05-13 15:57:32.111',NULL,NULL);
INSERT INTO `users` VALUES (11,2,'MALOLOS-M-YIG2-0009','carlos-ramos-MALOLOS-M-YIG2-0009','carlos.ramos.MALOLOS-M-YIG2-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.114','2026-05-13 15:57:32.114',NULL,NULL);
INSERT INTO `users` VALUES (12,2,'MALOLOS-M-993M-0010','carmen-domingo-MALOLOS-M-993M-0010','carmen.domingo.MALOLOS-M-993M-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.117','2026-05-13 15:57:32.117',NULL,NULL);
INSERT INTO `users` VALUES (13,2,'MALOLOS-M-HF5O-0011','remedios-reyes-MALOLOS-M-HF5O-0011','remedios.reyes.MALOLOS-M-HF5O-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.119','2026-05-13 15:57:32.119',NULL,NULL);
INSERT INTO `users` VALUES (14,2,'MALOLOS-M-VRHY-0012','ricardo-mercado-MALOLOS-M-VRHY-0012','ricardo.mercado.MALOLOS-M-VRHY-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.122','2026-05-13 15:57:32.122',NULL,NULL);
INSERT INTO `users` VALUES (15,2,'MALOLOS-M-3CFI-0013','ligaya-torres-MALOLOS-M-3CFI-0013','ligaya.torres.MALOLOS-M-3CFI-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.125','2026-05-13 15:57:32.125',NULL,NULL);
INSERT INTO `users` VALUES (16,2,'MALOLOS-M-OLPL-0014','rolando-mercado-MALOLOS-M-OLPL-0014','rolando.mercado.MALOLOS-M-OLPL-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.127','2026-05-13 15:57:32.127',NULL,NULL);
INSERT INTO `users` VALUES (17,2,'MALOLOS-M-R12M-0015','merlinda-villanueva-MALOLOS-M-R12M-0015','merlinda.villanueva.MALOLOS-M-R12M-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.130','2026-05-13 15:57:32.130',NULL,NULL);
INSERT INTO `users` VALUES (18,2,'MALOLOS-M-6AKM-0016','ricardo-castillo-MALOLOS-M-6AKM-0016','ricardo.castillo.MALOLOS-M-6AKM-0016@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.132','2026-05-13 15:57:32.132',NULL,NULL);
INSERT INTO `users` VALUES (19,2,'MALOLOS-M-ET0T-0017','ricardo-reyes-MALOLOS-M-ET0T-0017','ricardo.reyes.MALOLOS-M-ET0T-0017@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.134','2026-05-13 15:57:32.134',NULL,NULL);
INSERT INTO `users` VALUES (20,2,'MALOLOS-M-M68O-0018','remedios-valencia-MALOLOS-M-M68O-0018','remedios.valencia.MALOLOS-M-M68O-0018@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.137','2026-05-13 15:57:32.137',NULL,NULL);
INSERT INTO `users` VALUES (21,2,'MALOLOS-M-ISXZ-0019','jocelyn-navarro-MALOLOS-M-ISXZ-0019','jocelyn.navarro.MALOLOS-M-ISXZ-0019@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.139','2026-05-13 15:57:32.139',NULL,NULL);
INSERT INTO `users` VALUES (22,2,'MALOLOS-M-WFLX-0020','lourdes-santos-MALOLOS-M-WFLX-0020','lourdes.santos.MALOLOS-M-WFLX-0020@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.142','2026-05-13 15:57:32.142',NULL,NULL);
INSERT INTO `users` VALUES (23,2,'MALOLOS-M-LPOB-0021','danilo-lopez-MALOLOS-M-LPOB-0021','danilo.lopez.MALOLOS-M-LPOB-0021@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.144','2026-05-13 15:57:32.144',NULL,NULL);
INSERT INTO `users` VALUES (24,3,'SAN_JOSE-O-R9XC-0001','jocelyn-garcia-SAN_JOSE-O-R9XC-0001','jocelyn.garcia.SAN_JOSE-O-R9XC-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.233','2026-05-13 15:57:32.233',NULL,NULL);
INSERT INTO `users` VALUES (25,3,'SAN_JOSE-M-NOZV-0001','arturo-cruz-SAN_JOSE-M-NOZV-0001','arturo.cruz.SAN_JOSE-M-NOZV-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.237','2026-05-13 15:57:32.237',NULL,NULL);
INSERT INTO `users` VALUES (26,3,'SAN_JOSE-M-5ZPT-0002','carmen-pascual-SAN_JOSE-M-5ZPT-0002','carmen.pascual.SAN_JOSE-M-5ZPT-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.239','2026-05-13 15:57:32.239',NULL,NULL);
INSERT INTO `users` VALUES (27,3,'SAN_JOSE-M-ZFGB-0003','luisa-soriano-SAN_JOSE-M-ZFGB-0003','luisa.soriano.SAN_JOSE-M-ZFGB-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.249','2026-05-13 15:57:32.249',NULL,NULL);
INSERT INTO `users` VALUES (28,3,'SAN_JOSE-M-8PZN-0004','maria-valencia-SAN_JOSE-M-8PZN-0004','maria.valencia.SAN_JOSE-M-8PZN-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.257','2026-05-13 15:57:32.257',NULL,NULL);
INSERT INTO `users` VALUES (29,3,'SAN_JOSE-M-NSZW-0005','lourdes-garcia-SAN_JOSE-M-NSZW-0005','lourdes.garcia.SAN_JOSE-M-NSZW-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.260','2026-05-13 15:57:32.260',NULL,NULL);
INSERT INTO `users` VALUES (30,3,'SAN_JOSE-M-AORI-0006','rolando-salazar-SAN_JOSE-M-AORI-0006','rolando.salazar.SAN_JOSE-M-AORI-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.262','2026-05-13 15:57:32.262',NULL,NULL);
INSERT INTO `users` VALUES (31,3,'SAN_JOSE-M-5I2L-0007','elena-rivera-SAN_JOSE-M-5I2L-0007','elena.rivera.SAN_JOSE-M-5I2L-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.265','2026-05-13 15:57:32.265',NULL,NULL);
INSERT INTO `users` VALUES (32,3,'SAN_JOSE-M-QPB6-0008','marites-reyes-SAN_JOSE-M-QPB6-0008','marites.reyes.SAN_JOSE-M-QPB6-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.269','2026-05-13 15:57:32.269',NULL,NULL);
INSERT INTO `users` VALUES (33,3,'SAN_JOSE-M-6L6W-0009','roberto-villanueva-SAN_JOSE-M-6L6W-0009','roberto.villanueva.SAN_JOSE-M-6L6W-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.272','2026-05-13 15:57:32.272',NULL,NULL);
INSERT INTO `users` VALUES (34,3,'SAN_JOSE-M-V3T1-0010','ernesto-navarro-SAN_JOSE-M-V3T1-0010','ernesto.navarro.SAN_JOSE-M-V3T1-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.274','2026-05-13 15:57:32.274',NULL,NULL);
INSERT INTO `users` VALUES (35,3,'SAN_JOSE-M-NVMW-0011','elena-garcia-SAN_JOSE-M-NVMW-0011','elena.garcia.SAN_JOSE-M-NVMW-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.277','2026-05-13 15:57:32.277',NULL,NULL);
INSERT INTO `users` VALUES (36,3,'SAN_JOSE-M-SZRS-0012','rowena-santos-SAN_JOSE-M-SZRS-0012','rowena.santos.SAN_JOSE-M-SZRS-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.279','2026-05-13 15:57:32.279',NULL,NULL);
INSERT INTO `users` VALUES (37,3,'SAN_JOSE-M-SH1I-0013','angelica-salazar-SAN_JOSE-M-SH1I-0013','angelica.salazar.SAN_JOSE-M-SH1I-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.281','2026-05-13 15:57:32.281',NULL,NULL);
INSERT INTO `users` VALUES (38,3,'SAN_JOSE-M-UMN3-0014','emilio-rivera-SAN_JOSE-M-UMN3-0014','emilio.rivera.SAN_JOSE-M-UMN3-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.284','2026-05-13 15:57:32.284',NULL,NULL);
INSERT INTO `users` VALUES (39,3,'SAN_JOSE-M-9X7D-0015','eduardo-santos-SAN_JOSE-M-9X7D-0015','eduardo.santos.SAN_JOSE-M-9X7D-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.287','2026-05-13 15:57:32.287',NULL,NULL);
INSERT INTO `users` VALUES (40,3,'SAN_JOSE-M-PGBO-0016','rolando-soriano-SAN_JOSE-M-PGBO-0016','rolando.soriano.SAN_JOSE-M-PGBO-0016@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.289','2026-05-13 15:57:32.289',NULL,NULL);
INSERT INTO `users` VALUES (41,3,'SAN_JOSE-M-M2HA-0017','angelica-bautista-SAN_JOSE-M-M2HA-0017','angelica.bautista.SAN_JOSE-M-M2HA-0017@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.292','2026-05-13 15:57:32.292',NULL,NULL);
INSERT INTO `users` VALUES (42,3,'SAN_JOSE-M-E22L-0018','marites-valencia-SAN_JOSE-M-E22L-0018','marites.valencia.SAN_JOSE-M-E22L-0018@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.295','2026-05-13 15:57:32.295',NULL,NULL);
INSERT INTO `users` VALUES (43,3,'SAN_JOSE-M-ZK8N-0019','rolando-fernandez-SAN_JOSE-M-ZK8N-0019','rolando.fernandez.SAN_JOSE-M-ZK8N-0019@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.297','2026-05-13 15:57:32.297',NULL,NULL);
INSERT INTO `users` VALUES (44,3,'SAN_JOSE-M-X45R-0020','luisa-bautista-SAN_JOSE-M-X45R-0020','luisa.bautista.SAN_JOSE-M-X45R-0020@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.299','2026-05-13 15:57:32.299',NULL,NULL);
INSERT INTO `users` VALUES (45,3,'SAN_JOSE-M-JYL6-0021','danilo-torres-SAN_JOSE-M-JYL6-0021','danilo.torres.SAN_JOSE-M-JYL6-0021@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.302','2026-05-13 15:57:32.302',NULL,NULL);
INSERT INTO `users` VALUES (46,3,'SAN_JOSE-M-76A6-0022','rosario-aquino-SAN_JOSE-M-76A6-0022','rosario.aquino.SAN_JOSE-M-76A6-0022@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.304','2026-05-13 15:57:32.304',NULL,NULL);
INSERT INTO `users` VALUES (47,3,'SAN_JOSE-M-NB5D-0023','carlos-garcia-SAN_JOSE-M-NB5D-0023','carlos.garcia.SAN_JOSE-M-NB5D-0023@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.306','2026-05-13 15:57:32.306',NULL,NULL);
INSERT INTO `users` VALUES (48,3,'SAN_JOSE-M-YR6I-0024','danilo-flores-SAN_JOSE-M-YR6I-0024','danilo.flores.SAN_JOSE-M-YR6I-0024@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.308','2026-05-13 15:57:32.308',NULL,NULL);
INSERT INTO `users` VALUES (49,4,'QC_VENDORS-O-BJTQ-00','danilo-gonzales-QC_VENDORS-O-BJTQ-0001','danilo.gonzales.QC_VENDORS-O-BJTQ-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.376','2026-05-13 15:57:32.376',NULL,NULL);
INSERT INTO `users` VALUES (50,4,'QC_VENDORS-M-FAD0-00','fernando-valencia-QC_VENDORS-M-FAD0-0001','fernando.valencia.QC_VENDORS-M-FAD0-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.379','2026-05-13 15:57:32.379',NULL,NULL);
INSERT INTO `users` VALUES (51,4,'QC_VENDORS-M-SSYW-00','ligaya-villanueva-QC_VENDORS-M-SSYW-0002','ligaya.villanueva.QC_VENDORS-M-SSYW-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.382','2026-05-13 15:57:32.382',NULL,NULL);
INSERT INTO `users` VALUES (52,4,'QC_VENDORS-M-0R86-00','rosario-aquino-QC_VENDORS-M-0R86-0003','rosario.aquino.QC_VENDORS-M-0R86-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.384','2026-05-13 15:57:32.384',NULL,NULL);
INSERT INTO `users` VALUES (53,4,'QC_VENDORS-M-S7G8-00','manuel-mercado-QC_VENDORS-M-S7G8-0004','manuel.mercado.QC_VENDORS-M-S7G8-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.386','2026-05-13 15:57:32.386',NULL,NULL);
INSERT INTO `users` VALUES (54,4,'QC_VENDORS-M-QEZW-00','rowena-ramos-QC_VENDORS-M-QEZW-0005','rowena.ramos.QC_VENDORS-M-QEZW-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.388','2026-05-13 15:57:32.388',NULL,NULL);
INSERT INTO `users` VALUES (55,4,'QC_VENDORS-M-99TE-00','carmen-gonzales-QC_VENDORS-M-99TE-0006','carmen.gonzales.QC_VENDORS-M-99TE-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.391','2026-05-13 15:57:32.391',NULL,NULL);
INSERT INTO `users` VALUES (56,4,'QC_VENDORS-M-VVNZ-00','emilio-santos-QC_VENDORS-M-VVNZ-0007','emilio.santos.QC_VENDORS-M-VVNZ-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.394','2026-05-13 15:57:32.394',NULL,NULL);
INSERT INTO `users` VALUES (57,4,'QC_VENDORS-M-P4GR-00','victoria-torres-QC_VENDORS-M-P4GR-0008','victoria.torres.QC_VENDORS-M-P4GR-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.397','2026-05-13 15:57:32.397',NULL,NULL);
INSERT INTO `users` VALUES (58,4,'QC_VENDORS-M-KW9K-00','andres-soriano-QC_VENDORS-M-KW9K-0009','andres.soriano.QC_VENDORS-M-KW9K-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.400','2026-05-13 15:57:32.400',NULL,NULL);
INSERT INTO `users` VALUES (59,4,'QC_VENDORS-M-19K5-00','emilio-flores-QC_VENDORS-M-19K5-0010','emilio.flores.QC_VENDORS-M-19K5-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.403','2026-05-13 15:57:32.403',NULL,NULL);
INSERT INTO `users` VALUES (60,4,'QC_VENDORS-M-G6MH-00','roberto-delacruz-QC_VENDORS-M-G6MH-0011','roberto.delacruz.QC_VENDORS-M-G6MH-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.406','2026-05-13 15:57:32.406',NULL,NULL);
INSERT INTO `users` VALUES (61,4,'QC_VENDORS-M-9UQK-00','marites-valencia-QC_VENDORS-M-9UQK-0012','marites.valencia.QC_VENDORS-M-9UQK-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.409','2026-05-13 15:57:32.409',NULL,NULL);
INSERT INTO `users` VALUES (62,4,'QC_VENDORS-M-J3NE-00','arturo-flores-QC_VENDORS-M-J3NE-0013','arturo.flores.QC_VENDORS-M-J3NE-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.412','2026-05-13 15:57:32.412',NULL,NULL);
INSERT INTO `users` VALUES (63,4,'QC_VENDORS-M-P7LO-00','emilio-ramos-QC_VENDORS-M-P7LO-0014','emilio.ramos.QC_VENDORS-M-P7LO-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.414','2026-05-13 15:57:32.414',NULL,NULL);
INSERT INTO `users` VALUES (64,4,'QC_VENDORS-M-611R-00','rafael-lopez-QC_VENDORS-M-611R-0015','rafael.lopez.QC_VENDORS-M-611R-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.416','2026-05-13 15:57:32.416',NULL,NULL);
INSERT INTO `users` VALUES (65,5,'MAKATI_BUSINESS-O-5K','emilio-aquino-MAKATI_BUSINESS-O-5K7H-0001','emilio.aquino.MAKATI_BUSINESS-O-5K7H-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.488','2026-05-13 15:57:32.488',NULL,NULL);
INSERT INTO `users` VALUES (66,5,'MAKATI_BUSINESS-M-K8','rowena-flores-MAKATI_BUSINESS-M-K8ZC-0001','rowena.flores.MAKATI_BUSINESS-M-K8ZC-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.495','2026-05-13 15:57:32.495',NULL,NULL);
INSERT INTO `users` VALUES (67,5,'MAKATI_BUSINESS-M-XM','ricardo-salazar-MAKATI_BUSINESS-M-XM0G-0002','ricardo.salazar.MAKATI_BUSINESS-M-XM0G-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.499','2026-05-13 15:57:32.499',NULL,NULL);
INSERT INTO `users` VALUES (68,5,'MAKATI_BUSINESS-M-IJ','ricardo-garcia-MAKATI_BUSINESS-M-IJ39-0003','ricardo.garcia.MAKATI_BUSINESS-M-IJ39-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.505','2026-05-13 15:57:32.505',NULL,NULL);
INSERT INTO `users` VALUES (69,5,'MAKATI_BUSINESS-M-X8','merlinda-navarro-MAKATI_BUSINESS-M-X8GA-0004','merlinda.navarro.MAKATI_BUSINESS-M-X8GA-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.511','2026-05-13 15:57:32.511',NULL,NULL);
INSERT INTO `users` VALUES (70,5,'MAKATI_BUSINESS-M-JF','rafael-torres-MAKATI_BUSINESS-M-JF9D-0005','rafael.torres.MAKATI_BUSINESS-M-JF9D-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.517','2026-05-13 15:57:32.517',NULL,NULL);
INSERT INTO `users` VALUES (71,5,'MAKATI_BUSINESS-M-WU','ricardo-mercado-MAKATI_BUSINESS-M-WUCY-0006','ricardo.mercado.MAKATI_BUSINESS-M-WUCY-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.522','2026-05-13 15:57:32.522',NULL,NULL);
INSERT INTO `users` VALUES (72,5,'MAKATI_BUSINESS-M-GU','jocelyn-mendoza-MAKATI_BUSINESS-M-GUO5-0007','jocelyn.mendoza.MAKATI_BUSINESS-M-GUO5-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.527','2026-05-13 15:57:32.527',NULL,NULL);
INSERT INTO `users` VALUES (73,5,'MAKATI_BUSINESS-M-L1','corazon-rivera-MAKATI_BUSINESS-M-L1FJ-0008','corazon.rivera.MAKATI_BUSINESS-M-L1FJ-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.531','2026-05-13 15:57:32.531',NULL,NULL);
INSERT INTO `users` VALUES (74,5,'MAKATI_BUSINESS-M-66','merlinda-aquino-MAKATI_BUSINESS-M-66UP-0009','merlinda.aquino.MAKATI_BUSINESS-M-66UP-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.537','2026-05-13 15:57:32.537',NULL,NULL);
INSERT INTO `users` VALUES (75,5,'MAKATI_BUSINESS-M-44','rafael-cruz-MAKATI_BUSINESS-M-44I3-0010','rafael.cruz.MAKATI_BUSINESS-M-44I3-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.541','2026-05-13 15:57:32.541',NULL,NULL);
INSERT INTO `users` VALUES (76,5,'MAKATI_BUSINESS-M-J5','miguel-ramos-MAKATI_BUSINESS-M-J5QM-0011','miguel.ramos.MAKATI_BUSINESS-M-J5QM-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.545','2026-05-13 15:57:32.545',NULL,NULL);
INSERT INTO `users` VALUES (77,5,'MAKATI_BUSINESS-M-94','esperanza-salazar-MAKATI_BUSINESS-M-94V8-0012','esperanza.salazar.MAKATI_BUSINESS-M-94V8-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.549','2026-05-13 15:57:32.549',NULL,NULL);
INSERT INTO `users` VALUES (78,5,'MAKATI_BUSINESS-M-KU','rafael-castillo-MAKATI_BUSINESS-M-KU7X-0013','rafael.castillo.MAKATI_BUSINESS-M-KU7X-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.554','2026-05-13 15:57:32.554',NULL,NULL);
INSERT INTO `users` VALUES (79,5,'MAKATI_BUSINESS-M-Y2','rolando-villanueva-MAKATI_BUSINESS-M-Y2RD-0014','rolando.villanueva.MAKATI_BUSINESS-M-Y2RD-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.558','2026-05-13 15:57:32.558',NULL,NULL);
INSERT INTO `users` VALUES (80,5,'MAKATI_BUSINESS-M-G3','jocelyn-soriano-MAKATI_BUSINESS-M-G3E8-0015','jocelyn.soriano.MAKATI_BUSINESS-M-G3E8-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.563','2026-05-13 15:57:32.563',NULL,NULL);
INSERT INTO `users` VALUES (81,5,'MAKATI_BUSINESS-M-SL','merlinda-aquino-MAKATI_BUSINESS-M-SLAI-0016','merlinda.aquino.MAKATI_BUSINESS-M-SLAI-0016@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.568','2026-05-13 15:57:32.568',NULL,NULL);
INSERT INTO `users` VALUES (82,5,'MAKATI_BUSINESS-M-TP','cecilia-valencia-MAKATI_BUSINESS-M-TPKX-0017','cecilia.valencia.MAKATI_BUSINESS-M-TPKX-0017@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.573','2026-05-13 15:57:32.573',NULL,NULL);
INSERT INTO `users` VALUES (83,5,'MAKATI_BUSINESS-M-EP','victoria-gonzales-MAKATI_BUSINESS-M-EPRY-0018','victoria.gonzales.MAKATI_BUSINESS-M-EPRY-0018@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.577','2026-05-13 15:57:32.577',NULL,NULL);
INSERT INTO `users` VALUES (84,5,'MAKATI_BUSINESS-M-LL','esperanza-gonzales-MAKATI_BUSINESS-M-LLAF-0019','esperanza.gonzales.MAKATI_BUSINESS-M-LLAF-0019@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.581','2026-05-13 15:57:32.581',NULL,NULL);
INSERT INTO `users` VALUES (85,5,'MAKATI_BUSINESS-M-4R','luisa-reyes-MAKATI_BUSINESS-M-4RGW-0020','luisa.reyes.MAKATI_BUSINESS-M-4RGW-0020@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.586','2026-05-13 15:57:32.586',NULL,NULL);
INSERT INTO `users` VALUES (86,6,'CALAMBA_AGRI-O-YQAI-','cecilia-domingo-CALAMBA_AGRI-O-YQAI-0001','cecilia.domingo.CALAMBA_AGRI-O-YQAI-0001@gmail.com',NULL,'$2b$10$DIz3z1S0EYeyyke96C4kx.tD9cOjXUnylXIwoVkbZU81UbEloUf8a','operator','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.655','2026-05-13 15:57:32.655',NULL,NULL);
INSERT INTO `users` VALUES (87,6,'CALAMBA_AGRI-M-UJNM-','rafael-pascual-CALAMBA_AGRI-M-UJNM-0001','rafael.pascual.CALAMBA_AGRI-M-UJNM-0001@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.659','2026-05-13 15:57:32.659',NULL,NULL);
INSERT INTO `users` VALUES (88,6,'CALAMBA_AGRI-M-PK2M-','carmen-valencia-CALAMBA_AGRI-M-PK2M-0002','carmen.valencia.CALAMBA_AGRI-M-PK2M-0002@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.662','2026-05-13 15:57:32.662',NULL,NULL);
INSERT INTO `users` VALUES (89,6,'CALAMBA_AGRI-M-KIOJ-','ricardo-garcia-CALAMBA_AGRI-M-KIOJ-0003','ricardo.garcia.CALAMBA_AGRI-M-KIOJ-0003@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.666','2026-05-13 15:57:32.666',NULL,NULL);
INSERT INTO `users` VALUES (90,6,'CALAMBA_AGRI-M-TLSS-','rafael-navarro-CALAMBA_AGRI-M-TLSS-0004','rafael.navarro.CALAMBA_AGRI-M-TLSS-0004@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.669','2026-05-13 15:57:32.669',NULL,NULL);
INSERT INTO `users` VALUES (91,6,'CALAMBA_AGRI-M-EIRF-','patricia-castillo-CALAMBA_AGRI-M-EIRF-0005','patricia.castillo.CALAMBA_AGRI-M-EIRF-0005@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.674','2026-05-13 15:57:32.674',NULL,NULL);
INSERT INTO `users` VALUES (92,6,'CALAMBA_AGRI-M-9I5X-','maria-navarro-CALAMBA_AGRI-M-9I5X-0006','maria.navarro.CALAMBA_AGRI-M-9I5X-0006@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.681','2026-05-13 15:57:32.681',NULL,NULL);
INSERT INTO `users` VALUES (93,6,'CALAMBA_AGRI-M-SU2Q-','ramon-salazar-CALAMBA_AGRI-M-SU2Q-0007','ramon.salazar.CALAMBA_AGRI-M-SU2Q-0007@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.685','2026-05-13 15:57:32.685',NULL,NULL);
INSERT INTO `users` VALUES (94,6,'CALAMBA_AGRI-M-GU3K-','rolando-ramos-CALAMBA_AGRI-M-GU3K-0008','rolando.ramos.CALAMBA_AGRI-M-GU3K-0008@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.688','2026-05-13 15:57:32.688',NULL,NULL);
INSERT INTO `users` VALUES (95,6,'CALAMBA_AGRI-M-2J6D-','esperanza-bautista-CALAMBA_AGRI-M-2J6D-0009','esperanza.bautista.CALAMBA_AGRI-M-2J6D-0009@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.690','2026-05-13 15:57:32.690',NULL,NULL);
INSERT INTO `users` VALUES (96,6,'CALAMBA_AGRI-M-7E9V-','luisa-castillo-CALAMBA_AGRI-M-7E9V-0010','luisa.castillo.CALAMBA_AGRI-M-7E9V-0010@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.693','2026-05-13 15:57:32.693',NULL,NULL);
INSERT INTO `users` VALUES (97,6,'CALAMBA_AGRI-M-SNN8-','reynaldo-domingo-CALAMBA_AGRI-M-SNN8-0011','reynaldo.domingo.CALAMBA_AGRI-M-SNN8-0011@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T1_5_PERCENT',0,NULL,'2026-05-13 15:57:32.695','2026-05-13 15:57:32.695',NULL,NULL);
INSERT INTO `users` VALUES (98,6,'CALAMBA_AGRI-M-X0TP-','danilo-cruz-CALAMBA_AGRI-M-X0TP-0012','danilo.cruz.CALAMBA_AGRI-M-X0TP-0012@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.697','2026-05-13 15:57:32.697',NULL,NULL);
INSERT INTO `users` VALUES (99,6,'CALAMBA_AGRI-M-6EM5-','corazon-santos-CALAMBA_AGRI-M-6EM5-0013','corazon.santos.CALAMBA_AGRI-M-6EM5-0013@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.699','2026-05-13 15:57:32.699',NULL,NULL);
INSERT INTO `users` VALUES (100,6,'CALAMBA_AGRI-M-8YFI-','teresa-zamora-CALAMBA_AGRI-M-8YFI-0014','teresa.zamora.CALAMBA_AGRI-M-8YFI-0014@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T3_4_PERCENT',0,NULL,'2026-05-13 15:57:32.702','2026-05-13 15:57:32.702',NULL,NULL);
INSERT INTO `users` VALUES (101,6,'CALAMBA_AGRI-M-STFJ-','rolando-navarro-CALAMBA_AGRI-M-STFJ-0015','rolando.navarro.CALAMBA_AGRI-M-STFJ-0015@gmail.com',NULL,'$2b$10$Ue3Z3Vt.po7qiaCZfiUlH.UZTcOSDDp2tuLuWep53LUYpUg.jYkp6','member','active','T2_4_5_PERCENT',0,NULL,'2026-05-13 15:57:32.704','2026-05-13 15:57:32.704',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user_profiles`
--

LOCK TABLES `user_profiles` WRITE;
/*!40000 ALTER TABLE `user_profiles` DISABLE KEYS */;
INSERT INTO `user_profiles` VALUES (1,1,1,'James',NULL,'Bryant',NULL,NULL,NULL,NULL,'single',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (2,2,2,'Fernando',NULL,'Aquino','male',NULL,'Brgy. Macabling, Malolos Market Vendors Cooperative',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (3,3,2,'Eduardo',NULL,'Navarro','male',NULL,'52 Rizal St, Brgy. Mandurriao','Sampaguita Store','single','Ukay-Ukay Vendor',NULL,'658-279-867',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (4,4,2,'Angelica',NULL,'Bautista','female',NULL,'59 Rizal St, Brgy. Mandurriao','Lucky 7 Sari-Sari','single','Freelancer',NULL,'177-104-784',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (5,5,2,'Ernesto',NULL,'Navarro','male',NULL,'98 Rizal St, Brgy. Mandurriao','Isdaan Fish Trading','single','Sari-Sari Store Owner',NULL,'399-233-65',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (6,6,2,'Eduardo',NULL,'Valencia','male',NULL,'66 Rizal St, Brgy. San Nicolas','Kabayan Grocery','single','Carinderia Owner',NULL,'886-274-431',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (7,7,2,'Fernando',NULL,'Soriano','male',NULL,'71 Rizal St, Brgy. Macabling','Taho Master PH','single','Tricycle Driver',NULL,'431-752-909',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (8,8,2,'Cecilia',NULL,'Pascual','female',NULL,'37 Rizal St, Brgy. Macabling','Tindahan ni Nanay','single','Rice Trader',NULL,'496-410-31',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (9,9,2,'Lourdes',NULL,'Gonzales','female',NULL,'5 Rizal St, Brgy. Macabling','J&R Trading','single','Freelancer',NULL,'618-807-741',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (10,10,2,'Gloria',NULL,'Pascual','female',NULL,'59 Rizal St, Brgy. Commonwealth','Buko King Enterprise','single','Laundry Service',NULL,'919-991-270',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (11,11,2,'Carlos',NULL,'Ramos','male',NULL,'91 Rizal St, Brgy. Sto. Domingo','Isdaan Fish Trading','single','Street Food Vendor',NULL,'512-339-817',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (12,12,2,'Carmen',NULL,'Domingo','female',NULL,'62 Rizal St, Brgy. Macabling','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'262-431-217',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (13,13,2,'Remedios',NULL,'Reyes','female',NULL,'76 Rizal St, Brgy. Balibago','Lutong Bahay Catering','single','Ukay-Ukay Vendor',NULL,'437-596-696',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (14,14,2,'Ricardo',NULL,'Mercado','male',NULL,'25 Rizal St, Brgy. Balibago','J&R Trading','single','Market Vendor',NULL,'266-870-61',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (15,15,2,'Ligaya',NULL,'Torres','female',NULL,'33 Rizal St, Brgy. Sto. Domingo','Golden Star Variety','single','Fish Vendor',NULL,'474-402-326',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (16,16,2,'Rolando',NULL,'Mercado','male',NULL,'14 Rizal St, Brgy. Jaro','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'294-665-136',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (17,17,2,'Merlinda',NULL,'Villanueva','female',NULL,'78 Rizal St, Brgy. Macabling','Kuya Eddie\'s General Mdse','single','Sari-Sari Store Owner',NULL,'624-167-184',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (18,18,2,'Ricardo',NULL,'Castillo','male',NULL,'85 Rizal St, Brgy. San Nicolas','Sampaguita Store','single','Market Vendor',NULL,'433-943-542',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (19,19,2,'Ricardo',NULL,'Reyes','male',NULL,'23 Rizal St, Brgy. Jaro','Palengke Express','single','Farmer',NULL,'457-382-68',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (20,20,2,'Remedios',NULL,'Valencia','female',NULL,'83 Rizal St, Brgy. Macabling','Kuya Eddie\'s General Mdse','single','Sari-Sari Store Owner',NULL,'900-843-165',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (21,21,2,'Jocelyn',NULL,'Navarro','female',NULL,'40 Rizal St, Brgy. Jaro','Panaderia De Manila','single','Ukay-Ukay Vendor',NULL,'758-502-122',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (22,22,2,'Lourdes',NULL,'Santos','female',NULL,'27 Rizal St, Brgy. Sto. Domingo','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'739-327-984',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (23,23,2,'Danilo',NULL,'Lopez','male',NULL,'89 Rizal St, Brgy. Sto. Domingo','Golden Star Variety','single','Freelancer',NULL,'403-489-817',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (24,24,3,'Jocelyn',NULL,'Garcia','female',NULL,'Brgy. San Nicolas, San Jose Rural Workers Coop',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (25,25,3,'Arturo',NULL,'Cruz','male',NULL,'23 Rizal St, Brgy. Mandurriao','Mabuhay Mart','single','Market Vendor',NULL,'380-117-882',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (26,26,3,'Carmen',NULL,'Pascual','female',NULL,'44 Rizal St, Brgy. Balibago','Panaderia De Manila','single','Ukay-Ukay Vendor',NULL,'950-693-941',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (27,27,3,'Luisa',NULL,'Soriano','female',NULL,'67 Rizal St, Brgy. Balibago','Isdaan Fish Trading','single','Water Refilling Operator',NULL,'497-727-332',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (28,28,3,'Maria',NULL,'Valencia','female',NULL,'46 Rizal St, Brgy. Mandurriao','Aling Nena\'s Sari-Sari','single','Carinderia Owner',NULL,'637-455-155',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (29,29,3,'Lourdes',NULL,'Garcia','female',NULL,'49 Rizal St, Brgy. Holy Spirit','Mabuhay Mart','single','Market Vendor',NULL,'214-963-55',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (30,30,3,'Rolando',NULL,'Salazar','male',NULL,'18 Rizal St, Brgy. Macabling','Lutong Bahay Catering','single','Ukay-Ukay Vendor',NULL,'483-830-900',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (31,31,3,'Elena',NULL,'Rivera','female',NULL,'70 Rizal St, Brgy. Holy Spirit','Tindahan ni Nanay','single','Market Vendor',NULL,'569-786-416',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (32,32,3,'Marites',NULL,'Reyes','female',NULL,'35 Rizal St, Brgy. Balibago','Kuya Eddie\'s General Mdse','single','Carinderia Owner',NULL,'142-914-295',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (33,33,3,'Roberto',NULL,'Villanueva','male',NULL,'18 Rizal St, Brgy. Holy Spirit','Kakanin Corner','single','Market Vendor',NULL,'325-770-286',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (34,34,3,'Ernesto',NULL,'Navarro','male',NULL,'63 Rizal St, Brgy. Jaro','J&R Trading','single','Rice Trader',NULL,'260-862-162',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (35,35,3,'Elena',NULL,'Garcia','female',NULL,'26 Rizal St, Brgy. Jaro','Aling Nena\'s Sari-Sari','single','Laundry Service',NULL,'480-272-869',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (36,36,3,'Rowena',NULL,'Santos','female',NULL,'63 Rizal St, Brgy. Balibago','Ate Rose Mini Mart','single','Sari-Sari Store Owner',NULL,'308-776-640',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (37,37,3,'Angelica',NULL,'Salazar','female',NULL,'71 Rizal St, Brgy. Jaro','Kakanin Corner','single','Fish Vendor',NULL,'659-489-881',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (38,38,3,'Emilio',NULL,'Rivera','male',NULL,'69 Rizal St, Brgy. San Nicolas','Kuya Eddie\'s General Mdse','single','Farmer',NULL,'351-626-329',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (39,39,3,'Eduardo',NULL,'Santos','male',NULL,'25 Rizal St, Brgy. Commonwealth','Lutong Bahay Catering','single','Farmer',NULL,'139-379-555',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (40,40,3,'Rolando',NULL,'Soriano','male',NULL,'33 Rizal St, Brgy. Commonwealth','Buko King Enterprise','single','Street Food Vendor',NULL,'837-946-32',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (41,41,3,'Angelica',NULL,'Bautista','female',NULL,'92 Rizal St, Brgy. Mandurriao','Tres Marias Store','single','Market Vendor',NULL,'902-946-993',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (42,42,3,'Marites',NULL,'Valencia','female',NULL,'54 Rizal St, Brgy. Sto. Domingo','Lutong Bahay Catering','single','Freelancer',NULL,'533-635-813',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (43,43,3,'Rolando',NULL,'Fernandez','male',NULL,'59 Rizal St, Brgy. San Nicolas','Palengke Express','single','Water Refilling Operator',NULL,'458-999-641',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (44,44,3,'Luisa',NULL,'Bautista','female',NULL,'9 Rizal St, Brgy. Commonwealth','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'588-754-526',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (45,45,3,'Danilo',NULL,'Torres','male',NULL,'73 Rizal St, Brgy. Jaro','Tindahan ni Nanay','single','Farmer',NULL,'941-513-461',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (46,46,3,'Rosario',NULL,'Aquino','female',NULL,'57 Rizal St, Brgy. Sto. Domingo','Kakanin Corner','single','Freelancer',NULL,'273-279-762',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (47,47,3,'Carlos',NULL,'Garcia','male',NULL,'20 Rizal St, Brgy. Mandurriao','Ate Rose Mini Mart','single','Tricycle Driver',NULL,'703-822-855',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (48,48,3,'Danilo',NULL,'Flores','male',NULL,'95 Rizal St, Brgy. Holy Spirit','Kuya Eddie\'s General Mdse','single','Water Refilling Operator',NULL,'937-411-476',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (49,49,4,'Danilo',NULL,'Gonzales','male',NULL,'Brgy. Sto. Domingo, Quezon City Vendors Trust',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (50,50,4,'Fernando',NULL,'Valencia','male',NULL,'66 Rizal St, Brgy. Jaro','Mabuhay Mart','single','Tricycle Driver',NULL,'953-512-417',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (51,51,4,'Ligaya',NULL,'Villanueva','female',NULL,'58 Rizal St, Brgy. Holy Spirit','Taho Master PH','single','Farmer',NULL,'134-229-592',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (52,52,4,'Rosario',NULL,'Aquino','female',NULL,'64 Rizal St, Brgy. Macabling','Sampaguita Store','single','Laundry Service',NULL,'404-494-784',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (53,53,4,'Manuel',NULL,'Mercado','male',NULL,'5 Rizal St, Brgy. Mandurriao','Ate Rose Mini Mart','single','Water Refilling Operator',NULL,'843-564-682',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (54,54,4,'Rowena',NULL,'Ramos','female',NULL,'63 Rizal St, Brgy. Sto. Domingo','Kuya Eddie\'s General Mdse','single','Water Refilling Operator',NULL,'627-506-599',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (55,55,4,'Carmen',NULL,'Gonzales','female',NULL,'61 Rizal St, Brgy. Sto. Domingo','Sampaguita Store','single','Street Food Vendor',NULL,'771-318-644',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (56,56,4,'Emilio',NULL,'Santos','male',NULL,'75 Rizal St, Brgy. Commonwealth','Taho Master PH','single','Water Refilling Operator',NULL,'877-618-869',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (57,57,4,'Victoria',NULL,'Torres','female',NULL,'74 Rizal St, Brgy. Sto. Domingo','Tindahan ni Nanay','single','Tricycle Driver',NULL,'413-644-808',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (58,58,4,'Andres',NULL,'Soriano','male',NULL,'2 Rizal St, Brgy. Jaro','Lutong Bahay Catering','single','Water Refilling Operator',NULL,'600-766-40',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (59,59,4,'Emilio',NULL,'Flores','male',NULL,'24 Rizal St, Brgy. Batasan Hills','Kabayan Grocery','single','Laundry Service',NULL,'996-775-263',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (60,60,4,'Roberto',NULL,'Dela Cruz','male',NULL,'25 Rizal St, Brgy. Sto. Domingo','Lucky 7 Sari-Sari','single','Freelancer',NULL,'593-460-103',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (61,61,4,'Marites',NULL,'Valencia','female',NULL,'5 Rizal St, Brgy. Balibago','Tindahan ni Nanay','single','Street Food Vendor',NULL,'479-580-256',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (62,62,4,'Arturo',NULL,'Flores','male',NULL,'30 Rizal St, Brgy. Jaro','Panaderia De Manila','single','Farmer',NULL,'895-447-378',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (63,63,4,'Emilio',NULL,'Ramos','male',NULL,'65 Rizal St, Brgy. Jaro','Buko King Enterprise','single','Carinderia Owner',NULL,'578-776-291',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (64,64,4,'Rafael',NULL,'Lopez','male',NULL,'14 Rizal St, Brgy. Balibago','Panaderia De Manila','single','Fish Vendor',NULL,'955-329-155',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (65,65,5,'Emilio',NULL,'Aquino','male',NULL,'Brgy. Commonwealth, Makati Business Sari-Sari Coop',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (66,66,5,'Rowena',NULL,'Flores','female',NULL,'13 Rizal St, Brgy. Holy Spirit','J&R Trading','single','Sari-Sari Store Owner',NULL,'335-466-507',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (67,67,5,'Ricardo',NULL,'Salazar','male',NULL,'25 Rizal St, Brgy. Balibago','Tres Marias Store','single','Tricycle Driver',NULL,'950-486-992',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (68,68,5,'Ricardo',NULL,'Garcia','male',NULL,'92 Rizal St, Brgy. Sto. Domingo','Kuya Eddie\'s General Mdse','single','Sari-Sari Store Owner',NULL,'234-851-953',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (69,69,5,'Merlinda',NULL,'Navarro','female',NULL,'20 Rizal St, Brgy. Sto. Domingo','Kakanin Corner','single','Rice Trader',NULL,'646-342-258',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (70,70,5,'Rafael',NULL,'Torres','male',NULL,'37 Rizal St, Brgy. San Nicolas','Buko King Enterprise','single','Street Food Vendor',NULL,'656-132-139',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (71,71,5,'Ricardo',NULL,'Mercado','male',NULL,'5 Rizal St, Brgy. Mandurriao','Sampaguita Store','single','Sari-Sari Store Owner',NULL,'352-556-528',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (72,72,5,'Jocelyn',NULL,'Mendoza','female',NULL,'10 Rizal St, Brgy. Holy Spirit','Lucky 7 Sari-Sari','single','Ukay-Ukay Vendor',NULL,'610-562-569',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (73,73,5,'Corazon',NULL,'Rivera','female',NULL,'46 Rizal St, Brgy. Jaro','Kuya Eddie\'s General Mdse','single','Freelancer',NULL,'319-373-859',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (74,74,5,'Merlinda',NULL,'Aquino','female',NULL,'16 Rizal St, Brgy. Commonwealth','Kabayan Grocery','single','Market Vendor',NULL,'893-464-183',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (75,75,5,'Rafael',NULL,'Cruz','male',NULL,'42 Rizal St, Brgy. Mandurriao','Palengke Express','single','Street Food Vendor',NULL,'382-792-416',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (76,76,5,'Miguel',NULL,'Ramos','male',NULL,'20 Rizal St, Brgy. San Nicolas','Lucky 7 Sari-Sari','single','Fish Vendor',NULL,'280-705-520',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (77,77,5,'Esperanza',NULL,'Salazar','female',NULL,'50 Rizal St, Brgy. Batasan Hills','Kakanin Corner','single','Freelancer',NULL,'169-852-313',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (78,78,5,'Rafael',NULL,'Castillo','male',NULL,'60 Rizal St, Brgy. Jaro','Tiangge ni Mang Bert','single','Fish Vendor',NULL,'975-575-120',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (79,79,5,'Rolando',NULL,'Villanueva','male',NULL,'100 Rizal St, Brgy. Macabling','Lucky 7 Sari-Sari','single','Water Refilling Operator',NULL,'541-572-326',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (80,80,5,'Jocelyn',NULL,'Soriano','female',NULL,'10 Rizal St, Brgy. Holy Spirit','Tindahan ni Nanay','single','Laundry Service',NULL,'108-571-710',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (81,81,5,'Merlinda',NULL,'Aquino','female',NULL,'89 Rizal St, Brgy. Batasan Hills','Mabuhay Mart','single','Sari-Sari Store Owner',NULL,'586-193-890',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (82,82,5,'Cecilia',NULL,'Valencia','female',NULL,'48 Rizal St, Brgy. Sto. Domingo','Ate Rose Mini Mart','single','Freelancer',NULL,'242-798-539',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (83,83,5,'Victoria',NULL,'Gonzales','female',NULL,'35 Rizal St, Brgy. Batasan Hills','Aling Nena\'s Sari-Sari','single','Freelancer',NULL,'791-352-802',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (84,84,5,'Esperanza',NULL,'Gonzales','female',NULL,'57 Rizal St, Brgy. San Nicolas','Kuya Eddie\'s General Mdse','single','Market Vendor',NULL,'170-103-397',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (85,85,5,'Luisa',NULL,'Reyes','female',NULL,'17 Rizal St, Brgy. Mandurriao','Buko King Enterprise','single','Sari-Sari Store Owner',NULL,'867-383-244',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (86,86,6,'Cecilia',NULL,'Domingo','female',NULL,'Brgy. Holy Spirit, Calamba Agricultural Cooperative',NULL,'single','Cooperative Operator',NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (87,87,6,'Rafael',NULL,'Pascual','male',NULL,'53 Rizal St, Brgy. Sto. Domingo','J&R Trading','single','Tricycle Driver',NULL,'581-364-471',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (88,88,6,'Carmen',NULL,'Valencia','female',NULL,'27 Rizal St, Brgy. Holy Spirit','Panaderia De Manila','single','Freelancer',NULL,'847-758-133',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (89,89,6,'Ricardo',NULL,'Garcia','male',NULL,'48 Rizal St, Brgy. Commonwealth','Mabuhay Mart','single','Water Refilling Operator',NULL,'404-698-577',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (90,90,6,'Rafael',NULL,'Navarro','male',NULL,'63 Rizal St, Brgy. Batasan Hills','Panaderia De Manila','single','Tricycle Driver',NULL,'679-802-723',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (91,91,6,'Patricia',NULL,'Castillo','female',NULL,'16 Rizal St, Brgy. Balibago','J&R Trading','single','Street Food Vendor',NULL,'959-724-213',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (92,92,6,'Maria',NULL,'Navarro','female',NULL,'37 Rizal St, Brgy. Mandurriao','Palengke Express','single','Ukay-Ukay Vendor',NULL,'888-113-235',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (93,93,6,'Ramon',NULL,'Salazar','male',NULL,'96 Rizal St, Brgy. Macabling','Bahay Kubo Trading','single','Sari-Sari Store Owner',NULL,'394-718-298',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (94,94,6,'Rolando',NULL,'Ramos','male',NULL,'92 Rizal St, Brgy. Mandurriao','Mabuhay Mart','single','Water Refilling Operator',NULL,'415-261-464',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (95,95,6,'Esperanza',NULL,'Bautista','female',NULL,'58 Rizal St, Brgy. Holy Spirit','Ate Rose Mini Mart','single','Farmer',NULL,'134-696-784',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (96,96,6,'Luisa',NULL,'Castillo','female',NULL,'32 Rizal St, Brgy. Sto. Domingo','Mabuhay Mart','single','Street Food Vendor',NULL,'685-186-599',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (97,97,6,'Reynaldo',NULL,'Domingo','male',NULL,'57 Rizal St, Brgy. Balibago','Sampaguita Store','single','Sari-Sari Store Owner',NULL,'510-738-585',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (98,98,6,'Danilo',NULL,'Cruz','male',NULL,'3 Rizal St, Brgy. Batasan Hills','Bahay Kubo Trading','single','Sari-Sari Store Owner',NULL,'387-335-56',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (99,99,6,'Corazon',NULL,'Santos','female',NULL,'87 Rizal St, Brgy. Balibago','Kuya Eddie\'s General Mdse','single','Street Food Vendor',NULL,'727-743-583',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (100,100,6,'Teresa',NULL,'Zamora','female',NULL,'86 Rizal St, Brgy. Jaro','Golden Star Variety','single','Laundry Service',NULL,'196-258-443',NULL,NULL,NULL,NULL,NULL);
INSERT INTO `user_profiles` VALUES (101,101,6,'Rolando',NULL,'Navarro','male',NULL,'20 Rizal St, Brgy. Balibago','Lutong Bahay Catering','single','Market Vendor',NULL,'809-331-562',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `user_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `savings_accounts`
--

LOCK TABLES `savings_accounts` WRITE;
/*!40000 ALTER TABLE `savings_accounts` DISABLE KEYS */;
INSERT INTO `savings_accounts` VALUES (1,1,1,'regular_savings','superadmin',0.00,0,NULL,'2026-05-14 10:45:26.000','2026-05-14 10:45:26.000');
/*!40000 ALTER TABLE `savings_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `two_factor_auth`
--

LOCK TABLES `two_factor_auth` WRITE;
/*!40000 ALTER TABLE `two_factor_auth` DISABLE KEYS */;
/*!40000 ALTER TABLE `two_factor_auth` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `ledger_accounts`
--

LOCK TABLES `ledger_accounts` WRITE;
/*!40000 ALTER TABLE `ledger_accounts` DISABLE KEYS */;
INSERT INTO `ledger_accounts` VALUES (1,'Cash and Cash Equivalents','CASH_EQUIVALENTS','ASSET',NULL,1,'2026-05-13 15:57:31.942','2026-05-13 15:57:31.942');
INSERT INTO `ledger_accounts` VALUES (2,'Member Savings Deposits','MEMBER_SAVINGS','LIABILITY',NULL,1,'2026-05-13 15:57:31.955','2026-05-13 15:57:31.955');
INSERT INTO `ledger_accounts` VALUES (3,'Loan Receivables','LOAN_RECEIVABLES','ASSET',NULL,1,'2026-05-13 15:57:31.962','2026-05-13 15:57:31.962');
INSERT INTO `ledger_accounts` VALUES (4,'Interest Income','INTEREST_INCOME','REVENUE',NULL,1,'2026-05-13 15:57:31.968','2026-05-13 15:57:31.968');
INSERT INTO `ledger_accounts` VALUES (5,'Reconciliation Discrepancy','RECONC_DISCREPANCY','EXPENSE',NULL,1,'2026-05-13 15:57:31.975','2026-05-13 15:57:31.975');
/*!40000 ALTER TABLE `ledger_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `business_ledger`
--

LOCK TABLES `business_ledger` WRITE;
/*!40000 ALTER TABLE `business_ledger` DISABLE KEYS */;
/*!40000 ALTER TABLE `business_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `platform_config`
--

LOCK TABLES `platform_config` WRITE;
/*!40000 ALTER TABLE `platform_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_config` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-14 11:34:21
