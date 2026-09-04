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

$courseId = isset($data['course_id'])
    ? (int)$data['course_id']
    : 0;

if ($courseId <= 0) {
    sendError("Invalid course ID", 400);
}

$stmt = $pdo->prepare("
    SELECT id
    FROM courses
    WHERE id = ?
");

$stmt->execute([$courseId]);

$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    sendError("Course not found", 404);
}

$stmt = $pdo->prepare("
    SELECT id
    FROM wishlists
    WHERE user_id = ?
    AND course_id = ?
");

$stmt->execute([
    $user['id'],
    $courseId
]);

if ($stmt->fetch()) {
    sendError("Course already exists in wishlist", 409);
}

$stmt = $pdo->prepare("
    INSERT INTO wishlists
    (user_id, course_id)
    VALUES (?, ?)
");

$stmt->execute([
    $user['id'],
    $courseId
]);

sendResponse(
    true,
    "Course added to wishlist successfully"
);