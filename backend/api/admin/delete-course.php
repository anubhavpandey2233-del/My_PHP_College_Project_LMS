
<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin']);

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$courseId = (int)($data['course_id'] ?? 0);

if (!$courseId) {
    sendError(
        "Course ID is required",
        null,
        422
    );
}

try {

    // Check course exists
    $stmt = $pdo->prepare("
        SELECT id, title, status
        FROM courses
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $courseId
    ]);

    $course = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        sendError(
            "Course not found",
            null,
            404
        );
    }

    // Archive course instead of permanently deleting it
    $stmt = $pdo->prepare("
        UPDATE courses
        SET
            status = 'archived',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ");

    $stmt->execute([
        $courseId
    ]);

    sendResponse(
        true,
        "Course deleted successfully",
        [
            "course_id" => $courseId,
            "title" => $course['title'],
            "status" => "archived"
        ]
    );

} catch (PDOException $e) {

    sendError(
        "Failed to delete course",
        $e->getMessage(),
        500
    );
}

