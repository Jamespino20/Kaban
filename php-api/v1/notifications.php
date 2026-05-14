<?php
$user = requireAuth();
$userId = $user['user_id'];

switch ($_API['action']) {
    case '':
        if ($_API['method'] !== 'GET') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

        $stmt = $pdo->prepare("
            SELECT * FROM notifications
            WHERE user_id = ?
            ORDER BY is_read ASC, created_at DESC
            LIMIT 20
        ");
        $stmt->execute([$userId]);
        $notifications = $stmt->fetchAll();

        $stmt = $pdo->prepare("SELECT COUNT(*) as total_unread FROM notifications WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);
        $unreadCount = $stmt->fetch()['total_unread'];

        jsonResponse(['notifications' => $notifications, 'unread_count' => (int)$unreadCount]);
        break;

    case 'mark-read':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

        $input = getJsonInput();
        $notificationId = $input['notification_id'] ?? null;
        if (!$notificationId) jsonResponse(['status' => 'error', 'message' => 'notification_id required'], 400);

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->execute([$notificationId, $userId]);

        if ($stmt->rowCount() === 0) jsonResponse(['status' => 'error', 'message' => 'Notification not found'], 404);

        jsonResponse(['status' => 'success', 'message' => 'Marked as read']);
        break;

    case 'mark-all-read':
        if ($_API['method'] !== 'POST') jsonResponse(['status' => 'error', 'message' => 'Method not allowed'], 405);

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0");
        $stmt->execute([$userId]);

        jsonResponse(['status' => 'success', 'message' => 'All notifications marked as read', 'updated' => $stmt->rowCount()]);
        break;

    default:
        jsonResponse(['status' => 'error', 'message' => 'Action not found: ' . $_API['action']], 404);
}
