<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);
$data = json_decode(file_get_contents("php://input"), true);
$lessonId = $data['lesson_id'] ?? 0;

if (!$lessonId) sendError("lesson_id required", null, 422);

$stmt = $pdo->prepare("SELECT ch.course_id FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE l.id = ?");
$stmt->execute([$lessonId]);
$row = $stmt->fetch();
if (!$row) sendError("Lesson not found", null, 404);
$courseId = $row['course_id'];

$stmt = $pdo->prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?");
$stmt->execute([$user['id'], $courseId]);
if (!$stmt->fetch()) sendError("Not enrolled", null, 403);

$stmt = $pdo->prepare("INSERT INTO lesson_progress (user_id, lesson_id, is_completed, completed_at)
                       VALUES (?, ?, 1, NOW())
                       ON DUPLICATE KEY UPDATE is_completed = 1, completed_at = NOW()");
$stmt->execute([$user['id'], $lessonId]);

$pdo->prepare("UPDATE enrollments SET last_lesson_id = ?, last_watched_at = NOW() WHERE student_id = ? AND course_id = ?")
    ->execute([$lessonId, $user['id'], $courseId]);

$stmt = $pdo->prepare("SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = ?");
$stmt->execute([$courseId]);
$totalLessons = $stmt->fetchColumn();

$stmt = $pdo->prepare("SELECT COUNT(*) FROM lesson_progress lp 
                       JOIN lessons l ON lp.lesson_id = l.id 
                       JOIN chapters ch ON l.chapter_id = ch.id 
                       WHERE ch.course_id = ? AND lp.user_id = ? AND lp.is_completed = 1");
$stmt->execute([$courseId, $user['id']]);
$completed = $stmt->fetchColumn();

$progress = $totalLessons > 0 ? round(($completed / $totalLessons) * 100, 2) : 0;
$status = $progress >= 100 ? 'completed' : 'active';
$completedAt = $progress >= 100 ? date('Y-m-d H:i:s') : null;

$pdo->prepare("UPDATE enrollments SET progress = ?, status = ?, completed_at = ? WHERE student_id = ? AND course_id = ?")
    ->execute([$progress, $status, $completedAt, $user['id'], $courseId]);

if ($progress >= 100) {
    $code = 'CERT-' . strtoupper(bin2hex(random_bytes(6)));
    $pdo->prepare("INSERT IGNORE INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)")
        ->execute([$user['id'], $courseId, $code]);
}

sendResponse(true, "Lesson marked complete", [
    "progress"          => $progress,
    "status"            => $status,
    "completed_lessons" => (int)$completed,
    "total_lessons"     => (int)$totalLessons
]);
