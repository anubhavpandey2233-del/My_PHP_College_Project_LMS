<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$quizId = $data['id'] ?? 0;

$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');

$timeLimit = $data['time_limit'] ?? null;
$passingPercentage = $data['passing_percentage'] ?? 50;
$maxAttempts = $data['max_attempts'] ?? 1;
$status = $data['status'] ?? 'draft';

if (!$quizId) {
    sendError("Quiz id required", null, 422);
}

if (!$title) {
    sendError("Quiz title is required", null, 422);
}

if (!in_array($status, ['draft', 'published'])) {
    sendError("Invalid quiz status", null, 422);
}

try {

    // Check quiz belongs to teacher's course
    $stmt = $pdo->prepare("
        SELECT 
            q.id,
            q.course_id
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

    $quiz = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$quiz) {
        sendError(
            "You are not allowed to update this quiz",
            null,
            403
        );
    }


    // Update quiz
    $stmt = $pdo->prepare("
        UPDATE quizzes
        SET
            title = ?,
            description = ?,
            time_limit = ?,
            passing_percentage = ?,
            max_attempts = ?,
            status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $title,
        $description ?: null,
        $timeLimit ?: null,
        $passingPercentage,
        $maxAttempts,
        $status,
        $quizId
    ]);


    // Get updated quiz
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

    $updatedQuiz = $stmt->fetch(PDO::FETCH_ASSOC);

    sendResponse(
        true,
        "Quiz updated successfully",
        $updatedQuiz
    );

} catch (PDOException $e) {

    sendError(
        "Failed to update quiz",
        $e->getMessage(),
        500
    );
}