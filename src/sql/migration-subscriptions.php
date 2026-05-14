<?php
/**
 * Migration: Flexible Subscription Durations
 * Adds price_3months, price_6months, price_12months to subscription_plans
 * Updates billing_cycle ENUM in tenant_subscriptions
 */

require_once __DIR__ . '/../includes/config/config.php';
require_once __DIR__ . '/../includes/lib/Database.php';

// Load config and initialize Database
$config = require __DIR__ . '/../includes/config/config.php';
Database::init($config['db']);

try {
    echo "Starting migration...\n";

    // 1. Add columns to subscription_plans
    echo "Adding pricing columns to subscription_plans...\n";
    Database::raw("ALTER TABLE subscription_plans 
        ADD COLUMN price_3months DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER tier_name,
        ADD COLUMN price_6months DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price_3months,
        ADD COLUMN price_12months DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER price_6months");

    // 2. Update tenant_subscriptions ENUM
    echo "Updating billing_cycle ENUM in tenant_subscriptions...\n";
    Database::raw("ALTER TABLE tenant_subscriptions 
        MODIFY COLUMN billing_cycle ENUM('monthly', 'annually', '3months', '6months', '12months') DEFAULT '3months'");

    echo "Migration completed successfully.\n";

} catch (Throwable $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
