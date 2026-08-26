<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$quizId = $data['id'] ?? 0;

if (!$quizId) {
    sendError("Quiz id required", null, 422);
}

try {

    // Check quiz belongs to logged-in teacher
    $stmt = $pdo->prepare("
        SELECT 
            q.id
        FROM quizzes q
        INNER JOIN courses c
            ON q.course_id = c.id
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
            "You are not allowed to delete this quiz",
            null,
            403
        );
    }


    // Delete quiz
    $stmt = $pdo->prepare("
        DELETE FROM quizzes
        WHERE id = ?
    ");

    $stmt->execute([$quizId]);

    sendResponse(
        true,
        "Quiz deleted successfully",
        null
    );

} catch (PDOException $e) {

    sendError(
        "Failed to delete quiz",
        $e->getMessage(),
        500
    );
}