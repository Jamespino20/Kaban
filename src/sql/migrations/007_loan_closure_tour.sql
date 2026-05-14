-- Migration 007: Loan Closure, Welcome Tour, and Profile Fields
-- Run against the master schema AND each tenant schema.

-- 1. Add paid_at and summary columns to loans table
ALTER TABLE loans ADD COLUMN IF NOT EXISTS paid_at DATETIME NULL AFTER approved_by;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS total_paid DECIMAL(15,2) DEFAULT 0.00 AFTER balance_remaining;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS total_interest_paid DECIMAL(15,2) DEFAULT 0.00 AFTER total_paid;

-- 2. Widen marital_status ENUM to support 'prefer_not_to_say'
ALTER TABLE user_profiles MODIFY COLUMN marital_status VARCHAR(30) DEFAULT NULL;

-- 3. Add income_range and savings fields to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS income_range VARCHAR(50) NULL AFTER barangay;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS savings DECIMAL(15,2) NULL AFTER income_range;
