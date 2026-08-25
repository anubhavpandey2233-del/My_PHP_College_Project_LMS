
<?php

// =====================================
// Required Files
// =====================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Dompdf
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;


// =====================================
// Authenticate Student
// =====================================

$user = authenticate($pdo, ['student']);

$userId = (int) $user['id'];


// =====================================
// Get Lesson ID
// =====================================

$data = json_decode(
    file_get_contents('php://input'),
    true
);

$lessonId = $data['lesson_id'] ?? 0;

if (!$lessonId) {
    sendError(
        "lesson_id required",
        null,
        422
    );
}


// =====================================
// Get Course ID From Lesson
// =====================================

$stmt = $pdo->prepare("
    SELECT
        ch.course_id
    FROM lessons l
    INNER JOIN chapters ch
        ON l.chapter_id = ch.id
    WHERE l.id = ?
    LIMIT 1
");

$stmt->execute([
    $lessonId
]);

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    sendError(
        "Lesson not found",
        null,
        404
    );
}

$courseId = (int) $row['course_id'];


// =====================================
// Check Enrollment
// =====================================

$stmt = $pdo->prepare("
    SELECT
        id,
        progress,
        status
    FROM enrollments
    WHERE student_id = ?
      AND course_id = ?
    LIMIT 1
");

$stmt->execute([
    $userId,
    $courseId
]);

$enrollment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$enrollment) {
    sendError(
        "Not enrolled",
        null,
        403
    );
}


// =====================================
// Mark Lesson Complete
// =====================================

