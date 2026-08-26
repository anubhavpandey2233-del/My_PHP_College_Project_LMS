
<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
// AUTH
// ==========================================

$user = authenticate($pdo, ['student']);

// ==========================================
// READ JSON
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$quizId = isset($data['quiz_id'])
    ? (int) $data['quiz_id']
    : 0;

if ($quizId <= 0) {
    sendError(
        "quiz_id required",
        null,
        422
    );
}

// ==========================================
// GET QUIZ
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        title,
        total_marks,
        passing_percentage,
        time_limit,
        max_attempts,
        status
    FROM quizzes
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([$quizId]);

$quiz = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$quiz) {
    sendError(
        "Quiz not found",
        null,
        404
    );
}

// ==========================================
// CHECK PUBLISHED
// ==========================================

if ($quiz['status'] !== 'published') {
    sendError(
        "This quiz is not published",
        null,
        403
    );
}

// ==========================================
// CHECK ENROLLMENT
// ==========================================

$stmt = $pdo->prepare("
    SELECT id
    FROM enrollments
    WHERE student_id = ?
      AND course_id = (
          SELECT course_id
          FROM quizzes
          WHERE id = ?
      )
    LIMIT 1
");

$stmt->execute([
    $user['id'],
    $quizId
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
// CHECK EXISTING ACTIVE ATTEMPT
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        quiz_id,
        user_id,
        started_at,
        finished_at
    FROM quiz_attempts
    WHERE user_id = ?
      AND quiz_id = ?
      AND finished_at IS NULL
    ORDER BY id DESC
    LIMIT 1
");

$stmt->execute([
    $user['id'],
    $quizId
]);

$existingAttempt = $stmt->fetch(PDO::FETCH_ASSOC);

// ==========================================
// RETURN EXISTING ATTEMPT
// ==========================================

if ($existingAttempt) {

    sendResponse(
        true,
        "Existing quiz attempt",
        [
            "attempt" => [
                "id" => (int) $existingAttempt['id'],
                "quiz_id" => (int) $existingAttempt['quiz_id'],
                "user_id" => (int) $existingAttempt['user_id'],
                "started_at" => $existingAttempt['started_at'],
                "finished_at" => $existingAttempt['finished_at']
            ],

            "quiz" => [
                "id" => (int) $quiz['id'],
                "title" => $quiz['title'],
                "time_limit" => $quiz['time_limit'],
                "max_attempts" => $quiz['max_attempts']
            ]
        ]
    );
}

// ==========================================
// CHECK MAX ATTEMPTS
// ==========================================

$stmt = $pdo->prepare("
    SELECT COUNT(*) AS attempt_count
    FROM quiz_attempts
    WHERE user_id = ?
      AND quiz_id = ?
");

$stmt->execute([
    $user['id'],
    $quizId
]);

$attemptCount = (int) $stmt->fetchColumn();

$maxAttempts = (int) $quiz['max_attempts'];

if (
    $maxAttempts > 0 &&
    $attemptCount >= $maxAttempts
) {
    sendError(
        "Maximum quiz attempts reached",
        null,
        403
    );
}

// ==========================================
// CREATE NEW ATTEMPT
// ==========================================

$stmt = $pdo->prepare("
    INSERT INTO quiz_attempts
    (
        user_id,
        quiz_id,
        score,
        percentage,
        is_passed,
        time_taken,
        started_at
    )
    VALUES
    (
        ?,
        ?,
        0,
        0,
        0,
        NULL,
        CURRENT_TIMESTAMP
    )
");

$stmt->execute([
    $user['id'],
    $quizId
]);

$attemptId = (int) $pdo->lastInsertId();

// ==========================================
// GET CREATED ATTEMPT
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        quiz_id,
        user_id,
        started_at,
        finished_at
    FROM quiz_attempts
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $attemptId
]);

$attempt = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$attempt) {
    sendError(
        "Unable to create quiz attempt",
        null,
        500
    );
}

// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Quiz started successfully",
    [
        "attempt" => [
            "id" => (int) $attempt['id'],
            "quiz_id" => (int) $attempt['quiz_id'],
            "user_id" => (int) $attempt['user_id'],
            "started_at" => $attempt['started_at'],
            "finished_at" => $attempt['finished_at']
        ],

        "quiz" => [
            "id" => (int) $quiz['id'],
            "title" => $quiz['title'],
            "time_limit" => $quiz['time_limit'],
            "max_attempts" => $quiz['max_attempts']
        ]
    ]
);

