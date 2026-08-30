<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// AUTHENTICATION
// ==========================================

$user = authenticate($pdo);


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

$courseId = (int)($data['course_id'] ?? 0);

if (!$courseId) {

    sendError(
        "course_id required",
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
        teacher_id,
        status
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

if ($course['status'] !== 'published') {

    sendError(
        "Course is not available for enrollment",
        null,
        400
    );

}


// ==========================================
// CHECK EXISTING ENROLLMENT
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

if ($stmt->fetch()) {

    sendError(
        "You are already enrolled in this course",
        null,
        409
    );

}


// ==========================================
// CREATE ENROLLMENT
// ==========================================

$stmt = $pdo->prepare("
    INSERT INTO enrollments
    (
        student_id,
        course_id,
        progress,
        status
    )
    VALUES (?, ?, 0, 'active')
");

$stmt->execute([
    $user['id'],
    $courseId
]);

$enrollmentId = $pdo->lastInsertId();


// ==========================================
// UPDATE STUDENT COUNT
// ==========================================

$stmt = $pdo->prepare("
    UPDATE courses
    SET total_students = total_students + 1
    WHERE id = ?
");

$stmt->execute([
    $courseId
]);


// ==========================================
// TEACHER NOTIFICATION
// ==========================================

$notificationTitle = "New Student Enrollment";

$notificationMessage =
    $user['name'] .
    " enrolled in your course: " .
    $course['title'];

$stmt = $pdo->prepare("
    INSERT INTO notifications
    (
        user_id,
        title,
        message,
        type,
        is_read,
        link,
        created_at
    )
    VALUES (?, ?, ?, 'enrollment', 0, NULL, NOW())
");

$stmt->execute([
    $course['teacher_id'],
    $notificationTitle,
    $notificationMessage
]);


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Successfully enrolled",
    [
        "enrollment_id" => (int)$enrollmentId
    ],
    201
);