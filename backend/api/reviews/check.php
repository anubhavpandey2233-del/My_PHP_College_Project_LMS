
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
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// AUTHENTICATION
// ==========================================

$user = authenticate($pdo, ['student']);


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
// GET COURSE ID
// ==========================================

$courseId = (int)($_GET['course_id'] ?? 0);

if ($courseId <= 0) {

    sendError(
        "course_id is required",
        null,
        422
    );

}


// ==========================================
// CHECK COURSE
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        title
    FROM courses
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $courseId
]);

$course = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$course) {

    sendError(
        "Course not found",
        null,
        404
    );

}


// ==========================================
// CHECK ENROLLMENT
// ==========================================

$stmt = $pdo->prepare("
    SELECT id
    FROM enrollments
    WHERE student_id = ?
      AND course_id = ?
    LIMIT 1
");

$stmt->execute([
    $user['id'],
    $courseId
]);

$enrollment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$enrollment) {

    sendError(
        "You are not enrolled in this course",
        null,
        403
    );

}


// ==========================================
// CHECK EXISTING REVIEW
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        rating,
        review_text,
        status,
        created_at
    FROM reviews
    WHERE user_id = ?
      AND course_id = ?
    LIMIT 1
");

$stmt->execute([
    $user['id'],
    $courseId
]);

$review = $stmt->fetch(PDO::FETCH_ASSOC);


// ==========================================
// REVIEW EXISTS
// ==========================================

if ($review) {

    sendResponse(
        true,
        "Review already submitted",
        [
            "has_reviewed" => true,
            "review" => $review,
            "course" => $course
        ],
        200
    );

}


// ==========================================
// REVIEW DOES NOT EXIST
// ==========================================

sendResponse(
    true,
    "No review submitted yet",
    [
        "has_reviewed" => false,
        "review" => null,
        "course" => $course
    ],
    200
);

