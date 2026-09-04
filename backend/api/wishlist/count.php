<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);

$stmt = $pdo->prepare("
    SELECT COUNT(*) AS count
    FROM wishlists
    WHERE user_id = ?
");

$stmt->execute([
    $user['id']
]);

$result = $stmt->fetch(PDO::FETCH_ASSOC);

sendResponse(
    true,
    "Wishlist count fetched successfully",
    [
        "count" => (int)$result['count']
    ]
);