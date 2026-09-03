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

// Check course exists
$stmt = $pdo->prepare("
    SELECT id
    FROM courses
    WHERE id = ?
");

$stmt->execute([$course_id]);

$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    sendError("Course not found", null, 404);
}

// Check if course is already in cart
$stmt = $pdo->prepare("
    SELECT id
    FROM cart_items
    WHERE user_id = ? AND course_id = ?
");

$stmt->execute([
    $user['id'],
    $course_id
]);

if ($stmt->fetch()) {
    sendError("Course is already in your cart", null, 409);
}

// Add course to cart
$stmt = $pdo->prepare("
    INSERT INTO cart_items (user_id, course_id)
    VALUES (?, ?)
");

$stmt->execute([
    $user['id'],
    $course_id
]);

sendResponse(true, "Course added to cart successfully");