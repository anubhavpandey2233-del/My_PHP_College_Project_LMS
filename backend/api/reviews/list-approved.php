
<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");


// ==========================================
// PREFLIGHT
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ==========================================
// FILES
// ==========================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';


// ==========================================
// METHOD CHECK
// ==========================================

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {

    sendError(
        "Only GET method is allowed",
        null,
        405
    );

}


// ==========================================
// COURSE ID
// ==========================================

$courseId = (int) ($_GET['course_id'] ?? 0);

if ($courseId <= 0) {

    sendError(
        "course_id is required",
        null,
        422
    );

}


// ==========================================
// GET APPROVED REVIEWS
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        rv.id,
        rv.user_id,
        rv.course_id,

        u.name AS student_name,
        u.avatar AS student_avatar,

        rv.rating,
        rv.review_text,
        rv.created_at

    FROM reviews rv

    INNER JOIN users u
        ON rv.user_id = u.id

    WHERE rv.course_id = ?
      AND rv.status = 'approved'

    ORDER BY rv.id DESC
");

$stmt->execute([
    $courseId
]);

$reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Approved reviews fetched successfully",
    $reviews
);

