<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $stmt = $pdo->query("
        SELECT COUNT(*) AS total_enrollments
        FROM enrollments e
        INNER JOIN users u
            ON e.student_id = u.id
        INNER JOIN courses c
            ON e.course_id = c.id
    ");

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    $totalEnrollments = (int) (
        $result['total_enrollments'] ?? 0
    );

    sendResponse(
        true,
        "Enrollment count fetched successfully",
        [
            'total_enrollments' => $totalEnrollments
        ]
    );

} catch (PDOException $e) {

    sendError(
        "Failed to fetch enrollment count",
        $e->getMessage(),
        500
    );
}