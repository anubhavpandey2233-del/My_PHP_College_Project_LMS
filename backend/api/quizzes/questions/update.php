<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$questionId = $data['id'] ?? 0;
$question = trim($data['question'] ?? '');
$questionType = $data['question_type'] ?? 'mcq';
$marks = $data['marks'] ?? 1;
$sortOrder = $data['sort_order'] ?? 0;
$options = $data['options'] ?? [];

if (!$questionId) {
    sendError("Question id required", null, 422);
}

if (!$question) {
    sendError("Question is required", null, 422);
}

if (!in_array($questionType, ['mcq', 'true_false', 'multiple'])) {
    sendError("Invalid question type", null, 422);
}

if (!is_array($options) || count($options) < 2) {
    sendError("At least 2 options are required", null, 422);
}

try {

    // Check question belongs to teacher
    $stmt = $pdo->prepare("
        SELECT qq.id, qq.quiz_id, q.course_id
        FROM quiz_questions qq
        JOIN quizzes q ON qq.quiz_id = q.id
        JOIN courses c ON q.course_id = c.id
        WHERE qq.id = ?
        AND c.teacher_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $questionId,
        $user['id']
    ]);

    $existing = $stmt->fetch();

    if (!$existing) {
        sendError(
            "You are not allowed to update this question",
            null,
            403
        );
    }

    $pdo->beginTransaction();

    // Update question
    $stmt = $pdo->prepare("
        UPDATE quiz_questions
        SET
            question = ?,
            question_type = ?,
            marks = ?,
            sort_order = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $question,
        $questionType,
        $marks,
        $sortOrder,
        $questionId
    ]);

    // Delete old options
    $stmt = $pdo->prepare("
        DELETE FROM quiz_options
        WHERE question_id = ?
    ");

    $stmt->execute([
        $questionId
    ]);

    // Insert new options
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

    // Update quiz total marks
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
        $existing['quiz_id'],
        $existing['quiz_id']
    ]);

    $pdo->commit();

    sendResponse(
        true,
        "Question updated successfully",
        [
            'id' => (int)$questionId
        ]
    );

} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError(
        "Failed to update question",
        $e->getMessage(),
        500
    );
}