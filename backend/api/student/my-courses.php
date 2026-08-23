
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ===============================
// Student Authentication
// ===============================

$user = authenticate($pdo, ['student']);

$status = $_GET['status'] ?? 'all';


// ===============================
// Base Query
// ===============================

$sql = "
    SELECT
        e.id AS enrollment_id,
        e.student_id,
        e.course_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        e.last_watched_at,

        c.id AS id,
        c.title,
        c.thumbnail,
        c.slug,
        c.level,
        c.status AS course_status,

        u.name AS teacher_name,

        (
            SELECT COUNT(*)
            FROM lessons l
            INNER JOIN chapters ch
                ON l.chapter_id = ch.id
            WHERE ch.course_id = c.id
        ) AS total_lessons,

        (
            SELECT COUNT(*)
            FROM lesson_progress lp
            INNER JOIN lessons l
                ON lp.lesson_id = l.id
            INNER JOIN chapters ch
                ON l.chapter_id = ch.id
            WHERE ch.course_id = c.id
              AND lp.user_id = ?
              AND lp.is_completed = 1
        ) AS completed_lessons

    FROM enrollments e

    INNER JOIN courses c
        ON e.course_id = c.id
        AND c.status = 'published'

    INNER JOIN users u
        ON c.teacher_id = u.id

    WHERE e.student_id = ?
";

$params = [
    $user['id'],
    $user['id']
];


// ===============================
// Enrollment Status Filter
// ===============================

if ($status === 'active') {

    $sql .= "
        AND e.status = 'active'
    ";

} elseif ($status === 'completed') {

    $sql .= "
        AND e.status = 'completed'
    ";
}


// ===============================
// Order
// ===============================

$sql .= "
    ORDER BY
        e.last_watched_at DESC,
        e.enrolled_at DESC
";


// ===============================
// Execute
// ===============================

try {

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ===============================
    // Calculate Progress
    // ===============================

    foreach ($courses as &$course) {

        $course['total_lessons'] =
            (int)($course['total_lessons'] ?? 0);

        $course['completed_lessons'] =
            (int)($course['completed_lessons'] ?? 0);

        if ($course['total_lessons'] > 0) {

            $course['progress'] = round(
                (
                    $course['completed_lessons'] /
                    $course['total_lessons']
                ) * 100,
                2
            );

        } else {

            $course['progress'] = 0;
        }
    }

    unset($course);


    // ===============================
    // Response
    // ===============================

    sendResponse(
        true,
        "My courses",
        $courses
    );


} catch (PDOException $e) {

    sendError(
        "Failed to fetch my courses",
        $e->getMessage(),
        500
    );
}

