<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);
$teacherId = $user['id'];

$totalCourses = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE teacher_id = ?");
$totalCourses->execute([$teacherId]);
$totalCourses = $totalCourses->fetchColumn();

$published = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE teacher_id = ? AND status = 'published'");
$published->execute([$teacherId]);
$published = $published->fetchColumn();

$draft = $pdo->prepare("SELECT COUNT(*) FROM courses WHERE teacher_id = ? AND status = 'draft'");
$draft->execute([$teacherId]);
$draft = $draft->fetchColumn();

$totalStudents = $pdo->prepare("SELECT COUNT(DISTINCT e.student_id) FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE c.teacher_id = ?");
$totalStudents->execute([$teacherId]);
$totalStudents = $totalStudents->fetchColumn();

$totalLessons = $pdo->prepare("SELECT COUNT(*) FROM lessons l JOIN chapters ch ON l.chapter_id = ch.id JOIN courses c ON ch.course_id = c.id WHERE c.teacher_id = ?");
$totalLessons->execute([$teacherId]);
$totalLessons = $totalLessons->fetchColumn();

sendResponse(true, "Dashboard data", [
    "total_courses"     => (int)$totalCourses,
    "published_courses" => (int)$published,
    "draft_courses"     => (int)$draft,
    "total_students"    => (int)$totalStudents,
    "total_lessons"     => (int)$totalLessons,
    "average_rating"    => 0
]);
