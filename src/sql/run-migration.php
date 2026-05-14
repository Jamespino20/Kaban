<?php
declare(strict_types=1);

/**
 * Migration Runner for 008_unique_tenant_data.sql
 *
 * Usage: php sql/run-migration.php
 */

define('_AGAPAY', true);
defined('BASE_PATH') or define('BASE_PATH', dirname(__DIR__));

$config = require __DIR__ . '/../includes/config/config.php';
require_once __DIR__ . '/../includes/lib/Database.php';
require_once __DIR__ . '/../includes/lib/helpers.php';

Database::init($config['db']);
$db = Database::getConnection();

$migrationFile = __DIR__ . '/migrations/008_unique_tenant_data.sql';
if (!file_exists($migrationFile)) {
    echo "ERROR: Migration file not found: {$migrationFile}\n";
    exit(1);
}

$sql = file_get_contents($migrationFile);
if ($sql === false || trim($sql) === '') {
    echo "ERROR: Empty or unreadable migration file.\n";
    exit(1);
}

// Split into individual statements on semicolons followed by whitespace+newline
$rawStatements = preg_split('/;\s*\n/', $sql);

echo "Running migration 008_unique_tenant_data...\n\n";

$success = 0;
$errors  = 0;

foreach ($rawStatements as $i => $stmt) {
    $stmt = trim($stmt);
    if (empty($stmt)) continue;

    // Strip leading comment lines to check if there's SQL content
    $sqlOnly = preg_replace('/^(--.*\n?)+/', '', $stmt);
    $sqlOnly = trim($sqlOnly);
    if (empty($sqlOnly)) continue; // comment-only part

    // Re-append semicolon (required for INSERT/UPDATE statements)
    $fullStmt = $stmt . ';';

    try {
        $db->query($fullStmt);
        $success++;
        echo "  [OK] Statement #{$i}: " . mb_substr(preg_replace('/\s+/', ' ', $sqlOnly), 0, 80) . "...\n";
    } catch (\Throwable $e) {
        $errors++;
        $lines = explode("\n", $stmt);
        $preview = implode("\n", array_slice($lines, 0, 3));
        echo "  [ERROR] Statement #{$i}: {$e->getMessage()}\n";
        echo "    -> {$preview}\n\n";
    }
}

echo "\n================================================\n";
echo "  Migration Complete\n";
echo "  Statements executed: " . ($success + $errors) . "\n";
echo "  Successful: {$success}\n";
echo "  Errors:     {$errors}\n";
echo "================================================\n\n";

// ── Verification ──
echo "Verifying tenant data...\n\n";

$tenants = Database::select(
    "SELECT slug, name, region, brand_color, metadata FROM tenants WHERE slug IN ('malolos','baguio','cebu','iloilo','davao','manila') ORDER BY slug"
);

if (empty($tenants)) {
    echo "WARNING: No target tenants found.\n";
} else {
    foreach ($tenants as $t) {
        $meta = json_decode($t['metadata'] ?? '{}', true);
        echo "──────────────────────────────────────\n";
        echo "  Slug:    {$t['slug']}\n";
        echo "  Name:    {$t['name']}\n";
        echo "  Region:  {$t['region']}\n";
        echo "  Color:   {$t['brand_color']}\n";
        echo "  Category: " . ($meta['category'] ?? 'N/A') . "\n";
        echo "  Email:   " . ($meta['official_email'] ?? 'N/A') . "\n";
        echo "  Phone:   " . ($meta['phone'] ?? 'N/A') . "\n";
        echo "  Address: " . ($meta['address'] ?? 'N/A') . "\n";
        echo "  Hero:    " . ($meta['heroHeadline'] ?? 'N/A') . "\n";
        echo "  Mission: " . mb_substr($meta['mission'] ?? 'N/A', 0, 80) . "...\n";
        echo "  Vision:  " . mb_substr($meta['vision'] ?? 'N/A', 0, 80) . "...\n";
        echo "  Values (" . count($meta['values'] ?? []) . "):\n";
        foreach ($meta['values'] ?? [] as $v) {
            echo "    - {$v['label']} ({$v['icon']})\n";
        }
        echo "  Testimonials (" . count($meta['testimonials'] ?? []) . "):\n";
        foreach ($meta['testimonials'] ?? [] as $j => $tst) {
            $q = mb_substr($tst['quote'], 0, 80);
            echo "    [" . ($j + 1) . "] {$tst['author']} ({$tst['role']}): \"{$q}...\"\n";
        }
    }
}

echo "\n──────────────────────────────────────\n";
echo "Done.\n";
