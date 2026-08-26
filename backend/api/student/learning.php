
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['student']);

$courseId = $_GET['course_id'] ?? 0;

if (!$courseId) {
    sendError("course_id required", null, 422);
}


/*
|--------------------------------------------------------------------------
| CHECK ENROLLMENT
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT *
    FROM enrollments
    WHERE student_id = ?
    AND course_id = ?
");

$stmt->execute([
    $user['id'],
    $courseId
]);

$enrollment = $stmt->fetch();

if (!$enrollment) {
    sendError(
        "You are not enrolled in this course",
        null,
        403
    );
}


/*
|--------------------------------------------------------------------------
| COURSE
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        c.*,
        u.name AS teacher_name
    FROM courses c
    JOIN users u
        ON c.teacher_id = u.id
    WHERE c.id = ?
");

$stmt->execute([$courseId]);

$course = $stmt->fetch();

if (!$course) {
    sendError("Course not found", null, 404);
}


/*
|--------------------------------------------------------------------------
| CHAPTERS
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT *
    FROM chapters
    WHERE course_id = ?
    ORDER BY sort_order ASC
");

$stmt->execute([$courseId]);

$chapters = $stmt->fetchAll();


/*
|--------------------------------------------------------------------------
| LESSONS + QUIZZES
|--------------------------------------------------------------------------
*/

foreach ($chapters as &$ch) {

    /*
    |--------------------------------------------------------------------------
    | LESSONS
    |--------------------------------------------------------------------------
    */

    $stmt2 = $pdo->prepare("
        SELECT
            l.*,

            (
                SELECT lp.is_completed
                FROM lesson_progress lp
                WHERE lp.user_id = ?
                AND lp.lesson_id = l.id
                LIMIT 1
            ) AS is_completed

        FROM lessons l

        WHERE l.chapter_id = ?

        ORDER BY l.sort_order ASC
    ");

    $stmt2->execute([
        $user['id'],
        $ch['id']
    ]);

    $ch['lessons'] = $stmt2->fetchAll();


    /*
    |--------------------------------------------------------------------------
    | QUIZZES
    |--------------------------------------------------------------------------
    */

    $stmt3 = $pdo->prepare("
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
            q.status,
            q.total_marks

        FROM quizzes q

        WHERE q.course_id = ?
        AND q.chapter_id = ?
        AND q.status = 'published'

        ORDER BY q.id ASC
    ");

    $stmt3->execute([
        $courseId,
        $ch['id']
    ]);

    $ch['quizzes'] = $stmt3->fetchAll();
}


/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

sendResponse(
    true,
    "Learning data",
    [
        "course" => $course,
        "enrollment" => $enrollment,
        "chapters" => $chapters
    ]
);

