<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);
$userId = $user['id'];

$total = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE student_id = ?");
$total->execute([$userId]);
$total = $total->fetchColumn();

$inProgress = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND status = 'active' AND progress < 100");
$inProgress->execute([$userId]);
$inProgress = $inProgress->fetchColumn();

$completed = $pdo->prepare("SELECT COUNT(*) FROM enrollments WHERE student_id = ? AND status = 'completed'");
$completed->execute([$userId]);
$completed = $completed->fetchColumn();

$avgProgress = $pdo->prepare("SELECT AVG(progress) FROM enrollments WHERE student_id = ?");
$avgProgress->execute([$userId]);
$avgProgress = round($avgProgress->fetchColumn() ?? 0, 1);

$stmt = $pdo->prepare("
    SELECT e.*, c.title, c.thumbnail, c.slug, u.name as teacher_name
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON c.teacher_id = u.id
    WHERE e.student_id = ?
    ORDER BY e.last_watched_at DESC, e.enrolled_at DESC
    LIMIT 5
");
$stmt->execute([$userId]);
$recent = $stmt->fetchAll();

sendResponse(true, "Dashboard data", [
    "total_enrolled"   => (int)$total,
    "in_progress"      => (int)$inProgress,
    "completed"        => (int)$completed,
    "average_progress" => $avgProgress,
    "recent_courses"   => $recent
]);
