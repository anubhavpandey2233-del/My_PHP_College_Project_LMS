
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

$user = authenticate($pdo, ['admin']);


// ==========================================
// GET REVIEWS
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        rv.id,
        rv.user_id,
        rv.course_id,

        u.name AS student_name,
        u.email AS student_email,

        c.title AS course_title,

        rv.rating,
        rv.review_text,
        rv.status,
        rv.created_at

    FROM reviews rv

    INNER JOIN users u
        ON rv.user_id = u.id

    INNER JOIN courses c
        ON rv.course_id = c.id

    ORDER BY rv.id DESC
");

$stmt->execute();

$reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Reviews fetched successfully",
    $reviews
);

