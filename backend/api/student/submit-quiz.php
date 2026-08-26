
<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ==========================================
// HANDLE PREFLIGHT
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// FILES
// ==========================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

// ==========================================
// AUTH
// ==========================================

$user = authenticate($pdo, ['student']);

// ==========================================
// READ JSON
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    sendError("Invalid request data", null, 422);
}

$attemptId = isset($data['attempt_id'])
    ? (int) $data['attempt_id']
    : 0;

$answers = $data['answers'] ?? [];

if ($attemptId <= 0) {
    sendError(
        "attempt_id required",
        null,
        422
    );
}

if (!is_array($answers)) {
    sendError(
        "answers must be an object",
        null,
        422
    );
}

// ==========================================
// GET ATTEMPT
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
    WHERE id = ?
      AND user_id = ?
    LIMIT 1
");

$stmt->execute([
    $attemptId,
    $user['id']
]);

$attempt = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$attempt) {
    sendError(
        "Quiz attempt not found",
        null,
        404
    );
}

// ==========================================
// CHECK ALREADY SUBMITTED
// ==========================================

if (!empty($attempt['finished_at'])) {
    sendError(
        "This quiz attempt has already been submitted",
        null,
        409
    );
}

// ==========================================
// GET QUIZ
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        title,
        total_marks,
        passing_percentage,
        time_limit,
        status
    FROM quizzes
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $attempt['quiz_id']
]);

$quiz = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$quiz) {
    sendError(
        "Quiz not found",
        null,
        404
    );
}

// ==========================================
// CHECK PUBLISHED
// ==========================================

if ($quiz['status'] !== 'published') {
    sendError(
        "This quiz is not published",
        null,
        403
    );
}

// ==========================================
// CALCULATE TIME
// ==========================================

$startedAt = strtotime(
    $attempt['started_at']
);

$finishedAt = time();

$timeTaken = $finishedAt - $startedAt;

if ($timeTaken < 0) {
    $timeTaken = 0;
}

// ==========================================
// GET QUESTIONS
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id,
        question,
        question_type,
        marks,
        sort_order
    FROM quiz_questions
    WHERE quiz_id = ?
    ORDER BY sort_order ASC, id ASC
");

$stmt->execute([
    $attempt['quiz_id']
]);

$questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$questions) {
    sendError(
        "No questions found for this quiz",
        null,
        404
    );
}

// ==========================================
// START TRANSACTION
// ==========================================

