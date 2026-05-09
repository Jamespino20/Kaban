-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" public."Role" NOT NULL DEFAULT 'member',
    "status" public."UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" public."InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent_accepted_at" TIMESTAMP(3),
    "consent_version" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" public."MaritalStatus" DEFAULT 'single',
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type" public."DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" TEXT NOT NULL,
    "verification_status" public."VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    "allowed_frequencies" public."RepaymentFrequency"[] DEFAULT ARRAY['monthly']::public."RepaymentFrequency"[],
    "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."loans" (
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
    "status" public."LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "repayment_frequency" public."RepaymentFrequency" NOT NULL DEFAULT 'monthly',
    "recovery_parent_loan_id" INTEGER,
    "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" public."ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" public."AccountType" NOT NULL,
    "owner_role" public."Role",
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(255),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type" public."TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'verified',
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "actor_role" public."Role",
    "actor_label" VARCHAR(150),
    "module" public."AuditModule" NOT NULL DEFAULT 'system',
    "action" VARCHAR(100) NOT NULL,
    "action_category" public."AuditActionCategory" NOT NULL DEFAULT 'other',
    "severity" public."AuditSeverity" NOT NULL DEFAULT 'info',
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" public."ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" public."ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
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
    "resolution_action" public."ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" public."DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
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
    "resolution_action" public."ImbalanceResolutionAction",
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."traffic_logs" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."interaction_logs" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."homepage_faqs" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."homepage_testimonials" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "feedback_type" public."FeedbackType" NOT NULL DEFAULT 'general',
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
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
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."support_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "tenant_id" INTEGER,
    "requester_id" INTEGER,
    "feedback_entry_id" INTEGER,
    "category" public."SupportTicketCategory" NOT NULL,
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
    "status" public."SupportTicketStatus" NOT NULL DEFAULT 'open',
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."messages" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" public."ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" public."MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emoji" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" public."NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "channel" public."NotificationChannel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."tenant_transfer_requests" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_content" TEXT NOT NULL,

    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" public."GuaranteeStatus" NOT NULL DEFAULT 'pending',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "action_type" public."CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" public."CompassionStatus" NOT NULL DEFAULT 'pending',
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
    "freeze_status" public."CompassionFreezeStatus" NOT NULL DEFAULT 'none',
    "reminder_state" public."CompassionReminderState" NOT NULL DEFAULT 'not_started',
    "reminder_sent_at" TIMESTAMP(3),
    "restructuring_offer_status" public."RestructuringOfferStatus" NOT NULL DEFAULT 'not_offered',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" public."LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."social_vouches" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."vouch_score_snapshots" (
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

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."tenant_trust_policies" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_trust_policies_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."trust_rating_periods" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_periods_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."trust_rating_assignments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "rating_source_role" public."Role" NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_assignments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."trust_score_snapshots" (
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
    "tier_before" public."InterestTier",
    "tier_after" public."InterestTier" NOT NULL,
    "low_rating_action_state" "LowRatingActionState" NOT NULL DEFAULT 'none',
    "low_rating_reason" VARCHAR(255),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."trust_tier_audits" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "snapshot_id" INTEGER,
    "previous_tier" public."InterestTier",
    "new_tier" public."InterestTier" NOT NULL,
    "score" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_tier_audits_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."system_files" (
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

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "users_email_tenant_id_key" ON "malolos"."users"("email", "tenant_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "users_username_tenant_id_key" ON "malolos"."users"("username", "tenant_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "users_member_code_tenant_id_key" ON "malolos"."users"("member_code", "tenant_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "user_profiles_user_id_key" ON "malolos"."user_profiles"("user_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_auth_user_id_key" ON "malolos"."two_factor_auth"("user_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "loans_loan_reference_key" ON "malolos"."loans"("loan_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "payments_payment_reference_key" ON "malolos"."payments"("payment_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "savings_accounts_user_id_account_type_key" ON "malolos"."savings_accounts"("user_id", "account_type");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_account_type_idx" ON "malolos"."savings_accounts"("tenant_id", "account_type");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_owner_role_idx" ON "malolos"."savings_accounts"("tenant_id", "owner_role");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "savings_transactions_account_id_status_processed_at_idx" ON "malolos"."savings_transactions"("account_id", "status", "processed_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "savings_transactions_reconciliation_reference_idx" ON "malolos"."savings_transactions"("reconciliation_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "savings_transactions_ledger_transaction_id_idx" ON "malolos"."savings_transactions"("ledger_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "savings_transactions_issue_status_idx" ON "malolos"."savings_transactions"("issue_status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_tenant_id_module_created_at_idx" ON "malolos"."audit_logs"("tenant_id", "module", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_user_id_created_at_idx" ON "malolos"."audit_logs"("user_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_entity_type_entity_id_idx" ON "malolos"."audit_logs"("entity_type", "entity_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_entity_ref_idx" ON "malolos"."audit_logs"("entity_ref");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_action_category_severity_idx" ON "malolos"."audit_logs"("action_category", "severity");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_request_id_idx" ON "malolos"."audit_logs"("request_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_session_id_idx" ON "malolos"."audit_logs"("session_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "audit_logs_is_cross_tenant_visible_created_at_idx" ON "malolos"."audit_logs"("is_cross_tenant_visible", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "malolos"."imbalance_investigations"("tenant_id", "status", "detected_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "malolos"."imbalance_investigations"("source_module", "source_entity_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_assigned_to_status_idx" ON "malolos"."imbalance_investigations"("assigned_to", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_reconciliation_reference_idx" ON "malolos"."imbalance_investigations"("reconciliation_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "malolos"."imbalance_investigations"("related_ledger_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "malolos"."imbalance_investigations"("related_wallet_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_topup_request_id_idx" ON "malolos"."imbalance_investigations"("related_topup_request_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_loan_id_idx" ON "malolos"."imbalance_investigations"("related_loan_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_payment_id_idx" ON "malolos"."imbalance_investigations"("related_payment_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "imbalance_investigations_audit_log_id_idx" ON "malolos"."imbalance_investigations"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_reconciliation_reference_key" ON "malolos"."daily_reconciliations"("reconciliation_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_tenant_id_business_date_key" ON "malolos"."daily_reconciliations"("tenant_id", "business_date");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "malolos"."daily_reconciliations"("tenant_id", "status", "business_date");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "malolos"."daily_reconciliations"("imbalance_investigation_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_resolution_reference_idx" ON "malolos"."daily_reconciliations"("resolution_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "malolos"."daily_reconciliations"("adjustment_ledger_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_audit_log_id_idx" ON "malolos"."daily_reconciliations"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_signed_off_by_idx" ON "malolos"."daily_reconciliations"("signed_off_by");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "daily_reconciliations_approved_by_idx" ON "malolos"."daily_reconciliations"("approved_by");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "traffic_logs_tenant_id_created_at_idx" ON "malolos"."traffic_logs"("tenant_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "malolos"."interaction_logs"("tenant_id", "event_type", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx" ON "malolos"."homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx" ON "malolos"."homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_tenant_id_status_created_at_idx" ON "malolos"."feedback_entries"("tenant_id", "status", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_user_id_created_at_idx" ON "malolos"."feedback_entries"("user_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_feedback_type_module_context_idx" ON "malolos"."feedback_entries"("feedback_type", "module_context");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_related_entity_type_related_entity_id_idx" ON "malolos"."feedback_entries"("related_entity_type", "related_entity_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_wallet_transaction_id_idx" ON "malolos"."feedback_entries"("wallet_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_loan_id_idx" ON "malolos"."feedback_entries"("loan_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_payment_id_idx" ON "malolos"."feedback_entries"("payment_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_topup_request_id_idx" ON "malolos"."feedback_entries"("topup_request_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_support_ticket_id_idx" ON "malolos"."feedback_entries"("support_ticket_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_assigned_to_status_idx" ON "malolos"."feedback_entries"("assigned_to", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_priority_status_idx" ON "malolos"."feedback_entries"("priority", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "feedback_entries_audit_log_id_idx" ON "malolos"."feedback_entries"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "support_tickets_ticket_number_key" ON "malolos"."support_tickets"("ticket_number");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_tenant_id_status_priority_created_at_idx" ON "malolos"."support_tickets"("tenant_id", "status", "priority", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_requester_id_created_at_idx" ON "malolos"."support_tickets"("requester_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_feedback_entry_id_idx" ON "malolos"."support_tickets"("feedback_entry_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_category_status_idx" ON "malolos"."support_tickets"("category", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_module_context_status_idx" ON "malolos"."support_tickets"("module_context", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_related_entity_type_related_entity_id_idx" ON "malolos"."support_tickets"("related_entity_type", "related_entity_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_wallet_transaction_id_idx" ON "malolos"."support_tickets"("wallet_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_loan_id_idx" ON "malolos"."support_tickets"("loan_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_payment_id_idx" ON "malolos"."support_tickets"("payment_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_topup_request_id_idx" ON "malolos"."support_tickets"("topup_request_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_assigned_to_status_idx" ON "malolos"."support_tickets"("assigned_to", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "support_tickets_audit_log_id_idx" ON "malolos"."support_tickets"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_token_key" ON "malolos"."verification_tokens"("token");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "verification_tokens_tenant_id_email_idx" ON "malolos"."verification_tokens"("tenant_id", "email");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_tenant_id_email_token_key" ON "malolos"."verification_tokens"("tenant_id", "email", "token");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_token_key" ON "malolos"."two_factor_tokens"("token");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "two_factor_tokens_tenant_id_email_idx" ON "malolos"."two_factor_tokens"("tenant_id", "email");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_tenant_id_email_token_key" ON "malolos"."two_factor_tokens"("tenant_id", "email", "token");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_token_key" ON "malolos"."password_reset_tokens"("token");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "password_reset_tokens_tenant_id_email_idx" ON "malolos"."password_reset_tokens"("tenant_id", "email");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_tenant_id_email_token_key" ON "malolos"."password_reset_tokens"("tenant_id", "email", "token");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "messages_conversation_id_created_at_idx" ON "malolos"."messages"("conversation_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "conversations_tenant_id_type_updated_at_idx" ON "malolos"."conversations"("tenant_id", "type", "updated_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "conversations_tenant_id_type_slug_key" ON "malolos"."conversations"("tenant_id", "type", "slug");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "conversation_participants_user_id_last_read_at_idx" ON "malolos"."conversation_participants"("user_id", "last_read_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "conversation_participants_conversation_id_user_id_key" ON "malolos"."conversation_participants"("conversation_id", "user_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "malolos"."mentorship_connections"("tenant_id", "status", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "malolos"."mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "message_attachments_message_id_created_at_idx" ON "malolos"."message_attachments"("message_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "message_reactions_user_id_created_at_idx" ON "malolos"."message_reactions"("user_id", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "message_reactions_message_id_user_id_emoji_key" ON "malolos"."message_reactions"("message_id", "user_id", "emoji");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "notifications_user_id_is_read_created_at_idx" ON "malolos"."notifications"("user_id", "is_read", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "notifications_tenant_id_type_created_at_idx" ON "malolos"."notifications"("tenant_id", "type", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "loan_guarantees_loan_id_status_idx" ON "malolos"."loan_guarantees"("loan_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "loan_guarantees_guarantor_id_status_idx" ON "malolos"."loan_guarantees"("guarantor_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "loan_guarantees_notification_id_idx" ON "malolos"."loan_guarantees"("notification_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "loan_guarantees_audit_log_id_idx" ON "malolos"."loan_guarantees"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "malolos"."loan_guarantees"("reassigned_to_guarantee_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_loan_id_status_idx" ON "malolos"."compassion_actions"("loan_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_requested_by_status_idx" ON "malolos"."compassion_actions"("requested_by", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_approved_by_idx" ON "malolos"."compassion_actions"("approved_by");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_freeze_status_idx" ON "malolos"."compassion_actions"("freeze_status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_reminder_state_idx" ON "malolos"."compassion_actions"("reminder_state");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_restructuring_offer_status_idx" ON "malolos"."compassion_actions"("restructuring_offer_status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_guarantor_charge_status_idx" ON "malolos"."compassion_actions"("guarantor_charge_status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "compassion_actions_audit_log_id_idx" ON "malolos"."compassion_actions"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "tenant_transfer_requests_status_idx" ON "malolos"."tenant_transfer_requests"("status");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "ledger_accounts_code_key" ON "malolos"."ledger_accounts"("code");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "business_ledger_transaction_id_idx" ON "malolos"."business_ledger"("transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "business_ledger_source_module_source_reference_idx" ON "malolos"."business_ledger"("source_module", "source_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "business_ledger_reconciliation_reference_idx" ON "malolos"."business_ledger"("reconciliation_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "business_ledger_reversed_entry_id_idx" ON "malolos"."business_ledger"("reversed_entry_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "ledger_accounts_tenant_id_type_idx" ON "malolos"."ledger_accounts"("tenant_id", "type");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_tenant_id_status_created_at_idx" ON "malolos"."social_vouches"("tenant_id", "status", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_voucher_id_status_idx" ON "malolos"."social_vouches"("voucher_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_vouchee_id_status_idx" ON "malolos"."social_vouches"("vouchee_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_requester_id_idx" ON "malolos"."social_vouches"("requester_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_discount_eligibility_state_idx" ON "malolos"."social_vouches"("discount_eligibility_state");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_trust_network_visibility_idx" ON "malolos"."social_vouches"("trust_network_visibility");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "social_vouches_audit_log_id_idx" ON "malolos"."social_vouches"("audit_log_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "malolos"."vouch_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_discount_eligibility_state_idx" ON "malolos"."vouch_score_snapshots"("discount_eligibility_state");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "tenant_trust_policies_tenant_id_key" ON "malolos"."tenant_trust_policies"("tenant_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "tenant_trust_policies_tenant_id_is_active_idx" ON "malolos"."tenant_trust_policies"("tenant_id", "is_active");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_periods_tenant_id_period_start_period_end_key" ON "malolos"."trust_rating_periods"("tenant_id", "period_start", "period_end");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_rating_periods_tenant_id_status_period_start_idx" ON "malolos"."trust_rating_periods"("tenant_id", "status", "period_start");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_assignments_period_id_rater_id_ratee_id_rating_source_role_key" ON "malolos"."trust_rating_assignments"("period_id", "rater_id", "ratee_id", "rating_source_role");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_tenant_id_status_due_at_idx" ON "malolos"."trust_rating_assignments"("tenant_id", "status", "due_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_rater_id_status_idx" ON "malolos"."trust_rating_assignments"("rater_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_ratee_id_status_idx" ON "malolos"."trust_rating_assignments"("ratee_id", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_lockout_until_idx" ON "malolos"."trust_rating_assignments"("lockout_until");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "malolos"."trust_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_period_id_idx" ON "malolos"."trust_score_snapshots"("period_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tier_after_idx" ON "malolos"."trust_score_snapshots"("tier_after");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_low_rating_action_state_idx" ON "malolos"."trust_score_snapshots"("low_rating_action_state");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_tier_audits_tenant_id_user_id_changed_at_idx" ON "malolos"."trust_tier_audits"("tenant_id", "user_id", "changed_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_tier_audits_snapshot_id_idx" ON "malolos"."trust_tier_audits"("snapshot_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "trust_tier_audits_previous_tier_new_tier_idx" ON "malolos"."trust_tier_audits"("previous_tier", "new_tier");

-- SCHEMA: malolos
-- CreateIndex
CREATE UNIQUE  INDEX "interest_audit_loan_id_key" ON "malolos"."interest_audit"("loan_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "system_files_tenant_id_idx" ON "malolos"."system_files"("tenant_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "system_files_uploader_id_idx" ON "malolos"."system_files"("uploader_id");

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loans" ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey" FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."homepage_faqs" ADD CONSTRAINT "homepage_faqs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."feedback_entries" ADD CONSTRAINT "feedback_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."system_files" ADD CONSTRAINT "system_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."system_files" ADD CONSTRAINT "system_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."topup_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" public."WalletRequestType" NOT NULL DEFAULT 'deposit',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
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

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "topup_requests_tenant_id_request_type_status_idx" ON "malolos"."topup_requests"("tenant_id", "request_type", "status");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "topup_requests_user_id_request_type_created_at_idx" ON "malolos"."topup_requests"("user_id", "request_type", "created_at");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "topup_requests_reconciliation_reference_idx" ON "malolos"."topup_requests"("reconciliation_reference");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "topup_requests_ledger_transaction_id_idx" ON "malolos"."topup_requests"("ledger_transaction_id");

-- SCHEMA: malolos
-- CreateIndex
CREATE  INDEX "topup_requests_issue_status_idx" ON "malolos"."topup_requests"("issue_status");

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."topup_requests" ADD CONSTRAINT "topup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."topup_requests" ADD CONSTRAINT "topup_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: malolos
-- AddForeignKey
ALTER TABLE "malolos"."topup_requests" ADD CONSTRAINT "topup_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: malolos
-- ============================================================
-- DM-26: Notification Type Enum Update
-- Note: ALTER TYPE ADD VALUE applied only if not exists
-- ============================================================

-- New NotificationType values are added via migration only on fresh DBs.
-- init.sql always runs on a clean DB so we replace the full enum:

-- CreateEnum (replace full NotificationType — init.sql is always clean DB)
-- Note: Prisma will auto-generate the full enum;

-- SCHEMA: malolos
-- CreateTable
CREATE TABLE "malolos"."receipts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "receipt_number" VARCHAR(60) NOT NULL,
    "receipt_type" public."ReceiptType" NOT NULL,
    "status" public."ReceiptStatus" NOT NULL DEFAULT 'generated',
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

-- SCHEMA: malolos
CREATE UNIQUE  INDEX "receipts_receipt_number_key" ON "malolos"."receipts"("receipt_number");

-- SCHEMA: malolos
CREATE  INDEX "receipts_tenant_id_receipt_type_issued_at_idx" ON "malolos"."receipts"("tenant_id", "receipt_type", "issued_at");

-- SCHEMA: malolos
CREATE  INDEX "receipts_user_id_issued_at_idx" ON "malolos"."receipts"("user_id", "issued_at");

-- SCHEMA: malolos
CREATE  INDEX "receipts_receipt_number_idx" ON "malolos"."receipts"("receipt_number");

-- SCHEMA: malolos
CREATE  INDEX "receipts_loan_id_idx" ON "malolos"."receipts"("loan_id");

-- SCHEMA: malolos
CREATE  INDEX "receipts_payment_id_idx" ON "malolos"."receipts"("payment_id");

-- SCHEMA: malolos
CREATE  INDEX "receipts_topup_request_id_idx" ON "malolos"."receipts"("topup_request_id");

-- SCHEMA: malolos
CREATE  INDEX "receipts_savings_transaction_id_idx" ON "malolos"."receipts"("savings_transaction_id");

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" public."Role" NOT NULL DEFAULT 'member',
    "status" public."UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" public."InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent_accepted_at" TIMESTAMP(3),
    "consent_version" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" public."MaritalStatus" DEFAULT 'single',
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type" public."DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" TEXT NOT NULL,
    "verification_status" public."VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    "allowed_frequencies" public."RepaymentFrequency"[] DEFAULT ARRAY['monthly']::public."RepaymentFrequency"[],
    "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."loans" (
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
    "status" public."LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "repayment_frequency" public."RepaymentFrequency" NOT NULL DEFAULT 'monthly',
    "recovery_parent_loan_id" INTEGER,
    "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" public."ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" public."AccountType" NOT NULL,
    "owner_role" public."Role",
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(255),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type" public."TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'verified',
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "actor_role" public."Role",
    "actor_label" VARCHAR(150),
    "module" public."AuditModule" NOT NULL DEFAULT 'system',
    "action" VARCHAR(100) NOT NULL,
    "action_category" public."AuditActionCategory" NOT NULL DEFAULT 'other',
    "severity" public."AuditSeverity" NOT NULL DEFAULT 'info',
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" public."ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" public."ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
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
    "resolution_action" public."ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" public."DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
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
    "resolution_action" public."ImbalanceResolutionAction",
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."traffic_logs" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."interaction_logs" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."homepage_faqs" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."homepage_testimonials" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "feedback_type" public."FeedbackType" NOT NULL DEFAULT 'general',
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
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
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."support_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "tenant_id" INTEGER,
    "requester_id" INTEGER,
    "feedback_entry_id" INTEGER,
    "category" public."SupportTicketCategory" NOT NULL,
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
    "status" public."SupportTicketStatus" NOT NULL DEFAULT 'open',
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."messages" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" public."ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" public."MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emoji" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" public."NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "channel" public."NotificationChannel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."tenant_transfer_requests" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_content" TEXT NOT NULL,

    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" public."GuaranteeStatus" NOT NULL DEFAULT 'pending',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "action_type" public."CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" public."CompassionStatus" NOT NULL DEFAULT 'pending',
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
    "freeze_status" public."CompassionFreezeStatus" NOT NULL DEFAULT 'none',
    "reminder_state" public."CompassionReminderState" NOT NULL DEFAULT 'not_started',
    "reminder_sent_at" TIMESTAMP(3),
    "restructuring_offer_status" public."RestructuringOfferStatus" NOT NULL DEFAULT 'not_offered',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" public."LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."social_vouches" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."vouch_score_snapshots" (
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

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."tenant_trust_policies" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_trust_policies_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."trust_rating_periods" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_periods_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."trust_rating_assignments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "rating_source_role" public."Role" NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_assignments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."trust_score_snapshots" (
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
    "tier_before" public."InterestTier",
    "tier_after" public."InterestTier" NOT NULL,
    "low_rating_action_state" "LowRatingActionState" NOT NULL DEFAULT 'none',
    "low_rating_reason" VARCHAR(255),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."trust_tier_audits" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "snapshot_id" INTEGER,
    "previous_tier" public."InterestTier",
    "new_tier" public."InterestTier" NOT NULL,
    "score" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_tier_audits_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."system_files" (
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

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "users_email_tenant_id_key" ON "san_jose"."users"("email", "tenant_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "users_username_tenant_id_key" ON "san_jose"."users"("username", "tenant_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "users_member_code_tenant_id_key" ON "san_jose"."users"("member_code", "tenant_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "user_profiles_user_id_key" ON "san_jose"."user_profiles"("user_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_auth_user_id_key" ON "san_jose"."two_factor_auth"("user_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "loans_loan_reference_key" ON "san_jose"."loans"("loan_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "payments_payment_reference_key" ON "san_jose"."payments"("payment_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "savings_accounts_user_id_account_type_key" ON "san_jose"."savings_accounts"("user_id", "account_type");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_account_type_idx" ON "san_jose"."savings_accounts"("tenant_id", "account_type");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_owner_role_idx" ON "san_jose"."savings_accounts"("tenant_id", "owner_role");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "savings_transactions_account_id_status_processed_at_idx" ON "san_jose"."savings_transactions"("account_id", "status", "processed_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "savings_transactions_reconciliation_reference_idx" ON "san_jose"."savings_transactions"("reconciliation_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "savings_transactions_ledger_transaction_id_idx" ON "san_jose"."savings_transactions"("ledger_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "savings_transactions_issue_status_idx" ON "san_jose"."savings_transactions"("issue_status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_tenant_id_module_created_at_idx" ON "san_jose"."audit_logs"("tenant_id", "module", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_user_id_created_at_idx" ON "san_jose"."audit_logs"("user_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_entity_type_entity_id_idx" ON "san_jose"."audit_logs"("entity_type", "entity_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_entity_ref_idx" ON "san_jose"."audit_logs"("entity_ref");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_action_category_severity_idx" ON "san_jose"."audit_logs"("action_category", "severity");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_request_id_idx" ON "san_jose"."audit_logs"("request_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_session_id_idx" ON "san_jose"."audit_logs"("session_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "audit_logs_is_cross_tenant_visible_created_at_idx" ON "san_jose"."audit_logs"("is_cross_tenant_visible", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "san_jose"."imbalance_investigations"("tenant_id", "status", "detected_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "san_jose"."imbalance_investigations"("source_module", "source_entity_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_assigned_to_status_idx" ON "san_jose"."imbalance_investigations"("assigned_to", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_reconciliation_reference_idx" ON "san_jose"."imbalance_investigations"("reconciliation_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "san_jose"."imbalance_investigations"("related_ledger_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "san_jose"."imbalance_investigations"("related_wallet_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_topup_request_id_idx" ON "san_jose"."imbalance_investigations"("related_topup_request_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_loan_id_idx" ON "san_jose"."imbalance_investigations"("related_loan_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_payment_id_idx" ON "san_jose"."imbalance_investigations"("related_payment_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "imbalance_investigations_audit_log_id_idx" ON "san_jose"."imbalance_investigations"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_reconciliation_reference_key" ON "san_jose"."daily_reconciliations"("reconciliation_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_tenant_id_business_date_key" ON "san_jose"."daily_reconciliations"("tenant_id", "business_date");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "san_jose"."daily_reconciliations"("tenant_id", "status", "business_date");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "san_jose"."daily_reconciliations"("imbalance_investigation_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_resolution_reference_idx" ON "san_jose"."daily_reconciliations"("resolution_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "san_jose"."daily_reconciliations"("adjustment_ledger_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_audit_log_id_idx" ON "san_jose"."daily_reconciliations"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_signed_off_by_idx" ON "san_jose"."daily_reconciliations"("signed_off_by");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "daily_reconciliations_approved_by_idx" ON "san_jose"."daily_reconciliations"("approved_by");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "traffic_logs_tenant_id_created_at_idx" ON "san_jose"."traffic_logs"("tenant_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "san_jose"."interaction_logs"("tenant_id", "event_type", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx" ON "san_jose"."homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx" ON "san_jose"."homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_tenant_id_status_created_at_idx" ON "san_jose"."feedback_entries"("tenant_id", "status", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_user_id_created_at_idx" ON "san_jose"."feedback_entries"("user_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_feedback_type_module_context_idx" ON "san_jose"."feedback_entries"("feedback_type", "module_context");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_related_entity_type_related_entity_id_idx" ON "san_jose"."feedback_entries"("related_entity_type", "related_entity_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_wallet_transaction_id_idx" ON "san_jose"."feedback_entries"("wallet_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_loan_id_idx" ON "san_jose"."feedback_entries"("loan_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_payment_id_idx" ON "san_jose"."feedback_entries"("payment_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_topup_request_id_idx" ON "san_jose"."feedback_entries"("topup_request_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_support_ticket_id_idx" ON "san_jose"."feedback_entries"("support_ticket_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_assigned_to_status_idx" ON "san_jose"."feedback_entries"("assigned_to", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_priority_status_idx" ON "san_jose"."feedback_entries"("priority", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "feedback_entries_audit_log_id_idx" ON "san_jose"."feedback_entries"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "support_tickets_ticket_number_key" ON "san_jose"."support_tickets"("ticket_number");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_tenant_id_status_priority_created_at_idx" ON "san_jose"."support_tickets"("tenant_id", "status", "priority", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_requester_id_created_at_idx" ON "san_jose"."support_tickets"("requester_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_feedback_entry_id_idx" ON "san_jose"."support_tickets"("feedback_entry_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_category_status_idx" ON "san_jose"."support_tickets"("category", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_module_context_status_idx" ON "san_jose"."support_tickets"("module_context", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_related_entity_type_related_entity_id_idx" ON "san_jose"."support_tickets"("related_entity_type", "related_entity_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_wallet_transaction_id_idx" ON "san_jose"."support_tickets"("wallet_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_loan_id_idx" ON "san_jose"."support_tickets"("loan_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_payment_id_idx" ON "san_jose"."support_tickets"("payment_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_topup_request_id_idx" ON "san_jose"."support_tickets"("topup_request_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_assigned_to_status_idx" ON "san_jose"."support_tickets"("assigned_to", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "support_tickets_audit_log_id_idx" ON "san_jose"."support_tickets"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_token_key" ON "san_jose"."verification_tokens"("token");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "verification_tokens_tenant_id_email_idx" ON "san_jose"."verification_tokens"("tenant_id", "email");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_tenant_id_email_token_key" ON "san_jose"."verification_tokens"("tenant_id", "email", "token");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_token_key" ON "san_jose"."two_factor_tokens"("token");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "two_factor_tokens_tenant_id_email_idx" ON "san_jose"."two_factor_tokens"("tenant_id", "email");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_tenant_id_email_token_key" ON "san_jose"."two_factor_tokens"("tenant_id", "email", "token");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_token_key" ON "san_jose"."password_reset_tokens"("token");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "password_reset_tokens_tenant_id_email_idx" ON "san_jose"."password_reset_tokens"("tenant_id", "email");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_tenant_id_email_token_key" ON "san_jose"."password_reset_tokens"("tenant_id", "email", "token");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "messages_conversation_id_created_at_idx" ON "san_jose"."messages"("conversation_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "conversations_tenant_id_type_updated_at_idx" ON "san_jose"."conversations"("tenant_id", "type", "updated_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "conversations_tenant_id_type_slug_key" ON "san_jose"."conversations"("tenant_id", "type", "slug");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "conversation_participants_user_id_last_read_at_idx" ON "san_jose"."conversation_participants"("user_id", "last_read_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "conversation_participants_conversation_id_user_id_key" ON "san_jose"."conversation_participants"("conversation_id", "user_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "san_jose"."mentorship_connections"("tenant_id", "status", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "san_jose"."mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "message_attachments_message_id_created_at_idx" ON "san_jose"."message_attachments"("message_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "message_reactions_user_id_created_at_idx" ON "san_jose"."message_reactions"("user_id", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "message_reactions_message_id_user_id_emoji_key" ON "san_jose"."message_reactions"("message_id", "user_id", "emoji");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "notifications_user_id_is_read_created_at_idx" ON "san_jose"."notifications"("user_id", "is_read", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "notifications_tenant_id_type_created_at_idx" ON "san_jose"."notifications"("tenant_id", "type", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "loan_guarantees_loan_id_status_idx" ON "san_jose"."loan_guarantees"("loan_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "loan_guarantees_guarantor_id_status_idx" ON "san_jose"."loan_guarantees"("guarantor_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "loan_guarantees_notification_id_idx" ON "san_jose"."loan_guarantees"("notification_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "loan_guarantees_audit_log_id_idx" ON "san_jose"."loan_guarantees"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "san_jose"."loan_guarantees"("reassigned_to_guarantee_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_loan_id_status_idx" ON "san_jose"."compassion_actions"("loan_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_requested_by_status_idx" ON "san_jose"."compassion_actions"("requested_by", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_approved_by_idx" ON "san_jose"."compassion_actions"("approved_by");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_freeze_status_idx" ON "san_jose"."compassion_actions"("freeze_status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_reminder_state_idx" ON "san_jose"."compassion_actions"("reminder_state");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_restructuring_offer_status_idx" ON "san_jose"."compassion_actions"("restructuring_offer_status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_guarantor_charge_status_idx" ON "san_jose"."compassion_actions"("guarantor_charge_status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "compassion_actions_audit_log_id_idx" ON "san_jose"."compassion_actions"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "tenant_transfer_requests_status_idx" ON "san_jose"."tenant_transfer_requests"("status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "ledger_accounts_code_key" ON "san_jose"."ledger_accounts"("code");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "business_ledger_transaction_id_idx" ON "san_jose"."business_ledger"("transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "business_ledger_source_module_source_reference_idx" ON "san_jose"."business_ledger"("source_module", "source_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "business_ledger_reconciliation_reference_idx" ON "san_jose"."business_ledger"("reconciliation_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "business_ledger_reversed_entry_id_idx" ON "san_jose"."business_ledger"("reversed_entry_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "ledger_accounts_tenant_id_type_idx" ON "san_jose"."ledger_accounts"("tenant_id", "type");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_tenant_id_status_created_at_idx" ON "san_jose"."social_vouches"("tenant_id", "status", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_voucher_id_status_idx" ON "san_jose"."social_vouches"("voucher_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_vouchee_id_status_idx" ON "san_jose"."social_vouches"("vouchee_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_requester_id_idx" ON "san_jose"."social_vouches"("requester_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_discount_eligibility_state_idx" ON "san_jose"."social_vouches"("discount_eligibility_state");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_trust_network_visibility_idx" ON "san_jose"."social_vouches"("trust_network_visibility");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "social_vouches_audit_log_id_idx" ON "san_jose"."social_vouches"("audit_log_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "san_jose"."vouch_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_discount_eligibility_state_idx" ON "san_jose"."vouch_score_snapshots"("discount_eligibility_state");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "tenant_trust_policies_tenant_id_key" ON "san_jose"."tenant_trust_policies"("tenant_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "tenant_trust_policies_tenant_id_is_active_idx" ON "san_jose"."tenant_trust_policies"("tenant_id", "is_active");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_periods_tenant_id_period_start_period_end_key" ON "san_jose"."trust_rating_periods"("tenant_id", "period_start", "period_end");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_rating_periods_tenant_id_status_period_start_idx" ON "san_jose"."trust_rating_periods"("tenant_id", "status", "period_start");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_assignments_period_id_rater_id_ratee_id_rating_source_role_key" ON "san_jose"."trust_rating_assignments"("period_id", "rater_id", "ratee_id", "rating_source_role");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_tenant_id_status_due_at_idx" ON "san_jose"."trust_rating_assignments"("tenant_id", "status", "due_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_rater_id_status_idx" ON "san_jose"."trust_rating_assignments"("rater_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_ratee_id_status_idx" ON "san_jose"."trust_rating_assignments"("ratee_id", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_lockout_until_idx" ON "san_jose"."trust_rating_assignments"("lockout_until");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "san_jose"."trust_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_period_id_idx" ON "san_jose"."trust_score_snapshots"("period_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tier_after_idx" ON "san_jose"."trust_score_snapshots"("tier_after");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_low_rating_action_state_idx" ON "san_jose"."trust_score_snapshots"("low_rating_action_state");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_tier_audits_tenant_id_user_id_changed_at_idx" ON "san_jose"."trust_tier_audits"("tenant_id", "user_id", "changed_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_tier_audits_snapshot_id_idx" ON "san_jose"."trust_tier_audits"("snapshot_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "trust_tier_audits_previous_tier_new_tier_idx" ON "san_jose"."trust_tier_audits"("previous_tier", "new_tier");

-- SCHEMA: san_jose
-- CreateIndex
CREATE UNIQUE  INDEX "interest_audit_loan_id_key" ON "san_jose"."interest_audit"("loan_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "system_files_tenant_id_idx" ON "san_jose"."system_files"("tenant_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "system_files_uploader_id_idx" ON "san_jose"."system_files"("uploader_id");

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loans" ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey" FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."homepage_faqs" ADD CONSTRAINT "homepage_faqs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."feedback_entries" ADD CONSTRAINT "feedback_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."system_files" ADD CONSTRAINT "system_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."system_files" ADD CONSTRAINT "system_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."topup_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" public."WalletRequestType" NOT NULL DEFAULT 'deposit',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
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

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "topup_requests_tenant_id_request_type_status_idx" ON "san_jose"."topup_requests"("tenant_id", "request_type", "status");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "topup_requests_user_id_request_type_created_at_idx" ON "san_jose"."topup_requests"("user_id", "request_type", "created_at");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "topup_requests_reconciliation_reference_idx" ON "san_jose"."topup_requests"("reconciliation_reference");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "topup_requests_ledger_transaction_id_idx" ON "san_jose"."topup_requests"("ledger_transaction_id");

-- SCHEMA: san_jose
-- CreateIndex
CREATE  INDEX "topup_requests_issue_status_idx" ON "san_jose"."topup_requests"("issue_status");

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."topup_requests" ADD CONSTRAINT "topup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."topup_requests" ADD CONSTRAINT "topup_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- AddForeignKey
ALTER TABLE "san_jose"."topup_requests" ADD CONSTRAINT "topup_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: san_jose
-- ============================================================
-- DM-26: Notification Type Enum Update
-- Note: ALTER TYPE ADD VALUE applied only if not exists
-- ============================================================

-- New NotificationType values are added via migration only on fresh DBs.
-- init.sql always runs on a clean DB so we replace the full enum:

-- CreateEnum (replace full NotificationType — init.sql is always clean DB)
-- Note: Prisma will auto-generate the full enum;

-- SCHEMA: san_jose
-- CreateTable
CREATE TABLE "san_jose"."receipts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "receipt_number" VARCHAR(60) NOT NULL,
    "receipt_type" public."ReceiptType" NOT NULL,
    "status" public."ReceiptStatus" NOT NULL DEFAULT 'generated',
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

-- SCHEMA: san_jose
CREATE UNIQUE  INDEX "receipts_receipt_number_key" ON "san_jose"."receipts"("receipt_number");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_tenant_id_receipt_type_issued_at_idx" ON "san_jose"."receipts"("tenant_id", "receipt_type", "issued_at");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_user_id_issued_at_idx" ON "san_jose"."receipts"("user_id", "issued_at");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_receipt_number_idx" ON "san_jose"."receipts"("receipt_number");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_loan_id_idx" ON "san_jose"."receipts"("loan_id");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_payment_id_idx" ON "san_jose"."receipts"("payment_id");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_topup_request_id_idx" ON "san_jose"."receipts"("topup_request_id");

-- SCHEMA: san_jose
CREATE  INDEX "receipts_savings_transaction_id_idx" ON "san_jose"."receipts"("savings_transaction_id");

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" public."Role" NOT NULL DEFAULT 'member',
    "status" public."UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" public."InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent_accepted_at" TIMESTAMP(3),
    "consent_version" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" public."MaritalStatus" DEFAULT 'single',
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type" public."DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" TEXT NOT NULL,
    "verification_status" public."VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    "allowed_frequencies" public."RepaymentFrequency"[] DEFAULT ARRAY['monthly']::public."RepaymentFrequency"[],
    "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."loans" (
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
    "status" public."LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "repayment_frequency" public."RepaymentFrequency" NOT NULL DEFAULT 'monthly',
    "recovery_parent_loan_id" INTEGER,
    "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" public."ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" public."AccountType" NOT NULL,
    "owner_role" public."Role",
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(255),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type" public."TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'verified',
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "actor_role" public."Role",
    "actor_label" VARCHAR(150),
    "module" public."AuditModule" NOT NULL DEFAULT 'system',
    "action" VARCHAR(100) NOT NULL,
    "action_category" public."AuditActionCategory" NOT NULL DEFAULT 'other',
    "severity" public."AuditSeverity" NOT NULL DEFAULT 'info',
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" public."ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" public."ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
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
    "resolution_action" public."ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" public."DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
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
    "resolution_action" public."ImbalanceResolutionAction",
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."traffic_logs" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."interaction_logs" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."homepage_faqs" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."homepage_testimonials" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "feedback_type" public."FeedbackType" NOT NULL DEFAULT 'general',
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
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
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."support_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "tenant_id" INTEGER,
    "requester_id" INTEGER,
    "feedback_entry_id" INTEGER,
    "category" public."SupportTicketCategory" NOT NULL,
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
    "status" public."SupportTicketStatus" NOT NULL DEFAULT 'open',
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."messages" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" public."ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" public."MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emoji" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" public."NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "channel" public."NotificationChannel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."tenant_transfer_requests" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_content" TEXT NOT NULL,

    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" public."GuaranteeStatus" NOT NULL DEFAULT 'pending',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "action_type" public."CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" public."CompassionStatus" NOT NULL DEFAULT 'pending',
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
    "freeze_status" public."CompassionFreezeStatus" NOT NULL DEFAULT 'none',
    "reminder_state" public."CompassionReminderState" NOT NULL DEFAULT 'not_started',
    "reminder_sent_at" TIMESTAMP(3),
    "restructuring_offer_status" public."RestructuringOfferStatus" NOT NULL DEFAULT 'not_offered',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" public."LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."social_vouches" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."vouch_score_snapshots" (
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

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."tenant_trust_policies" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_trust_policies_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."trust_rating_periods" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_periods_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."trust_rating_assignments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "rating_source_role" public."Role" NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_assignments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."trust_score_snapshots" (
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
    "tier_before" public."InterestTier",
    "tier_after" public."InterestTier" NOT NULL,
    "low_rating_action_state" "LowRatingActionState" NOT NULL DEFAULT 'none',
    "low_rating_reason" VARCHAR(255),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."trust_tier_audits" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "snapshot_id" INTEGER,
    "previous_tier" public."InterestTier",
    "new_tier" public."InterestTier" NOT NULL,
    "score" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_tier_audits_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."system_files" (
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

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "users_email_tenant_id_key" ON "qc_vendors"."users"("email", "tenant_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "users_username_tenant_id_key" ON "qc_vendors"."users"("username", "tenant_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "users_member_code_tenant_id_key" ON "qc_vendors"."users"("member_code", "tenant_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "user_profiles_user_id_key" ON "qc_vendors"."user_profiles"("user_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_auth_user_id_key" ON "qc_vendors"."two_factor_auth"("user_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "loans_loan_reference_key" ON "qc_vendors"."loans"("loan_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "payments_payment_reference_key" ON "qc_vendors"."payments"("payment_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "savings_accounts_user_id_account_type_key" ON "qc_vendors"."savings_accounts"("user_id", "account_type");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_account_type_idx" ON "qc_vendors"."savings_accounts"("tenant_id", "account_type");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_owner_role_idx" ON "qc_vendors"."savings_accounts"("tenant_id", "owner_role");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "savings_transactions_account_id_status_processed_at_idx" ON "qc_vendors"."savings_transactions"("account_id", "status", "processed_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "savings_transactions_reconciliation_reference_idx" ON "qc_vendors"."savings_transactions"("reconciliation_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "savings_transactions_ledger_transaction_id_idx" ON "qc_vendors"."savings_transactions"("ledger_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "savings_transactions_issue_status_idx" ON "qc_vendors"."savings_transactions"("issue_status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_tenant_id_module_created_at_idx" ON "qc_vendors"."audit_logs"("tenant_id", "module", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_user_id_created_at_idx" ON "qc_vendors"."audit_logs"("user_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_entity_type_entity_id_idx" ON "qc_vendors"."audit_logs"("entity_type", "entity_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_entity_ref_idx" ON "qc_vendors"."audit_logs"("entity_ref");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_action_category_severity_idx" ON "qc_vendors"."audit_logs"("action_category", "severity");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_request_id_idx" ON "qc_vendors"."audit_logs"("request_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_session_id_idx" ON "qc_vendors"."audit_logs"("session_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "audit_logs_is_cross_tenant_visible_created_at_idx" ON "qc_vendors"."audit_logs"("is_cross_tenant_visible", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "qc_vendors"."imbalance_investigations"("tenant_id", "status", "detected_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "qc_vendors"."imbalance_investigations"("source_module", "source_entity_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_assigned_to_status_idx" ON "qc_vendors"."imbalance_investigations"("assigned_to", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_reconciliation_reference_idx" ON "qc_vendors"."imbalance_investigations"("reconciliation_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "qc_vendors"."imbalance_investigations"("related_ledger_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "qc_vendors"."imbalance_investigations"("related_wallet_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_topup_request_id_idx" ON "qc_vendors"."imbalance_investigations"("related_topup_request_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_loan_id_idx" ON "qc_vendors"."imbalance_investigations"("related_loan_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_payment_id_idx" ON "qc_vendors"."imbalance_investigations"("related_payment_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "imbalance_investigations_audit_log_id_idx" ON "qc_vendors"."imbalance_investigations"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_reconciliation_reference_key" ON "qc_vendors"."daily_reconciliations"("reconciliation_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_tenant_id_business_date_key" ON "qc_vendors"."daily_reconciliations"("tenant_id", "business_date");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "qc_vendors"."daily_reconciliations"("tenant_id", "status", "business_date");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "qc_vendors"."daily_reconciliations"("imbalance_investigation_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_resolution_reference_idx" ON "qc_vendors"."daily_reconciliations"("resolution_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "qc_vendors"."daily_reconciliations"("adjustment_ledger_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_audit_log_id_idx" ON "qc_vendors"."daily_reconciliations"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_signed_off_by_idx" ON "qc_vendors"."daily_reconciliations"("signed_off_by");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "daily_reconciliations_approved_by_idx" ON "qc_vendors"."daily_reconciliations"("approved_by");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "traffic_logs_tenant_id_created_at_idx" ON "qc_vendors"."traffic_logs"("tenant_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "qc_vendors"."interaction_logs"("tenant_id", "event_type", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx" ON "qc_vendors"."homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx" ON "qc_vendors"."homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_tenant_id_status_created_at_idx" ON "qc_vendors"."feedback_entries"("tenant_id", "status", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_user_id_created_at_idx" ON "qc_vendors"."feedback_entries"("user_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_feedback_type_module_context_idx" ON "qc_vendors"."feedback_entries"("feedback_type", "module_context");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_related_entity_type_related_entity_id_idx" ON "qc_vendors"."feedback_entries"("related_entity_type", "related_entity_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_wallet_transaction_id_idx" ON "qc_vendors"."feedback_entries"("wallet_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_loan_id_idx" ON "qc_vendors"."feedback_entries"("loan_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_payment_id_idx" ON "qc_vendors"."feedback_entries"("payment_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_topup_request_id_idx" ON "qc_vendors"."feedback_entries"("topup_request_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_support_ticket_id_idx" ON "qc_vendors"."feedback_entries"("support_ticket_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_assigned_to_status_idx" ON "qc_vendors"."feedback_entries"("assigned_to", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_priority_status_idx" ON "qc_vendors"."feedback_entries"("priority", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "feedback_entries_audit_log_id_idx" ON "qc_vendors"."feedback_entries"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "support_tickets_ticket_number_key" ON "qc_vendors"."support_tickets"("ticket_number");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_tenant_id_status_priority_created_at_idx" ON "qc_vendors"."support_tickets"("tenant_id", "status", "priority", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_requester_id_created_at_idx" ON "qc_vendors"."support_tickets"("requester_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_feedback_entry_id_idx" ON "qc_vendors"."support_tickets"("feedback_entry_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_category_status_idx" ON "qc_vendors"."support_tickets"("category", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_module_context_status_idx" ON "qc_vendors"."support_tickets"("module_context", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_related_entity_type_related_entity_id_idx" ON "qc_vendors"."support_tickets"("related_entity_type", "related_entity_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_wallet_transaction_id_idx" ON "qc_vendors"."support_tickets"("wallet_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_loan_id_idx" ON "qc_vendors"."support_tickets"("loan_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_payment_id_idx" ON "qc_vendors"."support_tickets"("payment_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_topup_request_id_idx" ON "qc_vendors"."support_tickets"("topup_request_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_assigned_to_status_idx" ON "qc_vendors"."support_tickets"("assigned_to", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "support_tickets_audit_log_id_idx" ON "qc_vendors"."support_tickets"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_token_key" ON "qc_vendors"."verification_tokens"("token");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "verification_tokens_tenant_id_email_idx" ON "qc_vendors"."verification_tokens"("tenant_id", "email");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_tenant_id_email_token_key" ON "qc_vendors"."verification_tokens"("tenant_id", "email", "token");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_token_key" ON "qc_vendors"."two_factor_tokens"("token");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "two_factor_tokens_tenant_id_email_idx" ON "qc_vendors"."two_factor_tokens"("tenant_id", "email");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_tenant_id_email_token_key" ON "qc_vendors"."two_factor_tokens"("tenant_id", "email", "token");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_token_key" ON "qc_vendors"."password_reset_tokens"("token");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "password_reset_tokens_tenant_id_email_idx" ON "qc_vendors"."password_reset_tokens"("tenant_id", "email");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_tenant_id_email_token_key" ON "qc_vendors"."password_reset_tokens"("tenant_id", "email", "token");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "messages_conversation_id_created_at_idx" ON "qc_vendors"."messages"("conversation_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "conversations_tenant_id_type_updated_at_idx" ON "qc_vendors"."conversations"("tenant_id", "type", "updated_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "conversations_tenant_id_type_slug_key" ON "qc_vendors"."conversations"("tenant_id", "type", "slug");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "conversation_participants_user_id_last_read_at_idx" ON "qc_vendors"."conversation_participants"("user_id", "last_read_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "conversation_participants_conversation_id_user_id_key" ON "qc_vendors"."conversation_participants"("conversation_id", "user_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "qc_vendors"."mentorship_connections"("tenant_id", "status", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "qc_vendors"."mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "message_attachments_message_id_created_at_idx" ON "qc_vendors"."message_attachments"("message_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "message_reactions_user_id_created_at_idx" ON "qc_vendors"."message_reactions"("user_id", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "message_reactions_message_id_user_id_emoji_key" ON "qc_vendors"."message_reactions"("message_id", "user_id", "emoji");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "notifications_user_id_is_read_created_at_idx" ON "qc_vendors"."notifications"("user_id", "is_read", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "notifications_tenant_id_type_created_at_idx" ON "qc_vendors"."notifications"("tenant_id", "type", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "loan_guarantees_loan_id_status_idx" ON "qc_vendors"."loan_guarantees"("loan_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "loan_guarantees_guarantor_id_status_idx" ON "qc_vendors"."loan_guarantees"("guarantor_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "loan_guarantees_notification_id_idx" ON "qc_vendors"."loan_guarantees"("notification_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "loan_guarantees_audit_log_id_idx" ON "qc_vendors"."loan_guarantees"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "qc_vendors"."loan_guarantees"("reassigned_to_guarantee_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_loan_id_status_idx" ON "qc_vendors"."compassion_actions"("loan_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_requested_by_status_idx" ON "qc_vendors"."compassion_actions"("requested_by", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_approved_by_idx" ON "qc_vendors"."compassion_actions"("approved_by");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_freeze_status_idx" ON "qc_vendors"."compassion_actions"("freeze_status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_reminder_state_idx" ON "qc_vendors"."compassion_actions"("reminder_state");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_restructuring_offer_status_idx" ON "qc_vendors"."compassion_actions"("restructuring_offer_status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_guarantor_charge_status_idx" ON "qc_vendors"."compassion_actions"("guarantor_charge_status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "compassion_actions_audit_log_id_idx" ON "qc_vendors"."compassion_actions"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "tenant_transfer_requests_status_idx" ON "qc_vendors"."tenant_transfer_requests"("status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "ledger_accounts_code_key" ON "qc_vendors"."ledger_accounts"("code");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "business_ledger_transaction_id_idx" ON "qc_vendors"."business_ledger"("transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "business_ledger_source_module_source_reference_idx" ON "qc_vendors"."business_ledger"("source_module", "source_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "business_ledger_reconciliation_reference_idx" ON "qc_vendors"."business_ledger"("reconciliation_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "business_ledger_reversed_entry_id_idx" ON "qc_vendors"."business_ledger"("reversed_entry_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "ledger_accounts_tenant_id_type_idx" ON "qc_vendors"."ledger_accounts"("tenant_id", "type");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_tenant_id_status_created_at_idx" ON "qc_vendors"."social_vouches"("tenant_id", "status", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_voucher_id_status_idx" ON "qc_vendors"."social_vouches"("voucher_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_vouchee_id_status_idx" ON "qc_vendors"."social_vouches"("vouchee_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_requester_id_idx" ON "qc_vendors"."social_vouches"("requester_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_discount_eligibility_state_idx" ON "qc_vendors"."social_vouches"("discount_eligibility_state");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_trust_network_visibility_idx" ON "qc_vendors"."social_vouches"("trust_network_visibility");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "social_vouches_audit_log_id_idx" ON "qc_vendors"."social_vouches"("audit_log_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "qc_vendors"."vouch_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_discount_eligibility_state_idx" ON "qc_vendors"."vouch_score_snapshots"("discount_eligibility_state");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "tenant_trust_policies_tenant_id_key" ON "qc_vendors"."tenant_trust_policies"("tenant_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "tenant_trust_policies_tenant_id_is_active_idx" ON "qc_vendors"."tenant_trust_policies"("tenant_id", "is_active");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_periods_tenant_id_period_start_period_end_key" ON "qc_vendors"."trust_rating_periods"("tenant_id", "period_start", "period_end");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_rating_periods_tenant_id_status_period_start_idx" ON "qc_vendors"."trust_rating_periods"("tenant_id", "status", "period_start");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_assignments_period_id_rater_id_ratee_id_rating_source_role_key" ON "qc_vendors"."trust_rating_assignments"("period_id", "rater_id", "ratee_id", "rating_source_role");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_tenant_id_status_due_at_idx" ON "qc_vendors"."trust_rating_assignments"("tenant_id", "status", "due_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_rater_id_status_idx" ON "qc_vendors"."trust_rating_assignments"("rater_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_ratee_id_status_idx" ON "qc_vendors"."trust_rating_assignments"("ratee_id", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_lockout_until_idx" ON "qc_vendors"."trust_rating_assignments"("lockout_until");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "qc_vendors"."trust_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_period_id_idx" ON "qc_vendors"."trust_score_snapshots"("period_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tier_after_idx" ON "qc_vendors"."trust_score_snapshots"("tier_after");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_low_rating_action_state_idx" ON "qc_vendors"."trust_score_snapshots"("low_rating_action_state");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_tier_audits_tenant_id_user_id_changed_at_idx" ON "qc_vendors"."trust_tier_audits"("tenant_id", "user_id", "changed_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_tier_audits_snapshot_id_idx" ON "qc_vendors"."trust_tier_audits"("snapshot_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "trust_tier_audits_previous_tier_new_tier_idx" ON "qc_vendors"."trust_tier_audits"("previous_tier", "new_tier");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE UNIQUE  INDEX "interest_audit_loan_id_key" ON "qc_vendors"."interest_audit"("loan_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "system_files_tenant_id_idx" ON "qc_vendors"."system_files"("tenant_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "system_files_uploader_id_idx" ON "qc_vendors"."system_files"("uploader_id");

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loans" ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey" FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."homepage_faqs" ADD CONSTRAINT "homepage_faqs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."feedback_entries" ADD CONSTRAINT "feedback_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."system_files" ADD CONSTRAINT "system_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."system_files" ADD CONSTRAINT "system_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."topup_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" public."WalletRequestType" NOT NULL DEFAULT 'deposit',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
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

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "topup_requests_tenant_id_request_type_status_idx" ON "qc_vendors"."topup_requests"("tenant_id", "request_type", "status");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "topup_requests_user_id_request_type_created_at_idx" ON "qc_vendors"."topup_requests"("user_id", "request_type", "created_at");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "topup_requests_reconciliation_reference_idx" ON "qc_vendors"."topup_requests"("reconciliation_reference");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "topup_requests_ledger_transaction_id_idx" ON "qc_vendors"."topup_requests"("ledger_transaction_id");

-- SCHEMA: qc_vendors
-- CreateIndex
CREATE  INDEX "topup_requests_issue_status_idx" ON "qc_vendors"."topup_requests"("issue_status");

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."topup_requests" ADD CONSTRAINT "topup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."topup_requests" ADD CONSTRAINT "topup_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- AddForeignKey
ALTER TABLE "qc_vendors"."topup_requests" ADD CONSTRAINT "topup_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: qc_vendors
-- ============================================================
-- DM-26: Notification Type Enum Update
-- Note: ALTER TYPE ADD VALUE applied only if not exists
-- ============================================================

-- New NotificationType values are added via migration only on fresh DBs.
-- init.sql always runs on a clean DB so we replace the full enum:

-- CreateEnum (replace full NotificationType — init.sql is always clean DB)
-- Note: Prisma will auto-generate the full enum;

-- SCHEMA: qc_vendors
-- CreateTable
CREATE TABLE "qc_vendors"."receipts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "receipt_number" VARCHAR(60) NOT NULL,
    "receipt_type" public."ReceiptType" NOT NULL,
    "status" public."ReceiptStatus" NOT NULL DEFAULT 'generated',
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

-- SCHEMA: qc_vendors
CREATE UNIQUE  INDEX "receipts_receipt_number_key" ON "qc_vendors"."receipts"("receipt_number");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_tenant_id_receipt_type_issued_at_idx" ON "qc_vendors"."receipts"("tenant_id", "receipt_type", "issued_at");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_user_id_issued_at_idx" ON "qc_vendors"."receipts"("user_id", "issued_at");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_receipt_number_idx" ON "qc_vendors"."receipts"("receipt_number");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_loan_id_idx" ON "qc_vendors"."receipts"("loan_id");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_payment_id_idx" ON "qc_vendors"."receipts"("payment_id");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_topup_request_id_idx" ON "qc_vendors"."receipts"("topup_request_id");

-- SCHEMA: qc_vendors
CREATE  INDEX "receipts_savings_transaction_id_idx" ON "qc_vendors"."receipts"("savings_transaction_id");

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" public."Role" NOT NULL DEFAULT 'member',
    "status" public."UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" public."InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent_accepted_at" TIMESTAMP(3),
    "consent_version" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" public."MaritalStatus" DEFAULT 'single',
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type" public."DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" TEXT NOT NULL,
    "verification_status" public."VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    "allowed_frequencies" public."RepaymentFrequency"[] DEFAULT ARRAY['monthly']::public."RepaymentFrequency"[],
    "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."loans" (
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
    "status" public."LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "repayment_frequency" public."RepaymentFrequency" NOT NULL DEFAULT 'monthly',
    "recovery_parent_loan_id" INTEGER,
    "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" public."ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" public."AccountType" NOT NULL,
    "owner_role" public."Role",
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(255),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type" public."TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'verified',
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "actor_role" public."Role",
    "actor_label" VARCHAR(150),
    "module" public."AuditModule" NOT NULL DEFAULT 'system',
    "action" VARCHAR(100) NOT NULL,
    "action_category" public."AuditActionCategory" NOT NULL DEFAULT 'other',
    "severity" public."AuditSeverity" NOT NULL DEFAULT 'info',
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" public."ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" public."ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
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
    "resolution_action" public."ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" public."DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
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
    "resolution_action" public."ImbalanceResolutionAction",
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."traffic_logs" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."interaction_logs" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."homepage_faqs" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."homepage_testimonials" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "feedback_type" public."FeedbackType" NOT NULL DEFAULT 'general',
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
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
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."support_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "tenant_id" INTEGER,
    "requester_id" INTEGER,
    "feedback_entry_id" INTEGER,
    "category" public."SupportTicketCategory" NOT NULL,
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
    "status" public."SupportTicketStatus" NOT NULL DEFAULT 'open',
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."messages" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" public."ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" public."MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emoji" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" public."NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "channel" public."NotificationChannel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."tenant_transfer_requests" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_content" TEXT NOT NULL,

    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" public."GuaranteeStatus" NOT NULL DEFAULT 'pending',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "action_type" public."CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" public."CompassionStatus" NOT NULL DEFAULT 'pending',
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
    "freeze_status" public."CompassionFreezeStatus" NOT NULL DEFAULT 'none',
    "reminder_state" public."CompassionReminderState" NOT NULL DEFAULT 'not_started',
    "reminder_sent_at" TIMESTAMP(3),
    "restructuring_offer_status" public."RestructuringOfferStatus" NOT NULL DEFAULT 'not_offered',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" public."LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."social_vouches" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."vouch_score_snapshots" (
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

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."tenant_trust_policies" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_trust_policies_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."trust_rating_periods" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_periods_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."trust_rating_assignments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "rating_source_role" public."Role" NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_assignments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."trust_score_snapshots" (
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
    "tier_before" public."InterestTier",
    "tier_after" public."InterestTier" NOT NULL,
    "low_rating_action_state" "LowRatingActionState" NOT NULL DEFAULT 'none',
    "low_rating_reason" VARCHAR(255),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."trust_tier_audits" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "snapshot_id" INTEGER,
    "previous_tier" public."InterestTier",
    "new_tier" public."InterestTier" NOT NULL,
    "score" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_tier_audits_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."system_files" (
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

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "users_email_tenant_id_key" ON "makati_business"."users"("email", "tenant_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "users_username_tenant_id_key" ON "makati_business"."users"("username", "tenant_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "users_member_code_tenant_id_key" ON "makati_business"."users"("member_code", "tenant_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "user_profiles_user_id_key" ON "makati_business"."user_profiles"("user_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_auth_user_id_key" ON "makati_business"."two_factor_auth"("user_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "loans_loan_reference_key" ON "makati_business"."loans"("loan_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "payments_payment_reference_key" ON "makati_business"."payments"("payment_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "savings_accounts_user_id_account_type_key" ON "makati_business"."savings_accounts"("user_id", "account_type");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_account_type_idx" ON "makati_business"."savings_accounts"("tenant_id", "account_type");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_owner_role_idx" ON "makati_business"."savings_accounts"("tenant_id", "owner_role");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "savings_transactions_account_id_status_processed_at_idx" ON "makati_business"."savings_transactions"("account_id", "status", "processed_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "savings_transactions_reconciliation_reference_idx" ON "makati_business"."savings_transactions"("reconciliation_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "savings_transactions_ledger_transaction_id_idx" ON "makati_business"."savings_transactions"("ledger_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "savings_transactions_issue_status_idx" ON "makati_business"."savings_transactions"("issue_status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_tenant_id_module_created_at_idx" ON "makati_business"."audit_logs"("tenant_id", "module", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_user_id_created_at_idx" ON "makati_business"."audit_logs"("user_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_entity_type_entity_id_idx" ON "makati_business"."audit_logs"("entity_type", "entity_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_entity_ref_idx" ON "makati_business"."audit_logs"("entity_ref");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_action_category_severity_idx" ON "makati_business"."audit_logs"("action_category", "severity");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_request_id_idx" ON "makati_business"."audit_logs"("request_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_session_id_idx" ON "makati_business"."audit_logs"("session_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "audit_logs_is_cross_tenant_visible_created_at_idx" ON "makati_business"."audit_logs"("is_cross_tenant_visible", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "makati_business"."imbalance_investigations"("tenant_id", "status", "detected_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "makati_business"."imbalance_investigations"("source_module", "source_entity_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_assigned_to_status_idx" ON "makati_business"."imbalance_investigations"("assigned_to", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_reconciliation_reference_idx" ON "makati_business"."imbalance_investigations"("reconciliation_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "makati_business"."imbalance_investigations"("related_ledger_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "makati_business"."imbalance_investigations"("related_wallet_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_topup_request_id_idx" ON "makati_business"."imbalance_investigations"("related_topup_request_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_loan_id_idx" ON "makati_business"."imbalance_investigations"("related_loan_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_payment_id_idx" ON "makati_business"."imbalance_investigations"("related_payment_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "imbalance_investigations_audit_log_id_idx" ON "makati_business"."imbalance_investigations"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_reconciliation_reference_key" ON "makati_business"."daily_reconciliations"("reconciliation_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_tenant_id_business_date_key" ON "makati_business"."daily_reconciliations"("tenant_id", "business_date");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "makati_business"."daily_reconciliations"("tenant_id", "status", "business_date");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "makati_business"."daily_reconciliations"("imbalance_investigation_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_resolution_reference_idx" ON "makati_business"."daily_reconciliations"("resolution_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "makati_business"."daily_reconciliations"("adjustment_ledger_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_audit_log_id_idx" ON "makati_business"."daily_reconciliations"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_signed_off_by_idx" ON "makati_business"."daily_reconciliations"("signed_off_by");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "daily_reconciliations_approved_by_idx" ON "makati_business"."daily_reconciliations"("approved_by");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "traffic_logs_tenant_id_created_at_idx" ON "makati_business"."traffic_logs"("tenant_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "makati_business"."interaction_logs"("tenant_id", "event_type", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx" ON "makati_business"."homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx" ON "makati_business"."homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_tenant_id_status_created_at_idx" ON "makati_business"."feedback_entries"("tenant_id", "status", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_user_id_created_at_idx" ON "makati_business"."feedback_entries"("user_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_feedback_type_module_context_idx" ON "makati_business"."feedback_entries"("feedback_type", "module_context");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_related_entity_type_related_entity_id_idx" ON "makati_business"."feedback_entries"("related_entity_type", "related_entity_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_wallet_transaction_id_idx" ON "makati_business"."feedback_entries"("wallet_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_loan_id_idx" ON "makati_business"."feedback_entries"("loan_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_payment_id_idx" ON "makati_business"."feedback_entries"("payment_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_topup_request_id_idx" ON "makati_business"."feedback_entries"("topup_request_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_support_ticket_id_idx" ON "makati_business"."feedback_entries"("support_ticket_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_assigned_to_status_idx" ON "makati_business"."feedback_entries"("assigned_to", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_priority_status_idx" ON "makati_business"."feedback_entries"("priority", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "feedback_entries_audit_log_id_idx" ON "makati_business"."feedback_entries"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "support_tickets_ticket_number_key" ON "makati_business"."support_tickets"("ticket_number");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_tenant_id_status_priority_created_at_idx" ON "makati_business"."support_tickets"("tenant_id", "status", "priority", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_requester_id_created_at_idx" ON "makati_business"."support_tickets"("requester_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_feedback_entry_id_idx" ON "makati_business"."support_tickets"("feedback_entry_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_category_status_idx" ON "makati_business"."support_tickets"("category", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_module_context_status_idx" ON "makati_business"."support_tickets"("module_context", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_related_entity_type_related_entity_id_idx" ON "makati_business"."support_tickets"("related_entity_type", "related_entity_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_wallet_transaction_id_idx" ON "makati_business"."support_tickets"("wallet_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_loan_id_idx" ON "makati_business"."support_tickets"("loan_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_payment_id_idx" ON "makati_business"."support_tickets"("payment_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_topup_request_id_idx" ON "makati_business"."support_tickets"("topup_request_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_assigned_to_status_idx" ON "makati_business"."support_tickets"("assigned_to", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "support_tickets_audit_log_id_idx" ON "makati_business"."support_tickets"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_token_key" ON "makati_business"."verification_tokens"("token");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "verification_tokens_tenant_id_email_idx" ON "makati_business"."verification_tokens"("tenant_id", "email");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_tenant_id_email_token_key" ON "makati_business"."verification_tokens"("tenant_id", "email", "token");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_token_key" ON "makati_business"."two_factor_tokens"("token");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "two_factor_tokens_tenant_id_email_idx" ON "makati_business"."two_factor_tokens"("tenant_id", "email");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_tenant_id_email_token_key" ON "makati_business"."two_factor_tokens"("tenant_id", "email", "token");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_token_key" ON "makati_business"."password_reset_tokens"("token");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "password_reset_tokens_tenant_id_email_idx" ON "makati_business"."password_reset_tokens"("tenant_id", "email");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_tenant_id_email_token_key" ON "makati_business"."password_reset_tokens"("tenant_id", "email", "token");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "messages_conversation_id_created_at_idx" ON "makati_business"."messages"("conversation_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "conversations_tenant_id_type_updated_at_idx" ON "makati_business"."conversations"("tenant_id", "type", "updated_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "conversations_tenant_id_type_slug_key" ON "makati_business"."conversations"("tenant_id", "type", "slug");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "conversation_participants_user_id_last_read_at_idx" ON "makati_business"."conversation_participants"("user_id", "last_read_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "conversation_participants_conversation_id_user_id_key" ON "makati_business"."conversation_participants"("conversation_id", "user_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "makati_business"."mentorship_connections"("tenant_id", "status", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "makati_business"."mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "message_attachments_message_id_created_at_idx" ON "makati_business"."message_attachments"("message_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "message_reactions_user_id_created_at_idx" ON "makati_business"."message_reactions"("user_id", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "message_reactions_message_id_user_id_emoji_key" ON "makati_business"."message_reactions"("message_id", "user_id", "emoji");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "notifications_user_id_is_read_created_at_idx" ON "makati_business"."notifications"("user_id", "is_read", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "notifications_tenant_id_type_created_at_idx" ON "makati_business"."notifications"("tenant_id", "type", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "loan_guarantees_loan_id_status_idx" ON "makati_business"."loan_guarantees"("loan_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "loan_guarantees_guarantor_id_status_idx" ON "makati_business"."loan_guarantees"("guarantor_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "loan_guarantees_notification_id_idx" ON "makati_business"."loan_guarantees"("notification_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "loan_guarantees_audit_log_id_idx" ON "makati_business"."loan_guarantees"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "makati_business"."loan_guarantees"("reassigned_to_guarantee_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_loan_id_status_idx" ON "makati_business"."compassion_actions"("loan_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_requested_by_status_idx" ON "makati_business"."compassion_actions"("requested_by", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_approved_by_idx" ON "makati_business"."compassion_actions"("approved_by");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_freeze_status_idx" ON "makati_business"."compassion_actions"("freeze_status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_reminder_state_idx" ON "makati_business"."compassion_actions"("reminder_state");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_restructuring_offer_status_idx" ON "makati_business"."compassion_actions"("restructuring_offer_status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_guarantor_charge_status_idx" ON "makati_business"."compassion_actions"("guarantor_charge_status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "compassion_actions_audit_log_id_idx" ON "makati_business"."compassion_actions"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "tenant_transfer_requests_status_idx" ON "makati_business"."tenant_transfer_requests"("status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "ledger_accounts_code_key" ON "makati_business"."ledger_accounts"("code");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "business_ledger_transaction_id_idx" ON "makati_business"."business_ledger"("transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "business_ledger_source_module_source_reference_idx" ON "makati_business"."business_ledger"("source_module", "source_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "business_ledger_reconciliation_reference_idx" ON "makati_business"."business_ledger"("reconciliation_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "business_ledger_reversed_entry_id_idx" ON "makati_business"."business_ledger"("reversed_entry_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "ledger_accounts_tenant_id_type_idx" ON "makati_business"."ledger_accounts"("tenant_id", "type");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_tenant_id_status_created_at_idx" ON "makati_business"."social_vouches"("tenant_id", "status", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_voucher_id_status_idx" ON "makati_business"."social_vouches"("voucher_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_vouchee_id_status_idx" ON "makati_business"."social_vouches"("vouchee_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_requester_id_idx" ON "makati_business"."social_vouches"("requester_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_discount_eligibility_state_idx" ON "makati_business"."social_vouches"("discount_eligibility_state");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_trust_network_visibility_idx" ON "makati_business"."social_vouches"("trust_network_visibility");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "social_vouches_audit_log_id_idx" ON "makati_business"."social_vouches"("audit_log_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "makati_business"."vouch_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_discount_eligibility_state_idx" ON "makati_business"."vouch_score_snapshots"("discount_eligibility_state");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "tenant_trust_policies_tenant_id_key" ON "makati_business"."tenant_trust_policies"("tenant_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "tenant_trust_policies_tenant_id_is_active_idx" ON "makati_business"."tenant_trust_policies"("tenant_id", "is_active");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_periods_tenant_id_period_start_period_end_key" ON "makati_business"."trust_rating_periods"("tenant_id", "period_start", "period_end");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_rating_periods_tenant_id_status_period_start_idx" ON "makati_business"."trust_rating_periods"("tenant_id", "status", "period_start");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_assignments_period_id_rater_id_ratee_id_rating_source_role_key" ON "makati_business"."trust_rating_assignments"("period_id", "rater_id", "ratee_id", "rating_source_role");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_tenant_id_status_due_at_idx" ON "makati_business"."trust_rating_assignments"("tenant_id", "status", "due_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_rater_id_status_idx" ON "makati_business"."trust_rating_assignments"("rater_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_ratee_id_status_idx" ON "makati_business"."trust_rating_assignments"("ratee_id", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_lockout_until_idx" ON "makati_business"."trust_rating_assignments"("lockout_until");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "makati_business"."trust_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_period_id_idx" ON "makati_business"."trust_score_snapshots"("period_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tier_after_idx" ON "makati_business"."trust_score_snapshots"("tier_after");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_low_rating_action_state_idx" ON "makati_business"."trust_score_snapshots"("low_rating_action_state");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_tier_audits_tenant_id_user_id_changed_at_idx" ON "makati_business"."trust_tier_audits"("tenant_id", "user_id", "changed_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_tier_audits_snapshot_id_idx" ON "makati_business"."trust_tier_audits"("snapshot_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "trust_tier_audits_previous_tier_new_tier_idx" ON "makati_business"."trust_tier_audits"("previous_tier", "new_tier");

-- SCHEMA: makati_business
-- CreateIndex
CREATE UNIQUE  INDEX "interest_audit_loan_id_key" ON "makati_business"."interest_audit"("loan_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "system_files_tenant_id_idx" ON "makati_business"."system_files"("tenant_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "system_files_uploader_id_idx" ON "makati_business"."system_files"("uploader_id");

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loans" ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey" FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."homepage_faqs" ADD CONSTRAINT "homepage_faqs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."feedback_entries" ADD CONSTRAINT "feedback_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."system_files" ADD CONSTRAINT "system_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."system_files" ADD CONSTRAINT "system_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."topup_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" public."WalletRequestType" NOT NULL DEFAULT 'deposit',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
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

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "topup_requests_tenant_id_request_type_status_idx" ON "makati_business"."topup_requests"("tenant_id", "request_type", "status");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "topup_requests_user_id_request_type_created_at_idx" ON "makati_business"."topup_requests"("user_id", "request_type", "created_at");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "topup_requests_reconciliation_reference_idx" ON "makati_business"."topup_requests"("reconciliation_reference");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "topup_requests_ledger_transaction_id_idx" ON "makati_business"."topup_requests"("ledger_transaction_id");

-- SCHEMA: makati_business
-- CreateIndex
CREATE  INDEX "topup_requests_issue_status_idx" ON "makati_business"."topup_requests"("issue_status");

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."topup_requests" ADD CONSTRAINT "topup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."topup_requests" ADD CONSTRAINT "topup_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- AddForeignKey
ALTER TABLE "makati_business"."topup_requests" ADD CONSTRAINT "topup_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: makati_business
-- ============================================================
-- DM-26: Notification Type Enum Update
-- Note: ALTER TYPE ADD VALUE applied only if not exists
-- ============================================================

-- New NotificationType values are added via migration only on fresh DBs.
-- init.sql always runs on a clean DB so we replace the full enum:

-- CreateEnum (replace full NotificationType — init.sql is always clean DB)
-- Note: Prisma will auto-generate the full enum;

-- SCHEMA: makati_business
-- CreateTable
CREATE TABLE "makati_business"."receipts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "receipt_number" VARCHAR(60) NOT NULL,
    "receipt_type" public."ReceiptType" NOT NULL,
    "status" public."ReceiptStatus" NOT NULL DEFAULT 'generated',
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

-- SCHEMA: makati_business
CREATE UNIQUE  INDEX "receipts_receipt_number_key" ON "makati_business"."receipts"("receipt_number");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_tenant_id_receipt_type_issued_at_idx" ON "makati_business"."receipts"("tenant_id", "receipt_type", "issued_at");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_user_id_issued_at_idx" ON "makati_business"."receipts"("user_id", "issued_at");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_receipt_number_idx" ON "makati_business"."receipts"("receipt_number");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_loan_id_idx" ON "makati_business"."receipts"("loan_id");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_payment_id_idx" ON "makati_business"."receipts"("payment_id");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_topup_request_id_idx" ON "makati_business"."receipts"("topup_request_id");

-- SCHEMA: makati_business
CREATE  INDEX "receipts_savings_transaction_id_idx" ON "makati_business"."receipts"("savings_transaction_id");

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."users" (
    "user_id" SERIAL NOT NULL,
    "member_code" VARCHAR(20),
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(20),
    "password_hash" VARCHAR(255) NOT NULL,
    "tenant_id" INTEGER,
    "role" public."Role" NOT NULL DEFAULT 'member',
    "status" public."UserStatus" NOT NULL DEFAULT 'pending',
    "interest_tier" public."InterestTier" NOT NULL DEFAULT 'T1_5_PERCENT',
    "is_deactivation_locked" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "consent_accepted_at" TIMESTAMP(3),
    "consent_version" VARCHAR(20),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "gender" VARCHAR(20),
    "birthdate" DATE,
    "address" TEXT,
    "business_name" VARCHAR(150),
    "marital_status" public."MaritalStatus" DEFAULT 'single',
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."user_documents" (
    "document_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_type" public."DocumentType" NOT NULL,
    "id_type_name" VARCHAR(100),
    "file_url" TEXT NOT NULL,
    "verification_status" public."VerificationStatus" NOT NULL DEFAULT 'pending',
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("document_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."two_factor_auth" (
    "tfa_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "totp_secret" VARCHAR(255) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "recovery_codes" TEXT,

    CONSTRAINT "two_factor_auth_pkey" PRIMARY KEY ("tfa_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."loan_products" (
    "product_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "min_amount" DECIMAL(15,2) NOT NULL,
    "max_amount" DECIMAL(15,2) NOT NULL,
    "interest_rate_percent" DECIMAL(5,2) NOT NULL,
    "max_term_months" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,
    "allowed_frequencies" public."RepaymentFrequency"[] DEFAULT ARRAY['monthly']::public."RepaymentFrequency"[],
    "guarantor_liability_rate" DECIMAL(5,2) NOT NULL DEFAULT 25,

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("product_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."loans" (
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
    "status" public."LoanStatus" NOT NULL DEFAULT 'pending',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "approved_by" INTEGER,
    "repayment_frequency" public."RepaymentFrequency" NOT NULL DEFAULT 'monthly',
    "recovery_parent_loan_id" INTEGER,
    "is_recovery_loan" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "loans_pkey" PRIMARY KEY ("loan_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."loan_schedules" (
    "schedule_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment_number" INTEGER NOT NULL,
    "due_date" DATE NOT NULL,
    "principal_amount" DECIMAL(15,2) NOT NULL,
    "interest_amount" DECIMAL(15,2) NOT NULL,
    "total_due" DECIMAL(15,2) NOT NULL,
    "status" public."ScheduleStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "days_late" INTEGER NOT NULL DEFAULT 0,
    "penalty_applied" DECIMAL(15,2) NOT NULL DEFAULT 0,

    CONSTRAINT "loan_schedules_pkey" PRIMARY KEY ("schedule_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."payment_methods" (
    "method_id" SERIAL NOT NULL,
    "provider_name" VARCHAR(100) NOT NULL,
    "account_number" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tenant_id" INTEGER NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("method_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."payments" (
    "payment_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "method_id" INTEGER NOT NULL,
    "payment_reference" VARCHAR(100) NOT NULL,
    "amount_paid" DECIMAL(15,2) NOT NULL,
    "receipt_url" VARCHAR(255),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "verified_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."savings_accounts" (
    "account_id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_type" public."AccountType" NOT NULL,
    "owner_role" public."Role",
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(255),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_accounts_pkey" PRIMARY KEY ("account_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."savings_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "transaction_type" public."TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'verified',
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."audit_logs" (
    "log_id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "actor_role" public."Role",
    "actor_label" VARCHAR(150),
    "module" public."AuditModule" NOT NULL DEFAULT 'system',
    "action" VARCHAR(100) NOT NULL,
    "action_category" public."AuditActionCategory" NOT NULL DEFAULT 'other',
    "severity" public."AuditSeverity" NOT NULL DEFAULT 'info',
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."imbalance_investigations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "source_module" public."ImbalanceSourceModule" NOT NULL,
    "source_entity_type" VARCHAR(80),
    "source_entity_id" VARCHAR(120),
    "expected_amount" DECIMAL(15,2) NOT NULL,
    "actual_amount" DECIMAL(15,2) NOT NULL,
    "difference_amount" DECIMAL(15,2) NOT NULL,
    "status" public."ImbalanceInvestigationStatus" NOT NULL DEFAULT 'detected',
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
    "resolution_action" public."ImbalanceResolutionAction",
    "adjustment_ledger_transaction_id" TEXT,
    "adjustment_savings_transaction_id" INTEGER,
    "audit_log_id" INTEGER,
    "notes" TEXT,
    "resolution_notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imbalance_investigations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."daily_reconciliations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "business_date" DATE NOT NULL,
    "status" public."DailyReconciliationStatus" NOT NULL DEFAULT 'draft',
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
    "resolution_action" public."ImbalanceResolutionAction",
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reconciliations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."traffic_logs" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."interaction_logs" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."homepage_faqs" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."homepage_testimonials" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."feedback_entries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "category" VARCHAR(100) NOT NULL,
    "feedback_type" public."FeedbackType" NOT NULL DEFAULT 'general',
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
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
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."support_tickets" (
    "id" SERIAL NOT NULL,
    "ticket_number" VARCHAR(50) NOT NULL,
    "tenant_id" INTEGER,
    "requester_id" INTEGER,
    "feedback_entry_id" INTEGER,
    "category" public."SupportTicketCategory" NOT NULL,
    "module_context" public."FeedbackModule" NOT NULL DEFAULT 'general',
    "status" public."SupportTicketStatus" NOT NULL DEFAULT 'open',
    "priority" public."SupportPriority" NOT NULL DEFAULT 'normal',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."verification_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."two_factor_tokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "tenant_id" INTEGER,

    CONSTRAINT "two_factor_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."messages" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."conversations" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "type" public."ConversationType" NOT NULL,
    "title" VARCHAR(150),
    "slug" VARCHAR(100),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."mentorship_connections" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "mentor_id" INTEGER NOT NULL,
    "endorsed_by" INTEGER,
    "status" public."MentorshipStatus" NOT NULL DEFAULT 'pending_endorsement',
    "focus_area" VARCHAR(150),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endorsed_at" TIMESTAMP(3),

    CONSTRAINT "mentorship_connections_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."message_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_attachments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."message_reactions" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "emoji" VARCHAR(24) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER,
    "user_id" INTEGER NOT NULL,
    "type" public."NotificationType" NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "body" TEXT NOT NULL,
    "action_url" VARCHAR(255),
    "channel" public."NotificationChannel" NOT NULL DEFAULT 'in_app',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "emailed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."tenant_transfer_requests" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."decommissioned_backups" (
    "id" TEXT NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "file_url" VARCHAR(255) NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot_content" TEXT NOT NULL,

    CONSTRAINT "decommissioned_backups_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."loan_guarantees" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "guarantor_id" INTEGER NOT NULL,
    "status" public."GuaranteeStatus" NOT NULL DEFAULT 'pending',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loan_guarantees_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."compassion_actions" (
    "action_id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "action_type" public."CompassionActionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" public."CompassionStatus" NOT NULL DEFAULT 'pending',
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
    "freeze_status" public."CompassionFreezeStatus" NOT NULL DEFAULT 'none',
    "reminder_state" public."CompassionReminderState" NOT NULL DEFAULT 'not_started',
    "reminder_sent_at" TIMESTAMP(3),
    "restructuring_offer_status" public."RestructuringOfferStatus" NOT NULL DEFAULT 'not_offered',
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compassion_actions_pkey" PRIMARY KEY ("action_id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."business_ledger" (
    "id" SERIAL NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."ledger_accounts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "type" public."LedgerAccountType" NOT NULL,
    "tenant_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."social_vouches" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_vouches_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."vouch_score_snapshots" (
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

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."tenant_trust_policies" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_trust_policies_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."trust_rating_periods" (
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_periods_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."trust_rating_assignments" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "rater_id" INTEGER NOT NULL,
    "ratee_id" INTEGER NOT NULL,
    "rating_source_role" public."Role" NOT NULL,
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
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_rating_assignments_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."trust_score_snapshots" (
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
    "tier_before" public."InterestTier",
    "tier_after" public."InterestTier" NOT NULL,
    "low_rating_action_state" "LowRatingActionState" NOT NULL DEFAULT 'none',
    "low_rating_reason" VARCHAR(255),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_score_snapshots_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."trust_tier_audits" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "snapshot_id" INTEGER,
    "previous_tier" public."InterestTier",
    "new_tier" public."InterestTier" NOT NULL,
    "score" INTEGER NOT NULL,
    "change_reason" VARCHAR(255) NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "trust_tier_audits_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."interest_audit" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "formula_snapshot" JSONB NOT NULL,
    "rate_applied" DECIMAL(5,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_audit_pkey" PRIMARY KEY ("id")
);

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."system_files" (
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

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "users_email_tenant_id_key" ON "calamba_agri"."users"("email", "tenant_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "users_username_tenant_id_key" ON "calamba_agri"."users"("username", "tenant_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "users_member_code_tenant_id_key" ON "calamba_agri"."users"("member_code", "tenant_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "user_profiles_user_id_key" ON "calamba_agri"."user_profiles"("user_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_auth_user_id_key" ON "calamba_agri"."two_factor_auth"("user_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "loans_loan_reference_key" ON "calamba_agri"."loans"("loan_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "payments_payment_reference_key" ON "calamba_agri"."payments"("payment_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "savings_accounts_user_id_account_type_key" ON "calamba_agri"."savings_accounts"("user_id", "account_type");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_account_type_idx" ON "calamba_agri"."savings_accounts"("tenant_id", "account_type");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "savings_accounts_tenant_id_owner_role_idx" ON "calamba_agri"."savings_accounts"("tenant_id", "owner_role");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "savings_transactions_account_id_status_processed_at_idx" ON "calamba_agri"."savings_transactions"("account_id", "status", "processed_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "savings_transactions_reconciliation_reference_idx" ON "calamba_agri"."savings_transactions"("reconciliation_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "savings_transactions_ledger_transaction_id_idx" ON "calamba_agri"."savings_transactions"("ledger_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "savings_transactions_issue_status_idx" ON "calamba_agri"."savings_transactions"("issue_status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_tenant_id_module_created_at_idx" ON "calamba_agri"."audit_logs"("tenant_id", "module", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_user_id_created_at_idx" ON "calamba_agri"."audit_logs"("user_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_entity_type_entity_id_idx" ON "calamba_agri"."audit_logs"("entity_type", "entity_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_entity_ref_idx" ON "calamba_agri"."audit_logs"("entity_ref");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_action_category_severity_idx" ON "calamba_agri"."audit_logs"("action_category", "severity");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_request_id_idx" ON "calamba_agri"."audit_logs"("request_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_session_id_idx" ON "calamba_agri"."audit_logs"("session_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "audit_logs_is_cross_tenant_visible_created_at_idx" ON "calamba_agri"."audit_logs"("is_cross_tenant_visible", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_tenant_id_status_detected_at_idx" ON "calamba_agri"."imbalance_investigations"("tenant_id", "status", "detected_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_source_module_source_entity_id_idx" ON "calamba_agri"."imbalance_investigations"("source_module", "source_entity_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_assigned_to_status_idx" ON "calamba_agri"."imbalance_investigations"("assigned_to", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_reconciliation_reference_idx" ON "calamba_agri"."imbalance_investigations"("reconciliation_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_ledger_transaction_id_idx" ON "calamba_agri"."imbalance_investigations"("related_ledger_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_wallet_transaction_id_idx" ON "calamba_agri"."imbalance_investigations"("related_wallet_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_topup_request_id_idx" ON "calamba_agri"."imbalance_investigations"("related_topup_request_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_loan_id_idx" ON "calamba_agri"."imbalance_investigations"("related_loan_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_related_payment_id_idx" ON "calamba_agri"."imbalance_investigations"("related_payment_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "imbalance_investigations_audit_log_id_idx" ON "calamba_agri"."imbalance_investigations"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_reconciliation_reference_key" ON "calamba_agri"."daily_reconciliations"("reconciliation_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "daily_reconciliations_tenant_id_business_date_key" ON "calamba_agri"."daily_reconciliations"("tenant_id", "business_date");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_tenant_id_status_business_date_idx" ON "calamba_agri"."daily_reconciliations"("tenant_id", "status", "business_date");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_imbalance_investigation_id_idx" ON "calamba_agri"."daily_reconciliations"("imbalance_investigation_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_resolution_reference_idx" ON "calamba_agri"."daily_reconciliations"("resolution_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_adjustment_ledger_transaction_id_idx" ON "calamba_agri"."daily_reconciliations"("adjustment_ledger_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_audit_log_id_idx" ON "calamba_agri"."daily_reconciliations"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_signed_off_by_idx" ON "calamba_agri"."daily_reconciliations"("signed_off_by");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "daily_reconciliations_approved_by_idx" ON "calamba_agri"."daily_reconciliations"("approved_by");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "traffic_logs_tenant_id_created_at_idx" ON "calamba_agri"."traffic_logs"("tenant_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "interaction_logs_tenant_id_event_type_created_at_idx" ON "calamba_agri"."interaction_logs"("tenant_id", "event_type", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "homepage_faqs_tenant_id_workflow_status_is_active_sort_orde_idx" ON "calamba_agri"."homepage_faqs"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "homepage_testimonials_tenant_id_workflow_status_is_active_s_idx" ON "calamba_agri"."homepage_testimonials"("tenant_id", "workflow_status", "is_active", "sort_order");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_tenant_id_status_created_at_idx" ON "calamba_agri"."feedback_entries"("tenant_id", "status", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_user_id_created_at_idx" ON "calamba_agri"."feedback_entries"("user_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_feedback_type_module_context_idx" ON "calamba_agri"."feedback_entries"("feedback_type", "module_context");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_related_entity_type_related_entity_id_idx" ON "calamba_agri"."feedback_entries"("related_entity_type", "related_entity_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_wallet_transaction_id_idx" ON "calamba_agri"."feedback_entries"("wallet_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_loan_id_idx" ON "calamba_agri"."feedback_entries"("loan_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_payment_id_idx" ON "calamba_agri"."feedback_entries"("payment_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_topup_request_id_idx" ON "calamba_agri"."feedback_entries"("topup_request_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_support_ticket_id_idx" ON "calamba_agri"."feedback_entries"("support_ticket_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_assigned_to_status_idx" ON "calamba_agri"."feedback_entries"("assigned_to", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_priority_status_idx" ON "calamba_agri"."feedback_entries"("priority", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "feedback_entries_audit_log_id_idx" ON "calamba_agri"."feedback_entries"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "support_tickets_ticket_number_key" ON "calamba_agri"."support_tickets"("ticket_number");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_tenant_id_status_priority_created_at_idx" ON "calamba_agri"."support_tickets"("tenant_id", "status", "priority", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_requester_id_created_at_idx" ON "calamba_agri"."support_tickets"("requester_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_feedback_entry_id_idx" ON "calamba_agri"."support_tickets"("feedback_entry_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_category_status_idx" ON "calamba_agri"."support_tickets"("category", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_module_context_status_idx" ON "calamba_agri"."support_tickets"("module_context", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_related_entity_type_related_entity_id_idx" ON "calamba_agri"."support_tickets"("related_entity_type", "related_entity_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_wallet_transaction_id_idx" ON "calamba_agri"."support_tickets"("wallet_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_loan_id_idx" ON "calamba_agri"."support_tickets"("loan_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_payment_id_idx" ON "calamba_agri"."support_tickets"("payment_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_topup_request_id_idx" ON "calamba_agri"."support_tickets"("topup_request_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_assigned_to_status_idx" ON "calamba_agri"."support_tickets"("assigned_to", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "support_tickets_audit_log_id_idx" ON "calamba_agri"."support_tickets"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_token_key" ON "calamba_agri"."verification_tokens"("token");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "verification_tokens_tenant_id_email_idx" ON "calamba_agri"."verification_tokens"("tenant_id", "email");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "verification_tokens_tenant_id_email_token_key" ON "calamba_agri"."verification_tokens"("tenant_id", "email", "token");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_token_key" ON "calamba_agri"."two_factor_tokens"("token");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "two_factor_tokens_tenant_id_email_idx" ON "calamba_agri"."two_factor_tokens"("tenant_id", "email");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "two_factor_tokens_tenant_id_email_token_key" ON "calamba_agri"."two_factor_tokens"("tenant_id", "email", "token");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_token_key" ON "calamba_agri"."password_reset_tokens"("token");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "password_reset_tokens_tenant_id_email_idx" ON "calamba_agri"."password_reset_tokens"("tenant_id", "email");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "password_reset_tokens_tenant_id_email_token_key" ON "calamba_agri"."password_reset_tokens"("tenant_id", "email", "token");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "messages_conversation_id_created_at_idx" ON "calamba_agri"."messages"("conversation_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "conversations_tenant_id_type_updated_at_idx" ON "calamba_agri"."conversations"("tenant_id", "type", "updated_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "conversations_tenant_id_type_slug_key" ON "calamba_agri"."conversations"("tenant_id", "type", "slug");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "conversation_participants_user_id_last_read_at_idx" ON "calamba_agri"."conversation_participants"("user_id", "last_read_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "conversation_participants_conversation_id_user_id_key" ON "calamba_agri"."conversation_participants"("conversation_id", "user_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "mentorship_connections_tenant_id_status_created_at_idx" ON "calamba_agri"."mentorship_connections"("tenant_id", "status", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "mentorship_connections_tenant_id_requester_id_mentor_id_key" ON "calamba_agri"."mentorship_connections"("tenant_id", "requester_id", "mentor_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "message_attachments_message_id_created_at_idx" ON "calamba_agri"."message_attachments"("message_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "message_reactions_user_id_created_at_idx" ON "calamba_agri"."message_reactions"("user_id", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "message_reactions_message_id_user_id_emoji_key" ON "calamba_agri"."message_reactions"("message_id", "user_id", "emoji");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "notifications_user_id_is_read_created_at_idx" ON "calamba_agri"."notifications"("user_id", "is_read", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "notifications_tenant_id_type_created_at_idx" ON "calamba_agri"."notifications"("tenant_id", "type", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "loan_guarantees_loan_id_status_idx" ON "calamba_agri"."loan_guarantees"("loan_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "loan_guarantees_guarantor_id_status_idx" ON "calamba_agri"."loan_guarantees"("guarantor_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "loan_guarantees_notification_id_idx" ON "calamba_agri"."loan_guarantees"("notification_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "loan_guarantees_audit_log_id_idx" ON "calamba_agri"."loan_guarantees"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "loan_guarantees_reassigned_to_guarantee_id_idx" ON "calamba_agri"."loan_guarantees"("reassigned_to_guarantee_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_loan_id_status_idx" ON "calamba_agri"."compassion_actions"("loan_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_requested_by_status_idx" ON "calamba_agri"."compassion_actions"("requested_by", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_approved_by_idx" ON "calamba_agri"."compassion_actions"("approved_by");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_freeze_status_idx" ON "calamba_agri"."compassion_actions"("freeze_status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_reminder_state_idx" ON "calamba_agri"."compassion_actions"("reminder_state");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_restructuring_offer_status_idx" ON "calamba_agri"."compassion_actions"("restructuring_offer_status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_guarantor_charge_status_idx" ON "calamba_agri"."compassion_actions"("guarantor_charge_status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "compassion_actions_audit_log_id_idx" ON "calamba_agri"."compassion_actions"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "tenant_transfer_requests_status_idx" ON "calamba_agri"."tenant_transfer_requests"("status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "ledger_accounts_code_key" ON "calamba_agri"."ledger_accounts"("code");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "business_ledger_transaction_id_idx" ON "calamba_agri"."business_ledger"("transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "business_ledger_source_module_source_reference_idx" ON "calamba_agri"."business_ledger"("source_module", "source_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "business_ledger_reconciliation_reference_idx" ON "calamba_agri"."business_ledger"("reconciliation_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "business_ledger_reversed_entry_id_idx" ON "calamba_agri"."business_ledger"("reversed_entry_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "ledger_accounts_tenant_id_type_idx" ON "calamba_agri"."ledger_accounts"("tenant_id", "type");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_tenant_id_status_created_at_idx" ON "calamba_agri"."social_vouches"("tenant_id", "status", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_voucher_id_status_idx" ON "calamba_agri"."social_vouches"("voucher_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_vouchee_id_status_idx" ON "calamba_agri"."social_vouches"("vouchee_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_requester_id_idx" ON "calamba_agri"."social_vouches"("requester_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_discount_eligibility_state_idx" ON "calamba_agri"."social_vouches"("discount_eligibility_state");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_trust_network_visibility_idx" ON "calamba_agri"."social_vouches"("trust_network_visibility");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "social_vouches_audit_log_id_idx" ON "calamba_agri"."social_vouches"("audit_log_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "calamba_agri"."vouch_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "vouch_score_snapshots_discount_eligibility_state_idx" ON "calamba_agri"."vouch_score_snapshots"("discount_eligibility_state");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "tenant_trust_policies_tenant_id_key" ON "calamba_agri"."tenant_trust_policies"("tenant_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "tenant_trust_policies_tenant_id_is_active_idx" ON "calamba_agri"."tenant_trust_policies"("tenant_id", "is_active");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_periods_tenant_id_period_start_period_end_key" ON "calamba_agri"."trust_rating_periods"("tenant_id", "period_start", "period_end");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_rating_periods_tenant_id_status_period_start_idx" ON "calamba_agri"."trust_rating_periods"("tenant_id", "status", "period_start");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "trust_rating_assignments_period_id_rater_id_ratee_id_rating_source_role_key" ON "calamba_agri"."trust_rating_assignments"("period_id", "rater_id", "ratee_id", "rating_source_role");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_tenant_id_status_due_at_idx" ON "calamba_agri"."trust_rating_assignments"("tenant_id", "status", "due_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_rater_id_status_idx" ON "calamba_agri"."trust_rating_assignments"("rater_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_ratee_id_status_idx" ON "calamba_agri"."trust_rating_assignments"("ratee_id", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_rating_assignments_lockout_until_idx" ON "calamba_agri"."trust_rating_assignments"("lockout_until");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tenant_id_user_id_calculated_at_idx" ON "calamba_agri"."trust_score_snapshots"("tenant_id", "user_id", "calculated_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_period_id_idx" ON "calamba_agri"."trust_score_snapshots"("period_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_tier_after_idx" ON "calamba_agri"."trust_score_snapshots"("tier_after");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_score_snapshots_low_rating_action_state_idx" ON "calamba_agri"."trust_score_snapshots"("low_rating_action_state");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_tier_audits_tenant_id_user_id_changed_at_idx" ON "calamba_agri"."trust_tier_audits"("tenant_id", "user_id", "changed_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_tier_audits_snapshot_id_idx" ON "calamba_agri"."trust_tier_audits"("snapshot_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "trust_tier_audits_previous_tier_new_tier_idx" ON "calamba_agri"."trust_tier_audits"("previous_tier", "new_tier");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE UNIQUE  INDEX "interest_audit_loan_id_key" ON "calamba_agri"."interest_audit"("loan_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "system_files_tenant_id_idx" ON "calamba_agri"."system_files"("tenant_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "system_files_uploader_id_idx" ON "calamba_agri"."system_files"("uploader_id");

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."two_factor_auth" ADD CONSTRAINT "two_factor_auth_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loan_products" ADD CONSTRAINT "loan_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loans" ADD CONSTRAINT "loans_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loans" ADD CONSTRAINT "loans_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loans" ADD CONSTRAINT "loans_recovery_parent_loan_id_fkey" FOREIGN KEY ("recovery_parent_loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loans" ADD CONSTRAINT "loans_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loans" ADD CONSTRAINT "loans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loan_schedules" ADD CONSTRAINT "loan_schedules_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."payments" ADD CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."payments" ADD CONSTRAINT "payments_method_id_fkey" FOREIGN KEY ("method_id") REFERENCES "payment_methods"("method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."payments" ADD CONSTRAINT "payments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."savings_accounts" ADD CONSTRAINT "savings_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."savings_accounts" ADD CONSTRAINT "savings_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."savings_transactions" ADD CONSTRAINT "savings_transactions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "savings_accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."savings_transactions" ADD CONSTRAINT "savings_transactions_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."traffic_logs" ADD CONSTRAINT "traffic_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."interaction_logs" ADD CONSTRAINT "interaction_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."interaction_logs" ADD CONSTRAINT "interaction_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."homepage_faqs" ADD CONSTRAINT "homepage_faqs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."homepage_testimonials" ADD CONSTRAINT "homepage_testimonials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."feedback_entries" ADD CONSTRAINT "feedback_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."feedback_entries" ADD CONSTRAINT "feedback_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."messages" ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."conversations" ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_endorsed_by_fkey" FOREIGN KEY ("endorsed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."mentorship_connections" ADD CONSTRAINT "mentorship_connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."message_attachments" ADD CONSTRAINT "message_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."message_reactions" ADD CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."message_reactions" ADD CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_from_tenant_id_fkey" FOREIGN KEY ("from_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_to_tenant_id_fkey" FOREIGN KEY ("to_tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."tenant_transfer_requests" ADD CONSTRAINT "tenant_transfer_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."decommissioned_backups" ADD CONSTRAINT "decommissioned_backups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."loan_guarantees" ADD CONSTRAINT "loan_guarantees_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."compassion_actions" ADD CONSTRAINT "compassion_actions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."compassion_actions" ADD CONSTRAINT "compassion_actions_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."compassion_actions" ADD CONSTRAINT "compassion_actions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."business_ledger" ADD CONSTRAINT "business_ledger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."business_ledger" ADD CONSTRAINT "business_ledger_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."social_vouches" ADD CONSTRAINT "social_vouches_vouchee_id_fkey" FOREIGN KEY ("vouchee_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."social_vouches" ADD CONSTRAINT "social_vouches_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."interest_audit" ADD CONSTRAINT "interest_audit_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("loan_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."system_files" ADD CONSTRAINT "system_files_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."system_files" ADD CONSTRAINT "system_files_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."topup_requests" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "request_type" public."WalletRequestType" NOT NULL DEFAULT 'deposit',
    "amount" DECIMAL(15,2) NOT NULL,
    "fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(15,2),
    "method_label" VARCHAR(80),
    "external_reference" VARCHAR(120),
    "status" public."PaymentStatus" NOT NULL DEFAULT 'pending',
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

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "topup_requests_tenant_id_request_type_status_idx" ON "calamba_agri"."topup_requests"("tenant_id", "request_type", "status");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "topup_requests_user_id_request_type_created_at_idx" ON "calamba_agri"."topup_requests"("user_id", "request_type", "created_at");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "topup_requests_reconciliation_reference_idx" ON "calamba_agri"."topup_requests"("reconciliation_reference");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "topup_requests_ledger_transaction_id_idx" ON "calamba_agri"."topup_requests"("ledger_transaction_id");

-- SCHEMA: calamba_agri
-- CreateIndex
CREATE  INDEX "topup_requests_issue_status_idx" ON "calamba_agri"."topup_requests"("issue_status");

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."topup_requests" ADD CONSTRAINT "topup_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."topup_requests" ADD CONSTRAINT "topup_requests_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- AddForeignKey
ALTER TABLE "calamba_agri"."topup_requests" ADD CONSTRAINT "topup_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES public."tenants"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SCHEMA: calamba_agri
-- ============================================================
-- DM-26: Notification Type Enum Update
-- Note: ALTER TYPE ADD VALUE applied only if not exists
-- ============================================================

-- New NotificationType values are added via migration only on fresh DBs.
-- init.sql always runs on a clean DB so we replace the full enum:

-- CreateEnum (replace full NotificationType — init.sql is always clean DB)
-- Note: Prisma will auto-generate the full enum;

-- SCHEMA: calamba_agri
-- CreateTable
CREATE TABLE "calamba_agri"."receipts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "receipt_number" VARCHAR(60) NOT NULL,
    "receipt_type" public."ReceiptType" NOT NULL,
    "status" public."ReceiptStatus" NOT NULL DEFAULT 'generated',
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

-- SCHEMA: calamba_agri
CREATE UNIQUE  INDEX "receipts_receipt_number_key" ON "calamba_agri"."receipts"("receipt_number");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_tenant_id_receipt_type_issued_at_idx" ON "calamba_agri"."receipts"("tenant_id", "receipt_type", "issued_at");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_user_id_issued_at_idx" ON "calamba_agri"."receipts"("user_id", "issued_at");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_receipt_number_idx" ON "calamba_agri"."receipts"("receipt_number");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_loan_id_idx" ON "calamba_agri"."receipts"("loan_id");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_payment_id_idx" ON "calamba_agri"."receipts"("payment_id");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_topup_request_id_idx" ON "calamba_agri"."receipts"("topup_request_id");

-- SCHEMA: calamba_agri
CREATE  INDEX "receipts_savings_transaction_id_idx" ON "calamba_agri"."receipts"("savings_transaction_id");

