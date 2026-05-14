<?php
$user = requireAuth();
$userId = $user['user_id'];
$tenantId = $user['tenant_id'] ?? 0;

switch ($_API['action']) {
    case 'conversations':
        if ($_API['method'] === 'GET') {
            $stmt = $pdo->prepare("
                SELECT c.*, 
                    (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at,
                    (SELECT COUNT(*) FROM messages m2 WHERE m2.conversation_id = c.id AND m2.created_at > COALESCE(cp.last_read_at, '1970-01-01')) as unread_count
                FROM conversations c
                JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ?
                ORDER BY last_message_at DESC
            ");
            $stmt->execute([$userId]);
            jsonResponse(['conversations' => $stmt->fetchAll()]);
        } elseif ($_API['method'] === 'POST') {
            $input = getJsonInput();
            $type = $input['type'] ?? 'direct';
            $name = $input['name'] ?? null;
            $participantIds = $input['participant_ids'] ?? [];

            if (empty($participantIds)) jsonResponse(['status' => 'error', 'message' => 'participant_ids required'], 400);

            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("INSERT INTO conversations (tenant_id, type, name, created_by, created_at) VALUES (?, ?, ?, ?, NOW())");
                $stmt->execute([$tenantId, $type, $name, $userId]);
                $conversationId = $pdo->lastInsertId();

                $allParticipants = array_unique(array_merge([$userId], $participantIds));
                $stmt = $pdo->prepare("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)");
                foreach ($allParticipants as $pid) {
                    $stmt->execute([$conversationId, $pid]);
                }

                $pdo->commit();

                $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
                $stmt->execute([$conversationId]);
                jsonResponse(['conversation' => $stmt->fetch()], 201);
            } catch (Exception $e) {
                $pdo->rollBack();
                jsonResponse(['status' => 'error', 'message' => 'Failed to create conversation'], 500);
            }
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        }
        break;

    case 'messages':
        if ($_API['method'] === 'GET') {
            $conversationId = $_GET['conversation_id'] ?? null;
            if (!$conversationId) jsonResponse(['status' => 'error', 'message' => 'conversation_id required'], 400);

            $page = max(1, (int)($_GET['page'] ?? 1));
            $offset = ($page - 1) * 50;

            $stmt = $pdo->prepare("
                SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ?
                ORDER BY m.created_at DESC
                LIMIT 50 OFFSET ?
            ");
            $stmt->execute([$conversationId, $offset]);
            $messages = $stmt->fetchAll();

            if (!empty($messages)) {
                $messageIds = array_column($messages, 'id');
                $placeholders = implode(',', array_fill(0, count($messageIds), '?'));
                $stmt = $pdo->prepare("SELECT * FROM message_reactions WHERE message_id IN ($placeholders)");
                $stmt->execute($messageIds);
                $reactions = $stmt->fetchAll();

                $reactionsByMessage = [];
                foreach ($reactions as $r) {
                    $reactionsByMessage[$r['message_id']][] = $r;
                }
                foreach ($messages as &$msg) {
                    $msg['reactions'] = $reactionsByMessage[$msg['id']] ?? [];
                }
                unset($msg);
            }

            jsonResponse(['messages' => $messages, 'page' => $page]);
        } elseif ($_API['method'] === 'POST') {
            $input = getJsonInput();
            $conversationId = $input['conversation_id'] ?? null;
            $content = $input['content'] ?? '';
            $replyToId = $input['reply_to_id'] ?? null;

            if (!$conversationId || !$content) jsonResponse(['status' => 'error', 'message' => 'conversation_id and content required'], 400);

            $stmt = $pdo->prepare("SELECT 1 FROM conversation_participants WHERE conversation_id = ? AND user_id = ?");
            $stmt->execute([$conversationId, $userId]);
            if (!$stmt->fetch()) jsonResponse(['status' => 'error', 'message' => 'Not a participant'], 403);

            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("INSERT INTO messages (conversation_id, sender_id, content, reply_to_id, created_at) VALUES (?, ?, ?, ?, NOW())");
                $stmt->execute([$conversationId, $userId, $content, $replyToId]);
                $messageId = $pdo->lastInsertId();
                $pdo->commit();

                $stmt = $pdo->prepare("SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?");
                $stmt->execute([$messageId]);
                jsonResponse(['message' => $stmt->fetch()], 201);
            } catch (Exception $e) {
                $pdo->rollBack();
                jsonResponse(['status' => 'error', 'message' => 'Failed to send message'], 500);
            }
        } else {
            jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);
        }
        break;

    case 'reactions':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

        $input = getJsonInput();
        $messageId = $input['message_id'] ?? null;
        $emoji = $input['emoji'] ?? '';

        if (!$messageId || !$emoji) jsonResponse(['status' => 'error', 'message' => 'message_id and emoji required'], 400);

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?");
            $stmt->execute([$messageId, $userId, $emoji]);
            $existing = $stmt->fetch();

            if ($existing) {
                $stmt = $pdo->prepare("DELETE FROM message_reactions WHERE id = ?");
                $stmt->execute([$existing['id']]);
                $pdo->commit();
                jsonResponse(['status' => 'success', 'action' => 'removed']);
            } else {
                $stmt = $pdo->prepare("INSERT INTO message_reactions (message_id, user_id, emoji, created_at) VALUES (?, ?, ?, NOW())");
                $stmt->execute([$messageId, $userId, $emoji]);
                $pdo->commit();
                jsonResponse(['status' => 'success', 'action' => 'added', 'id' => $pdo->lastInsertId()], 201);
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Failed to toggle reaction'], 500);
        }
        break;

    case 'read':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

        $input = getJsonInput();
        $conversationId = $input['conversation_id'] ?? null;
        if (!$conversationId) jsonResponse(['status' => 'error', 'message' => 'conversation_id required'], 400);

        $stmt = $pdo->prepare("UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?");
        $stmt->execute([$conversationId, $userId]);

        if ($stmt->rowCount() === 0) jsonResponse(['status' => 'error', 'message' => 'Not a participant'], 403);

        jsonResponse(['status' => 'success', 'message' => 'Marked as read']);
        break;

    case 'operator-room':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

        $stmt = $pdo->prepare("
            SELECT c.* FROM conversations c
            JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ?
            WHERE c.tenant_id = ? AND c.type = 'operator_room'
            LIMIT 1
        ");
        $stmt->execute([$userId, $tenantId]);
        $room = $stmt->fetch();

        if ($room) {
            $stmt = $pdo->prepare("SELECT user_id FROM conversation_participants WHERE conversation_id = ?");
            $stmt->execute([$room['id']]);
            $room['participant_ids'] = array_column($stmt->fetchAll(), 'user_id');
            jsonResponse(['room' => $room]);
        }

        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("INSERT INTO conversations (tenant_id, type, name, created_by, created_at) VALUES (?, 'operator_room', 'Operator Room', ?, NOW())");
            $stmt->execute([$tenantId, $userId]);
            $roomId = $pdo->lastInsertId();

            $stmt = $pdo->prepare("SELECT user_id FROM users WHERE tenant_id = ? AND role IN ('operator', 'admin', 'super_admin')");
            $stmt->execute([$tenantId]);
            $operatorIds = array_column($stmt->fetchAll(), 'user_id');

            $allParticipants = array_unique(array_merge([$userId], $operatorIds));
            $stmt = $pdo->prepare("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)");
            foreach ($allParticipants as $pid) {
                $stmt->execute([$roomId, $pid]);
            }

            $pdo->commit();

            $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
            $stmt->execute([$roomId]);
            $newRoom = $stmt->fetch();
            $newRoom['participant_ids'] = $allParticipants;

            jsonResponse(['room' => $newRoom], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonResponse(['status' => 'error', 'message' => 'Failed to create operator room'], 500);
        }
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Action not found: ' . $_API['action']], 404);
}
