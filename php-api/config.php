<?php
error_reporting(0);
ini_set('display_errors', '0');

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ── Environment-aware DB credentials ──
// Priority: env vars > auto-detection > InfinityFree default
$envHost  = getenv('DB_HOST');
$envUser  = getenv('DB_USER');
$envPass  = getenv('DB_PASS');
$envName  = getenv('DB_NAME');
$envPort  = getenv('DB_PORT');

if ($envHost && $envUser && $envName) {
    define('DB_HOST', $envHost);
    define('DB_USER', $envUser);
    define('DB_PASS', $envPass ?: '');
    define('DB_NAME', $envName);
    define('DB_PORT', $envPort ?: '3306');
} else {
    // Auto-detect by HTTP_HOST
    $httpHost = $_SERVER['HTTP_HOST'] ?? '';

    // AwardSpace: PHP runs on AwardSpace, DB lives on InfinityFree
    if (str_contains($httpHost, 'atwebpages') || str_contains($httpHost, 'awardspace')) {
        define('DB_HOST', 'sql112.infinityfree.com');
        define('DB_USER', 'if0_41904755');
        define('DB_PASS', 'Bryant09200');
        define('DB_NAME', 'if0_41904755_agapay_db');
        define('DB_PORT', '3306');
    // InfinityFree custom domain: host contains gt.tc or free
    } elseif (str_contains($httpHost, 'gt.tc') || str_contains($httpHost, 'free')) {
        define('DB_HOST', 'sql112.infinityfree.com');
        define('DB_USER', 'if0_41904755');
        define('DB_PASS', 'Bryant09200');
        define('DB_NAME', 'if0_41904755_agapay_db');
        define('DB_PORT', '3306');
    } else {
        // Local dev fallback
        define('DB_HOST', 'localhost');
        define('DB_USER', 'root');
        define('DB_PASS', '');
        define('DB_NAME', 'agapay_db');
        define('DB_PORT', '3307');
    }
}

define('JWT_SECRET', getenv('JWT_SECRET') ?: 'agapay-dev-secret-key-change-in-production');
define('JWT_EXPIRY', 86400 * 7);

// Safe PDO connection
try {
    $pdo = @new PDO("mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed",
        "detail" => $e->getMessage(),
        "host" => DB_HOST,
        "db" => DB_NAME,
        "user" => DB_USER,
    ]);
    exit;
}

function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonInput(): array {
    $input = file_get_contents('php://input');
    return $input ? (json_decode($input, true) ?: []) : [];
}

function generateJWT(array $payload): string {
    $header = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payloadEncoded = base64url_encode(json_encode($payload));
    $signature = base64url_encode(hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true));
    return "$header.$payloadEncoded.$signature";
}

function getAuthorizationHeader(): string {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$auth && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }
    return $auth;
}

function verifyJWT(): ?array {
    $auth = getAuthorizationHeader();
    if (!preg_match('/^Bearer\s+(.+)$/', $auth, $m)) return null;
    $parts = explode('.', $m[1]);
    if (count($parts) !== 3) return null;
    $expected = base64url_encode(hash_hmac('sha256', "$parts[0].$parts[1]", JWT_SECRET, true));
    if (!hash_equals($expected, $parts[2])) return null;
    $data = json_decode(base64url_decode($parts[1]), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return null;
    return $data;
}

function requireAuth(): array {
    $user = verifyJWT();
    if (!$user) jsonResponse(['status' => 'error', 'message' => 'Unauthorized'], 401);
    return $user;
}

function requireRole(array $roles): array {
    $user = requireAuth();
    if (!in_array($user['role'] ?? '', $roles)) jsonResponse(['status' => 'error', 'message' => 'Forbidden'], 403);
    return $user;
}

function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}
