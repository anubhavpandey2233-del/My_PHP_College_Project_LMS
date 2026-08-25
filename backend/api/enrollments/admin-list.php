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
            u.avatar AS student_avatar,

            c.title AS course_title,

            cert.id AS certificate_id,
            cert.certificate_code,
            cert.certificate_file,
            cert.issued_at AS certificate_issued_at,
            cert.status AS certificate_status

        FROM enrollments e

        INNER JOIN users u
            ON e.student_id = u.id

        INNER JOIN courses c
            ON e.course_id = c.id

        LEFT JOIN certificates cert
            ON cert.user_id = e.student_id
            AND cert.course_id = e.course_id

        ORDER BY e.enrolled_at DESC
    ");

    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // =====================================
    // Format Data
    // =====================================

    foreach ($enrollments as &$enrollment) {

        // ---------------------------------
        // Student Avatar
        // ---------------------------------

        $enrollment['student_avatar'] =
            !empty($enrollment['student_avatar'])
                ? 'http://localhost/php-lms-project/backend/uploads/avatars/'
                    . $enrollment['student_avatar']
                : null;


        // ---------------------------------
        // Certificate
        // ---------------------------------

        $enrollment['certificate'] = null;


        if (
            !empty($enrollment['certificate_id']) &&
            !empty($enrollment['certificate_file'])
        ) {

            $certificateFile =
                basename($enrollment['certificate_file']);

            $enrollment['certificate'] = [

                'id' =>
                    (int) $enrollment['certificate_id'],

                'certificate_code' =>
                    $enrollment['certificate_code'],

                'certificate_file' =>
                    $certificateFile,

                'certificate_url' =>
                    'http://localhost/php-lms-project/backend/uploads/certificates/'
                    . rawurlencode($certificateFile),

                'issued_at' =>
                    $enrollment['certificate_issued_at'],

                'status' =>
                    $enrollment['certificate_status']

            ];
        }


        // ---------------------------------
        // Remove temporary certificate fields
        // ---------------------------------

        unset(
            $enrollment['certificate_id'],
            $enrollment['certificate_code'],
            $enrollment['certificate_file'],
            $enrollment['certificate_issued_at'],
            $enrollment['certificate_status']
        );
    }

    unset($enrollment);


    // =====================================
    // Response
    // =====================================

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