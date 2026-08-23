<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher']);
$data = json_decode(file_get_contents("php://input"), true);

$courseId = $data['course_id'] ?? 0;
$title = trim($data['title'] ?? '');

if (!$courseId || empty($title)) sendError("course_id and title required", null, 422);

$stmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
$stmt->execute([$courseId]);
$course = $stmt->fetch();
if (!$course || ($user['role'] === 'teacher' && $course['teacher_id'] != $user['id'])) {
    sendError("Unauthorized", null, 403);
}

$stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM chapters WHERE course_id = ?");
$stmt->execute([$courseId]);
$sort = $stmt->fetchColumn();

$stmt = $pdo->prepare("INSERT INTO chapters (course_id, title, sort_order) VALUES (?, ?, ?)");
$stmt->execute([$courseId, $title, $sort]);

sendResponse(true, "Chapter created", ["id" => $pdo->lastInsertId()], 201);
