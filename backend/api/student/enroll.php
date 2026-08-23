<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);
$data = json_decode(file_get_contents("php://input"), true);
$courseId = $data['course_id'] ?? 0;

if (!$courseId) sendError("course_id required", null, 422);

$stmt = $pdo->prepare("SELECT id, status FROM courses WHERE id = ?");
$stmt->execute([$courseId]);
$course = $stmt->fetch();
if (!$course) sendError("Course not found", null, 404);
if ($course['status'] !== 'published') sendError("Course is not available for enrollment", null, 400);

$stmt = $pdo->prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?");
$stmt->execute([$user['id'], $courseId]);
if ($stmt->fetch()) sendError("You are already enrolled in this course", null, 409);

$stmt = $pdo->prepare("INSERT INTO enrollments (student_id, course_id, progress, status) VALUES (?, ?, 0, 'active')");
$stmt->execute([$user['id'], $courseId]);

$pdo->prepare("UPDATE courses SET total_students = total_students + 1 WHERE id = ?")->execute([$courseId]);

sendResponse(true, "Successfully enrolled", ["enrollment_id" => $pdo->lastInsertId()], 201);
