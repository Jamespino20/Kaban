<?php
require_once __DIR__ . '/config.php';

// ── Route Resolution ──
// InfinityFree doesn't set PATH_INFO. Parse from REQUEST_URI instead.
$route = '';
$uri = $_SERVER['REQUEST_URI'] ?? '';
$script = $_SERVER['SCRIPT_NAME'] ?? '/index.php';

// Strip script name and query string from URI
if ($script && $script !== '/' && str_starts_with($uri, $script)) {
    $route = substr($uri, strlen($script));
} else {
    // When .htaccess rewrites, script is /index.php but URI is /v1/health
    // Check if URI contains the script path
    $scriptDir = dirname($script);
    if ($scriptDir && $scriptDir !== '/' && str_starts_with($uri, $scriptDir)) {
        $route = substr($uri, strlen($scriptDir));
    } else {
        $route = $uri;
    }
}
$route = $route ?: ($_SERVER['PATH_INFO'] ?? '');
$route = explode('?', $route)[0]; // Strip query string
$route = trim($route, '/');

// Strip version prefix (v1, v2, etc.)
$parts = $route ? explode('/', $route) : [];
if (isset($parts[0]) && preg_match('/^v\d+$/', $parts[0])) {
    array_shift($parts); // Remove version segment
}

$resource = $parts[0] ?? '';
$action   = $parts[1] ?? '';
$id       = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;
$method   = $_SERVER['REQUEST_METHOD'];

$moduleMap = [
    'health' => 'v1/health.php',
    'auth'   => 'v1/auth.php',
    'tenants' => 'v1/tenants.php',
    'loans'  => 'v1/loans.php',
    'wallet' => 'v1/wallet.php',
    'admin'  => 'v1/admin.php',
    'community' => 'v1/community.php',
    'support' => 'v1/support.php',
    'notifications' => 'v1/notifications.php',
];

if (isset($moduleMap[$resource])) {
    $_API = ['method' => $method, 'action' => $action, 'id' => $id, 'parts' => array_slice($parts, 3)];
    require __DIR__ . '/' . $moduleMap[$resource];
} else {
    jsonResponse(['status' => 'error', 'message' => 'Not found: /' . $route], 404);
}
