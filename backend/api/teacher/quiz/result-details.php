
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
// GET PARAMETERS
// ==========================================

$quizId = filter_input(
    INPUT_GET,
    'quiz_id',
    FILTER_VALIDATE_INT
);

$studentId = filter_input(
    INPUT_GET,
    'student_id',
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


if (!$studentId || $studentId <= 0) {

    sendError(
        "student_id required",
        null,
        422
    );

    exit;
}


try {

    // ==========================================
    // GET QUIZ
    // CHECK TEACHER OWNERSHIP
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            q.id,
            q.course_id,
            q.title,
            q.description,
            q.total_marks,
            q.passing_percentage,
            q.time_limit

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
            "Quiz not found or you are not allowed to access this quiz",
            null,
            404
        );

        exit;
    }


    // ==========================================
    // GET STUDENT
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.name,
            u.email,
            u.avatar

        FROM users u

        INNER JOIN enrollments e
            ON e.student_id = u.id

        WHERE u.id = ?
          AND e.course_id = ?

        LIMIT 1
    ");

    $stmt->execute([
        $studentId,
        $quiz['course_id']
    ]);

    $student = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$student) {

        sendError(
            "Student not found or student is not enrolled in this course",
            null,
            404
        );

        exit;
    }


    // ==========================================
    // GET LATEST FINISHED ATTEMPT
    // IMPORTANT:
    // quiz_attempts uses user_id
    // NOT student_id
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            quiz_id,
            score,
            percentage,
            is_passed,
            time_taken,
            started_at,
            finished_at

        FROM quiz_attempts

        WHERE quiz_id = ?
          AND user_id = ?
          AND finished_at IS NOT NULL

        ORDER BY id DESC

        LIMIT 1
    ");

    $stmt->execute([
        $quizId,
        $studentId
    ]);

    $result = $stmt->fetch(PDO::FETCH_ASSOC);


    if (!$result) {

        sendError(
            "Student has not attempted this quiz",
            null,
            404
        );

        exit;
    }


    // ==========================================
    // GET QUESTIONS + STUDENT ANSWERS
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            qq.id,
            qq.quiz_id,
            qq.question,
            qq.question_type,
            qq.marks,
            qq.sort_order,

            qa.selected_option_id,
            qa.answer_text AS student_answer,
            qa.is_correct,
            qa.marks_obtained,

            (
                SELECT qo.option_text
                FROM quiz_options qo
                WHERE qo.question_id = qq.id
                  AND qo.is_correct = 1
                LIMIT 1
            ) AS correct_answer

        FROM quiz_questions qq

        LEFT JOIN quiz_answers qa
            ON qa.question_id = qq.id
           AND qa.attempt_id = ?

        WHERE qq.quiz_id = ?

        ORDER BY
            qq.sort_order ASC,
            qq.id ASC
    ");

    $stmt->execute([
        $result['id'],
        $quizId
    ]);

    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ==========================================
    // FORMAT QUIZ
    // ==========================================

    $quiz['id'] =
        (int) $quiz['id'];

    $quiz['course_id'] =
        (int) $quiz['course_id'];

    $quiz['total_marks'] =
        (float) $quiz['total_marks'];

    $quiz['passing_percentage'] =
        $quiz['passing_percentage'] !== null
            ? (float) $quiz['passing_percentage']
            : null;

    $quiz['time_limit'] =
        $quiz['time_limit'] !== null
            ? (int) $quiz['time_limit']
            : null;


    // ==========================================
    // FORMAT STUDENT
    // ==========================================

    $student['id'] =
        (int) $student['id'];


    // ==========================================
    // FORMAT RESULT
    // ==========================================

    $result['id'] =
        (int) $result['id'];

    $result['user_id'] =
        (int) $result['user_id'];

    $result['quiz_id'] =
        (int) $result['quiz_id'];

    $result['score'] =
        $result['score'] !== null
            ? (float) $result['score']
            : 0;

    $result['percentage'] =
        $result['percentage'] !== null
            ? (float) $result['percentage']
            : 0;

    $result['is_passed'] =
        (int) $result['is_passed'];

    $result['time_taken'] =
        $result['time_taken'] !== null
            ? (int) $result['time_taken']
            : null;


    // ==========================================
    // FORMAT QUESTIONS
    // ==========================================

    foreach ($questions as &$question) {

        $question['id'] =
            (int) $question['id'];

        $question['quiz_id'] =
            (int) $question['quiz_id'];

        $question['marks'] =
            $question['marks'] !== null
                ? (float) $question['marks']
                : 0;

        $question['selected_option_id'] =
            $question['selected_option_id'] !== null
                ? (int) $question['selected_option_id']
                : null;

        $question['student_answer'] =
            $question['student_answer'] !== null
                ? $question['student_answer']
                : null;

        $question['is_correct'] =
            $question['is_correct'] !== null
                ? (int) $question['is_correct']
                : 0;

        $question['marks_obtained'] =
            $question['marks_obtained'] !== null
                ? (float) $question['marks_obtained']
                : 0;
    }

    unset($question);


    // ==========================================
    // RESPONSE
    // ==========================================

    sendResponse(
        true,
        "Quiz result details fetched successfully",
        [
            "quiz" => $quiz,

            "student" => $student,

            "result" => $result,

            "questions" => $questions
        ]
    );


} catch (PDOException $e) {

    sendError(
        "Failed to fetch quiz result details",
        $e->getMessage(),
        500
    );

    exit;
}