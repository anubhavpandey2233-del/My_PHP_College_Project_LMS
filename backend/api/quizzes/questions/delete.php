<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$questionId = $data['id'] ?? 0;

if (!$questionId) {
    sendError("Question id required", null, 422);
}

try {

    // Check question belongs to teacher
    $stmt = $pdo->prepare("
        SELECT
            qq.id,
            qq.quiz_id,
            q.course_id
        FROM quiz_questions qq
        JOIN quizzes q
            ON qq.quiz_id = q.id
        JOIN courses c
            ON q.course_id = c.id
        WHERE qq.id = ?
        AND c.teacher_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $questionId,
        $user['id']
    ]);

    $question = $stmt->fetch();

    if (!$question) {
        sendError(
            "You are not allowed to delete this question",
            null,
            403
        );
    }

    $pdo->beginTransaction();

    // Delete options first
    $stmt = $pdo->prepare("
        DELETE FROM quiz_options
        WHERE question_id = ?
    ");

    $stmt->execute([
        $questionId
    ]);

    // Delete question
    $stmt = $pdo->prepare("
        DELETE FROM quiz_questions
        WHERE id = ?
    ");

    $stmt->execute([
        $questionId
    ]);

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
        $question['quiz_id'],
        $question['quiz_id']
    ]);

    $pdo->commit();

    sendResponse(
        true,
        "Question deleted successfully",
        [
            'id' => (int)$questionId
        ]
    );

} catch (PDOException $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError(
        "Failed to delete question",
        $e->getMessage(),
        500
    );
}