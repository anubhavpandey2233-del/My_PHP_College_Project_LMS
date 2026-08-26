
<?php

// ==========================================
// CORS
// ==========================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

header("Content-Type: application/json; charset=UTF-8");


// ==========================================
// PREFLIGHT
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(204);

    exit;
}


// ==========================================
// FILES
// ==========================================

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../helpers/response.php';
require_once __DIR__ . '/../../../middleware/auth.php';


// ==========================================
// AUTH
// ==========================================

$user = authenticate($pdo, ['teacher']);


// ==========================================
// GET TEACHER QUIZZES
// ==========================================

try {

    $stmt = $pdo->prepare("
        SELECT
            q.id,
            q.course_id,
            q.chapter_id,
            q.lesson_id,
            q.title,
            q.description,
            q.time_limit,
            q.passing_percentage,
            q.max_attempts,
            q.total_marks,
            q.status,
            c.title AS course_title

        FROM quizzes q

        INNER JOIN courses c
            ON q.course_id = c.id

        WHERE c.teacher_id = ?

        ORDER BY q.id DESC
    ");

    $stmt->execute([
        $user['id']
    ]);

    $quizzes = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ==========================================
    // FORMAT DATA
    // ==========================================

    foreach ($quizzes as &$quiz) {

        $quiz['id'] = (int) $quiz['id'];

        $quiz['course_id'] = (int) $quiz['course_id'];

        $quiz['chapter_id'] =
            $quiz['chapter_id'] !== null
                ? (int) $quiz['chapter_id']
                : null;

        $quiz['lesson_id'] =
            $quiz['lesson_id'] !== null
                ? (int) $quiz['lesson_id']
                : null;

        $quiz['time_limit'] =
            $quiz['time_limit'] !== null
                ? (int) $quiz['time_limit']
                : null;

        $quiz['passing_percentage'] =
            $quiz['passing_percentage'] !== null
                ? (float) $quiz['passing_percentage']
                : null;

        $quiz['max_attempts'] =
            $quiz['max_attempts'] !== null
                ? (int) $quiz['max_attempts']
                : null;

        $quiz['total_marks'] =
            $quiz['total_marks'] !== null
                ? (float) $quiz['total_marks']
                : null;
    }

    unset($quiz);


    // ==========================================
    // RESPONSE
    // ==========================================

    sendResponse(
        true,
        "Teacher quizzes fetched successfully",
        [
            "quizzes" => $quizzes,
            "total" => count($quizzes)
        ]
    );


} catch (PDOException $e) {

    sendError(
        "Failed to fetch teacher quizzes",
        $e->getMessage(),
        500
    );
}

