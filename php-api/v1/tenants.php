<?php
switch ($_API['action']) {
    case '':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $stmt = $pdo->query("
            SELECT t.tenant_id, t.name, t.slug, t.brand_color, t.accent_color, t.logo_url, t.region, t.is_active,
                   (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.tenant_id AND u.status = 'active') as member_count
            FROM tenants t
            WHERE t.is_active = 1
            ORDER BY t.name ASC
        ");
        jsonResponse(['status' => 'success', 'tenants' => $stmt->fetchAll()]);
        break;

    case 'search':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $q = $_GET['q'] ?? '';
        if (!$q) jsonResponse(['status' => 'error', 'message' => 'Search query required'], 400);
        $stmt = $pdo->prepare("
            SELECT t.tenant_id, t.name, t.slug, t.brand_color, t.accent_color, t.logo_url, t.region, t.is_active,
                   (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.tenant_id AND u.status = 'active') as member_count
            FROM tenants t
            WHERE t.is_active = 1 AND t.name LIKE ?
            ORDER BY t.name ASC
        ");
        $stmt->execute(['%' . $q . '%']);
        jsonResponse(['status' => 'success', 'tenants' => $stmt->fetchAll()]);
        break;

    case 'regions':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $stmt = $pdo->query("
            SELECT region, COUNT(*) as tenant_count,
                   (SELECT COUNT(*) FROM users u JOIN tenants t2 ON u.tenant_id = t2.tenant_id WHERE t2.region = t.region AND u.status = 'active') as total_members
            FROM tenants t
            WHERE t.is_active = 1 AND t.region IS NOT NULL AND t.region != ''
            GROUP BY t.region
            ORDER BY t.region ASC
        ");
        jsonResponse(['status' => 'success', 'regions' => $stmt->fetchAll()]);
        break;

    default:
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $tenantId = is_numeric($_API['action']) ? (int)$_API['action'] : null;
        if (!$tenantId) jsonResponse(['status' => 'error', 'message' => 'Invalid tenant ID'], 400);
        $stmt = $pdo->prepare("
            SELECT t.*,
                   (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.tenant_id AND u.status = 'active') as member_count
            FROM tenants t
            WHERE t.tenant_id = ? AND t.is_active = 1
        ");
        $stmt->execute([$tenantId]);
        $tenant = $stmt->fetch();
        if (!$tenant) jsonResponse(['status' => 'error', 'message' => 'Tenant not found'], 404);
        jsonResponse(['status' => 'success', 'tenant' => $tenant]);
        break;
}
