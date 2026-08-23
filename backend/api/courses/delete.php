<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher']);
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

if (!$id) sendError("ID required", null, 422);

$stmt = $pdo->prepare("SELECT teacher_id, thumbnail FROM courses WHERE id = ?");
$stmt->execute([$id]);
$course = $stmt->fetch();
if (!$course) sendError("Course not found", null, 404);

if ($user['role'] === 'teacher' && $course['teacher_id'] != $user['id']) {
    sendError("You can only delete your own courses", null, 403);
}

if ($course['thumbnail']) {
    $path = __DIR__ . '/../../uploads/courses/' . $course['thumbnail'];
    if (file_exists($path)) unlink($path);
}

$stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
$stmt->execute([$id]);

sendResponse(true, "Course deleted");
