
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$courseId = $data['course_id'] ?? 0;
$chapterId = $data['chapter_id'] ?? null;
$lessonId = $data['lesson_id'] ?? null;

$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');

$timeLimit = $data['time_limit'] ?? null;
$passingPercentage = $data['passing_percentage'] ?? 50;
$maxAttempts = $data['max_attempts'] ?? 1;

$status = $data['status'] ?? 'draft';

if (!$courseId) {
    sendError("course_id required", null, 422);
}

if (!$title) {
    sendError("Quiz title is required", null, 422);
}

if (!in_array($status, ['draft', 'published'])) {
    sendError("Invalid quiz status", null, 422);
}

if ($chapterId === '') {
    $chapterId = null;
}

if ($lessonId === '') {
    $lessonId = null;
}

try {

    // Check whether course belongs to logged-in teacher
    $stmt = $pdo->prepare("
        SELECT id
        FROM courses
        WHERE id = ?
        AND teacher_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $courseId,
        $user['id']
    ]);

    if (!$stmt->fetch()) {
        sendError("You are not allowed to create quiz for this course", null, 403);
    }


    // Check chapter belongs to this course
    if ($chapterId !== null) {

        $stmt = $pdo->prepare("
            SELECT id
            FROM chapters
            WHERE id = ?
            AND course_id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $chapterId,
            $courseId
        ]);

        if (!$stmt->fetch()) {
            sendError("Invalid chapter", null, 422);
        }
    }


    $stmt = $pdo->prepare("
        INSERT INTO quizzes
        (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $courseId,
        $chapterId,
        $lessonId,
        $title,
        $description ?: null,
        $timeLimit ?: null,
        $passingPercentage,
        $maxAttempts,
        0,
        $status
    ]);

    $quizId = $pdo->lastInsertId();

    sendResponse(
        true,
        "Quiz created successfully",
        [
            'id' => (int) $quizId,
            'course_id' => (int) $courseId,
            'chapter_id' => $chapterId ? (int) $chapterId : null,
            'lesson_id' => $lessonId ? (int) $lessonId : null,
            'title' => $title,
            'description' => $description,
            'time_limit' => $timeLimit,
            'passing_percentage' => $passingPercentage,
            'max_attempts' => $maxAttempts,
            'total_marks' => 0,
            'status' => $status
        ]
    );

} catch (PDOException $e) {

    sendError(
        "Failed to create quiz",
        $e->getMessage(),
        500
    );
}

