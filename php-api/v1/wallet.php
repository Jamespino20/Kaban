<?php
$action = $_API['action'];

switch ($action) {
    case '':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $acct = $pdo->prepare("SELECT * FROM savings_accounts WHERE user_id = ? AND tenant_id = ? AND account_type = 'regular_savings'");
        $acct->execute([$user['user_id'], $user['tenant_id']]);
        $account = $acct->fetch();
        if (!$account) {
            $pdo->prepare("INSERT INTO savings_accounts (tenant_id, user_id, account_type, owner_role, balance, opened_at, updated_at) VALUES (?,?,'regular_savings',?,0,NOW(),NOW())")->execute([$user['tenant_id'], $user['user_id'], $user['role'] ?? 'member']);
            $account = $pdo->prepare("SELECT * FROM savings_accounts WHERE user_id = ? AND tenant_id = ? AND account_type = 'regular_savings'");
            $account->execute([$user['user_id'], $user['tenant_id']]);
            $account = $account->fetch();
        }

        $txn = $pdo->prepare("SELECT * FROM savings_transactions WHERE account_id = ? ORDER BY processed_at DESC LIMIT 20");
        $txn->execute([$account['account_id']]);
        jsonResponse(['status' => 'success', 'account' => $account, 'recent_transactions' => $txn->fetchAll()]);
        break;

    case 'deposit':
    case 'topup':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $data = getJsonInput();
        if (empty($data['amount']) || (float)$data['amount'] <= 0)
            jsonResponse(['status' => 'error', 'message' => 'Valid amount required'], 400);

        $amount = (float)$data['amount'];
        $fee = round($amount * 0.02, 2);
        $net = $amount - $fee;

        $stmt = $pdo->prepare("INSERT INTO topup_requests (tenant_id, user_id, request_type, amount, fee_amount, net_amount, method_label, external_reference, status, receipt_url, created_at) VALUES (?,?,'deposit',?,?,?,?,?,'pending',?,NOW())");
        $stmt->execute([$user['tenant_id'], $user['user_id'], $amount, $fee, $net, $data['method_label'] ?? '', $data['external_reference'] ?? '', $data['receipt_url'] ?? '']);
        jsonResponse(['status' => 'success', 'message' => 'Top-up request submitted', 'request_id' => $pdo->lastInsertId()]);
        break;

    case 'withdraw':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $data = getJsonInput();
        if (empty($data['amount']) || (float)$data['amount'] <= 0)
            jsonResponse(['status' => 'error', 'message' => 'Valid amount required'], 400);

        $acct = $pdo->prepare("SELECT * FROM savings_accounts WHERE user_id = ? AND tenant_id = ? AND account_type = 'regular_savings'");
        $acct->execute([$user['user_id'], $user['tenant_id']]);
        $account = $acct->fetch();
        if (!$account || (float)$account['balance'] < (float)$data['amount'])
            jsonResponse(['status' => 'error', 'message' => 'Insufficient balance'], 400);

        $amount = (float)$data['amount'];
        $fee = round($amount * 0.01, 2);
        $net = $amount - $fee;

        $stmt = $pdo->prepare("INSERT INTO topup_requests (tenant_id, user_id, request_type, amount, fee_amount, net_amount, method_label, external_reference, status, created_at) VALUES (?,?,'withdrawal',?,?,?,?,?,'pending',NOW())");
        $stmt->execute([$user['tenant_id'], $user['user_id'], $amount, $fee, $net, $data['method_label'] ?? '', $data['external_reference'] ?? '']);
        jsonResponse(['status' => 'success', 'message' => 'Withdrawal request submitted', 'request_id' => $pdo->lastInsertId()]);
        break;

    case 'pending-topups':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $type = $_GET['type'] ?? '';

        if ($user['role'] === 'superadmin') {
            if ($type) {
                $stmt = $pdo->prepare("SELECT tr.*, u.username, u.email FROM topup_requests tr JOIN users u ON tr.user_id = u.user_id WHERE tr.status = 'pending' AND tr.request_type = ? ORDER BY tr.created_at DESC");
                $stmt->execute([$type]);
            } else {
                $stmt = $pdo->query("SELECT tr.*, u.username, u.email FROM topup_requests tr JOIN users u ON tr.user_id = u.user_id WHERE tr.status = 'pending' ORDER BY tr.created_at DESC");
            }
        } else {
            $tid = $user['tenant_id'];
            if ($type) {
                $stmt = $pdo->prepare("SELECT tr.*, u.username, u.email FROM topup_requests tr JOIN users u ON tr.user_id = u.user_id WHERE tr.tenant_id = ? AND tr.status = 'pending' AND tr.request_type = ? ORDER BY tr.created_at DESC");
                $stmt->execute([$tid, $type]);
            } else {
                $stmt = $pdo->prepare("SELECT tr.*, u.username, u.email FROM topup_requests tr JOIN users u ON tr.user_id = u.user_id WHERE tr.tenant_id = ? AND tr.status = 'pending' ORDER BY tr.created_at DESC");
                $stmt->execute([$tid]);
            }
        }
        jsonResponse(['status' => 'success', 'requests' => $stmt->fetchAll()]);
        break;

    case 'approve-topup':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $data = getJsonInput();
        if (empty($data['request_id'])) jsonResponse(['status' => 'error', 'message' => 'request_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $req = $pdo->prepare("SELECT * FROM topup_requests WHERE id = ? AND status = 'pending'");
            $req->execute([$data['request_id']]);
        } else {
            $req = $pdo->prepare("SELECT * FROM topup_requests WHERE id = ? AND tenant_id = ? AND status = 'pending'");
            $req->execute([$data['request_id'], $user['tenant_id']]);
        }
        $request = $req->fetch();
        if (!$request) jsonResponse(['status' => 'error', 'message' => 'Request not found or already processed'], 404);

        $reqTenantId = $request['tenant_id'];
        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("UPDATE topup_requests SET status = 'verified', processed_at = NOW(), processed_by = ?, admin_notes = ? WHERE id = ?");
            $stmt->execute([$user['user_id'], $data['notes'] ?? '', $data['request_id']]);

            $acct = $pdo->prepare("SELECT account_id, balance FROM savings_accounts WHERE user_id = ? AND tenant_id = ? AND account_type = 'regular_savings'");
            $acct->execute([$request['user_id'], $reqTenantId]);
            $account = $acct->fetch();

            if (!$account) {
                $pdo->prepare("INSERT INTO savings_accounts (tenant_id, user_id, account_type, owner_role, balance, opened_at, updated_at) VALUES (?,?,'regular_savings','member',0,NOW(),NOW())")->execute([$reqTenantId, $request['user_id']]);
                $acct->execute([$request['user_id'], $reqTenantId]);
                $account = $acct->fetch();
            }

            if ($request['request_type'] === 'deposit') {
                $newBalance = (float)$account['balance'] + (float)$request['net_amount'];
                $txType = 'deposit';
            } else {
                $newBalance = max(0, (float)$account['balance'] - (float)$request['amount']);
                $txType = 'withdrawal';
            }

            $pdo->prepare("UPDATE savings_accounts SET balance = ?, updated_at = NOW() WHERE account_id = ?")->execute([$newBalance, $account['account_id']]);
            $ref = strtoupper($txType) . '-' . date('Ymd') . '-' . str_pad($data['request_id'], 6, '0', STR_PAD_LEFT);
            $pdo->prepare("INSERT INTO savings_transactions (account_id, tenant_id, transaction_type, amount, fee_amount, net_amount, reference, status, processed_at, processed_by, method_label, external_reference) VALUES (?,?,?,?,?,?,?,'verified',NOW(),?,?,?)")->execute([$account['account_id'], $reqTenantId, $txType, $request['amount'], $request['fee_amount'], $request['net_amount'], $ref, $user['user_id'], $request['method_label'], $request['external_reference']]);

            $pdo->commit();
            jsonResponse(['status' => 'success', 'message' => ucfirst($txType) . ' approved', 'new_balance' => $newBalance]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Approval failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'reject-topup':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $data = getJsonInput();
        if (empty($data['request_id'])) jsonResponse(['status' => 'error', 'message' => 'request_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $req = $pdo->prepare("SELECT * FROM topup_requests WHERE id = ? AND status = 'pending'");
            $req->execute([$data['request_id']]);
        } else {
            $req = $pdo->prepare("SELECT * FROM topup_requests WHERE id = ? AND tenant_id = ? AND status = 'pending'");
            $req->execute([$data['request_id'], $user['tenant_id']]);
        }
        if (!$req->fetch()) jsonResponse(['status' => 'error', 'message' => 'Request not found or already processed'], 404);

        $stmt = $pdo->prepare("UPDATE topup_requests SET status = 'rejected', processed_at = NOW(), processed_by = ?, admin_notes = ? WHERE id = ?");
        $stmt->execute([$user['user_id'], $data['reason'] ?? 'Rejected by admin', $data['request_id']]);
        jsonResponse(['status' => 'success', 'message' => 'Request rejected']);
        break;

    case 'transactions':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $acct = $pdo->prepare("SELECT account_id FROM savings_accounts WHERE user_id = ? AND tenant_id = ? AND account_type = 'regular_savings'");
        $acct->execute([$user['user_id'], $user['tenant_id']]);
        $account = $acct->fetch();
        if (!$account) jsonResponse(['status' => 'success', 'transactions' => [], 'total' => 0, 'page' => $page]);

        $count = $pdo->prepare("SELECT COUNT(*) as total FROM savings_transactions WHERE account_id = ?");
        $count->execute([$account['account_id']]);
        $total = $count->fetch()['total'];

        $stmt = $pdo->prepare("SELECT * FROM savings_transactions WHERE account_id = ? ORDER BY processed_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$account['account_id'], $limit, $offset]);
        jsonResponse(['status' => 'success', 'transactions' => $stmt->fetchAll(), 'total' => (int)$total, 'page' => $page, 'pages' => max(1, (int)ceil($total / $limit))]);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Wallet action not found: ' . $action], 404);
}
