
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(
        "Only GET method is allowed",
        null,
        405
    );
}

$stmt = $pdo->prepare("
    SELECT
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
    FROM contact_messages
    ORDER BY created_at DESC
");

$stmt->execute();

$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendResponse(
    true,
    "Contact messages loaded successfully",
    $messages
);

