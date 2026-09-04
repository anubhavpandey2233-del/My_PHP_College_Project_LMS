<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// AUTHENTICATION
// ==========================================

$user = authenticate($pdo);


// ==========================================
// GET JSON DATA
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    sendError(
        "Invalid JSON data",
        null,
        400
    );

}

$courseIds = $data['course_ids'] ?? [];

if (!is_array($courseIds) || empty($courseIds)) {

    sendError(
        "course_ids required",
        null,
        422
    );

}

$courseIds = array_values(
    array_unique(
        array_map('intval', $courseIds)
    )
);

$courseIds = array_filter(
    $courseIds,
    function ($id) {
        return $id > 0;
    }
);

if (empty($courseIds)) {

    sendError(
        "Valid course_ids required",
        null,
        422
    );

}


// ==========================================
// START TRANSACTION
// ==========================================

try {

    $pdo->beginTransaction();

    $enrolledCourses = [];
    $alreadyEnrolled = [];
    $skippedCourses = [];

    foreach ($courseIds as $courseId) {


        // ==========================================
        // CHECK COURSE
        // ==========================================

        $stmt = $pdo->prepare("
            SELECT
                id,
                title,
                teacher_id,
                status
            FROM courses
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $courseId
        ]);

        $course = $stmt->fetch(
            PDO::FETCH_ASSOC
        );

        if (!$course) {

            $skippedCourses[] = [
                'course_id' => $courseId,
                'reason' => 'Course not found'
            ];

            continue;

        }

        if ($course['status'] !== 'published') {

            $skippedCourses[] = [
                'course_id' => $courseId,
                'title' => $course['title'],
                'reason' => 'Course is not available for enrollment'
            ];

            continue;

        }


        // ==========================================
        // CHECK EXISTING ENROLLMENT
        // ==========================================

        $stmt = $pdo->prepare("
            SELECT id
            FROM enrollments
            WHERE student_id = ?
              AND course_id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $user['id'],
            $courseId
        ]);

        if ($stmt->fetch()) {

            $alreadyEnrolled[] = [
                'course_id' => $courseId,
                'title' => $course['title']
            ];

            continue;

        }


        // ==========================================
        // CREATE ENROLLMENT
        // ==========================================

        $stmt = $pdo->prepare("
            INSERT INTO enrollments
            (
                student_id,
                course_id,
                progress,
                status
            )
            VALUES (?, ?, 0, 'active')
        ");

        $stmt->execute([
            $user['id'],
            $courseId
        ]);

        $enrollmentId =
            $pdo->lastInsertId();


        // ==========================================
        // UPDATE STUDENT COUNT
        // ==========================================

        $stmt = $pdo->prepare("
            UPDATE courses
            SET total_students =
                total_students + 1
            WHERE id = ?
        ");

        $stmt->execute([
            $courseId
        ]);


        // ==========================================
        // TEACHER NOTIFICATION
        // ==========================================

        $notificationTitle =
            "New Student Enrollment";

        $notificationMessage =
            $user['name'] .
            " enrolled in your course: " .
            $course['title'];

        $stmt = $pdo->prepare("
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type,
                is_read,
                link,
                created_at
            )
            VALUES (
                ?,
                ?,
                ?,
                'enrollment',
                0,
                NULL,
                NOW()
            )
        ");

        $stmt->execute([
            $course['teacher_id'],
            $notificationTitle,
            $notificationMessage
        ]);


        // ==========================================
        // STORE ENROLLED COURSE
        // ==========================================

        $enrolledCourses[] = [
            'course_id' => $courseId,
            'title' => $course['title'],
            'enrollment_id' => (int)$enrollmentId
        ];

    }


    // ==========================================
    // COMMIT
    // ==========================================

    $pdo->commit();


    // ==========================================
    // RESPONSE
    // ==========================================

    sendResponse(
        true,
        "Courses enrollment completed",
        [
            'enrolled_courses' => $enrolledCourses,
            'already_enrolled' => $alreadyEnrolled,
            'skipped_courses' => $skippedCourses,
            'enrolled_count' => count($enrolledCourses),
            'already_enrolled_count' => count($alreadyEnrolled),
            'skipped_count' => count($skippedCourses)
        ],
        201
    );


} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "Enroll All Error: " .
        $e->getMessage()
    );

    sendError(
        "Unable to enroll in courses",
        null,
        500
    );

}