<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$quizId = $data['quiz_id'] ?? 0;
$question = trim($data['question'] ?? '');
$questionType = $data['question_type'] ?? 'mcq';
$marks = $data['marks'] ?? 1;
$sortOrder = $data['sort_order'] ?? 0;
$options = $data['options'] ?? [];

if (!$quizId) {
    sendError("quiz_id required", null, 422);
}

if (!$question) {
    sendError("Question is required", null, 422);
}

if (!in_array($questionType, ['mcq', 'true_false', 'multiple'])) {
    sendError("Invalid question type", null, 422);
}

if (!is_numeric($marks) || $marks <= 0) {
    sendError("Invalid marks", null, 422);
}

if (!is_array($options) || count($options) < 2) {
    sendError("At least 2 options are required", null, 422);
}

try {

    // Check quiz belongs to teacher's course
    $stmt = $pdo->prepare("
        SELECT q.id
        FROM quizzes q
        JOIN courses c ON q.course_id = c.id
        WHERE q.id = ?
        AND c.teacher_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $quizId,
        $user['id']
    ]);

    if (!$stmt->fetch()) {
        sendError(
            "You are not allowed to add question to this quiz",
            null,
            403
        );
    }

    $pdo->beginTransaction();

    // Create question
    $stmt = $pdo->prepare("
        INSERT INTO quiz_questions
        (
            quiz_id,
            question,
            question_type,
            marks,
            sort_order
        )
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $quizId,
        $question,
        $questionType,
        $marks,
        $sortOrder
    ]);

    $questionId = $pdo->lastInsertId();

    // Create options
    $optionStmt = $pdo->prepare("
        INSERT INTO quiz_options
        (
            question_id,
            option_text,
            is_correct,
            sort_order
        )
        VALUES (?, ?, ?, ?)
    ");

    foreach ($options as $index => $option) {

        $optionText = trim($option['option_text'] ?? '');
        $isCorrect = !empty($option['is_correct']) ? 1 : 0;

        if (!$optionText) {
            throw new Exception("Option text is required");
        }

        $optionStmt->execute([
            $questionId,
            $optionText,
            $isCorrect,
            $index
        ]);
    }

    // Update total marks
    $stmt = $pdo->prepare("
        UPDATE quizzes
        SET total_marks = (
            SELECT COALESCE(SUM(marks), 0)
            FROM quiz_questions
            WHERE quiz_id = ?
        )
        WHERE id = ?
    ");

    $stmt->execute([
        $quizId,
        $quizId
    ]);

    $pdo->commit();

    sendResponse(
        true,
        "Question created successfully",
        [
            'id' => (int)$questionId,
            'quiz_id' => (int)$quizId
        ]
    );

} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError(
        "Failed to create question",
        $e->getMessage(),
        500
    );
}