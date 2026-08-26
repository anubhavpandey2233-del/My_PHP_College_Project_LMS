<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher', 'student']);

$quizId = $_GET['quiz_id'] ?? 0;

if (!$quizId) {
    sendError("quiz_id required", null, 422);
}

try {

    // Check quiz exists
    $stmt = $pdo->prepare("
        SELECT *
        FROM quizzes
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$quizId]);

    $quiz = $stmt->fetch();

    if (!$quiz) {
        sendError("Quiz not found", null, 404);
    }

    // Teacher can only access own quiz
    if ($user['role'] === 'teacher') {

        $stmt = $pdo->prepare("
            SELECT id
            FROM courses
            WHERE id = ?
            AND teacher_id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $quiz['course_id'],
            $user['id']
        ]);

        if (!$stmt->fetch()) {
            sendError("You are not allowed to access this quiz", null, 403);
        }
    }

    // Student can only see published quiz
    if (
        $user['role'] === 'student' &&
        $quiz['status'] !== 'published'
    ) {
        sendError("Quiz is not published", null, 403);
    }

    // Get questions
    $stmt = $pdo->prepare("
        SELECT *
        FROM quiz_questions
        WHERE quiz_id = ?
        ORDER BY sort_order ASC, id ASC
    ");

    $stmt->execute([$quizId]);

    $questions = $stmt->fetchAll();

    foreach ($questions as &$question) {

        $stmt2 = $pdo->prepare("
            SELECT
                id,
                question_id,
                option_text,
                is_correct,
                sort_order
            FROM quiz_options
            WHERE question_id = ?
            ORDER BY sort_order ASC, id ASC
        ");

        $stmt2->execute([
            $question['id']
        ]);

        $question['options'] = $stmt2->fetchAll();

        // Student ko correct answer nahi dikhana
        if ($user['role'] === 'student') {

            foreach ($question['options'] as &$option) {
                unset($option['is_correct']);
            }
        }
    }

    sendResponse(
        true,
        "Questions fetched successfully",
        $questions
    );

} catch (PDOException $e) {

    sendError(
        "Failed to fetch questions",
        $e->getMessage(),
        500
    );
}