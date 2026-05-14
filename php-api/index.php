<?php
require_once __DIR__ . '/config.php';

$pathInfo = $_SERVER['PATH_INFO'] ?? '';
if (!$pathInfo) {
    $request = $_SERVER['REQUEST_URI'];
    $scriptName = $_SERVER['SCRIPT_NAME'];
    $pathInfo = str_replace($scriptName, '', parse_url($request, PHP_URL_PATH));
}
$pathInfo = '/' . trim($pathInfo, '/');
$parts = explode('/', trim($pathInfo, '/'));
$version = $parts[0] ?? '';
$resource = $parts[1] ?? '';
$action = $parts[2] ?? '';
$id = isset($parts[3]) && is_numeric($parts[3]) ? (int)$parts[3] : null;

$method = $_SERVER['REQUEST_METHOD'];

$moduleMap = [
    'health' => 'v1/health.php',
    'auth' => 'v1/auth.php',
    'tenants' => 'v1/tenants.php',
    'loans' => 'v1/loans.php',
    'wallet' => 'v1/wallet.php',
    'admin' => 'v1/admin.php',
    'community' => 'v1/community.php',
    'support' => 'v1/support.php',
    'notifications' => 'v1/notifications.php',
];

if (isset($moduleMap[$resource])) {
    $_API = ['method' => $method, 'action' => $action, 'id' => $id, 'parts' => array_slice($parts, 3)];
    require __DIR__ . '/' . $moduleMap[$resource];
} else {
    jsonResponse(['status' => 'error', 'message' => 'Resource not found: ' . $resource], 404);
}
