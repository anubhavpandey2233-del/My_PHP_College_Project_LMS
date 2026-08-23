<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$id   = $_GET['id'] ?? 0;
$slug = $_GET['slug'] ?? '';

if ($id) {
    $stmt = $pdo->prepare("SELECT c.*, u.name as teacher_name, cat.name as category_name, sub.name as subcategory_name
                           FROM courses c
                           JOIN users u ON c.teacher_id = u.id
                           JOIN categories cat ON c.category_id = cat.id
                           LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
                           WHERE c.id = ?");
    $stmt->execute([$id]);
} elseif ($slug) {
    $stmt = $pdo->prepare("SELECT c.*, u.name as teacher_name, cat.name as category_name, sub.name as subcategory_name
                           FROM courses c
                           JOIN users u ON c.teacher_id = u.id
                           JOIN categories cat ON c.category_id = cat.id
                           LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
                           WHERE c.slug = ?");
    $stmt->execute([$slug]);
} else {
    sendError("ID or slug required", null, 422);
}

$course = $stmt->fetch();
if (!$course) sendError("Course not found", null, 404);

// Requirements
$stmt = $pdo->prepare("SELECT * FROM course_requirements WHERE course_id = ? ORDER BY sort_order");
$stmt->execute([$course['id']]);
$course['requirements'] = $stmt->fetchAll();

// Outcomes
$stmt = $pdo->prepare("SELECT * FROM course_outcomes WHERE course_id = ? ORDER BY sort_order");
$stmt->execute([$course['id']]);
$course['outcomes'] = $stmt->fetchAll();

// Approved reviews
$stmt = $pdo->prepare("SELECT r.*, u.name as student_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.course_id = ? AND r.status = 'approved' ORDER BY r.created_at DESC LIMIT 10");
$stmt->execute([$course['id']]);
$course['reviews'] = $stmt->fetchAll();

sendResponse(true, "Course details", $course);
