<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);
$userId = $user['id'];

/*
|--------------------------------------------------------------------------
| Total Enrolled Courses
|--------------------------------------------------------------------------
| Only published courses should be visible to students.
*/
$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM enrollments e
    INNER JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
      AND c.status = 'published'
");
$stmt->execute([$userId]);

$total = (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| In Progress Courses
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM enrollments e
    INNER JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
      AND c.status = 'published'
      AND e.status = 'active'
      AND e.progress < 100
");
$stmt->execute([$userId]);

$inProgress = (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Completed Courses
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM enrollments e
    INNER JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
      AND c.status = 'published'
      AND e.status = 'completed'
");
$stmt->execute([$userId]);

$completed = (int) $stmt->fetchColumn();


/*
|--------------------------------------------------------------------------
| Average Progress
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare("
    SELECT AVG(e.progress)
    FROM enrollments e
    INNER JOIN courses c ON e.course_id = c.id
    WHERE e.student_id = ?
      AND c.status = 'published'
");
$stmt->execute([$userId]);

$avgProgress = $stmt->fetchColumn();

$avgProgress = round($avgProgress ?? 0, 1);


/*
|--------------------------------------------------------------------------
| Recent Courses
|--------------------------------------------------------------------------
| Only published courses are returned.
*/
$stmt = $pdo->prepare("
    SELECT
        e.id AS enrollment_id,
        e.course_id,
        e.progress,
        e.status AS enrollment_status,
        e.last_watched_at,
        e.enrolled_at,

        c.title,
        c.thumbnail,
        c.slug,

        u.name AS teacher_name

    FROM enrollments e

    INNER JOIN courses c
        ON e.course_id = c.id

    INNER JOIN users u
        ON c.teacher_id = u.id

    WHERE e.student_id = ?
      AND c.status = 'published'

    ORDER BY
        e.last_watched_at DESC,
        e.enrolled_at DESC

    LIMIT 5
");

$stmt->execute([$userId]);

$recent = $stmt->fetchAll(PDO::FETCH_ASSOC);


/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/
sendResponse(true, "Dashboard data", [
    "total_enrolled"   => $total,
    "in_progress"      => $inProgress,
    "completed"        => $completed,
    "average_progress" => $avgProgress,
    "recent_courses"   => $recent
]);