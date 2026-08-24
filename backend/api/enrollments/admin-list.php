<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $stmt = $pdo->query("
        SELECT
            e.id,
            e.student_id,
            e.course_id,
            e.progress,
            e.status,
            e.enrolled_at,
            e.last_lesson_id,
            e.last_watched_at,
            e.completed_at,

            u.name AS student_name,
            u.email AS student_email,

            c.title AS course_title

        FROM enrollments e

        INNER JOIN users u
            ON e.student_id = u.id

        INNER JOIN courses c
            ON e.course_id = c.id

        ORDER BY e.enrolled_at DESC
    ");

    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(
        true,
        "Enrollments fetched successfully",
        $enrollments
    );

} catch (PDOException $e) {

    sendError(
        "Failed to fetch enrollments",
        $e->getMessage(),
        500
    );
}