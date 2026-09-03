<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$data = json_decode(file_get_contents("php://input"), true);

$course_id = $data['course_id'] ?? 0;

if (!$course_id) {
    sendError("Course ID is required", null, 422);
}

$course_id = (int)$course_id;

// Check if course is in user's cart
$stmt = $pdo->prepare("
    SELECT id
    FROM cart_items
    WHERE user_id = ? AND course_id = ?
");

$stmt->execute([
    $user['id'],
    $course_id
]);

$cartItem = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$cartItem) {
    sendError("Course is not in your cart", null, 404);
}

// Remove course from cart
$stmt = $pdo->prepare("
    DELETE FROM cart_items
    WHERE user_id = ? AND course_id = ?
");

$stmt->execute([
    $user['id'],
    $course_id
]);

sendResponse(true, "Course removed from cart successfully");