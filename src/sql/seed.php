<?php
declare(strict_types=1);

/**
 * Agapay Multi-Tenant Revamp Seed
 * Mirrors seed.ts logic for PHP/MariaDB.
 */

define('_AGAPAY', true);
defined('BASE_PATH') or define('BASE_PATH', dirname(__DIR__));

$config = require __DIR__ . '/../includes/config/config.php';
require_once __DIR__ . '/../includes/lib/Database.php';
require_once __DIR__ . '/../includes/lib/helpers.php';

Database::init($config['db']);

$hashedPassword  = password_hash('password123', PASSWORD_BCRYPT);
$hashedAdmin     = password_hash('admin2026!', PASSWORD_BCRYPT);

$pick = function(array $arr) { return $arr[array_rand($arr)]; };
$rand = function(int $min, int $max) { return random_int($min, $max); };
$normalizeNamePart = function(string $v): string {
    return preg_replace('/[^a-z0-9]+/', '', strtolower($v));
};

echo "Seeding Agapay Platform...\n\n";

// ── CLEAR GLOBAL TABLES (matching seed.ts order) ──
echo "[0] Clearing global tables...\n";
$tablesToClear = [
    'billing_invoices', 'payment_methods', 'user_profiles',
    'tenant_subscriptions', 'topup_requests', 'savings_transactions',
    'savings_accounts', 'trust_tier_audits', 'trust_score_snapshots',
    'trust_rating_assignments', 'trust_rating_periods', 'tenant_trust_policies',
    'feedback_entries', 'loan_schedules', 'loan_guarantees', 'payments',
    'compassion_actions', 'interest_audit', 'loans', 'loan_products',
    'user_documents', 'users', 'tenant_applications',
    'homepage_testimonials', 'homepage_faqs',
    'tenants', 'tenant_groups', 'subscription_plans',
    'ledger_accounts', 'platform_config', 'ai_config', 'security_settings',
];
Database::getConnection()->query('SET FOREIGN_KEY_CHECKS = 0');
foreach ($tablesToClear as $t) {
    Database::execute("DELETE FROM {$t}", []);
}
Database::getConnection()->query('SET FOREIGN_KEY_CHECKS = 1');
echo "   Done\n\n";

