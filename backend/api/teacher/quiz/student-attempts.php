
<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");


// ==========================================
// PREFLIGHT
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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
// QUIZ ID
// ==========================================

$quizId = filter_input(
    INPUT_GET,
    'quiz_id',
    FILTER_VALIDATE_INT
);

if (!$quizId || $quizId <= 0) {

    sendError(
        "quiz_id required",
        null,
        422
    );

    exit;
}


try {

    // ==========================================
    // GET QUIZ
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            q.id,
            q.title,
            q.course_id,
            q.total_marks,
            q.passing_percentage
        FROM quizzes q
        INNER JOIN courses c
            ON c.id = q.course_id
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
            "Quiz not found or you are not allowed to access this quiz",
            null,
            404
        );

        exit;
    }


    // ==========================================
    // GET ENROLLED STUDENTS
    // ==========================================

    /*
     * For each student, get only ONE completed
     * attempt: the latest attempt by ID.
     */

    $stmt = $pdo->prepare("
        SELECT
            u.id AS student_id,
            u.name AS student_name,
            u.email AS student_email,
            u.avatar,

            qa.id AS attempt_id,
            qa.score,
            qa.percentage,
            qa.is_passed,
            qa.time_taken,
            qa.started_at,
            qa.finished_at

        FROM enrollments e

        INNER JOIN users u
            ON u.id = e.student_id

        LEFT JOIN quiz_attempts qa
            ON qa.id = (
                SELECT MAX(qa2.id)
                FROM quiz_attempts qa2
                WHERE qa2.user_id = e.student_id
                  AND qa2.quiz_id = ?
                  AND qa2.finished_at IS NOT NULL
            )

        WHERE e.course_id = ?

        ORDER BY u.name ASC
    ");

    $stmt->execute([
        $quizId,
        $quiz['course_id']
    ]);

    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ==========================================
    // FORMAT DATA
    // ==========================================

    $attemptedCount = 0;
    $notAttemptedCount = 0;


    foreach ($students as &$student) {

        $student['student_id'] =
            (int) $student['student_id'];


        if ($student['attempt_id'] !== null) {

            // ==========================================
            // ATTEMPTED
            // ==========================================

            $student['has_attempted'] = 1;

            $attemptedCount++;


            $student['attempt_id'] =
                (int) $student['attempt_id'];


            $student['score'] =
                $student['score'] !== null
                    ? (float) $student['score']
                    : 0;


            $student['percentage'] =
                $student['percentage'] !== null
                    ? (float) $student['percentage']
                    : 0;


            $student['is_passed'] =
                (int) $student['is_passed'];


            $student['time_taken'] =
                $student['time_taken'] !== null
                    ? (int) $student['time_taken']
                    : null;

        } else {

            // ==========================================
            // NOT ATTEMPTED
            // ==========================================

            $student['has_attempted'] = 0;

            $notAttemptedCount++;


            $student['attempt_id'] = null;
            $student['score'] = null;
            $student['percentage'] = null;
            $student['is_passed'] = null;
            $student['time_taken'] = null;
            $student['started_at'] = null;
            $student['finished_at'] = null;
        }
    }

    unset($student);


    // ==========================================
    // RESPONSE
    // ==========================================

    sendResponse(
        true,
        "Student quiz attempt status fetched successfully",
        [
            "quiz" => [
                "id" =>
                    (int) $quiz['id'],

                "title" =>
                    $quiz['title'],

                "course_id" =>
                    (int) $quiz['course_id'],

                "total_marks" =>
                    (float) $quiz['total_marks'],

                "passing_percentage" =>
                    (float) $quiz['passing_percentage']
            ],

            "summary" => [
                "total_students" =>
                    count($students),

                "attempted" =>
                    $attemptedCount,

                "not_attempted" =>
                    $notAttemptedCount
            ],

            "students" =>
                $students
        ]
    );


} catch (PDOException $e) {

    sendError(
        "Failed to fetch student quiz attempt status",
        $e->getMessage(),
        500
    );

    exit;
}

