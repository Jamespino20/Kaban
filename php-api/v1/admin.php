<?php
$action = $_API['action'];
$id = $_API['id'];

switch ($action) {
    case 'dashboard-metrics':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);

        if ($user['role'] === 'superadmin') {
            $members = $pdo->query("SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL")->fetch();
            $activeMembers = $pdo->query("SELECT COUNT(*) as total FROM users WHERE status = 'active'")->fetch();
            $loans = $pdo->query("SELECT COUNT(*) as total, COALESCE(SUM(principal_amount),0) as total_principal FROM loans")->fetch();
            $activeLoans = $pdo->query("SELECT COUNT(*) as total, COALESCE(SUM(balance_remaining),0) as outstanding FROM loans WHERE status = 'active'")->fetch();
            $pendingLoans = $pdo->query("SELECT COUNT(*) as total, COALESCE(SUM(principal_amount),0) as total FROM loans WHERE status = 'pending'")->fetch();
            $portfolio = $pdo->query("SELECT COALESCE(SUM(balance),0) as total_savings FROM savings_accounts")->fetch();
            $overdue = $pdo->query("SELECT COUNT(*) as total FROM loan_schedules WHERE status = 'overdue'")->fetch();
        } else {
            $tid = $user['tenant_id'];
            $members = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE tenant_id = ? AND deleted_at IS NULL");
            $members->execute([$tid]); $members = $members->fetch();
            $activeMembers = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE tenant_id = ? AND status = 'active'");
            $activeMembers->execute([$tid]); $activeMembers = $activeMembers->fetch();
            $loans = $pdo->prepare("SELECT COUNT(*) as total, COALESCE(SUM(principal_amount),0) as total_principal FROM loans WHERE tenant_id = ?");
            $loans->execute([$tid]); $loans = $loans->fetch();
            $activeLoans = $pdo->prepare("SELECT COUNT(*) as total, COALESCE(SUM(balance_remaining),0) as outstanding FROM loans WHERE tenant_id = ? AND status = 'active'");
            $activeLoans->execute([$tid]); $activeLoans = $activeLoans->fetch();
            $pendingLoans = $pdo->prepare("SELECT COUNT(*) as total, COALESCE(SUM(principal_amount),0) as total FROM loans WHERE tenant_id = ? AND status = 'pending'");
            $pendingLoans->execute([$tid]); $pendingLoans = $pendingLoans->fetch();
            $portfolio = $pdo->prepare("SELECT COALESCE(SUM(balance),0) as total_savings FROM savings_accounts WHERE tenant_id = ?");
            $portfolio->execute([$tid]); $portfolio = $portfolio->fetch();
            $overdue = $pdo->prepare("SELECT COUNT(*) as total FROM loan_schedules ls JOIN loans l ON ls.loan_id = l.loan_id WHERE l.tenant_id = ? AND ls.status = 'overdue'");
            $overdue->execute([$tid]); $overdue = $overdue->fetch();
        }

        jsonResponse(['status' => 'success', 'metrics' => [
            'total_members' => (int)$members['total'],
            'active_members' => (int)$activeMembers['total'],
            'total_loans' => (int)$loans['total'],
            'total_principal' => (float)$loans['total_principal'],
            'active_loans' => (int)$activeLoans['total'],
            'outstanding_balance' => (float)$activeLoans['outstanding'],
            'pending_loans' => (int)$pendingLoans['total'],
            'pending_loan_amount' => (float)$pendingLoans['total'],
            'total_savings' => (float)$portfolio['total_savings'],
            'overdue_installments' => (int)$overdue['total'],
        ]]);
        break;

    case 'members':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $search = $_GET['search'] ?? '';
        $status = $_GET['status'] ?? '';
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        if ($user['role'] === 'superadmin') {
            $where = "WHERE u.deleted_at IS NULL";
            $params = [];
        } else {
            $where = "WHERE u.tenant_id = ? AND u.deleted_at IS NULL";
            $params = [$user['tenant_id']];
        }

        if ($search) {
            $where .= " AND (u.username LIKE ? OR u.email LIKE ? OR up.first_name LIKE ? OR up.last_name LIKE ? OR u.member_code LIKE ?)";
            $s = "%$search%";
            $params = array_merge($params, [$s, $s, $s, $s, $s]);
        }
        if ($status) {
            $where .= " AND u.status = ?";
            $params[] = $status;
        }

        $countSt = $pdo->prepare("SELECT COUNT(*) FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id $where");
        $countSt->execute($params);
        $total = $countSt->fetchColumn();

        $stmt = $pdo->prepare("SELECT u.user_id, u.username, u.email, u.phone, u.member_code, u.role, u.status, u.interest_tier, u.created_at, up.first_name, up.last_name, up.address, up.city, up.province, up.business_name, up.photo_url FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id $where ORDER BY u.created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute(array_merge($params, [$limit, $offset]));
        jsonResponse(['status' => 'success', 'members' => $stmt->fetchAll(), 'total' => (int)$total, 'page' => $page, 'pages' => max(1, (int)ceil($total / $limit))]);
        break;

    case 'pending-approvals':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);

        if ($user['role'] === 'superadmin') {
            $pendingLoans = $pdo->query("SELECT l.*, lp.name as product_name, u.username, u.email FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id JOIN users u ON l.user_id = u.user_id WHERE l.status = 'pending' ORDER BY l.applied_at DESC LIMIT 50");
            $pendingTopups = $pdo->query("SELECT tr.*, u.username, u.email FROM topup_requests tr JOIN users u ON tr.user_id = u.user_id WHERE tr.status = 'pending' ORDER BY tr.created_at DESC LIMIT 50");
            $pendingIdentities = $pdo->query("SELECT u.user_id, u.username, u.email, u.status, up.first_name, up.last_name FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id WHERE u.status = 'pending' ORDER BY u.created_at DESC LIMIT 50");
        } else {
            $tid = $user['tenant_id'];
            $pendingLoans = $pdo->prepare("SELECT l.*, lp.name as product_name, u.username, u.email FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id JOIN users u ON l.user_id = u.user_id WHERE l.tenant_id = ? AND l.status = 'pending' ORDER BY l.applied_at DESC LIMIT 50");
            $pendingLoans->execute([$tid]);
            $pendingTopups = $pdo->prepare("SELECT tr.*, u.username, u.email FROM topup_requests tr JOIN users u ON tr.user_id = u.user_id WHERE tr.tenant_id = ? AND tr.status = 'pending' ORDER BY tr.created_at DESC LIMIT 50");
            $pendingTopups->execute([$tid]);
            $pendingIdentities = $pdo->prepare("SELECT u.user_id, u.username, u.email, u.status, up.first_name, up.last_name FROM users u LEFT JOIN user_profiles up ON u.user_id = up.user_id WHERE u.tenant_id = ? AND u.status = 'pending' ORDER BY u.created_at DESC LIMIT 50");
            $pendingIdentities->execute([$tid]);
        }
        jsonResponse(['status' => 'success', 'pending_loans' => $pendingLoans->fetchAll(), 'pending_topups' => $pendingTopups->fetchAll(), 'pending_identities' => $pendingIdentities->fetchAll()]);
        break;

    case 'profile':
        if ($_API['method'] !== 'PUT') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        if (!$id) jsonResponse(['status' => 'error', 'message' => 'User ID required'], 400);
        $data = getJsonInput();

        if ($user['role'] === 'superadmin') {
            $target = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ?");
            $target->execute([$id]);
        } else {
            $target = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ? AND tenant_id = ?");
            $target->execute([$id, $user['tenant_id']]);
        }
        if (!$target->fetch()) jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);

        $allowed = ['first_name', 'middle_name', 'last_name', 'gender', 'birthdate', 'address', 'business_name', 'marital_status', 'occupation', 'place_of_birth', 'tin', 'region', 'province', 'city', 'barangay', 'phone', 'photo_url'];
        $fields = [];
        $values = [];
        foreach ($allowed as $f) {
            if (isset($data[$f])) {
                $fields[] = "$f = ?";
                $values[] = $data[$f];
            }
        }
        if (empty($fields)) jsonResponse(['status' => 'error', 'message' => 'No fields to update'], 400);
        $values[] = $id;

        $prof = $pdo->prepare("SELECT profile_id FROM user_profiles WHERE user_id = ?");
        $prof->execute([$id]);
        if ($prof->fetch()) {
            $stmt = $pdo->prepare("UPDATE user_profiles SET " . implode(', ', $fields) . " WHERE user_id = ?");
            $stmt->execute($values);
        } else {
            $targetUser = $pdo->prepare("SELECT tenant_id FROM users WHERE user_id = ?");
            $targetUser->execute([$id]);
            $tu = $targetUser->fetch();
            $insertFields = ['user_id', 'tenant_id'];
            $insertPlaceholders = ['?', '?'];
            $insertValues = [$id, $tu['tenant_id']];
            foreach ($allowed as $f) {
                if (isset($data[$f])) {
                    $insertFields[] = $f;
                    $insertPlaceholders[] = '?';
                    $insertValues[] = $data[$f];
                }
            }
            $stmt = $pdo->prepare("INSERT INTO user_profiles (" . implode(', ', $insertFields) . ") VALUES (" . implode(', ', $insertPlaceholders) . ")");
            $stmt->execute($insertValues);
        }
        jsonResponse(['status' => 'success', 'message' => 'Profile updated']);
        break;

    case 'status':
        if ($_API['method'] !== 'PUT') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        if (!$id) jsonResponse(['status' => 'error', 'message' => 'User ID required'], 400);
        $data = getJsonInput();
        if (empty($data['status'])) jsonResponse(['status' => 'error', 'message' => 'Status required'], 400);

        $allowedStatuses = ['pending', 'active', 'suspended', 'inactive', 'deactivated'];
        if (!in_array($data['status'], $allowedStatuses))
            jsonResponse(['status' => 'error', 'message' => 'Invalid status'], 400);

        if ($user['role'] === 'superadmin') {
            $target = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ?");
            $target->execute([$id]);
        } else {
            $target = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ? AND tenant_id = ?");
            $target->execute([$id, $user['tenant_id']]);
        }
        if (!$target->fetch()) jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);

        $stmt = $pdo->prepare("UPDATE users SET status = ?, updated_at = NOW() WHERE user_id = ?");
        $stmt->execute([$data['status'], $id]);
        jsonResponse(['status' => 'success', 'message' => 'Status updated']);
        break;

    case 'reset-pw':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        if (!$id) jsonResponse(['status' => 'error', 'message' => 'User ID required'], 400);
        $data = getJsonInput();
        $newPw = $data['password'] ?? bin2hex(random_bytes(8));

        if ($user['role'] === 'superadmin') {
            $target = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ?");
            $target->execute([$id]);
        } else {
            $target = $pdo->prepare("SELECT user_id FROM users WHERE user_id = ? AND tenant_id = ?");
            $target->execute([$id, $user['tenant_id']]);
        }
        if (!$target->fetch()) jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);

        $hash = password_hash($newPw, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?");
        $stmt->execute([$hash, $id]);
        jsonResponse(['status' => 'success', 'message' => 'Password reset', 'new_password' => $newPw]);
        break;

    case 'notify':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        if (!$id) jsonResponse(['status' => 'error', 'message' => 'User ID required'], 400);
        $data = getJsonInput();
        if (empty($data['title']) || empty($data['body']))
            jsonResponse(['status' => 'error', 'message' => 'Title and body required'], 400);

        if ($user['role'] === 'superadmin') {
            $target = $pdo->prepare("SELECT user_id, tenant_id FROM users WHERE user_id = ?");
            $target->execute([$id]);
        } else {
            $target = $pdo->prepare("SELECT user_id, tenant_id FROM users WHERE user_id = ? AND tenant_id = ?");
            $target->execute([$id, $user['tenant_id']]);
        }
        $targetUser = $target->fetch();
        if (!$targetUser) jsonResponse(['status' => 'error', 'message' => 'User not found'], 404);

        $notifId = bin2hex(random_bytes(16));
        $stmt = $pdo->prepare("INSERT INTO notifications (id, tenant_id, user_id, type, title, body, action_url, channel, created_at) VALUES (?,?,?,?,?,?,?,'in_app',NOW())");
        $stmt->execute([$notifId, $targetUser['tenant_id'], $id, $data['type'] ?? 'system_alert', $data['title'], $data['body'], $data['action_url'] ?? '']);
        jsonResponse(['status' => 'success', 'message' => 'Notification sent', 'notification_id' => $notifId]);
        break;

    case 'superadmin-overview':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['superadmin']);

        $tenants = $pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active, SUM(CASE WHEN entitlement_status = 'availed' THEN 1 ELSE 0 END) as availed FROM tenants")->fetch();
        $users = $pdo->query("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active FROM users WHERE deleted_at IS NULL")->fetch();
        $loans = $pdo->query("SELECT COUNT(*) as total, COALESCE(SUM(principal_amount),0) as total_principal FROM loans")->fetch();
        $activeLoans = $pdo->query("SELECT COUNT(*) as total, COALESCE(SUM(balance_remaining),0) as outstanding FROM loans WHERE status = 'active'")->fetch();
        $savings = $pdo->query("SELECT COALESCE(SUM(balance),0) as total_savings FROM savings_accounts")->fetch();
        $pendingApps = $pdo->query("SELECT COUNT(*) as total FROM tenant_applications WHERE status = 'pending'")->fetchColumn();

        jsonResponse(['status' => 'success', 'overview' => [
            'total_tenants' => (int)$tenants['total'],
            'active_tenants' => (int)$tenants['active'],
            'availed_tenants' => (int)$tenants['availed'],
            'total_users' => (int)$users['total'],
            'active_users' => (int)$users['active'],
            'total_loans' => (int)$loans['total'],
            'total_principal' => (float)$loans['total_principal'],
            'active_loans' => (int)$activeLoans['total'],
            'outstanding_balance' => (float)$activeLoans['outstanding'],
            'total_savings' => (float)$savings['total_savings'],
            'pending_applications' => (int)$pendingApps,
        ]]);
        break;

    case 'pending-applications':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        requireRole(['superadmin']);
        $stmt = $pdo->query("SELECT ta.*, u.username as submitted_by_name FROM tenant_applications ta LEFT JOIN users u ON ta.submitted_by = u.user_id WHERE ta.status = 'pending' ORDER BY ta.created_at ASC");
        jsonResponse(['status' => 'success', 'applications' => $stmt->fetchAll()]);
        break;

    case 'applications':
        $user = requireRole(['superadmin']);
        if ($_API['method'] === 'GET') {
            $stmt = $pdo->query("SELECT ta.*, u.username as submitted_by_name FROM tenant_applications ta LEFT JOIN users u ON ta.submitted_by = u.user_id ORDER BY ta.created_at DESC");
            jsonResponse(['status' => 'success', 'applications' => $stmt->fetchAll()]);
        } elseif ($_API['method'] === 'POST' && $id) {
            $data = getJsonInput();
            if (empty($data['action']) || !in_array($data['action'], ['approve', 'reject']))
                jsonResponse(['status' => 'error', 'message' => 'Invalid action. Use approve or reject'], 400);

            $app = $pdo->prepare("SELECT * FROM tenant_applications WHERE application_id = ? AND status = 'pending'");
            $app->execute([$id]);
            $application = $app->fetch();
            if (!$application) jsonResponse(['status' => 'error', 'message' => 'Application not found or already processed'], 404);

            try {
                $pdo->beginTransaction();

                if ($data['action'] === 'approve') {
                    $stmt = $pdo->prepare("UPDATE tenant_applications SET status = 'approved', reviewed_by = ?, reviewed_at = NOW(), review_notes = ? WHERE application_id = ?");
                    $stmt->execute([$user['user_id'], $data['notes'] ?? '', $id]);

                    $existing = $pdo->prepare("SELECT tenant_id FROM tenants WHERE slug = ?");
                    $existing->execute([$application['tenant_slug']]);
                    if (!$existing->fetch()) {
                        $stmt = $pdo->prepare("INSERT INTO tenants (name, slug, brand_color, accent_color, logo_url, is_active, created_at, updated_at, entitlement_status, tenant_group_id, region) VALUES (?,?,?,?,?,1,NOW(),NOW(),'active',?,?)");
                        $stmt->execute([$application['tenant_name'], $application['tenant_slug'], $application['brand_color'] ?? '#2563eb', $application['accent_color'] ?? '#059669', $application['logo_url'] ?? '', $application['tenant_group_id'], '']);
                    }
                } else {
                    $stmt = $pdo->prepare("UPDATE tenant_applications SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), review_notes = ? WHERE application_id = ?");
                    $stmt->execute([$user['user_id'], $data['notes'] ?? '', $id]);
                }

                $pdo->commit();
                jsonResponse(['status' => 'success', 'message' => 'Application ' . $data['action'] . 'd']);
            } catch (Exception $e) {
                $pdo->rollBack();
                jsonResponse(['status' => 'error', 'message' => 'Failed: ' . $e->getMessage()], 500);
            }
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        }
        break;

    case 'tenants':
        $user = requireRole(['superadmin']);
        if ($_API['method'] === 'GET') {
            $stmt = $pdo->query("SELECT t.*, tg.name as group_name, (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.tenant_id AND u.deleted_at IS NULL) as member_count FROM tenants t LEFT JOIN tenant_groups tg ON t.tenant_group_id = tg.id ORDER BY t.created_at DESC");
            jsonResponse(['status' => 'success', 'tenants' => $stmt->fetchAll()]);
        } elseif ($_API['method'] === 'POST' && $id) {
            $data = getJsonInput();
            $actionVal = $data['action'] ?? '';
            $validActions = ['avail', 'suspend', 'decommission', 'restore'];
            if (!in_array($actionVal, $validActions))
                jsonResponse(['status' => 'error', 'message' => 'Invalid action. Use: ' . implode(', ', $validActions)], 400);

            $tenant = $pdo->prepare("SELECT * FROM tenants WHERE tenant_id = ?");
            $tenant->execute([$id]);
            if (!$tenant->fetch()) jsonResponse(['status' => 'error', 'message' => 'Tenant not found'], 404);

            try {
                $pdo->beginTransaction();
                switch ($actionVal) {
                    case 'avail':
                        $pdo->prepare("UPDATE tenants SET is_active = 1, entitlement_status = 'active', lifetime_availed_at = COALESCE(lifetime_availed_at, NOW()), updated_at = NOW() WHERE tenant_id = ?")->execute([$id]);
                        break;
                    case 'suspend':
                        $pdo->prepare("UPDATE tenants SET is_active = 0, entitlement_status = 'suspended', updated_at = NOW() WHERE tenant_id = ?")->execute([$id]);
                        $pdo->prepare("UPDATE users SET status = 'suspended', updated_at = NOW() WHERE tenant_id = ? AND status = 'active'")->execute([$id]);
                        break;
                    case 'decommission':
                        $pdo->prepare("UPDATE tenants SET is_active = 0, entitlement_status = 'suspended', updated_at = NOW() WHERE tenant_id = ?")->execute([$id]);
                        $pdo->prepare("UPDATE users SET status = 'inactive', updated_at = NOW() WHERE tenant_id = ? AND status IN ('active','pending')")->execute([$id]);
                        break;
                    case 'restore':
                        $pdo->prepare("UPDATE tenants SET is_active = 1, entitlement_status = 'active', updated_at = NOW() WHERE tenant_id = ?")->execute([$id]);
                        $pdo->prepare("UPDATE users SET status = 'active', updated_at = NOW() WHERE tenant_id = ? AND status = 'suspended'")->execute([$id]);
                        break;
                }
                $pdo->commit();
                jsonResponse(['status' => 'success', 'message' => 'Tenant ' . $actionVal . 'ed']);
            } catch (Exception $e) {
                $pdo->rollBack();
                jsonResponse(['status' => 'error', 'message' => 'Failed: ' . $e->getMessage()], 500);
            }
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        }
        break;

    case 'audit-logs':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;
        $module = $_GET['module'] ?? '';
        $eventType = $_GET['event_type'] ?? '';

        if ($user['role'] === 'superadmin') {
            $where = "WHERE 1=1";
            $params = [];
        } else {
            $where = "WHERE al.tenant_id = ?";
            $params = [$user['tenant_id']];
        }

        if ($module) {
            $where .= " AND al.module = ?";
            $params[] = $module;
        }
        if ($eventType) {
            $where .= " AND al.event_type = ?";
            $params[] = $eventType;
        }

        $countSt = $pdo->prepare("SELECT COUNT(*) FROM audit_logs al $where");
        $countSt->execute($params);
        $total = $countSt->fetchColumn();

        $stmt = $pdo->prepare("SELECT al.*, u.username as actor_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.user_id $where ORDER BY al.created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute(array_merge($params, [$limit, $offset]));
        jsonResponse(['status' => 'success', 'logs' => $stmt->fetchAll(), 'total' => (int)$total, 'page' => $page, 'pages' => max(1, (int)ceil($total / $limit))]);
        break;

    case 'growth-metrics':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $months = min(24, max(1, (int)($_GET['months'] ?? 12)));

        if ($user['role'] === 'superadmin') {
            $memberGrowth = $pdo->prepare("SELECT DATE_FORMAT(created_at, '%Y-%m') as period, COUNT(*) as count FROM users WHERE deleted_at IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH) GROUP BY period ORDER BY period ASC");
            $memberGrowth->execute([$months]);
            $loanTrend = $pdo->prepare("SELECT DATE_FORMAT(applied_at, '%Y-%m') as period, COUNT(*) as count, COALESCE(SUM(principal_amount),0) as volume FROM loans WHERE applied_at >= DATE_SUB(NOW(), INTERVAL ? MONTH) GROUP BY period ORDER BY period ASC");
            $loanTrend->execute([$months]);
            $savingsTrend = $pdo->prepare("SELECT DATE_FORMAT(processed_at, '%Y-%m') as period, COUNT(*) as count, COALESCE(SUM(amount),0) as volume FROM savings_transactions WHERE transaction_type = 'deposit' AND processed_at >= DATE_SUB(NOW(), INTERVAL ? MONTH) GROUP BY period ORDER BY period ASC");
            $savingsTrend->execute([$months]);
        } else {
            $tid = $user['tenant_id'];
            $memberGrowth = $pdo->prepare("SELECT DATE_FORMAT(created_at, '%Y-%m') as period, COUNT(*) as count FROM users WHERE tenant_id = ? AND deleted_at IS NULL AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH) GROUP BY period ORDER BY period ASC");
            $memberGrowth->execute([$tid, $months]);
            $loanTrend = $pdo->prepare("SELECT DATE_FORMAT(applied_at, '%Y-%m') as period, COUNT(*) as count, COALESCE(SUM(principal_amount),0) as volume FROM loans WHERE tenant_id = ? AND applied_at >= DATE_SUB(NOW(), INTERVAL ? MONTH) GROUP BY period ORDER BY period ASC");
            $loanTrend->execute([$tid, $months]);
            $savingsTrend = $pdo->prepare("SELECT DATE_FORMAT(processed_at, '%Y-%m') as period, COUNT(*) as count, COALESCE(SUM(amount),0) as volume FROM savings_transactions WHERE tenant_id = ? AND transaction_type = 'deposit' AND processed_at >= DATE_SUB(NOW(), INTERVAL ? MONTH) GROUP BY period ORDER BY period ASC");
            $savingsTrend->execute([$tid, $months]);
        }

        jsonResponse(['status' => 'success', 'metrics' => [
            'member_growth' => $memberGrowth->fetchAll(),
            'loan_trend' => $loanTrend->fetchAll(),
            'savings_trend' => $savingsTrend->fetchAll(),
        ]]);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Admin action not found: ' . $action], 404);
}
