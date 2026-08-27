
<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$user = authenticate($pdo, ['admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError(
        "Only POST method is allowed",
        null,
        405
    );
}

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

$messageId = (int)($data['id'] ?? 0);
$status = trim($data['status'] ?? '');

if ($messageId <= 0) {
    sendError(
        "Message id is required",
        null,
        422
    );
}

if (!in_array($status, ['new', 'read', 'replied'], true)) {
    sendError(
        "Invalid status",
        null,
        422
    );
}

$stmt = $pdo->prepare("
    SELECT id
    FROM contact_messages
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $messageId
]);

$message = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$message) {
    sendError(
        "Contact message not found",
        null,
        404
    );
}

$stmt = $pdo->prepare("
    UPDATE contact_messages
    SET status = ?
    WHERE id = ?
");

$stmt->execute([
    $status,
    $messageId
]);

sendResponse(
    true,
    "Contact message status updated successfully",
    [
        "id" => $messageId,
        "status" => $status
    ]
);