$stmt = $pdo->prepare("
    INSERT INTO lesson_progress
    (
        user_id,
        lesson_id,
        is_completed,
        completed_at
    )
    VALUES
    (
        ?,
        ?,
        1,
        NOW()
    )
    ON DUPLICATE KEY UPDATE
        is_completed = 1,
        completed_at = NOW()
");

$stmt->execute([
    $userId,
    $lessonId
]);


// =====================================
// Update Last Watched Lesson
// =====================================

$stmt = $pdo->prepare("
    UPDATE enrollments
    SET
        last_lesson_id = ?,
        last_watched_at = NOW()
    WHERE student_id = ?
      AND course_id = ?
");

$stmt->execute([
    $lessonId,
    $userId,
    $courseId
]);


// =====================================
// Get Total Lessons
// =====================================

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM lessons l
    INNER JOIN chapters ch
        ON l.chapter_id = ch.id
    WHERE ch.course_id = ?
");

$stmt->execute([
    $courseId
]);

$totalLessons = (int) $stmt->fetchColumn();


// =====================================
// Get Completed Lessons
// =====================================

$stmt = $pdo->prepare("
    SELECT COUNT(*)
    FROM lesson_progress lp
    INNER JOIN lessons l
        ON lp.lesson_id = l.id
    INNER JOIN chapters ch
        ON l.chapter_id = ch.id
    WHERE ch.course_id = ?
      AND lp.user_id = ?
      AND lp.is_completed = 1
");

$stmt->execute([
    $courseId,
    $userId
]);

$completedLessons = (int) $stmt->fetchColumn();


// =====================================
// Calculate Progress
// =====================================

$progress = $totalLessons > 0
    ? round(
        ($completedLessons / $totalLessons) * 100,
        2
    )
    : 0;

$progress = min(
    max($progress, 0),
    100
);


// =====================================
// Enrollment Status
// =====================================

$status = $progress >= 100
    ? 'completed'
    : 'active';

$completedAt = $progress >= 100
    ? date('Y-m-d H:i:s')
    : null;


// =====================================
// Update Enrollment
// =====================================

$stmt = $pdo->prepare("
    UPDATE enrollments
    SET
        progress = ?,
        status = ?,
        completed_at = ?
    WHERE student_id = ?
      AND course_id = ?
");

$stmt->execute([
    $progress,
    $status,
    $completedAt,
    $userId,
    $courseId
]);


// =====================================
// Certificate
// =====================================

$certificate = null;
$certificateUrl = null;


if ($progress >= 100) {

    // =================================
    // Get Student + Course + Teacher
    // =================================

    $stmt = $pdo->prepare("
        SELECT
            u.name AS student_name,
            c.title AS course_title,
            t.name AS teacher_name
        FROM users u
        INNER JOIN courses c
            ON c.id = ?
        LEFT JOIN users t
            ON c.teacher_id = t.id
        WHERE u.id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $courseId,
        $userId
    ]);

    $details = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$details) {
        sendError(
            "Student or course details not found",
            null,
            404
        );
    }


    // =================================
    // Check Existing Certificate
    // =================================

    $stmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            course_id,
            certificate_code,
            certificate_file,
            issued_at,
            status
        FROM certificates
        WHERE user_id = ?
          AND course_id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $userId,
        $courseId
    ]);

    $certificate = $stmt->fetch(PDO::FETCH_ASSOC);


    // =================================
    // Create Certificate Record
    // =================================

    if (!$certificate) {

        do {

            $certificateCode =
                'CERT-' .
                strtoupper(
                    bin2hex(
                        random_bytes(6)
                    )
                );

            $stmt = $pdo->prepare("
                SELECT id
                FROM certificates
                WHERE certificate_code = ?
                LIMIT 1
            ");

            $stmt->execute([
                $certificateCode
            ]);

        } while ($stmt->fetch());


        // Insert certificate

        $stmt = $pdo->prepare("
            INSERT INTO certificates
            (
                user_id,
                course_id,
                certificate_code,
                certificate_file,
                status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                NULL,
                'issued'
            )
        ");

        $stmt->execute([
            $userId,
            $courseId,
            $certificateCode
        ]);


        $certificateId = $pdo->lastInsertId();


        // Get created certificate

        $stmt = $pdo->prepare("
            SELECT
                id,
                user_id,
                course_id,
                certificate_code,
                certificate_file,
                issued_at,
                status
            FROM certificates
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $certificateId
        ]);

        $certificate = $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // =================================
    // Check Revoked Certificate
    // =================================

    if ($certificate['status'] === 'revoked') {

        sendError(
            "This certificate has been revoked.",
            null,
            403
        );
    }


    // =================================
    // Certificate Directory
    // =================================
    //
    // Current file:
    // backend/api/student/mark-complete.php
    //
    // Target:
    // backend/uploads/certificates/
    //
    // Therefore:
    // ../../../uploads/certificates/
    // =================================

    $certificateDirectory =
        __DIR__ . '/../../../uploads/certificates/';


    // Create directory if needed

    if (!is_dir($certificateDirectory)) {

        if (!mkdir(
            $certificateDirectory,
            0777,
            true
        )) {

            sendError(
                "Certificate directory could not be created.",
                null,
                500
            );
        }
    }


    // =================================
    // Generate PDF If File Missing
    // =================================

    if (empty($certificate['certificate_file'])) {

        // ---------------------------------
        // File Name
        // ---------------------------------

        $fileName =
            'certificate_' .
            $certificate['certificate_code'] .
            '.pdf';

        $filePath =
            $certificateDirectory .
            $fileName;


        // ---------------------------------
        // Certificate Data
        // ---------------------------------

        $studentName = htmlspecialchars(
            $details['student_name'] ?? 'Student',
            ENT_QUOTES,
            'UTF-8'
        );

        $courseTitle = htmlspecialchars(
            $details['course_title'] ?? 'Course',
            ENT_QUOTES,
            'UTF-8'
        );

        $teacherName = htmlspecialchars(
            $details['teacher_name'] ?? 'Instructor',
            ENT_QUOTES,
            'UTF-8'
        );

        $certificateCode = htmlspecialchars(
            $certificate['certificate_code'],
            ENT_QUOTES,
            'UTF-8'
        );

        $issuedDate = !empty($certificate['issued_at'])
            ? date(
                'd F Y',
                strtotime($certificate['issued_at'])
            )
            : date('d F Y');


        // =================================
        // Certificate HTML
        // =================================

        $html = "
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset='UTF-8'>

            <style>

                @page {
                    margin: 0;
                }

                body {
                    margin: 0;
                    padding: 0;
                    font-family: DejaVu Sans, sans-serif;
                    background: #ffffff;
                }

                .certificate {
                    width: 100%;
                    height: 100vh;
                    box-sizing: border-box;
                    padding: 55px;
                    border: 18px solid #0d6efd;
                    text-align: center;
                    background: #ffffff;
                }

                .inner {
                    height: 100%;
                    box-sizing: border-box;
                    border: 3px solid #d4af37;
                    padding: 45px;
                }

                .title {
                    font-size: 36px;
                    font-weight: bold;
                    color: #0d6efd;
                    margin-top: 25px;
                }

                .subtitle {
                    font-size: 18px;
                    color: #555555;
                    margin-top: 25px;
                }

                .student {
                    font-size: 34px;
                    font-weight: bold;
                    color: #222222;
                    margin-top: 30px;
                }

                .text {
                    font-size: 17px;
                    color: #555555;
                    margin-top: 25px;
                }

                .course {
                    font-size: 26px;
                    font-weight: bold;
                    color: #222222;
                    margin-top: 15px;
                }

                .details {
                    width: 100%;
                    margin-top: 50px;
                }

                .details td {
                    width: 50%;
                    text-align: center;
                }

                .label {
                    font-size: 13px;
                    color: #777777;
                }

                .value {
                    font-size: 16px;
                    font-weight: bold;
                    margin-top: 8px;
                }

                .code {
                    margin-top: 35px;
                    font-size: 13px;
                    color: #555555;
                }

                .footer {
                    margin-top: 45px;
                    font-size: 13px;
                    color: #777777;
                }

            </style>

        </head>

        <body>

            <div class='certificate'>

                <div class='inner'>

                    <div class='title'>
                        CERTIFICATE OF COMPLETION
                    </div>

                    <div class='subtitle'>
                        This certificate is proudly presented to
                    </div>

                    <div class='student'>
                        {$studentName}
                    </div>

                    <div class='text'>
                        for successfully completing the course
                    </div>

                    <div class='course'>
                        {$courseTitle}
                    </div>

                    <table class='details'>

                        <tr>

                            <td>

                                <div class='label'>
                                    Instructor
                                </div>

                                <div class='value'>
                                    {$teacherName}
                                </div>

                            </td>

                            <td>

                                <div class='label'>
                                    Completion Date
                                </div>

                                <div class='value'>
                                    {$issuedDate}
                                </div>

                            </td>

                        </tr>

                    </table>

                    <div class='code'>

                        Certificate ID:
                        <strong>
                            {$certificateCode}
                        </strong>

                    </div>

                    <div class='footer'>

                        PHP LMS
                        <br>
                        Learning Management System

                    </div>

                </div>

            </div>

        </body>

        </html>
        ";


        // =================================
        // Dompdf Configuration
        // =================================

        $options = new Options();

        $options->set(
            'defaultFont',
            'DejaVu Sans'
        );

        $options->set(
            'isRemoteEnabled',
            false
        );

        $dompdf = new Dompdf($options);


        // =================================
        // Generate PDF
        // =================================

        $dompdf->loadHtml(
            $html,
            'UTF-8'
        );

        $dompdf->setPaper(
            'A4',
            'landscape'
        );

        $dompdf->render();


        // =================================
        // Save PDF
        // =================================

        $pdfOutput = $dompdf->output();

        $saved = file_put_contents(
            $filePath,
            $pdfOutput
        );

        if ($saved === false) {

            sendError(
                "Certificate PDF could not be created.",
                null,
                500
            );
        }


        // =================================
        // Verify PDF Exists
        // =================================

        if (
            !file_exists($filePath) ||
            filesize($filePath) <= 0
        ) {

            sendError(
                "Certificate PDF was not saved correctly.",
                null,
                500
            );
        }


        // =================================
        // Save File Name In Database
        // =================================

        $stmt = $pdo->prepare("
            UPDATE certificates
            SET certificate_file = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $fileName,
            $certificate['id']
        ]);


        // =================================
        // Verify Database Update
        // =================================

        $stmt = $pdo->prepare("
            SELECT
                certificate_file
            FROM certificates
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $certificate['id']
        ]);

        $savedFileName = $stmt->fetchColumn();


        if (empty($savedFileName)) {

            sendError(
                "PDF was created but certificate_file could not be saved in database.",
                null,
                500
            );
        }


        // Update certificate data

        $certificate['certificate_file'] =
            $savedFileName;
    }


    // =================================
    // Certificate URL
    // =================================

    if (!empty($certificate['certificate_file'])) {

        $certificateUrl =
            'http://localhost/php-lms-project/backend/uploads/certificates/'
            . $certificate['certificate_file'];
    }
}


// =====================================
// Final Response
// =====================================

sendResponse(
    true,

    $progress >= 100
        ? "Lesson marked complete and certificate is ready."
        : "Lesson marked complete",

    [
        "progress" =>
            $progress,

        "status" =>
            $status,

        "completed_lessons" =>
            $completedLessons,

        "total_lessons" =>
            $totalLessons,

        "certificate" =>
            $certificate,

        "certificate_url" =>
            $certificateUrl
    ]
);

