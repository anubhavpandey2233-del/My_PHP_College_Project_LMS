
<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

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
// QUIZ ID
// ==========================================

$quizId = isset($_GET['quiz_id'])
    ? (int) $_GET['quiz_id']
    : 0;

if ($quizId <= 0) {
    sendError("quiz_id required", null, 422);
}

// ==========================================
// GET QUIZ
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        course_id,
        chapter_id,
        lesson_id,
        title,
        description,
        time_limit,
        passing_percentage,
        max_attempts,
        total_marks,
        status
    FROM quizzes
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([$quizId]);

$quiz = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$quiz) {
    sendError("Quiz not found", null, 404);
}

// ==========================================
// CHECK PUBLISHED
// ==========================================

if ($quiz['status'] !== 'published') {
    sendError("This quiz is not published", null, 403);
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
    $quiz['course_id']
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
// GET QUESTIONS
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        quiz_id,
        question,
        question_type,
        marks,
        sort_order
    FROM quiz_questions
    WHERE quiz_id = ?
    ORDER BY sort_order ASC, id ASC
");

$stmt->execute([$quizId]);

$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ==========================================
// GET OPTIONS
// ==========================================

foreach ($questions as &$question) {

    $stmt = $pdo->prepare("
        SELECT
            id,
            question_id,
            option_text,
            sort_order
        FROM quiz_options
        WHERE question_id = ?
        ORDER BY sort_order ASC, id ASC
    ");

    $stmt->execute([$question['id']]);

    $question['options'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

unset($question);

// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Quiz loaded successfully",
    [
        "quiz" => $quiz,
        "questions" => $questions
    ]
);
