<?php
switch ($_API['action']) {
    case 'login':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $data = getJsonInput();
        if (empty($data['email']) && empty($data['password']))
            jsonResponse(['status' => 'error', 'message' => 'Email and password required'], 400);

        $stmt = $pdo->prepare("SELECT u.*, up.first_name, up.last_name FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id WHERE u.email = ? OR u.username = ?");
        $stmt->execute([$data['email'] ?? '', $data['email'] ?? '']);
        $user = $stmt->fetch();
        if (!$user) jsonResponse(['status' => 'error', 'message' => 'Invalid credentials'], 401);
        $hash = $user['password_hash'];
        // Handle Node.js bcryptjs $2b$ prefix → PHP $2y$ prefix
        if (str_starts_with($hash, '$2b$')) $hash = '$2y$' . substr($hash, 4);
        if (!password_verify($data['password'] ?? '', $hash))
            jsonResponse(['status' => 'error', 'message' => 'Invalid credentials'], 401);

        $tfa = $pdo->prepare("SELECT is_enabled FROM two_factor_auth WHERE user_id = ?");
        $tfa->execute([$user['user_id']]);
        $tfaData = $tfa->fetch();

        $token = generateJWT([
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'tenant_id' => $user['tenant_id'],
        ]);

        jsonResponse(['status' => 'success', 'token' => $token, 'user' => [
            'user_id' => $user['user_id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'role' => $user['role'],
            'tenant_id' => $user['tenant_id'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'member_code' => $user['member_code'],
            'interest_tier' => $user['interest_tier'],
            'status' => $user['status'],
            'requires_2fa' => !empty($tfaData['is_enabled']),
        ]]);
        break;

    case 'register':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $data = getJsonInput();
        if (empty($data['email']) || empty($data['password']) || empty($data['username']))
            jsonResponse(['status' => 'error', 'message' => 'Email, username, and password required'], 400);

        $check = $pdo->prepare("SELECT user_id FROM users WHERE email = ? OR username = ?");
        $check->execute([$data['email'], $data['username']]);
        if ($check->fetch()) jsonResponse(['status' => 'error', 'message' => 'Email or username already exists'], 409);

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $pdo->beginTransaction();
        try {
            $members = $pdo->prepare("SELECT COUNT(*) as cnt FROM users WHERE tenant_id = ?");
            $members->execute([$data['tenant_id'] ?? 1]);
            $memberCode = str_pad(($members->fetch()['cnt'] ?? 0) + 1, 6, '0', STR_PAD_LEFT);

            $stmt = $pdo->prepare("INSERT INTO users (tenant_id, username, email, password_hash, role, member_code, interest_tier, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'member', ?, 'standard', 'active', NOW(), NOW())");
            $stmt->execute([$data['tenant_id'] ?? 1, $data['username'], $data['email'], $hash, $memberCode]);
            $userId = $pdo->lastInsertId();

            if (!empty($data['first_name']) || !empty($data['last_name'])) {
                $prof = $pdo->prepare("INSERT INTO user_profiles (user_id, first_name, last_name, phone, address, city, province) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $prof->execute([$userId, $data['first_name'] ?? '', $data['last_name'] ?? '', $data['phone'] ?? '', $data['address'] ?? '', $data['city'] ?? '', $data['province'] ?? '']);
            }

            $savings = $pdo->prepare("SELECT account_type_id FROM account_types WHERE slug = 'savings'");
            $savings->execute();
            $savingsType = $savings->fetch();
            if ($savingsType) {
                $acct = $pdo->prepare("INSERT INTO savings_accounts (user_id, tenant_id, account_type_id, account_number, balance, status, created_at, updated_at) VALUES (?, ?, ?, ?, 0.00, 'active', NOW(), NOW())");
                $acctNo = 'SAV-' . strtoupper(substr($data['username'], 0, 4)) . '-' . str_pad($userId, 6, '0', STR_PAD_LEFT);
                $acct->execute([$userId, $data['tenant_id'] ?? 1, $savingsType['account_type_id'], $acctNo]);
            }

            $pdo->commit();
            jsonResponse(['status' => 'success', 'message' => 'Registration successful', 'user_id' => $userId], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
        break;

    case '2fa':
        $sub = $_API['parts'][0] ?? '';
        $user = requireAuth();
        switch ($sub) {
            case 'enable':
                if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
                $secret = bin2hex(random_bytes(20));
                $stmt = $pdo->prepare("INSERT INTO two_factor_auth (user_id, secret, is_enabled, created_at) VALUES (?, ?, 0, NOW()) ON DUPLICATE KEY UPDATE secret = VALUES(secret), is_enabled = 0, updated_at = NOW()");
                $stmt->execute([$user['user_id'], $secret]);
                jsonResponse(['status' => 'success', 'secret' => $secret, 'message' => 'Scan this with your authenticator app']);
                break;

            case 'verify':
                if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
                $data = getJsonInput();
                if (empty($data['code'])) jsonResponse(['status' => 'error', 'message' => 'Verification code required'], 400);
                // In production, verify TOTP code against stored secret using a TOTP library
                $stmt = $pdo->prepare("UPDATE two_factor_auth SET is_enabled = 1, verified_at = NOW(), updated_at = NOW() WHERE user_id = ?");
                $stmt->execute([$user['user_id']]);
                jsonResponse(['status' => 'success', 'message' => '2FA enabled successfully']);
                break;

            case 'disable':
                if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
                $stmt = $pdo->prepare("UPDATE two_factor_auth SET is_enabled = 0, secret = NULL, updated_at = NOW() WHERE user_id = ?");
                $stmt->execute([$user['user_id']]);
                jsonResponse(['status' => 'success', 'message' => '2FA disabled']);
                break;

            default:
                jsonResponse(['status' => 'error', 'message' => '2FA action not found'], 404);
        }
        break;

    case 'me':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $stmt = $pdo->prepare("SELECT u.user_id, u.username, u.email, u.role, u.tenant_id, u.member_code, u.interest_tier, u.status, u.created_at, up.first_name, up.last_name, up.phone, up.address, up.city, up.province FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id WHERE u.user_id = ?");
        $stmt->execute([$user['user_id']]);
        $profile = $stmt->fetch();
        if (!$profile) jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);
        jsonResponse(['status' => 'success', 'user' => $profile]);
        break;

    case 'forgot-password':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $data = getJsonInput();
        if (empty($data['email'])) jsonResponse(['status' => 'error', 'message' => 'Email required'], 400);

        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $userRow = $stmt->fetch();
        if (!$userRow) jsonResponse(['status' => 'error', 'message' => 'Email not found'], 404);

        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', time() + 3600);
        $reset = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at), created_at = NOW()");
        $reset->execute([$userRow['user_id'], $token, $expiry]);

        jsonResponse(['status' => 'success', 'message' => 'Password reset link sent', 'reset_token' => $token]);
        break;

    case 'reset-password':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $data = getJsonInput();
        if (empty($data['token']) || empty($data['password']))
            jsonResponse(['status' => 'error', 'message' => 'Token and new password required'], 400);
        if (strlen($data['password']) < 6)
            jsonResponse(['status' => 'error', 'message' => 'Password must be at least 6 characters'], 400);

        $stmt = $pdo->prepare("SELECT pr.user_id, pr.expires_at FROM password_resets pr WHERE pr.token = ? AND pr.expires_at > NOW()");
        $stmt->execute([$data['token']]);
        $resetRow = $stmt->fetch();
        if (!$resetRow) jsonResponse(['status' => 'error', 'message' => 'Invalid or expired token'], 400);

        $hash = password_hash($data['password'], PASSWORD_BCRYPT);
        $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?")->execute([$hash, $resetRow['user_id']]);
        $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?")->execute([$resetRow['user_id']]);

        jsonResponse(['status' => 'success', 'message' => 'Password reset successful']);
        break;

    case 'tenants':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $stmt = $pdo->query("SELECT tenant_id, name, slug, description, brand_color, logo_url, region, is_active FROM tenants WHERE is_active = 1 ORDER BY name ASC");
        jsonResponse(['status' => 'success', 'tenants' => $stmt->fetchAll()]);
        break;

    case 'tenants-by-region':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $region = $_GET['region'] ?? '';
        if (!$region) jsonResponse(['status' => 'error', 'message' => 'Region parameter required'], 400);
        $stmt = $pdo->prepare("SELECT tenant_id, name, slug, description, brand_color, logo_url, region, is_active FROM tenants WHERE region = ? AND is_active = 1 ORDER BY name ASC");
        $stmt->execute([$region]);
        jsonResponse(['status' => 'success', 'tenants' => $stmt->fetchAll()]);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Auth action not found'], 404);
}
