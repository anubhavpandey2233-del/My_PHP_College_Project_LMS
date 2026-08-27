
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// AUTH
// ==========================================

$user = authenticate($pdo, ['admin']);


// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

$stats = [

    "total_users" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM users
    ")->fetchColumn(),


    "total_teachers" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM users
        WHERE role_id = 2
    ")->fetchColumn(),


    "total_students" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM users
        WHERE role_id = 3
    ")->fetchColumn(),


    "total_courses" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM courses
    ")->fetchColumn(),


    "published_courses" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM courses
        WHERE status = 'published'
    ")->fetchColumn(),


    "total_enrollments" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM enrollments
    ")->fetchColumn(),


    // ======================================
    // APPROVED REVIEWS
    // ======================================

    "approved_reviews" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM reviews
        WHERE status = 'approved'
    ")->fetchColumn(),


    "total_quizzes" => (int) $pdo->query("
        SELECT COUNT(*)
        FROM quizzes
    ")->fetchColumn()

];


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Admin stats",
    $stats
);

