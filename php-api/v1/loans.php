<?php
$user = null;
$action = $_API['action'];
$isSuper = fn() => ($_API['method'] !== 'GET' ? requireAuth() : null) && $user['role'] === 'superadmin';
$tidOrNull = function() use (&$user) { return $user['role'] === 'superadmin' ? null : $user['tenant_id']; };

switch ($action) {
    case '':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        if ($user['role'] === 'member') {
            $stmt = $pdo->prepare("SELECT l.*, lp.name as product_name FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id WHERE l.user_id = ? AND l.tenant_id = ? ORDER BY l.applied_at DESC");
            $stmt->execute([$user['user_id'], $user['tenant_id']]);
        } elseif ($user['role'] === 'superadmin') {
            $stmt = $pdo->query("SELECT l.*, lp.name as product_name, u.username FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id JOIN users u ON l.user_id = u.user_id ORDER BY l.applied_at DESC");
        } else {
            $stmt = $pdo->prepare("SELECT l.*, lp.name as product_name, u.username FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id JOIN users u ON l.user_id = u.user_id WHERE l.tenant_id = ? ORDER BY l.applied_at DESC");
            $stmt->execute([$user['tenant_id']]);
        }
        jsonResponse(['status' => 'success', 'loans' => $stmt->fetchAll()]);
        break;

    case 'my-loans':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        if ($user['role'] === 'member') {
            $stmt = $pdo->prepare("SELECT l.*, lp.name as product_name FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id WHERE l.user_id = ? AND l.tenant_id = ? ORDER BY l.applied_at DESC");
            $stmt->execute([$user['user_id'], $user['tenant_id']]);
        } else {
            $tid = $user['tenant_id'];
            if ($user['role'] === 'superadmin') {
                $stmt = $pdo->query("SELECT l.*, lp.name as product_name FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id ORDER BY l.applied_at DESC");
            } else {
                $stmt = $pdo->prepare("SELECT l.*, lp.name as product_name FROM loans l JOIN loan_products lp ON l.product_id = lp.product_id WHERE l.tenant_id = ? ORDER BY l.applied_at DESC");
                $stmt->execute([$tid]);
            }
        }
        jsonResponse(['status' => 'success', 'loans' => $stmt->fetchAll()]);
        break;

    case 'products':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $tid = $_GET['tenant_id'] ?? $user['tenant_id'];
        if (!$tid) jsonResponse(['status' => 'error', 'message' => 'Tenant required'], 400);
        $stmt = $pdo->prepare("SELECT * FROM loan_products WHERE tenant_id = ? AND is_active = 1 ORDER BY name ASC");
        $stmt->execute([$tid]);
        jsonResponse(['status' => 'success', 'products' => $stmt->fetchAll()]);
        break;

    case 'apply':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $data = getJsonInput();
        $tid = $user['tenant_id'];
        if (!$tid) jsonResponse(['status' => 'error', 'message' => 'Tenant not assigned'], 400);

        $check = $pdo->prepare("SELECT COUNT(*) as cnt FROM loans WHERE user_id = ? AND tenant_id = ? AND status IN ('pending','approved','active')");
        $check->execute([$user['user_id'], $tid]);
        if ($check->fetch()['cnt'] > 0) jsonResponse(['status' => 'error', 'message' => 'You already have an active or pending loan'], 400);

        $prod = $pdo->prepare("SELECT * FROM loan_products WHERE product_id = ? AND tenant_id = ?");
        $prod->execute([$data['product_id'], $tid]);
        $product = $prod->fetch();
        if (!$product) jsonResponse(['status' => 'error', 'message' => 'Product not found'], 404);

        $amount = (float)$data['amount'];
        if ($amount < (float)$product['min_amount'] || $amount > (float)$product['max_amount'])
            jsonResponse(['status' => 'error', 'message' => 'Amount outside product limits'], 400);

        $rate = (float)$product['interest_rate_percent'] / 100;
        $term = (int)$data['term_months'];
        if ($term > (int)$product['max_term_months'])
            jsonResponse(['status' => 'error', 'message' => 'Term exceeds product maximum'], 400);

        $frequency = $data['frequency'] ?? 'monthly';
        $interest = $amount * $rate * $term;
        $fees = 20 + 50;
        $totalPayable = $amount + $interest + $fees;
        $installmentAmount = $totalPayable / $term;

        try {
            $pdo->beginTransaction();
            $ref = 'LN-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            $stmt = $pdo->prepare("INSERT INTO loans (tenant_id, user_id, product_id, loan_reference, principal_amount, purpose, term_months, interest_applied, principal_receivable, interest_receivable, fees_applied, total_payable, balance_remaining, repayment_frequency, status, applied_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',NOW())");
            $stmt->execute([$tid, $user['user_id'], $data['product_id'], $ref, $amount, $data['purpose'] ?? '', $term, $interest, $amount, $interest, $fees, $totalPayable, $totalPayable, $frequency]);
            $loanId = $pdo->lastInsertId();

            for ($i = 1; $i <= $term; $i++) {
                $dueDate = date('Y-m-d', strtotime("+{$i} month"));
                $principalPortion = round($amount / $term, 2);
                $interestPortion = round($interest / $term, 2);
                $totalDue = round($installmentAmount, 2);
                $stmt = $pdo->prepare("INSERT INTO loan_schedules (loan_id, tenant_id, installment_number, due_date, principal_amount, interest_amount, total_due, status) VALUES (?,?,?,?,?,?,?,'pending')");
                $stmt->execute([$loanId, $tid, $i, $dueDate, $principalPortion, $interestPortion, $totalDue]);
            }

            if (!empty($data['guarantor_ids'])) {
                $liabilityPct = $product['guarantor_liability_rate'] ?? 25.00;
                foreach ($data['guarantor_ids'] as $gid) {
                    $stmt = $pdo->prepare("INSERT INTO loan_guarantees (loan_id, tenant_id, guarantor_id, liability_percentage, created_at, updated_at) VALUES (?,?,?,?,NOW(),NOW())");
                    $stmt->execute([$loanId, $tid, (int)$gid, $liabilityPct]);
                }
            }

            $pdo->commit();
            jsonResponse(['status' => 'success', 'loan_id' => $loanId, 'reference' => $ref]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Application failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'approve':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $data = getJsonInput();
        if (empty($data['loan_id'])) jsonResponse(['status' => 'error', 'message' => 'loan_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND status = 'pending'");
            $loan->execute([$data['loan_id']]);
        } else {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND tenant_id = ? AND status = 'pending'");
            $loan->execute([$data['loan_id'], $user['tenant_id']]);
        }
        if (!$loan->fetch()) jsonResponse(['status' => 'error', 'message' => 'Loan not found or not pending'], 404);

        $stmt = $pdo->prepare("UPDATE loans SET status = 'approved', approved_at = NOW(), approved_by = ? WHERE loan_id = ?");
        $stmt->execute([$user['user_id'], $data['loan_id']]);
        jsonResponse(['status' => 'success', 'message' => 'Loan approved']);
        break;

    case 'reject':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $data = getJsonInput();
        if (empty($data['loan_id'])) jsonResponse(['status' => 'error', 'message' => 'loan_id required'], 400);
        if (empty($data['reason'])) jsonResponse(['status' => 'error', 'message' => 'Rejection reason required'], 400);

        if ($user['role'] === 'superadmin') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND status = 'pending'");
            $loan->execute([$data['loan_id']]);
        } else {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND tenant_id = ? AND status = 'pending'");
            $loan->execute([$data['loan_id'], $user['tenant_id']]);
        }
        if (!$loan->fetch()) jsonResponse(['status' => 'error', 'message' => 'Loan not found or not pending'], 404);

        $stmt = $pdo->prepare("UPDATE loans SET status = 'rejected', approved_at = NOW(), approved_by = ? WHERE loan_id = ?");
        $stmt->execute([$user['user_id'], $data['loan_id']]);
        jsonResponse(['status' => 'success', 'message' => 'Loan rejected', 'reason' => $data['reason']]);
        break;

    case 'release':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireRole(['operator', 'superadmin']);
        $data = getJsonInput();
        if (empty($data['loan_id'])) jsonResponse(['status' => 'error', 'message' => 'loan_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND status = 'approved'");
            $loan->execute([$data['loan_id']]);
        } else {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND tenant_id = ? AND status = 'approved'");
            $loan->execute([$data['loan_id'], $user['tenant_id']]);
        }
        $loanRow = $loan->fetch();
        if (!$loanRow) jsonResponse(['status' => 'error', 'message' => 'Loan not found or not approved'], 404);

        $loanTenantId = $loanRow['tenant_id'];
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("UPDATE loans SET status = 'active' WHERE loan_id = ?");
            $stmt->execute([$data['loan_id']]);

            $acct = $pdo->prepare("SELECT account_id, balance FROM savings_accounts WHERE user_id = ? AND tenant_id = ? AND account_type = 'regular_savings'");
            $acct->execute([$loanRow['user_id'], $loanTenantId]);
            $account = $acct->fetch();

            if ($account) {
                $newBalance = (float)$account['balance'] + (float)$loanRow['principal_amount'];
                $pdo->prepare("UPDATE savings_accounts SET balance = ?, updated_at = NOW() WHERE account_id = ?")->execute([$newBalance, $account['account_id']]);
                $pdo->prepare("INSERT INTO savings_transactions (account_id, tenant_id, transaction_type, amount, net_amount, reference, status, processed_at, processed_by) VALUES (?,?,'deposit',?,?,'disbursement','verified',NOW(),?)")->execute([$account['account_id'], $loanTenantId, $loanRow['principal_amount'], $loanRow['principal_amount'], $user['user_id']]);
            }

            $pdo->commit();
            jsonResponse(['status' => 'success', 'message' => 'Loan funds released']);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Release failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'pay':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $data = getJsonInput();
        if (empty($data['loan_id'])) jsonResponse(['status' => 'error', 'message' => 'loan_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND status = 'active'");
            $loan->execute([$data['loan_id']]);
        } elseif ($user['role'] === 'member') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND user_id = ? AND tenant_id = ? AND status = 'active'");
            $loan->execute([$data['loan_id'], $user['user_id'], $user['tenant_id']]);
        } else {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND tenant_id = ? AND status = 'active'");
            $loan->execute([$data['loan_id'], $user['tenant_id']]);
        }
        $loanRow = $loan->fetch();
        if (!$loanRow) jsonResponse(['status' => 'error', 'message' => 'Loan not found or not active'], 404);

        $sched = $pdo->prepare("SELECT * FROM loan_schedules WHERE loan_id = ? AND status = 'pending' ORDER BY installment_number ASC LIMIT 1");
        $sched->execute([$data['loan_id']]);
        $schedule = $sched->fetch();
        if (!$schedule) jsonResponse(['status' => 'error', 'message' => 'No pending installments'], 400);

        try {
            $pdo->beginTransaction();

            $payRef = 'PAY-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            $methodId = $data['method_id'] ?? 1;
            $stmt = $pdo->prepare("INSERT INTO payments (loan_id, tenant_id, method_id, payment_reference, amount_paid, status, submitted_at, notes) VALUES (?,?,?,?,?,'verified',NOW(),?)");
            $stmt->execute([$data['loan_id'], $loanRow['tenant_id'], $methodId, $payRef, $schedule['total_due'], $data['notes'] ?? '']);

            $stmt = $pdo->prepare("UPDATE loan_schedules SET status = 'paid', paid_at = NOW() WHERE schedule_id = ?");
            $stmt->execute([$schedule['schedule_id']]);

            $newBalance = (float)$loanRow['balance_remaining'] - (float)$schedule['total_due'];
            if ($newBalance <= 0) {
                $pdo->prepare("UPDATE loans SET balance_remaining = 0, status = 'paid' WHERE loan_id = ?")->execute([$data['loan_id']]);
            } else {
                $pdo->prepare("UPDATE loans SET balance_remaining = ? WHERE loan_id = ?")->execute([$newBalance, $data['loan_id']]);
            }

            $pdo->commit();
            jsonResponse(['status' => 'success', 'message' => 'Payment recorded', 'schedule_id' => $schedule['schedule_id'], 'payment_reference' => $payRef]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Payment failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'full-pay':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $data = getJsonInput();
        if (empty($data['loan_id'])) jsonResponse(['status' => 'error', 'message' => 'loan_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND status IN ('active','approved')");
            $loan->execute([$data['loan_id']]);
        } elseif ($user['role'] === 'member') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND user_id = ? AND tenant_id = ? AND status IN ('active','approved')");
            $loan->execute([$data['loan_id'], $user['user_id'], $user['tenant_id']]);
        } else {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND tenant_id = ? AND status IN ('active','approved')");
            $loan->execute([$data['loan_id'], $user['tenant_id']]);
        }
        $loanRow = $loan->fetch();
        if (!$loanRow) jsonResponse(['status' => 'error', 'message' => 'Loan not found or not payable'], 404);

        try {
            $pdo->beginTransaction();

            $payRef = 'FULL-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
            $methodId = $data['method_id'] ?? 1;
            $stmt = $pdo->prepare("INSERT INTO payments (loan_id, tenant_id, method_id, payment_reference, amount_paid, status, submitted_at, notes) VALUES (?,?,?,?,?,'verified',NOW(),?)");
            $stmt->execute([$data['loan_id'], $loanRow['tenant_id'], $methodId, $payRef, $loanRow['balance_remaining'], $data['notes'] ?? 'Full payment']);

            $stmt = $pdo->prepare("UPDATE loan_schedules SET status = 'paid', paid_at = NOW() WHERE loan_id = ? AND status = 'pending'");
            $stmt->execute([$data['loan_id']]);

            $pdo->prepare("UPDATE loans SET balance_remaining = 0, status = 'paid' WHERE loan_id = ?")->execute([$data['loan_id']]);

            $pdo->commit();
            jsonResponse(['status' => 'success', 'message' => 'Full payment recorded', 'amount_paid' => $loanRow['balance_remaining'], 'payment_reference' => $payRef]);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Payment failed: ' . $e->getMessage()], 500);
        }
        break;

    case 'schedule':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        $user = requireAuth();
        $loanId = $_GET['loan_id'] ?? '';
        if (!$loanId) jsonResponse(['status' => 'error', 'message' => 'loan_id required'], 400);

        if ($user['role'] === 'superadmin') {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ?");
            $loan->execute([$loanId]);
        } else {
            $loan = $pdo->prepare("SELECT * FROM loans WHERE loan_id = ? AND tenant_id = ?");
            $loan->execute([$loanId, $user['tenant_id']]);
        }
        $loanRow = $loan->fetch();
        if (!$loanRow) jsonResponse(['status' => 'error', 'message' => 'Loan not found'], 404);

        if ($user['role'] === 'member' && $loanRow['user_id'] !== $user['user_id'])
            jsonResponse(['status' => 'error', 'message' => 'Forbidden'], 403);

        $stmt = $pdo->prepare("SELECT * FROM loan_schedules WHERE loan_id = ? ORDER BY installment_number ASC");
        $stmt->execute([$loanId]);
        jsonResponse(['status' => 'success', 'schedule' => $stmt->fetchAll()]);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Loan action not found: ' . $action], 404);
}
