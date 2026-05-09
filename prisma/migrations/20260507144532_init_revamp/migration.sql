-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'admin', 'lender', 'member');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'widowed', 'separated', 'annulled');

-- CreateEnum
CREATE TYPE "InterestTier" AS ENUM ('T1_5_PERCENT', 'T2_4_5_PERCENT', 'T3_4_PERCENT', 'T4_3_5_PERCENT', 'T5_3_PERCENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'active', 'suspended', 'inactive', 'deactivated');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('valid_id', 'proof_of_billing', 'residency_cert', 'brgy_cert', 'business_permit');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('pending', 'approved', 'active', 'paid', 'defaulted', 'rejected');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('pending', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('general', 'transaction', 'complaint', 'system_issue', 'feature_request', 'homepage_concern');

-- CreateEnum
CREATE TYPE "FeedbackModule" AS ENUM ('general', 'wallet', 'loan', 'repayment', 'payment', 'homepage', 'system', 'chat', 'reports');

-- CreateEnum
CREATE TYPE "SupportTicketCategory" AS ENUM ('wallet_issue', 'loan_issue', 'payment_issue', 'member_complaint', 'system_issue', 'feature_request', 'homepage_concern', 'general_support');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('open', 'in_review', 'waiting_on_member', 'waiting_on_admin', 'resolved', 'closed', 'escalated');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "AuditModule" AS ENUM ('tenant', 'identity', 'wallet', 'loan', 'repayment', 'guarantorship', 'compassion', 'trust', 'feedback', 'support', 'content', 'chat', 'reports', 'reconciliation', 'billing', 'system');

-- CreateEnum
CREATE TYPE "AuditActionCategory" AS ENUM ('create', 'update', 'delete', 'approve', 'reject', 'release', 'payment', 'status_change', 'signoff', 'login', 'security', 'export', 'system', 'other');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('debug', 'info', 'warning', 'critical');

-- CreateEnum
CREATE TYPE "ImbalanceSourceModule" AS ENUM ('wallet', 'loan', 'repayment', 'ledger', 'reconciliation', 'topup', 'manual_adjustment', 'system');

-- CreateEnum
CREATE TYPE "ImbalanceInvestigationStatus" AS ENUM ('detected', 'assigned', 'investigating', 'awaiting_approval', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "ImbalanceResolutionAction" AS ENUM ('no_adjustment_needed', 'wallet_adjustment', 'ledger_adjustment', 'loan_adjustment', 'repayment_adjustment', 'write_off', 'escalated');

-- CreateEnum
CREATE TYPE "DailyReconciliationStatus" AS ENUM ('draft', 'blocked', 'pending_approval', 'signed_off', 'adjusted', 'rejected', 'reopened');

-- CreateEnum
CREATE TYPE "GuaranteeStatus" AS ENUM ('pending', 'vouched', 'rejected', 'voided', 'charged');

-- CreateEnum
CREATE TYPE "LedgerAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('share_capital', 'regular_savings', 'personal_wallet');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('deposit', 'withdrawal', 'dividend', 'fee', 'default_recovery_debit', 'default_recovery_credit');

-- CreateEnum
CREATE TYPE "WalletRequestType" AS ENUM ('deposit', 'withdrawal');

-- CreateEnum
CREATE TYPE "RepaymentFrequency" AS ENUM ('weekly', 'bi_weekly', 'monthly');

-- CreateEnum
CREATE TYPE "CompassionActionType" AS ENUM ('grace_period', 'term_extension', 'penalty_freeze');

-- CreateEnum
CREATE TYPE "CompassionStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "CompassionFreezeStatus" AS ENUM ('none', 'active', 'expired', 'lifted');

-- CreateEnum
CREATE TYPE "CompassionReminderState" AS ENUM ('not_started', 'scheduled', 'sent', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "RestructuringOfferStatus" AS ENUM ('not_offered', 'offered', 'accepted', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "GuarantorChargeStatus" AS ENUM ('not_applicable', 'pending', 'charged', 'waived');

-- CreateEnum
CREATE TYPE "TrustRatingPeriodStatus" AS ENUM ('planned', 'active', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "TrustRatingAssignmentStatus" AS ENUM ('assigned', 'completed', 'missed', 'excused', 'locked_out');

-- CreateEnum
CREATE TYPE "LowRatingActionState" AS ENUM ('none', 'warning', 'review_required', 'restricted', 'tier_downgraded');

-- CreateEnum
CREATE TYPE "VouchRelationshipType" AS ENUM ('peer', 'family', 'business_partner', 'guarantor', 'mentor', 'admin_observed');

-- CreateEnum
CREATE TYPE "VouchStatus" AS ENUM ('active', 'revoked', 'expired', 'disputed');

-- CreateEnum
CREATE TYPE "VouchDiscountEligibilityState" AS ENUM ('not_evaluated', 'eligible', 'ineligible', 'suspended');

-- CreateEnum
CREATE TYPE "TrustNetworkVisibility" AS ENUM ('private_record', 'tenant_network', 'admin_only', 'cross_tenant_risk');

-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('direct', 'tenant_room', 'group_chat');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('pending_endorsement', 'endorsed', 'rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('email_verification', 'identity_verified', 'identity_rejected', 'tenant_application_received', 'tenant_approved', 'tenant_suspended', 'wallet_deposit_pending', 'wallet_deposit_approved', 'wallet_deposit_rejected', 'wallet_withdrawal_pending', 'wallet_withdrawal_approved', 'wallet_withdrawal_rejected', 'wallet_issue_reported', 'loan_application_received', 'loan_approved', 'loan_rejected', 'loan_disbursed', 'loan_defaulted', 'repayment_reminder', 'repayment_received', 'repayment_overdue', 'guarantor_request', 'guarantor_accepted', 'guarantor_rejected', 'guarantor_charged', 'trust_voting_assigned', 'trust_voting_due_soon', 'trust_voting_missed', 'compassion_requested', 'compassion_approved', 'compassion_rejected', 'feedback_received', 'support_ticket_opened', 'support_ticket_updated', 'support_ticket_resolved', 'report_ready', 'report_failed', 'mentorship_request', 'mentorship_endorsed', 'mentorship_rejected', 'direct_message', 'tenant_announcement', 'login_new_device', 'password_changed', 'two_fa_enabled', 'two_fa_disabled', 'system_alert', 'system_maintenance', 'platform_announcement');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('in_app', 'email', 'both');

-- CreateEnum
CREATE TYPE "TenantEntitlementStatus" AS ENUM ('prospect', 'availed', 'active', 'suspended');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'annually');

-- CreateEnum
CREATE TYPE "EmailTemplateCategory" AS ENUM ('verification', 'security', 'loan', 'repayment', 'wallet', 'support', 'report', 'announcement', 'onboarding', 'system');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('cross_tenant_financial', 'tenant_performance', 'lender_summary', 'member_summary', 'loan_portfolio', 'repayment_summary', 'wallet_activity', 'reconciliation_summary', 'trust_analysis', 'audit_export');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('csv', 'pdf', 'json');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('queued', 'processing', 'ready', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "ReportScheduleFrequency" AS ENUM ('daily', 'weekly', 'monthly', 'one_time');

-- CreateEnum
CREATE TYPE "ReceiptType" AS ENUM ('wallet_deposit', 'wallet_withdrawal', 'loan_disbursement', 'loan_repayment', 'loan_fee', 'fund_release', 'top_up', 'admin_adjustment');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('generated', 'voided', 'reissued');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('scheduled', 'running', 'completed', 'failed', 'expired');

-- CreateEnum
CREATE TYPE "RestoreStatus" AS ENUM ('requested', 'validating', 'restoring', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "AiUseCase" AS ENUM ('portfolio_summary', 'risk_detection', 'repayment_forecast', 'member_financial_tip', 'anomaly_alert', 'support_draft');

-- CreateEnum
CREATE TYPE "AiProcessingStatus" AS ENUM ('queued', 'processing', 'completed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "FraudSignalType" AS ENUM ('duplicate_identity', 'suspicious_transaction_pattern', 'rapid_loan_cycling', 'cross_tenant_default_risk', 'velocity_breach', 'device_anomaly', 'manual_flag');

-- CreateEnum
CREATE TYPE "FraudSignalStatus" AS ENUM ('detected', 'under_review', 'confirmed', 'false_positive', 'resolved', 'escalated');

-- CreateEnum
CREATE TYPE "HealthAlertState" AS ENUM ('ok', 'degraded', 'critical');

-- CreateTable
CREATE TABLE "tenant_groups" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "reg_code" VARCHAR(10) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "tenant_id" SERIAL NOT NULL,
    "tenant_group_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "brand_color" VARCHAR(20),
    "accent_color" VARCHAR(20),
    "font_pairing" VARCHAR(50) DEFAULT 'inter_outfit',
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "entitlement_status" "TenantEntitlementStatus" NOT NULL DEFAULT 'prospect',
    "lifetime_availed_at" TIMESTAMP(3),
    "availed_type" VARCHAR(50),
    "region" VARCHAR(100),
    "metadata" JSONB,
    "entitlement_reference" VARCHAR(120),
    "entitlement_notes" TEXT,
    "entitled_by_user_id" INTEGER,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" "Role" NOT NULL DEFAULT 'member',
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" "InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent_accepted_at" TIMESTAMP(3),
    "consent_version" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" "MaritalStatus" DEFAULT 'single',
    "occupation" VARCHAR(150),
    "place_of_birth" VARCHAR(150),
    "tin" VARCHAR(20),
    "region" VARCHAR(255),
    "province" VARCHAR(255),
    "city" VARCHAR(255),
    "barangay" VARCHAR(255),
    "photo_url" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" TEXT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

-- CreateTable
CREATE TABLE "two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

-- CreateTable
CREATE TABLE "loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    "allowed_frequencies" "RepaymentFrequency"[] DEFAULT ARRAY['monthly']::"RepaymentFrequency"[],
    "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "loans" (
    "loan_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "loan_reference" VARCHAR(50) NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "purpose" TEXT NOT NULL,
    "term_months" INTEGER NOT NULL,
    "interest_applied" DECIMAL(15,2) NOT NULL,
    "principal_receivable" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "interest_receivable" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "fees_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_payable" DECIMAL(15,2) NOT NULL,
    "balance_remaining" DECIMAL(15,2) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "repayment_frequency" "RepaymentFrequency" NOT NULL DEFAULT 'monthly',
    "recovery_parent_loan_id" INTEGER,
    "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- CreateTable
CREATE TABLE "loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" "AccountType" NOT NULL,
    "owner_role" "Role",
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(255),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "status" "PaymentStatus" NOT NULL DEFAULT 'verified',
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "reference" VARCHAR(100),
    "reconciliation_reference" VARCHAR(120),
    "ledger_transaction_id" TEXT,
    "issue_status" VARCHAR(50) NOT NULL DEFAULT 'none',
    "issue_reported_at" TIMESTAMP(3),
    "issue_notes" TEXT,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_by" INTEGER,

    CONSTRAINT "savings_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "actor_role" "Role",
    "actor_label" VARCHAR(150),
    "module" "AuditModule" NOT NULL DEFAULT 'system',
    "action" VARCHAR(100) NOT NULL,
    "action_category" "AuditActionCategory" NOT NULL DEFAULT 'other',
    "severity" "AuditSeverity" NOT NULL DEFAULT 'info',
    "entity_type" VARCHAR(80) NOT NULL,
    "entity_id" INTEGER,
    "entity_ref" VARCHAR(120),
    "request_id" VARCHAR(120),
    "session_id" VARCHAR(120),
    "old_values" JSONB,
    "new_values" JSONB,
    "changed_fields" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "route" VARCHAR(255),
    "http_method" VARCHAR(12),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "is_cross_tenant_visible" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" "ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" "ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
    "priority" VARCHAR(30) NOT NULL DEFAULT 'normal',
    "reconciliation_reference" VARCHAR(120),
    "related_ledger_transaction_id" TEXT,
    "related_wallet_transaction_id" INTEGER,
    "related_topup_request_id" INTEGER,
    "related_loan_id" INTEGER,
    "related_payment_id" INTEGER,
    "assigned_to" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "investigated_at" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "resolution_action" "ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" "DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
    "total_disbursed" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "disbursed_count" INTEGER NOT NULL DEFAULT 0,
    "total_collected" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "collected_count" INTEGER NOT NULL DEFAULT 0,
    "total_ledger_debits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_ledger_credits" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_ledger_balanced" BOOLEAN NOT NULL DEFAULT false,
    "total_tenant_savings" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_treasury_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "imbalance_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "has_discrepancy" BOOLEAN NOT NULL DEFAULT false,
    "signoff_blocked" BOOLEAN NOT NULL DEFAULT false,
    "block_reason" TEXT,
    "reconciliation_reference" VARCHAR(120) NOT NULL,
    "imbalance_investigation_id" INTEGER,
    "resolution_action" "ImbalanceResolutionAction",
    "resolution_reference" VARCHAR(120),
    "adjustment_ledger_transaction_id" TEXT,
    "audit_log_id" INTEGER,
    "prepared_by" INTEGER,
    "prepared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signed_off_by" INTEGER,
    "signed_off_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "approval_notes" TEXT,
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traffic_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "path" TEXT NOT NULL,
    "ip_address" VARCHAR(45),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traffic_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "event_type" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_faqs" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "question" VARCHAR(255) NOT NULL,
    "answer" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "season_tag" VARCHAR(100),
    "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'published',
    "review_notes" TEXT,
    "submitted_by_user_id" INTEGER,
    "reviewed_by_user_id" INTEGER,

    CONSTRAINT "homepage_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_testimonials" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "role_label" VARCHAR(150) NOT NULL,
    "photo_url" VARCHAR(255),
    "content" TEXT NOT NULL,
    "season_tag" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "workflow_status" VARCHAR(50) NOT NULL DEFAULT 'published',
    "review_notes" TEXT,
    "submitted_by_user_id" INTEGER,
    "reviewed_by_user_id" INTEGER,

    CONSTRAINT "homepage_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "feedback_type" "FeedbackType" NOT NULL DEFAULT 'general',
    "module_context" "FeedbackModule" NOT NULL DEFAULT 'general',
    "related_entity_type" VARCHAR(80),
    "related_entity_id" VARCHAR(120),
    "wallet_transaction_id" INTEGER,
    "loan_id" INTEGER,
    "payment_id" INTEGER,
    "topup_request_id" INTEGER,
    "support_ticket_id" INTEGER,
    "page_path" VARCHAR(255),
    "subject" VARCHAR(255),
    "message" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "priority" "SupportPriority" NOT NULL DEFAULT 'normal',
    "assigned_to" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "audit_log_id" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "tenant_id" INTEGER,
    "requester_id" INTEGER,
    "feedback_entry_id" INTEGER,
    "category" "SupportTicketCategory" NOT NULL,
    "module_context" "FeedbackModule" NOT NULL DEFAULT 'general',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'open',
    "priority" "SupportPriority" NOT NULL DEFAULT 'normal',
    "subject" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "related_entity_type" VARCHAR(80),
    "related_entity_id" VARCHAR(120),
    "wallet_transaction_id" INTEGER,
    "loan_id" INTEGER,
    "payment_id" INTEGER,
    "topup_request_id" INTEGER,
    "assigned_to" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "first_response_at" TIMESTAMP(3),
    "resolved_by" INTEGER,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "resolution_summary" TEXT,
    "escalation_level" INTEGER NOT NULL DEFAULT 0,
    "audit_log_id" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "is_broadcast" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_id" TEXT NOT NULL,
    "reply_to_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" "ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "emoji" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "channel" "NotificationChannel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_transfer_requests" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "from_tenant_id" INTEGER NOT NULL,
    "to_tenant_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_transfer_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_content" TEXT NOT NULL,

    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" "GuaranteeStatus" NOT NULL DEFAULT 'pending',
    "liability_percentage" DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    "liability_amount" DECIMAL(15,2),
    "charged_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "charge_reason" VARCHAR(255),
    "vouched_at" TIMESTAMP(3),
    "soft_freeze_at" TIMESTAMP(3),
    "hard_freeze_at" TIMESTAMP(3),
    "default_triggered_at" TIMESTAMP(3),
    "charged_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "reassigned_to_guarantee_id" INTEGER,
    "notification_id" TEXT,
    "audit_log_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "action_type" "CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "CompassionStatus" NOT NULL DEFAULT 'pending',
    "requested_by" INTEGER NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "effective_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "grace_period_days" INTEGER,
    "restructured_term_months" INTEGER,
    "restructured_payment_amount" DECIMAL(15,2),
    "penalty_waived_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "penalties_frozen_until" TIMESTAMP(3),
    "freeze_status" "CompassionFreezeStatus" NOT NULL DEFAULT 'none',
    "reminder_state" "CompassionReminderState" NOT NULL DEFAULT 'not_started',
    "reminder_sent_at" TIMESTAMP(3),
    "restructuring_offer_status" "RestructuringOfferStatus" NOT NULL DEFAULT 'not_offered',
    "restructuring_offer_at" TIMESTAMP(3),
    "final_write_off_at" TIMESTAMP(3),
    "write_off_amount" DECIMAL(15,2),
    "guarantor_charge_status" "GuarantorChargeStatus" NOT NULL DEFAULT 'not_applicable',
    "guarantor_charged_at" TIMESTAMP(3),
    "trust_score_impact_points" INTEGER NOT NULL DEFAULT 0,
    "trust_score_impact_reason" VARCHAR(255),
    "audit_log_id" INTEGER,
    "admin_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- CreateTable
CREATE TABLE "business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "debit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "source_module" VARCHAR(80),
    "source_reference" VARCHAR(120),
    "reconciliation_reference" VARCHAR(120),
    "reconciled_at" TIMESTAMP(3),
    "is_reversal" BOOLEAN NOT NULL DEFAULT false,
    "reversed_entry_id" INTEGER,
    "ledger_hash" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER,
    "loan_id" INTEGER,
    "metadata" JSONB,

    CONSTRAINT "business_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_vouches" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "voucher_id" INTEGER NOT NULL,
    "vouchee_id" INTEGER NOT NULL,
    "requester_id" INTEGER,
    "relationship_type" "VouchRelationshipType" NOT NULL DEFAULT 'peer',
    "score" INTEGER NOT NULL DEFAULT 5,
    "score_scale" INTEGER NOT NULL DEFAULT 10,
    "score_base" INTEGER NOT NULL DEFAULT 10,
    "status" "VouchStatus" NOT NULL DEFAULT 'active',
    "discount_eligibility_state" "VouchDiscountEligibilityState" NOT NULL DEFAULT 'not_evaluated',
    "discount_eligible" BOOLEAN NOT NULL DEFAULT false,
    "trust_network_visibility" "TrustNetworkVisibility" NOT NULL DEFAULT 'tenant_network',
    "visibility_metadata" JSONB,
    "comment" TEXT,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "audit_log_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouch_score_snapshots" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "average_score" DECIMAL(5,2) NOT NULL,
    "score_scale" INTEGER NOT NULL DEFAULT 10,
    "score_base" INTEGER NOT NULL DEFAULT 10,
    "vouch_count" INTEGER NOT NULL DEFAULT 0,
    "active_vouch_count" INTEGER NOT NULL DEFAULT 0,
    "discount_eligibility_state" "VouchDiscountEligibilityState" NOT NULL DEFAULT 'not_evaluated',
    "discount_eligible" BOOLEAN NOT NULL DEFAULT false,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "vouch_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_trust_policies" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "payment_weight" DECIMAL(5,2) NOT NULL DEFAULT 40.00,
    "business_weight" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "peer_weight" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "guarantor_weight" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "minimum_voting_quota" INTEGER NOT NULL DEFAULT 3,
    "randomized_sample_size" INTEGER NOT NULL DEFAULT 10,
    "missed_vote_lockout_days" INTEGER NOT NULL DEFAULT 7,
    "low_rating_threshold" INTEGER NOT NULL DEFAULT 55,
    "tier_review_day" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_trust_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_rating_periods" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "TrustRatingPeriodStatus" NOT NULL DEFAULT 'planned',
    "minimum_voting_quota" INTEGER NOT NULL DEFAULT 3,
    "randomized_sample_size" INTEGER NOT NULL DEFAULT 10,
    "generated_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_rating_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_rating_assignments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "rating_source_role" "Role" NOT NULL,
    "status" "TrustRatingAssignmentStatus" NOT NULL DEFAULT 'assigned',
    "score" INTEGER,
    "comment" TEXT,
    "sampled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "missed_at" TIMESTAMP(3),
    "lockout_until" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_rating_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_score_snapshots" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "period_id" INTEGER,
    "score" INTEGER NOT NULL,
    "payment_score" INTEGER NOT NULL,
    "business_score" INTEGER NOT NULL,
    "peer_score" INTEGER NOT NULL,
    "guarantor_score" INTEGER NOT NULL,
    "payment_weight" DECIMAL(5,2) NOT NULL,
    "business_weight" DECIMAL(5,2) NOT NULL,
    "peer_weight" DECIMAL(5,2) NOT NULL,
    "guarantor_weight" DECIMAL(5,2) NOT NULL,
    "tier_before" "InterestTier",
    "tier_after" "InterestTier" NOT NULL,
    "low_rating_action_state" "LowRatingActionState" NOT NULL DEFAULT 'none',
    "low_rating_reason" VARCHAR(255),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_tier_audits" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "snapshot_id" INTEGER,
    "previous_tier" "InterestTier",
    "new_tier" "InterestTier" NOT NULL,
    "score" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_tier_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topup_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" "WalletRequestType" NOT NULL DEFAULT 'deposit',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "receipt_url" VARCHAR(255),
    "issue_status" VARCHAR(50) NOT NULL DEFAULT 'none',
    "issue_notes" TEXT,
    "admin_notes" TEXT,
    "reconciliation_reference" VARCHAR(120),
    "ledger_transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "processed_by" INTEGER,

    CONSTRAINT "topup_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_files" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "uploader_id" INTEGER NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "content_base64" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" SERIAL NOT NULL,
    "tier_name" VARCHAR(50) NOT NULL,
    "price_monthly" DECIMAL(10,2) NOT NULL,
    "price_annually" DECIMAL(10,2) NOT NULL,
    "max_members" INTEGER NOT NULL,
    "max_storage_mb" INTEGER NOT NULL,
    "features" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_addon" BOOLEAN NOT NULL DEFAULT false,
    "tenant_price" INTEGER DEFAULT 3000,
    "tenant_storage" INTEGER DEFAULT 10000,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_subscriptions" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL DEFAULT 'active',
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "category" "EmailTemplateCategory" NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "html_body" TEXT NOT NULL,
    "text_body" TEXT,
    "variables" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_definitions" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "created_by" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "report_type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL DEFAULT 'csv',
    "filters" JSONB,
    "is_scheduled" BOOLEAN NOT NULL DEFAULT false,
    "schedule_freq" "ReportScheduleFrequency",
    "schedule_day" INTEGER,
    "next_run_at" TIMESTAMP(3),
    "recipients" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" SERIAL NOT NULL,
    "definition_id" INTEGER,
    "tenant_id" INTEGER,
    "requested_by" INTEGER,
    "report_type" "ReportType" NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'queued',
    "file_url" VARCHAR(512),
    "file_size_bytes" INTEGER,
    "row_count" INTEGER,
    "error_message" TEXT,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "dispatched_at" TIMESTAMP(3),
    "dispatch_recipients" TEXT[],
    "dispatch_status" VARCHAR(50),
    "expires_at" TIMESTAMP(3),
    "audit_log_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "receipt_number" VARCHAR(60) NOT NULL,
    "receipt_type" "ReceiptType" NOT NULL,
    "status" "ReceiptStatus" NOT NULL DEFAULT 'generated',
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'PHP',
    "description" TEXT,
    "savings_transaction_id" INTEGER,
    "loan_id" INTEGER,
    "payment_id" INTEGER,
    "topup_request_id" INTEGER,
    "file_url" VARCHAR(512),
    "voided_by" INTEGER,
    "voided_at" TIMESTAMP(3),
    "void_reason" TEXT,
    "reissued_receipt_id" INTEGER,
    "audit_log_id" INTEGER,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_schedules" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "frequency" "ReportScheduleFrequency" NOT NULL,
    "retention_days" INTEGER NOT NULL DEFAULT 30,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "storage_path" VARCHAR(512),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_records" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "schedule_id" INTEGER,
    "status" "BackupStatus" NOT NULL DEFAULT 'scheduled',
    "storage_path" VARCHAR(512),
    "file_size_bytes" BIGINT,
    "checksum" VARCHAR(128),
    "affected_schemas" TEXT[],
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restore_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "backup_id" INTEGER NOT NULL,
    "requested_by" INTEGER NOT NULL,
    "status" "RestoreStatus" NOT NULL DEFAULT 'requested',
    "target_schemas" TEXT[],
    "notes" TEXT,
    "error_message" TEXT,
    "approved_by" INTEGER,
    "approved_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "audit_log_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restore_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_configs" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "use_case" "AiUseCase" NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "risk_sensitivity" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "prompt_template" TEXT,
    "max_tokens" INTEGER NOT NULL DEFAULT 512,
    "temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.3,
    "allowed_data_scopes" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_snapshots" (
    "id" SERIAL NOT NULL,
    "config_id" INTEGER,
    "tenant_id" INTEGER,
    "use_case" "AiUseCase" NOT NULL,
    "status" "AiProcessingStatus" NOT NULL DEFAULT 'queued',
    "input_summary" JSONB,
    "output_text" TEXT,
    "risk_level" VARCHAR(20),
    "confidence_score" DECIMAL(5,2),
    "requires_review" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "error_message" TEXT,
    "processing_ms" INTEGER,
    "period_start" TIMESTAMP(3),
    "period_end" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_signals" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "signal_type" "FraudSignalType" NOT NULL,
    "status" "FraudSignalStatus" NOT NULL DEFAULT 'detected',
    "severity" "AuditSeverity" NOT NULL DEFAULT 'warning',
    "linked_user_id" INTEGER,
    "linked_loan_id" INTEGER,
    "linked_payment_id" INTEGER,
    "linked_topup_id" INTEGER,
    "duplicate_user_id" INTEGER,
    "risk_score" INTEGER,
    "threshold_breached" VARCHAR(120),
    "signal_metadata" JSONB,
    "assigned_to" INTEGER,
    "assigned_at" TIMESTAMP(3),
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "resolution_notes" TEXT,
    "audit_log_id" INTEGER,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_signals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_health_snapshots" (
    "id" SERIAL NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "api_uptime_percent" DECIMAL(5,2),
    "avg_response_ms" INTEGER,
    "error_rate_percent" DECIMAL(5,2),
    "active_connections" INTEGER,
    "queue_depth" INTEGER,
    "ai_queue_depth" INTEGER,
    "ai_processing_ok" BOOLEAN NOT NULL DEFAULT true,
    "db_size_bytes" BIGINT,
    "tenant_schema_sizes" JSONB,
    "alert_state" "HealthAlertState" NOT NULL DEFAULT 'ok',
    "alert_details" TEXT,
    "metadata" JSONB,
    "created_by" INTEGER,

    CONSTRAINT "system_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_groups_reg_code_key" ON "tenant_groups"("reg_code");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_tenant_id_key" ON "users"("email", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_tenant_id_key" ON "users"("username", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_member_code_tenant_id_key" ON "users"("member_code", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_tenant_id_idx" ON "user_profiles"("tenant_id");

-- CreateIndex
CREATE INDEX "user_documents_tenant_id_idx" ON "user_documents"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_auth_user_id_key" ON "two_factor_auth"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "loans_loan_reference_key" ON "loans"("loan_reference");

-- CreateIndex
CREATE INDEX "loan_schedules_tenant_id_idx" ON "loan_schedules"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payment_reference_key" ON "payments"("payment_reference");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "savings_accounts_tenant_id_account_type_idx" ON "savings_accounts"("tenant_id", "account_type");

-- CreateIndex
CREATE INDEX "savings_accounts_tenant_id_owner_role_idx" ON "savings_accounts"("tenant_id", "owner_role");

-- CreateIndex
CREATE UNIQUE INDEX "savings_accounts_user_id_account_type_key" ON "savings_accounts"("user_id", "account_type");

-- CreateIndex
CREATE INDEX "savings_transactions_tenant_id_idx" ON "savings_transactions"("tenant_id");

-- CreateIndex
CREATE INDEX "savings_transactions_account_id_status_processed_at_idx" ON "savings_transactions"("account_id", "status", "processed_at");

-- CreateIndex
CREATE INDEX "savings_transactions_reconciliation_reference_idx" ON "savings_transactions"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "savings_transactions_ledger_transaction_id_idx" ON "savings_transactions"("ledger_transaction_id");

-- CreateIndex
CREATE INDEX "savings_transactions_issue_status_idx" ON "savings_transactions"("issue_status");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_module_created_at_idx" ON "audit_logs"("tenant_id", "module", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_ref_idx" ON "audit_logs"("entity_ref");

-- CreateIndex
CREATE INDEX "audit_logs_action_category_severity_idx" ON "audit_logs"("action_category", "severity");

-- CreateIndex
CREATE INDEX "audit_logs_request_id_idx" ON "audit_logs"("request_id");

-- CreateIndex
CREATE INDEX "audit_logs_session_id_idx" ON "audit_logs"("session_id");

-- CreateIndex
CREATE INDEX "audit_logs_is_cross_tenant_visible_created_at_idx" ON "audit_logs"("is_cross_tenant_visible", "created_at");

-- CreateIndex
CREATE INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "imbalance_investigations"("tenant_id", "status", "detected_at");

-- CreateIndex
CREATE INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "imbalance_investigations"("source_module", "source_entity_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_assigned_to_status_idx" ON "imbalance_investigations"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "imbalance_investigations_reconciliation_reference_idx" ON "imbalance_investigations"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "imbalance_investigations"("related_ledger_transaction_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "imbalance_investigations"("related_wallet_transaction_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_topup_request_id_idx" ON "imbalance_investigations"("related_topup_request_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_loan_id_idx" ON "imbalance_investigations"("related_loan_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_related_payment_id_idx" ON "imbalance_investigations"("related_payment_id");

-- CreateIndex
CREATE INDEX "imbalance_investigations_audit_log_id_idx" ON "imbalance_investigations"("audit_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reconciliations_reconciliation_reference_key" ON "daily_reconciliations"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "daily_reconciliations"("tenant_id", "status", "business_date");

-- CreateIndex
CREATE INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "daily_reconciliations"("imbalance_investigation_id");

-- CreateIndex
CREATE INDEX "daily_reconciliations_resolution_reference_idx" ON "daily_reconciliations"("resolution_reference");

-- CreateIndex
CREATE INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "daily_reconciliations"("adjustment_ledger_transaction_id");

-- CreateIndex
CREATE INDEX "daily_reconciliations_audit_log_id_idx" ON "daily_reconciliations"("audit_log_id");

-- CreateIndex
CREATE INDEX "daily_reconciliations_signed_off_by_idx" ON "daily_reconciliations"("signed_off_by");

-- CreateIndex
CREATE INDEX "daily_reconciliations_approved_by_idx" ON "daily_reconciliations"("approved_by");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reconciliations_tenant_id_business_date_key" ON "daily_reconciliations"("tenant_id", "business_date");

-- CreateIndex
CREATE INDEX "traffic_logs_tenant_id_created_at_idx" ON "traffic_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "interaction_logs"("tenant_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx" ON "homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx" ON "homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");

-- CreateIndex
CREATE INDEX "feedback_entries_tenant_id_status_created_at_idx" ON "feedback_entries"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "feedback_entries_user_id_created_at_idx" ON "feedback_entries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "feedback_entries_feedback_type_module_context_idx" ON "feedback_entries"("feedback_type", "module_context");

-- CreateIndex
CREATE INDEX "feedback_entries_related_entity_type_related_entity_id_idx" ON "feedback_entries"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "feedback_entries_wallet_transaction_id_idx" ON "feedback_entries"("wallet_transaction_id");

-- CreateIndex
CREATE INDEX "feedback_entries_loan_id_idx" ON "feedback_entries"("loan_id");

-- CreateIndex
CREATE INDEX "feedback_entries_payment_id_idx" ON "feedback_entries"("payment_id");

-- CreateIndex
CREATE INDEX "feedback_entries_topup_request_id_idx" ON "feedback_entries"("topup_request_id");

-- CreateIndex
CREATE INDEX "feedback_entries_support_ticket_id_idx" ON "feedback_entries"("support_ticket_id");

-- CreateIndex
CREATE INDEX "feedback_entries_assigned_to_status_idx" ON "feedback_entries"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "feedback_entries_priority_status_idx" ON "feedback_entries"("priority", "status");

-- CreateIndex
CREATE INDEX "feedback_entries_audit_log_id_idx" ON "feedback_entries"("audit_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticket_number_key" ON "support_tickets"("ticket_number");

-- CreateIndex
CREATE INDEX "support_tickets_tenant_id_status_priority_created_at_idx" ON "support_tickets"("tenant_id", "status", "priority", "created_at");

-- CreateIndex
CREATE INDEX "support_tickets_requester_id_created_at_idx" ON "support_tickets"("requester_id", "created_at");

-- CreateIndex
CREATE INDEX "support_tickets_feedback_entry_id_idx" ON "support_tickets"("feedback_entry_id");

-- CreateIndex
CREATE INDEX "support_tickets_category_status_idx" ON "support_tickets"("category", "status");

-- CreateIndex
CREATE INDEX "support_tickets_module_context_status_idx" ON "support_tickets"("module_context", "status");

-- CreateIndex
CREATE INDEX "support_tickets_related_entity_type_related_entity_id_idx" ON "support_tickets"("related_entity_type", "related_entity_id");

-- CreateIndex
CREATE INDEX "support_tickets_wallet_transaction_id_idx" ON "support_tickets"("wallet_transaction_id");

-- CreateIndex
CREATE INDEX "support_tickets_loan_id_idx" ON "support_tickets"("loan_id");

-- CreateIndex
CREATE INDEX "support_tickets_payment_id_idx" ON "support_tickets"("payment_id");

-- CreateIndex
CREATE INDEX "support_tickets_topup_request_id_idx" ON "support_tickets"("topup_request_id");

-- CreateIndex
CREATE INDEX "support_tickets_assigned_to_status_idx" ON "support_tickets"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "support_tickets_audit_log_id_idx" ON "support_tickets"("audit_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_tenant_id_email_idx" ON "verification_tokens"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_tenant_id_email_token_key" ON "verification_tokens"("tenant_id", "email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_tokens_token_key" ON "two_factor_tokens"("token");

-- CreateIndex
CREATE INDEX "two_factor_tokens_tenant_id_email_idx" ON "two_factor_tokens"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_tokens_tenant_id_email_token_key" ON "two_factor_tokens"("tenant_id", "email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_tenant_id_email_idx" ON "password_reset_tokens"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tenant_id_email_token_key" ON "password_reset_tokens"("tenant_id", "email", "token");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_type_updated_at_idx" ON "conversations"("tenant_id", "type", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_tenant_id_type_slug_key" ON "conversations"("tenant_id", "type", "slug");

-- CreateIndex
CREATE INDEX "conversation_participants_tenant_id_idx" ON "conversation_participants"("tenant_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_last_read_at_idx" ON "conversation_participants"("user_id", "last_read_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "mentorship_connections"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- CreateIndex
CREATE INDEX "message_attachments_tenant_id_idx" ON "message_attachments"("tenant_id");

-- CreateIndex
CREATE INDEX "message_attachments_message_id_created_at_idx" ON "message_attachments"("message_id", "created_at");

-- CreateIndex
CREATE INDEX "message_reactions_tenant_id_idx" ON "message_reactions"("tenant_id");

-- CreateIndex
CREATE INDEX "message_reactions_user_id_created_at_idx" ON "message_reactions"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_key" ON "message_reactions"("message_id", "user_id", "emoji");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_type_created_at_idx" ON "notifications"("tenant_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "tenant_transfer_requests_status_idx" ON "tenant_transfer_requests"("status");

-- CreateIndex
CREATE INDEX "loan_guarantees_tenant_id_idx" ON "loan_guarantees"("tenant_id");

-- CreateIndex
CREATE INDEX "loan_guarantees_loan_id_status_idx" ON "loan_guarantees"("loan_id", "status");

-- CreateIndex
CREATE INDEX "loan_guarantees_guarantor_id_status_idx" ON "loan_guarantees"("guarantor_id", "status");

-- CreateIndex
CREATE INDEX "loan_guarantees_notification_id_idx" ON "loan_guarantees"("notification_id");

-- CreateIndex
CREATE INDEX "loan_guarantees_audit_log_id_idx" ON "loan_guarantees"("audit_log_id");

-- CreateIndex
CREATE INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "loan_guarantees"("reassigned_to_guarantee_id");

-- CreateIndex
CREATE INDEX "compassion_actions_tenant_id_idx" ON "compassion_actions"("tenant_id");

-- CreateIndex
CREATE INDEX "compassion_actions_loan_id_status_idx" ON "compassion_actions"("loan_id", "status");

-- CreateIndex
CREATE INDEX "compassion_actions_requested_by_status_idx" ON "compassion_actions"("requested_by", "status");

-- CreateIndex
CREATE INDEX "compassion_actions_approved_by_idx" ON "compassion_actions"("approved_by");

-- CreateIndex
CREATE INDEX "compassion_actions_freeze_status_idx" ON "compassion_actions"("freeze_status");

-- CreateIndex
CREATE INDEX "compassion_actions_reminder_state_idx" ON "compassion_actions"("reminder_state");

-- CreateIndex
CREATE INDEX "compassion_actions_restructuring_offer_status_idx" ON "compassion_actions"("restructuring_offer_status");

-- CreateIndex
CREATE INDEX "compassion_actions_guarantor_charge_status_idx" ON "compassion_actions"("guarantor_charge_status");

-- CreateIndex
CREATE INDEX "compassion_actions_audit_log_id_idx" ON "compassion_actions"("audit_log_id");

-- CreateIndex
CREATE INDEX "business_ledger_tenant_id_idx" ON "business_ledger"("tenant_id");

-- CreateIndex
CREATE INDEX "business_ledger_transaction_id_idx" ON "business_ledger"("transaction_id");

-- CreateIndex
CREATE INDEX "business_ledger_source_module_source_reference_idx" ON "business_ledger"("source_module", "source_reference");

-- CreateIndex
CREATE INDEX "business_ledger_reconciliation_reference_idx" ON "business_ledger"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "business_ledger_reversed_entry_id_idx" ON "business_ledger"("reversed_entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "ledger_accounts_code_key" ON "ledger_accounts"("code");

-- CreateIndex
CREATE INDEX "ledger_accounts_tenant_id_type_idx" ON "ledger_accounts"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "social_vouches_tenant_id_status_created_at_idx" ON "social_vouches"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "social_vouches_voucher_id_status_idx" ON "social_vouches"("voucher_id", "status");

-- CreateIndex
CREATE INDEX "social_vouches_vouchee_id_status_idx" ON "social_vouches"("vouchee_id", "status");

-- CreateIndex
CREATE INDEX "social_vouches_requester_id_idx" ON "social_vouches"("requester_id");

-- CreateIndex
CREATE INDEX "social_vouches_discount_eligibility_state_idx" ON "social_vouches"("discount_eligibility_state");

-- CreateIndex
CREATE INDEX "social_vouches_trust_network_visibility_idx" ON "social_vouches"("trust_network_visibility");

-- CreateIndex
CREATE INDEX "social_vouches_audit_log_id_idx" ON "social_vouches"("audit_log_id");

-- CreateIndex
CREATE INDEX "vouch_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "vouch_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- CreateIndex
CREATE INDEX "vouch_score_snapshots_discount_eligibility_state_idx" ON "vouch_score_snapshots"("discount_eligibility_state");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_trust_policies_tenant_id_key" ON "tenant_trust_policies"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_trust_policies_tenant_id_is_active_idx" ON "tenant_trust_policies"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "trust_rating_periods_tenant_id_status_period_start_idx" ON "trust_rating_periods"("tenant_id", "status", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "trust_rating_periods_tenant_id_period_start_period_end_key" ON "trust_rating_periods"("tenant_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "trust_rating_assignments_tenant_id_status_due_at_idx" ON "trust_rating_assignments"("tenant_id", "status", "due_at");

-- CreateIndex
CREATE INDEX "trust_rating_assignments_rater_id_status_idx" ON "trust_rating_assignments"("rater_id", "status");

-- CreateIndex
CREATE INDEX "trust_rating_assignments_ratee_id_status_idx" ON "trust_rating_assignments"("ratee_id", "status");

-- CreateIndex
CREATE INDEX "trust_rating_assignments_lockout_until_idx" ON "trust_rating_assignments"("lockout_until");

-- CreateIndex
CREATE UNIQUE INDEX "trust_rating_assignments_period_id_rater_id_ratee_id_rating_key" ON "trust_rating_assignments"("period_id", "rater_id", "ratee_id", "rating_source_role");

-- CreateIndex
CREATE INDEX "trust_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "trust_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- CreateIndex
CREATE INDEX "trust_score_snapshots_period_id_idx" ON "trust_score_snapshots"("period_id");

-- CreateIndex
CREATE INDEX "trust_score_snapshots_tier_after_idx" ON "trust_score_snapshots"("tier_after");

-- CreateIndex
CREATE INDEX "trust_score_snapshots_low_rating_action_state_idx" ON "trust_score_snapshots"("low_rating_action_state");

-- CreateIndex
CREATE INDEX "trust_tier_audits_tenant_id_user_id_changed_at_idx" ON "trust_tier_audits"("tenant_id", "user_id", "changed_at");

-- CreateIndex
CREATE INDEX "trust_tier_audits_snapshot_id_idx" ON "trust_tier_audits"("snapshot_id");

-- CreateIndex
CREATE INDEX "trust_tier_audits_previous_tier_new_tier_idx" ON "trust_tier_audits"("previous_tier", "new_tier");

-- CreateIndex
CREATE UNIQUE INDEX "interest_audit_loan_id_key" ON "interest_audit"("loan_id");

-- CreateIndex
CREATE INDEX "interest_audit_tenant_id_idx" ON "interest_audit"("tenant_id");

-- CreateIndex
CREATE INDEX "topup_requests_tenant_id_request_type_status_idx" ON "topup_requests"("tenant_id", "request_type", "status");

-- CreateIndex
CREATE INDEX "topup_requests_user_id_request_type_created_at_idx" ON "topup_requests"("user_id", "request_type", "created_at");

-- CreateIndex
CREATE INDEX "topup_requests_reconciliation_reference_idx" ON "topup_requests"("reconciliation_reference");

-- CreateIndex
CREATE INDEX "topup_requests_ledger_transaction_id_idx" ON "topup_requests"("ledger_transaction_id");

-- CreateIndex
CREATE INDEX "topup_requests_issue_status_idx" ON "topup_requests"("issue_status");

-- CreateIndex
CREATE INDEX "system_files_tenant_id_idx" ON "system_files"("tenant_id");

-- CreateIndex
CREATE INDEX "system_files_uploader_id_idx" ON "system_files"("uploader_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_tier_name_key" ON "subscription_plans"("tier_name");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subscriptions_tenant_id_key" ON "tenant_subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_subscriptions_tenant_id_idx" ON "tenant_subscriptions"("tenant_id");

-- CreateIndex
CREATE INDEX "email_templates_tenant_id_category_idx" ON "email_templates"("tenant_id", "category");

-- CreateIndex
CREATE INDEX "email_templates_category_is_active_idx" ON "email_templates"("category", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_tenant_id_slug_key" ON "email_templates"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "report_definitions_tenant_id_report_type_idx" ON "report_definitions"("tenant_id", "report_type");

-- CreateIndex
CREATE INDEX "report_definitions_is_scheduled_next_run_at_idx" ON "report_definitions"("is_scheduled", "next_run_at");

-- CreateIndex
CREATE INDEX "generated_reports_tenant_id_report_type_created_at_idx" ON "generated_reports"("tenant_id", "report_type", "created_at");

-- CreateIndex
CREATE INDEX "generated_reports_status_created_at_idx" ON "generated_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "generated_reports_definition_id_idx" ON "generated_reports"("definition_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "receipts_tenant_id_receipt_type_issued_at_idx" ON "receipts"("tenant_id", "receipt_type", "issued_at");

-- CreateIndex
CREATE INDEX "receipts_user_id_issued_at_idx" ON "receipts"("user_id", "issued_at");

-- CreateIndex
CREATE INDEX "receipts_receipt_number_idx" ON "receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "receipts_loan_id_idx" ON "receipts"("loan_id");

-- CreateIndex
CREATE INDEX "receipts_payment_id_idx" ON "receipts"("payment_id");

-- CreateIndex
CREATE INDEX "receipts_topup_request_id_idx" ON "receipts"("topup_request_id");

-- CreateIndex
CREATE INDEX "receipts_savings_transaction_id_idx" ON "receipts"("savings_transaction_id");

-- CreateIndex
CREATE INDEX "backup_schedules_tenant_id_is_active_idx" ON "backup_schedules"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "backup_schedules_next_run_at_idx" ON "backup_schedules"("next_run_at");

-- CreateIndex
CREATE INDEX "backup_records_tenant_id_status_created_at_idx" ON "backup_records"("tenant_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "backup_records_schedule_id_idx" ON "backup_records"("schedule_id");

-- CreateIndex
CREATE INDEX "restore_requests_tenant_id_status_idx" ON "restore_requests"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "restore_requests_backup_id_idx" ON "restore_requests"("backup_id");

-- CreateIndex
CREATE INDEX "restore_requests_requested_by_idx" ON "restore_requests"("requested_by");

-- CreateIndex
CREATE INDEX "ai_configs_tenant_id_is_enabled_idx" ON "ai_configs"("tenant_id", "is_enabled");

-- CreateIndex
CREATE UNIQUE INDEX "ai_configs_tenant_id_use_case_key" ON "ai_configs"("tenant_id", "use_case");

-- CreateIndex
CREATE INDEX "ai_snapshots_tenant_id_use_case_created_at_idx" ON "ai_snapshots"("tenant_id", "use_case", "created_at");

-- CreateIndex
CREATE INDEX "ai_snapshots_status_idx" ON "ai_snapshots"("status");

-- CreateIndex
CREATE INDEX "ai_snapshots_requires_review_reviewed_at_idx" ON "ai_snapshots"("requires_review", "reviewed_at");

-- CreateIndex
CREATE INDEX "fraud_signals_tenant_id_signal_type_status_detected_at_idx" ON "fraud_signals"("tenant_id", "signal_type", "status", "detected_at");

-- CreateIndex
CREATE INDEX "fraud_signals_linked_user_id_status_idx" ON "fraud_signals"("linked_user_id", "status");

-- CreateIndex
CREATE INDEX "fraud_signals_linked_loan_id_idx" ON "fraud_signals"("linked_loan_id");

-- CreateIndex
CREATE INDEX "fraud_signals_severity_status_idx" ON "fraud_signals"("severity", "status");

-- CreateIndex
CREATE INDEX "fraud_signals_assigned_to_status_idx" ON "fraud_signals"("assigned_to", "status");

-- CreateIndex
CREATE INDEX "system_health_snapshots_snapshot_at_idx" ON "system_health_snapshots"("snapshot_at");

-- CreateIndex
CREATE INDEX "system_health_snapshots_alert_state_snapshot_at_idx" ON "system_health_snapshots"("alert_state", "snapshot_at");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_tenant_group_id_fkey" FOREIGN KEY ("tenant_group_id") REFERENCES "tenant_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey" FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_schedules" ADD CONSTRAINT "loan_schedules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_transactions" ADD CONSTRAINT "savings_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_faqs" ADD CONSTRAINT "homepage_faqs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_entries" ADD CONSTRAINT "feedback_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_reactions" ADD CONSTRAINT "message_reactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_guarantees" ADD CONSTRAINT "loan_guarantees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compassion_actions" ADD CONSTRAINT "compassion_actions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_ledger" ADD CONSTRAINT "business_ledger_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_audit" ADD CONSTRAINT "interest_audit_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_files" ADD CONSTRAINT "system_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_files" ADD CONSTRAINT "system_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscriptions" ADD CONSTRAINT "tenant_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "report_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restore_requests" ADD CONSTRAINT "restore_requests_backup_id_fkey" FOREIGN KEY ("backup_id") REFERENCES "backup_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_snapshots" ADD CONSTRAINT "ai_snapshots_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "ai_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
