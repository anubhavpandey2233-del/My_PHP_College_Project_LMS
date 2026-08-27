
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// AUTHENTICATION
// ==========================================

$user = authenticate($pdo, ['admin', 'teacher']);


// ==========================================
// GET JSON DATA
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    sendError(
        "Invalid JSON data",
        null,
        400
    );

}


// ==========================================
// GET NOTIFICATION ID
// ==========================================

$notificationId = (int)($data['notification_id'] ?? 0);

if (!$notificationId) {

    sendError(
        "notification_id required",
        null,
        422
    );

}


// ==========================================
// CHECK NOTIFICATION
// ==========================================

$stmt = $pdo->prepare("
    SELECT id
    FROM notifications
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
");

$stmt->execute([
    $notificationId,
    $user['id']
]);

$notification = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$notification) {

    sendError(
        "Notification not found",
        null,
        404
    );

}


// ==========================================
// MARK AS READ
// ==========================================

$stmt = $pdo->prepare("
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
      AND user_id = ?
");

$stmt->execute([
    $notificationId,
    $user['id']
]);


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Notification marked as read",
    [
        "notification_id" => $notificationId
    ]
);

