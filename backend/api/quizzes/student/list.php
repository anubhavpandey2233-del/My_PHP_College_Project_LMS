<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';

$user = authenticate($pdo, ['student']);

$courseId = $_GET['course_id'] ?? 0;
$chapterId = $_GET['chapter_id'] ?? null;

if (!$courseId) {
    sendError("course_id required", null, 422);
}

try {

    $sql = "
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
        WHERE course_id = ?
        AND status = 'published'
    ";

    $params = [$courseId];

    if ($chapterId !== null && $chapterId !== '') {
        $sql .= " AND chapter_id = ?";
        $params[] = $chapterId;
    }

    $sql .= " ORDER BY id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($quizzes as &$quiz) {
        $quiz['id'] = (int) $quiz['id'];
        $quiz['course_id'] = (int) $quiz['course_id'];

        $quiz['chapter_id'] = $quiz['chapter_id']
            ? (int) $quiz['chapter_id']
            : null;

        $quiz['lesson_id'] = $quiz['lesson_id']
            ? (int) $quiz['lesson_id']
            : null;

        $quiz['time_limit'] = $quiz['time_limit'] !== null
            ? (int) $quiz['time_limit']
            : null;

        $quiz['passing_percentage'] = (int) $quiz['passing_percentage'];
        $quiz['max_attempts'] = (int) $quiz['max_attempts'];
        $quiz['total_marks'] = (float) $quiz['total_marks'];
    }

    sendResponse(
        true,
        "Published quizzes fetched successfully",
        $quizzes
    );

} catch (PDOException $e) {

    sendError(
        "Failed to fetch quizzes",
        $e->getMessage(),
        500
    );
}