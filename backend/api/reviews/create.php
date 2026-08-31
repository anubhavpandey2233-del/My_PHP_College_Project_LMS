<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    sendError(
        "Only POST method is allowed",
        null,
        405
    );

}


// ==========================================
// GET JSON DATA
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    sendError(
        "Invalid JSON data",
        null,
        400
    );

}


// ==========================================
// GET DATA
// ==========================================

$courseId = (int)($data['course_id'] ?? 0);

$rating = (int)($data['rating'] ?? 0);

$reviewText = trim(
    $data['review_text'] ?? ''
);


// ==========================================
// VALIDATION
// ==========================================

if ($courseId <= 0) {

    sendError(
        "course_id is required",
        null,
        422
    );

}

if ($rating < 1 || $rating > 5) {

    sendError(
        "Rating must be between 1 and 5",
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
        title,
        teacher_id
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
        "You must be enrolled in this course to submit a review",
        null,
        403
    );

}


// ==========================================
// CHECK EXISTING REVIEW
// ==========================================

$stmt = $pdo->prepare("
    SELECT id
    FROM reviews
    WHERE user_id = ?
      AND course_id = ?
    LIMIT 1
");

$stmt->execute([
    $user['id'],
    $courseId
]);

$existingReview = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existingReview) {

    sendError(
        "You have already reviewed this course",
        null,
        409
    );

}


// ==========================================
// INSERT REVIEW
// ==========================================

$stmt = $pdo->prepare("
    INSERT INTO reviews
    (
        user_id,
        course_id,
        rating,
        review_text,
        status
    )
    VALUES (?, ?, ?, ?, 'approved')
");

$stmt->execute([
    $user['id'],
    $courseId,
    $rating,
    $reviewText !== ''
        ? $reviewText
        : null
]);

$reviewId = (int)$pdo->lastInsertId();


// ==========================================
// GET STUDENT NAME
// ==========================================

$stmt = $pdo->prepare("
    SELECT name
    FROM users
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $user['id']
]);

$student = $stmt->fetch(PDO::FETCH_ASSOC);


// ==========================================
// CREATE TEACHER NOTIFICATION
// ==========================================

$studentName = $student['name'] ?? 'A student';

$notificationTitle = "New Course Review";

$notificationMessage =
    $studentName .
    " submitted a " .
    $rating .
    "-star review for your course \"" .
    $course['title'] .
    "\".";

$notificationLink =
    "/teacher/reviews/" . $courseId;

$stmt = $pdo->prepare("
    INSERT INTO notifications
    (
        user_id,
        title,
        message,
        type,
        is_read,
        link
    )
    VALUES (?, ?, ?, ?, 0, ?)
");

$stmt->execute([
    $course['teacher_id'],
    $notificationTitle,
    $notificationMessage,
    'review',
    $notificationLink
]);


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Review submitted successfully",
    [
        "review_id" => $reviewId,
        "status" => "approved"
    ],
    201
);