try {

    $pdo->beginTransaction();

    $totalScore = 0;
    $totalMarks = 0;

    // ======================================
    // PROCESS QUESTIONS
    // ======================================

    foreach ($questions as $question) {

        $questionId = (int) $question['id'];

        $questionMarks =
            (float) $question['marks'];

        $questionType =
            $question['question_type'];

        $totalMarks += $questionMarks;

        // ----------------------------------
        // GET OPTIONS
        // ----------------------------------

        $optionStmt = $pdo->prepare("
            SELECT
                id,
                option_text,
                is_correct
            FROM quiz_options
            WHERE question_id = ?
            ORDER BY sort_order ASC, id ASC
        ");

        $optionStmt->execute([
            $questionId
        ]);

        $options =
            $optionStmt->fetchAll(PDO::FETCH_ASSOC);

        // ----------------------------------
        // GET SELECTED ANSWER
        // ----------------------------------

        $selected =
            $answers[(string) $questionId]
            ?? $answers[$questionId]
            ?? null;

        $selectedOptionId = null;
        $answerText = null;
        $isCorrect = 0;
        $marksObtained = 0;

        // ==================================
        // MULTIPLE ANSWER
        // ==================================

        if ($questionType === 'multiple') {

            if (!is_array($selected)) {
                $selected = [];
            }

            $selected = array_map(
                'intval',
                $selected
            );

            sort($selected);

            $correctOptionIds = [];

            foreach ($options as $option) {

                if (
                    (int) $option['is_correct'] === 1
                ) {
                    $correctOptionIds[] =
                        (int) $option['id'];
                }
            }

            sort($correctOptionIds);

            // ------------------------------
            // CHECK ANSWER
            // ------------------------------

            if (
                !empty($selected) &&
                $selected === $correctOptionIds
            ) {

                $isCorrect = 1;

                $marksObtained =
                    $questionMarks;
            }

            // ------------------------------
            // SAVE SELECTED OPTION
            // ------------------------------

            if (!empty($selected)) {

                $selectedOptionId =
                    $selected[0];

                $selectedTexts = [];

                foreach ($options as $option) {

                    if (
                        in_array(
                            (int) $option['id'],
                            $selected,
                            true
                        )
                    ) {

                        $selectedTexts[] =
                            $option['option_text'];
                    }
                }

                $answerText =
                    implode(
                        ', ',
                        $selectedTexts
                    );
            }
        }

        // ==================================
        // SINGLE ANSWER
        // ==================================

        else {

            if (
                $selected !== null &&
                $selected !== ''
            ) {

                $selectedOptionId =
                    (int) $selected;

                foreach ($options as $option) {

                    if (
                        (int) $option['id']
                        === $selectedOptionId
                    ) {

                        $answerText =
                            $option['option_text'];

                        if (
                            (int) $option['is_correct']
                            === 1
                        ) {

                            $isCorrect = 1;

                            $marksObtained =
                                $questionMarks;
                        }

                        break;
                    }
                }
            }
        }

        // ==================================
        // SAVE ANSWER
        // ==================================

        $answerStmt = $pdo->prepare("
            INSERT INTO quiz_answers
            (
                attempt_id,
                question_id,
                selected_option_id,
                answer_text,
                is_correct,
                marks_obtained
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )
        ");

        $answerStmt->execute([
            $attemptId,
            $questionId,
            $selectedOptionId,
            $answerText,
            $isCorrect,
            $marksObtained
        ]);

        $totalScore += $marksObtained;
    }

    // ==========================================
    // TOTAL MARKS FALLBACK
    // ==========================================

    if ($totalMarks <= 0) {

        $totalMarks =
            (float) $quiz['total_marks'];
    }

    // ==========================================
    // PERCENTAGE
    // ==========================================

    $percentage = 0;

    if ($totalMarks > 0) {

        $percentage =
            ($totalScore / $totalMarks) * 100;
    }

    $percentage =
        round($percentage, 2);

    // ==========================================
    // PASS / FAIL
    // ==========================================

    $passingPercentage =
        (float) $quiz['passing_percentage'];

    $isPassed =
        $percentage >= $passingPercentage
            ? 1
            : 0;

    // ==========================================
    // TIME LIMIT
    // ==========================================

    if (!empty($quiz['time_limit'])) {

        $timeLimitSeconds =
            (int) $quiz['time_limit'] * 60;

        if (
            $timeTaken >
            $timeLimitSeconds
        ) {

            $timeTaken =
                $timeLimitSeconds;
        }
    }

    // ==========================================
    // UPDATE ATTEMPT
    // ==========================================

    $updateStmt = $pdo->prepare("
        UPDATE quiz_attempts
        SET
            score = ?,
            percentage = ?,
            is_passed = ?,
            time_taken = ?,
            finished_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND user_id = ?
    ");

    $updateStmt->execute([
        $totalScore,
        $percentage,
        $isPassed,
        $timeTaken,
        $attemptId,
        $user['id']
    ]);

    // ==========================================
    // COMMIT
    // ==========================================

    $pdo->commit();

    // ==========================================
    // RESPONSE
    // ==========================================

    sendResponse(
        true,
        "Quiz submitted successfully",
        [
            "attempt_id" =>
                $attemptId,

            "score" =>
                $totalScore,

            "total_marks" =>
                $totalMarks,

            "percentage" =>
                $percentage,

            "passing_percentage" =>
                $passingPercentage,

            "is_passed" =>
                $isPassed,

            "time_taken" =>
                $timeTaken,

            "finished_at" =>
                date('Y-m-d H:i:s')
        ]
    );

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError(
        "Quiz submission failed",
        $e->getMessage(),
        500
    );
}
