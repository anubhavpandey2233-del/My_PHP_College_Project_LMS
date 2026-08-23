<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);
$status = $_GET['status'] ?? 'all';

$sql = "SELECT e.*, c.title, c.thumbnail, c.slug, c.level, u.name as teacher_name,
               (SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id) as total_lessons,
               (SELECT COUNT(*) FROM lesson_progress lp JOIN lessons l ON lp.lesson_id = l.id JOIN chapters ch ON l.chapter_id = ch.id WHERE ch.course_id = c.id AND lp.user_id = e.student_id AND lp.is_completed = 1) as completed_lessons
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        JOIN users u ON c.teacher_id = u.id
        WHERE e.student_id = ?";

$params = [$user['id']];

if ($status === 'active') {
    $sql .= " AND e.status = 'active'";
} elseif ($status === 'completed') {
    $sql .= " AND e.status = 'completed'";
}

$sql .= " ORDER BY e.last_watched_at DESC, e.enrolled_at DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

sendResponse(true, "My courses", $stmt->fetchAll());
