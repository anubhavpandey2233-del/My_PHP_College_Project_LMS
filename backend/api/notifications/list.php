
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo);

$stmt = $pdo->prepare("
    SELECT
        id,
        user_id,
        title,
        message,
        type,
        is_read,
        link,
        created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
");

$stmt->execute([
    $user['id']
]);

$notifications =
    $stmt->fetchAll(PDO::FETCH_ASSOC);

$unreadStmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = ?
    AND is_read = 0
");

$unreadStmt->execute([
    $user['id']
]);

$unreadCount =
    (int) $unreadStmt->fetchColumn();

sendResponse(
    true,
    "Notifications",
    [
        "notifications" => $notifications,
        "unread_count" => $unreadCount
    ]
);