try {
    // ═══════════════════════════════════════════════
    // CONSTANTS (matching seed.ts)
    // ═══════════════════════════════════════════════
    $REGIONS = [
        ['name' => 'NCR Sector',             'reg_code' => 'AGP_NCR'],
        ['name' => 'Central Luzon Sector',   'reg_code' => 'AGP_CL'],
        ['name' => 'Southern Tagalog Sector', 'reg_code' => 'AGP_ST'],
    ];

    // Slug abbreviation map for member codes (must fit member_code VARCHAR(20))
    $SLUG_ABBREV = [
        'malolos'        => 'MALOLOS',
        'san_jose'       => 'SANJOSE',
        'qc_vendors'     => 'QCVENDOR',
        'makati_business'=> 'MAKATIBI',
        'calamba_agri'   => 'CALAMBAG',
    ];

    $COOPERATIVES = [
        ['name' => 'Malolos Market Vendors Cooperative', 'slug' => 'malolos',        'groupIdx' => 1, 'color' => '#2563eb'],
        ['name' => 'San Jose Rural Workers Coop',        'slug' => 'san_jose',       'groupIdx' => 1, 'color' => '#059669'],
        ['name' => 'Quezon City Vendors Trust',          'slug' => 'qc_vendors',     'groupIdx' => 0, 'color' => '#d97706'],
        ['name' => 'Makati Business Sari-Sari Coop',     'slug' => 'makati_business','groupIdx' => 0, 'color' => '#dc2626'],
        ['name' => 'Calamba Agricultural Cooperative',   'slug' => 'calamba_agri',   'groupIdx' => 2, 'color' => '#7c3aed'],
    ];

    $NAMES_M = ['Jose','Ricardo','Antonio','Eduardo','Fernando','Miguel','Carlos','Rafael','Andres','Emilio','Ramon','Manuel','Roberto','Arturo','Ernesto','Danilo','Reynaldo','Leonardo','Rolando','Gregorio'];
    $NAMES_F = ['Maria','Elena','Carmen','Rosario','Luisa','Teresa','Gloria','Patricia','Cecilia','Angelica','Lourdes','Victoria','Esperanza','Marites','Rowena','Jocelyn','Merlinda','Remedios','Corazon','Ligaya'];
    $SURNAMES  = ['Santos','Reyes','Cruz','Bautista','Gonzales','Villanueva','Ramos','Aquino','Mendoza','Garcia','Torres','Dela Cruz','Flores','Rivera','Castillo','Domingo','Fernandez','Lopez','Mercado','Navarro','Pascual','Salazar','Soriano','Valencia','Zamora'];
    $BUSINESSES = ['Aling Nena\'s Sari-Sari','Tiangge ni Mang Bert','Kuya Eddie\'s General Mdse','Ate Rose Mini Mart','Tres Marias Store','J&R Trading','Golden Star Variety','Kabayan Grocery','Lucky 7 Sari-Sari','Sampaguita Store','Bahay Kubo Trading','Mabuhay Mart','Tindahan ni Nanay','Isdaan Fish Trading','Palengke Express','Buko King Enterprise','Taho Master PH','Kakanin Corner','Lutong Bahay Catering','Panaderia De Manila'];
    $OCCUPATIONS = ['Sari-Sari Store Owner','Market Vendor','Tricycle Driver','Fish Vendor','Street Food Vendor','Laundry Service','Freelancer','Farmer','Carinderia Owner','Ukay-Ukay Vendor','Rice Trader','Water Refilling Operator'];
    $BARANGAYS = ['Brgy. Commonwealth','Brgy. Holy Spirit','Brgy. Batasan Hills','Brgy. San Nicolas','Brgy. Sto. Domingo','Brgy. Balibago','Brgy. Macabling','Brgy. Jaro','Brgy. Mandurriao'];

    $PLANS = [
        [
            'name' => 'Agapay Core', 
            'price_3months' => 3500, 
            'price_6months' => 7000, 
            'price_12months' => 14000, 
            'max_members' => 500, 
            'max_storage_mb' => 5000, 
            'features' => ["Basic Admin Dashboard","Standard Microfinancing Policy Access","Audit Logs","Email Support"]
        ],
        [
            'name' => 'Agapay Pro', 
            'price_3months' => 3250, 
            'price_6months' => 6500, 
            'price_12months' => 13000, 
            'max_members' => 2500, 
            'max_storage_mb' => 25000, 
            'features' => ["Custom Tenant Branding","Mentorship Community Tools","Chat/Priority Email Support","Automated Compassion Workflow"]
        ],
        [
            'name' => 'Agapay Enterprise', 
            'price_3months' => 3000, 
            'price_6months' => 6000, 
            'price_12months' => 12000, 
            'max_members' => 1000000, 
            'max_storage_mb' => 100000, 
            'features' => ["Analytics Module","Priority Technical Support","Data Exporting/Reporting Tools","System Configuration Controls"]
        ],
    ];

    $year = (int)date('Y');

    // Helper: build username and email matching seed.ts convention
    $buildMemberIdentity = function(string $first, string $last, string $memberCode, string $tenantSlug) use ($normalizeNamePart): array {
        $fp = $normalizeNamePart($first);
        $lp = $normalizeNamePart($last);
        return [
            'username' => "{$fp}-{$lp}-{$memberCode}",
            'email'    => "{$fp}.{$lp}.{$memberCode}@gmail.com",
        ];
    };

    // ═══════════════════════════════════════════════
    // 1. SUBSCRIPTION PLANS
    // ═══════════════════════════════════════════════
    echo "[1] Subscription plans...\n";
    $seededPlans = [];
    foreach ($PLANS as $p) {
        $features = json_encode($p['features']);
        $planId = Database::execute(
            "INSERT IGNORE INTO subscription_plans (tier_name, price_3months, price_6months, price_12months, price_monthly, price_annually, max_members, max_storage_mb, features)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $p['name'], 
                $p['price_3months'], 
                $p['price_6months'], 
                $p['price_12months'],
                $p['price_3months'] / 3,
                $p['price_12months'],
                $p['max_members'], 
                $p['max_storage_mb'], 
                $features
            ]
        );
        if (!$planId) {
            $existing = Database::selectOne("SELECT plan_id FROM subscription_plans WHERE tier_name = ?", [$p['name']]);
            $planId = $existing ? (int)$existing['plan_id'] : 0;
        }
        $seededPlans[] = $planId;
        echo "   {$p['name']} (ID: {$planId})\n";
    }

    // ═══════════════════════════════════════════════
    // 2. TENANT GROUPS (Sectors)
    // ═══════════════════════════════════════════════
    echo "[2] Tenant groups...\n";
    $seededGroups = [];
    foreach ($REGIONS as $g) {
        $groupId = Database::execute(
            "INSERT IGNORE INTO tenant_groups (name, reg_code) VALUES (?, ?)",
            [$g['name'], $g['reg_code']]
        );
        if (!$groupId) {
            $existing = Database::selectOne("SELECT group_id FROM tenant_groups WHERE reg_code = ?", [$g['reg_code']]);
            $groupId = $existing ? (int)$existing['group_id'] : 0;
        }
        $seededGroups[] = $groupId;
        echo "   {$g['name']} (ID: {$groupId})\n";
    }

    // ═══════════════════════════════════════════════
    // 3. SYSTEM-WIDE LEDGER ACCOUNTS
    //   (schema.sql pre-seeds global ones; ensure PROCESSING_FEES exists)
    // ═══════════════════════════════════════════════
    echo "[3] Ledger accounts...\n";
    Database::execute(
        "INSERT IGNORE INTO ledger_accounts (account_name, account_code, account_type, tenant_id, is_active)
         VALUES ('Processing Fees', 'PROCESSING_FEES', 'REVENUE', NULL, 1)",
        []
    );
    Database::execute(
        "INSERT IGNORE INTO ledger_accounts (account_name, account_code, account_type, tenant_id, is_active)
         VALUES ('Provision for Doubtful Accounts', 'PROVISION_DOUBTFUL', 'EXPENSE', NULL, 1)",
        []
    );
    echo "   Done\n";

    // ═══════════════════════════════════════════════
    // 4. APEX TENANT (system tenant for superadmins)
    // ═══════════════════════════════════════════════
    echo "[4] Apex tenant...\n";
    $apexId = Database::execute(
        "INSERT IGNORE INTO tenants (name, slug, brand_color, is_active, entitlement_status)
         VALUES ('Agapay System', 'apex', '#009966', 1, 'active')",
        []
    );
    if (!$apexId) {
        $existing = Database::selectOne("SELECT tenant_id FROM tenants WHERE slug = 'apex'");
        $apexId = $existing ? (int)$existing['tenant_id'] : 0;
    }
    echo "   Apex tenant ID: {$apexId}\n";

    // ═══════════════════════════════════════════════
    // 5. SUPERADMIN (under apex tenant)
    // ═══════════════════════════════════════════════
    echo "[5] Superadmin...\n";
    Database::execute(
        "INSERT IGNORE INTO users (tenant_id, username, email, password_hash, role, status, member_code, trust_score)
         VALUES (?, 'superadmin', 'agapay.saas@gmail.com', ?, 'superadmin', 'active', 'AGP S 000001', 100)",
        [$apexId, $hashedAdmin]
    );
    $sa = Database::selectOne("SELECT user_id FROM users WHERE email = 'agapay.saas@gmail.com'");
    if ($sa) {
        Database::execute(
            "INSERT IGNORE INTO user_profiles (user_id, tenant_id, first_name, last_name)
             VALUES (?, ?, 'James', 'Bryant')",
            [(int)$sa['user_id'], $apexId]
        );
        echo "   Superadmin: James Bryant (agapay.saas@gmail.com / admin2026!)\n";
    }

    // ═══════════════════════════════════════════════
    // 6. TENANTS + PER-TENANT SEEDING
    // ═══════════════════════════════════════════════
    echo "[6] Cooperatives...\n";
    $allTenantIds = [];

    foreach ($COOPERATIVES as $i => $coop) {
        $groupIdx = $coop['groupIdx'];
        $groupId  = $seededGroups[$groupIdx] ?? null;

        $tenantId = Database::execute(
            "INSERT IGNORE INTO tenants (name, slug, tenant_group_id, brand_color, is_active, entitlement_status, region)
             VALUES (?, ?, ?, ?, 1, 'active', ?)",
            [$coop['name'], $coop['slug'], $groupId, $coop['color'], $REGIONS[$groupIdx]['name']]
        );
        if (!$tenantId) {
            $existing = Database::selectOne("SELECT tenant_id FROM tenants WHERE slug = ?", [$coop['slug']]);
            $tenantId = $existing ? (int)$existing['tenant_id'] : 0;
        }
        $allTenantIds[$coop['slug']] = $tenantId;
        echo "   {$coop['name']} ({$coop['slug']}) ID: {$tenantId}\n";

        // ── Subscription ──
        $planIndex = $i % 3;
        $planId = $seededPlans[$planIndex] ?? 0;
        $cycles = ['3months', '6months', '12months'];
        $cycle = $cycles[$i % 3];
        $startDate = date('Y-m-d H:i:s', strtotime('-' . $rand(1, 10) . ' months'));
        if ($cycle === '3months') {
            $endDate = date('Y-m-d H:i:s', strtotime($startDate . ' +3 months'));
        } elseif ($cycle === '6months') {
            $endDate = date('Y-m-d H:i:s', strtotime($startDate . ' +6 months'));
        } else {
            $endDate = date('Y-m-d H:i:s', strtotime($startDate . ' +12 months'));
        }

        $PLAN_MODULES = [
            '["wallet","loans","community","audit"]',
            '["wallet","loans","community","audit","branding","reports","compassion"]',
            '["wallet","loans","community","audit","branding","reports","compassion","analytics","system_config"]',
        ];
        $modules = $PLAN_MODULES[$planIndex];

        Database::execute(
            "INSERT IGNORE INTO tenant_subscriptions (tenant_id, plan_id, billing_cycle, status, start_date, end_date, activated_modules)
             VALUES (?, ?, ?, 'active', ?, ?, ?)",
            [$tenantId, $planId, $cycle, $startDate, $endDate, $modules]
        );

        // ── Billing Invoices (2-5 random, ~80% paid) ──
        $invoiceCount = $rand(2, 5);
        for ($j = 0; $j < $invoiceCount; $j++) {
            $isPaid = mt_rand(1, 100) > 20;
            $invDate = date('Y-m-d H:i:s', strtotime($startDate . " +{$j} months"));
            $invNum = 'INV-' . strtoupper($coop['slug']) . '-' . $year . '-' . str_pad((string)($j + 1), 3, '0', STR_PAD_LEFT);
            $paidAt = $isPaid ? date('Y-m-d H:i:s', strtotime($invDate . ' +1 day')) : null;
            $pm = $pick(['Credit Card', 'Bank Transfer', 'GCash']);
            $priceKey = 'price_' . $cycle;
            $items = json_encode([['description' => $PLANS[$planIndex]['name'] . " Subscription - {$cycle}", 'amount' => (float)$PLANS[$planIndex][$priceKey], 'quantity' => 1]]);
            Database::execute(
                "INSERT IGNORE INTO billing_invoices (tenant_id, invoice_number, amount, status, due_date, paid_at, payment_method_used, items)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [$tenantId, $invNum, $PLANS[$planIndex][$priceKey], $isPaid ? 'paid' : 'pending', $invDate, $paidAt, $isPaid ? $pm : null, $items]
            );
        }

        // ── Trust Policy ──
        Database::execute("INSERT IGNORE INTO tenant_trust_policies (tenant_id) VALUES (?)", [$tenantId]);

        $slugAbbrev = $SLUG_ABBREV[$coop['slug']] ?? strtoupper(substr($coop['slug'], 0, 8));

        // ── Operator (1 per tenant) ──
        $isMale = mt_rand(0, 1);
        $first = $pick($isMale ? $NAMES_M : $NAMES_F);
        $last  = $pick($SURNAMES);
        $opCode = $slugAbbrev . ' O 000001';
        $opIdt  = $buildMemberIdentity($first, $last, $opCode, $coop['slug']);

        $opId = Database::execute(
            "INSERT IGNORE INTO users (tenant_id, username, email, password_hash, role, status, member_code, trust_score)
             VALUES (?, ?, ?, ?, 'operator', 'active', ?, 85)",
            [$tenantId, $opIdt['username'], $opIdt['email'], $hashedAdmin, $opCode]
        );
        if (!$opId) {
            $existing = Database::selectOne("SELECT user_id FROM users WHERE email = ?", [$opIdt['email']]);
            $opId = $existing ? (int)$existing['user_id'] : 0;
        }
        if ($opId) {
            Database::execute(
                "INSERT IGNORE INTO user_profiles (user_id, tenant_id, first_name, last_name, gender, address, occupation)
                 VALUES (?, ?, ?, ?, ?, ?, 'Cooperative Operator')",
                [$opId, $tenantId, $first, $last, $isMale ? 'male' : 'female', $pick($BARANGAYS) . ', ' . $coop['name']]
            );
        }

        // ── Members (20-30 per tenant) ──
        $memberIds = [];
        $memberCount = $rand(20, 30);
        for ($m = 0; $m < $memberCount; $m++) {
            $isMale = mt_rand(0, 1);
            $first  = $pick($isMale ? $NAMES_M : $NAMES_F);
            $last   = $pick($SURNAMES);
            $code   = $slugAbbrev . ' M ' . str_pad((string)($m + 1), 6, '0', STR_PAD_LEFT);
            $idt    = $buildMemberIdentity($first, $last, $code, $coop['slug']);

            $tiers = ['T1_5_PERCENT', 'T2_4_5_PERCENT', 'T3_4_PERCENT'];
            $tier  = $tiers[array_rand($tiers)];
            $uid = Database::execute(
                "INSERT IGNORE INTO users (tenant_id, username, email, password_hash, role, status, member_code, interest_tier, trust_score)
                 VALUES (?, ?, ?, ?, 'member', 'active', ?, ?, ?)",
                [$tenantId, $idt['username'], $idt['email'], $hashedPassword, $code, $tier, $rand(40, 90)]
            );
            if (!$uid) {
                $existing = Database::selectOne("SELECT user_id FROM users WHERE email = ?", [$idt['email']]);
                $uid = $existing ? (int)$existing['user_id'] : 0;
            }
            if ($uid) {
                $memberIds[] = $uid;
                Database::execute(
                    "INSERT IGNORE INTO user_profiles (user_id, tenant_id, first_name, last_name, gender, address, business_name, occupation, tin)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $uid, $tenantId, $first, $last, $isMale ? 'male' : 'female',
                        ($rand(1, 100) . ' Rizal St, ' . $pick($BARANGAYS)),
                        $pick($BUSINESSES), $pick($OCCUPATIONS),
                        $rand(100, 999) . '-' . $rand(100, 999) . '-' . $rand(0, 999),
                    ]
                );
            }
        }

        // ── Default Payment Methods (GCash, Bank Transfer, Cash, Maya) ──
        $defaultPMs = ['GCash', 'Bank Transfer', 'Cash', 'Maya'];
        foreach ($defaultPMs as $pmName) {
            Database::execute(
                "INSERT IGNORE INTO payment_methods (tenant_id, provider_name, is_active) VALUES (?, ?, 1)",
                [$tenantId, $pmName]
            );
        }

        // ── Personal wallets for all users ──
        $allUserIds = $memberIds;
        if ($opId) $allUserIds[] = $opId;
        foreach ($allUserIds as $uid) {
            $bal = round($rand(500, 20000) / 100, 2);
            Database::execute(
                "INSERT IGNORE INTO savings_accounts (tenant_id, user_id, account_type, balance) VALUES (?, ?, 'personal_wallet', ?)",
                [$tenantId, $uid, $bal]
            );
        }

        echo "   -> {$memberCount} members, " . count($defaultPMs) . " payment methods\n";
    }

    // ═══════════════════════════════════════════════
    // 7. PLATFORM CONFIG
    // ═══════════════════════════════════════════════
    echo "[7] Platform config...\n";
    Database::execute(
        "INSERT IGNORE INTO platform_config (scoring_weights, risk_thresholds, default_loan_config, platform_settings) VALUES (?, ?, ?, ?)",
        [
            json_encode(['payment' => 40, 'business' => 20, 'peer' => 20, 'guarantor' => 20]),
            json_encode(['low_rating_threshold' => 55, 'overdue_days_warning' => 7, 'overdue_days_default' => 90]),
            json_encode(['min_amount' => 2000, 'max_amount' => 1000000, 'default_term' => 6, 'grace_period_days' => 14]),
            json_encode(['platform_name' => 'Agapay', 'timezone' => 'Asia/Manila', 'currency' => 'PHP']),
        ]
    );
    echo "   Done\n";

    // ═══════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════
    echo "\n================================================\n";
    echo "  SEEDING COMPLETE\n";
    echo "================================================\n\n";
    echo "  Superadmin:\n";
    echo "    Email: agapay.saas@gmail.com\n";
    echo "    Pass:  admin2026!\n\n";
    echo "  Tenant Operators:\n";
    echo "    Pass:  admin2026!\n\n";
    echo "  Members:\n";
    echo "    Pass:  password123\n\n";

} catch (\Throwable $e) {
    echo "ERROR: {$e->getMessage()}\n{$e->getFile()}:{$e->getLine()}\n";
    exit(1);
}
