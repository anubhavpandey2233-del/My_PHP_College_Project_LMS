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
        cart_items.id,
        cart_items.course_id,
        cart_items.quantity,
        cart_items.created_at,
        courses.title,
        courses.slug,
        courses.short_description,
        courses.thumbnail,
        courses.price,
        courses.discount_price,
        courses.level,
        courses.language,
        courses.duration_hours
    FROM cart_items
    INNER JOIN courses 
        ON cart_items.course_id = courses.id
    WHERE cart_items.user_id = ?
    ORDER BY cart_items.id DESC
");

$stmt->execute([
    $user['id']
]);

$cart = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendResponse(
    true,
    "Cart fetched successfully",
    $cart
);