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
    SELECT
        w.id,
        w.course_id,
        c.slug,
        c.title,
        c.price,
        c.discount_price,
        c.thumbnail AS image
    FROM wishlists w
    INNER JOIN courses c
        ON c.id = w.course_id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
");

$stmt->execute([
    $user['id']
]);

$wishlist = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendResponse(
    true,
    "Wishlist fetched successfully",
    $wishlist
);