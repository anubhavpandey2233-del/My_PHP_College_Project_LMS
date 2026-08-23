<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);
$courseId = $_GET['course_id'] ?? 0;

if (!$courseId) sendError("course_id required", null, 422);

$stmt = $pdo->prepare("SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?");
$stmt->execute([$user['id'], $courseId]);
$enrollment = $stmt->fetch();
if (!$enrollment) sendError("You are not enrolled in this course", null, 403);

$stmt = $pdo->prepare("SELECT c.*, u.name as teacher_name FROM courses c JOIN users u ON c.teacher_id = u.id WHERE c.id = ?");
$stmt->execute([$courseId]);
$course = $stmt->fetch();

$stmt = $pdo->prepare("SELECT * FROM chapters WHERE course_id = ? ORDER BY sort_order ASC");
$stmt->execute([$courseId]);
$chapters = $stmt->fetchAll();

foreach ($chapters as &$ch) {
    $stmt2 = $pdo->prepare("SELECT l.*, 
        (SELECT is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = l.id) as is_completed
        FROM lessons l WHERE l.chapter_id = ? ORDER BY l.sort_order ASC");
    $stmt2->execute([$user['id'], $ch['id']]);
    $ch['lessons'] = $stmt2->fetchAll();
}

sendResponse(true, "Learning data", [
    "course"     => $course,
    "enrollment" => $enrollment,
    "chapters"   => $chapters
]);
