<?php
$user = requireAuth();
$userId = $user['user_id'];
$tenantId = $user['tenant_id'] ?? 0;

switch ($_API['action']) {
    case 'tickets':
        if ($_API['id'] === null) {
            if ($_API['method'] === 'GET') {
                $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE tenant_id = ? AND requester_id = ? ORDER BY created_at DESC");
                $stmt->execute([$tenantId, $userId]);
                jsonResponse(['tickets' => $stmt->fetchAll()]);
            } elseif ($_API['method'] === 'POST') {
                $input = getJsonInput();
                if (empty($input['subject']) || empty($input['description'])) {
                    jsonResponse(['status' => 'error', 'message' => 'subject and description required'], 400);
                }

                $ref = 'TKT-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
                $stmt = $pdo->prepare("INSERT INTO support_tickets (tenant_id, requester_id, ticket_type, category, subject, description, priority, status, ticket_number, created_at) VALUES (?, ?, 'support_request', ?, ?, ?, ?, 'open', ?, NOW())");
                $stmt->execute([$tenantId, $userId, $input['category'] ?? 'general', $input['subject'], $input['description'], $input['priority'] ?? 'normal', $ref]);
                $ticketId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ?");
                $stmt->execute([$ticketId]);
                jsonResponse(['ticket' => $stmt->fetch()], 201);
            } else {
                jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
            }
        } else {
            if ($_API['method'] === 'GET') {
                $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ? AND tenant_id = ?");
                $stmt->execute([$_API['id'], $tenantId]);
                $ticket = $stmt->fetch();
                if (!$ticket) jsonResponse(['status' => 'error', 'message' => 'Ticket not found'], 404);

                $stmt = $pdo->prepare("SELECT tr.*, u.full_name as user_name FROM ticket_replies tr JOIN users u ON tr.user_id = u.id WHERE tr.ticket_id = ? ORDER BY tr.created_at ASC");
                $stmt->execute([$_API['id']]);
                $ticket['replies'] = $stmt->fetchAll();

                jsonResponse(['ticket' => $ticket]);
            } elseif ($_API['method'] === 'POST') {
                $subAction = $_API['parts'][1] ?? '';
                if ($subAction !== 'reply') jsonResponse(['status' => 'error', 'message' => 'Action not found'], 404);

                $input = getJsonInput();
                if (empty($input['message'])) jsonResponse(['status' => 'error', 'message' => 'message required'], 400);

                $stmt = $pdo->prepare("SELECT * FROM support_tickets WHERE id = ? AND tenant_id = ?");
                $stmt->execute([$_API['id'], $tenantId]);
                $ticket = $stmt->fetch();
                if (!$ticket) jsonResponse(['status' => 'error', 'message' => 'Ticket not found'], 404);

                $isOperator = in_array($user['role'] ?? '', ['operator', 'admin', 'super_admin']);
                if ($ticket['user_id'] != $userId && !$isOperator) {
                    jsonResponse(['status' => 'error', 'message' => 'Forbidden'], 403);
                }

                $pdo->beginTransaction();
                try {
                    $stmt = $pdo->prepare("INSERT INTO ticket_replies (ticket_id, user_id, message, created_at) VALUES (?, ?, ?, NOW())");
                    $stmt->execute([$_API['id'], $userId, $input['message']]);
                    $replyId = $pdo->lastInsertId();

                    if ($isOperator && $ticket['status'] === 'open') {
                        $stmt = $pdo->prepare("UPDATE support_tickets SET status = 'in_progress' WHERE id = ?");
                        $stmt->execute([$_API['id']]);
                    }

                    $pdo->commit();

                    $stmt = $pdo->prepare("SELECT tr.*, u.full_name as user_name FROM ticket_replies tr JOIN users u ON tr.user_id = u.id WHERE tr.id = ?");
                    $stmt->execute([$replyId]);
                    jsonResponse(['reply' => $stmt->fetch()], 201);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    jsonResponse(['status' => 'error', 'message' => 'Failed to add reply'], 500);
                }
            } elseif ($_API['method'] === 'PUT') {
                $subAction = $_API['parts'][1] ?? '';
                if ($subAction !== 'status') jsonResponse(['status' => 'error', 'message' => 'Action not found'], 404);

                requireRole(['operator', 'admin', 'super_admin']);
                $input = getJsonInput();
                $allowedStatuses = ['open', 'in_progress', 'resolved', 'closed'];
                if (!in_array($input['status'], $allowedStatuses)) {
                    jsonResponse(['status' => 'error', 'message' => 'Invalid status. Allowed: ' . implode(', ', $allowedStatuses)], 400);
                }

                $stmt = $pdo->prepare("UPDATE support_tickets SET status = ? WHERE id = ? AND tenant_id = ?");
                $stmt->execute([$input['status'], $_API['id'], $tenantId]);

                if ($stmt->rowCount() === 0) jsonResponse(['status' => 'error', 'message' => 'Ticket not found'], 404);

                jsonResponse(['status' => 'success', 'message' => 'Ticket status updated']);
            } else {
                jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
            }
        }
        break;

    case 'feedback':
        if ($_API['id'] === null) {
            if ($_API['method'] === 'GET') {
                requireRole(['operator', 'admin', 'super_admin']);
                $stmt = $pdo->prepare("SELECT fe.*, u.full_name as user_name FROM feedback_entries fe JOIN users u ON fe.user_id = u.id WHERE fe.tenant_id = ? ORDER BY fe.created_at DESC");
                $stmt->execute([$tenantId]);
                jsonResponse(['feedback' => $stmt->fetchAll()]);
            } elseif ($_API['method'] === 'POST') {
                $input = getJsonInput();
                if (empty($input['message'])) jsonResponse(['status' => 'error', 'message' => 'message required'], 400);

                $stmt = $pdo->prepare("INSERT INTO feedback_entries (tenant_id, user_id, category, subject, message, status, created_at) VALUES (?, ?, ?, ?, ?, 'new', NOW())");
                $stmt->execute([$tenantId, $userId, $input['category'] ?? 'general', $input['subject'] ?? '', $input['message']]);
                $feedbackId = $pdo->lastInsertId();
                $stmt = $pdo->prepare("SELECT * FROM feedback_entries WHERE id = ?");
                $stmt->execute([$feedbackId]);
                jsonResponse(['feedback' => $stmt->fetch()], 201);
            } else {
                jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
            }
        } else {
            $subAction = $_API['parts'][1] ?? '';
            if ($subAction !== 'status' || $_API['method'] !== 'PUT') {
                jsonResponse(['status' => 'error', 'message' => 'Action not found'], 404);
            }

            requireRole(['operator', 'admin', 'super_admin']);
            $input = getJsonInput();
            $allowedStatuses = ['new', 'read', 'archived'];
            if (!in_array($input['status'], $allowedStatuses)) {
                jsonResponse(['status' => 'error', 'message' => 'Invalid status. Allowed: ' . implode(', ', $allowedStatuses)], 400);
            }

            $stmt = $pdo->prepare("UPDATE feedback_entries SET status = ? WHERE id = ? AND tenant_id = ?");
            $stmt->execute([$input['status'], $_API['id'], $tenantId]);

            if ($stmt->rowCount() === 0) jsonResponse(['status' => 'error', 'message' => 'Feedback not found'], 404);

            jsonResponse(['status' => 'success', 'message' => 'Feedback status updated']);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Action not found: ' . $_API['action']], 404);
}
