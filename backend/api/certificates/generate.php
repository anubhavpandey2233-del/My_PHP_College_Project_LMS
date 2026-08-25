
<?php

// =====================================
// Required Files
// =====================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

use Dompdf\Dompdf;
use Dompdf\Options;


// =====================================
// Authenticate Student
// =====================================

$user = authenticate($pdo, ['student']);

$userId = (int) $user['id'];


// =====================================
// Get Course ID
// =====================================

$input = json_decode(
    file_get_contents('php://input'),
    true
);

$courseId =
    $input['course_id']
    ?? $_POST['course_id']
    ?? null;

if (!$courseId) {
    sendError(
        "Course ID is required",
        null,
        422
    );
}

$courseId = (int) $courseId;


// =====================================
// Check Enrollment
// =====================================

$stmt = $pdo->prepare("
    SELECT
        e.id,
        e.progress,
        e.status,
        c.id AS course_id,
        c.title AS course_title,
        u.name AS student_name
    FROM enrollments e
    INNER JOIN courses c
        ON e.course_id = c.id
    INNER JOIN users u
        ON e.student_id = u.id
    WHERE e.student_id = ?
      AND e.course_id = ?
    LIMIT 1
");

$stmt->execute([
    $userId,
    $courseId
]);

$enrollment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$enrollment) {
    sendError(
        "You are not enrolled in this course.",
        null,
        404
    );
}


// =====================================
// Check Course Completion
// =====================================

$progress = (float) (
    $enrollment['progress'] ?? 0
);

if ($progress < 100) {
    sendError(
        "Course is not completed yet.",
        [
            'progress' => $progress
        ],
        403
    );
}


// =====================================
// Get Existing Certificate
// =====================================

$stmt = $pdo->prepare("
    SELECT
        cert.id,
        cert.user_id,
        cert.course_id,
        cert.certificate_code,
        cert.certificate_file,
        cert.issued_at,
        cert.status,
        c.title AS course_title,
        u.name AS student_name
    FROM certificates cert
    INNER JOIN courses c
        ON cert.course_id = c.id
    INNER JOIN users u
        ON cert.user_id = u.id
    WHERE cert.user_id = ?
      AND cert.course_id = ?
    LIMIT 1
");

$stmt->execute([
    $userId,
    $courseId
]);

$certificate = $stmt->fetch(PDO::FETCH_ASSOC);


// =====================================
// Create Certificate If Not Exists
// =====================================

if (!$certificate) {

    do {

        $certificateCode =
            'CERT-' .
            strtoupper(
                bin2hex(random_bytes(6))
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


    $stmt = $pdo->prepare("
        INSERT INTO certificates
        (
            user_id,
            course_id,
            certificate_code,
            certificate_file,
            issued_at,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            NULL,
            NOW(),
            'issued'
        )
    ");

    $stmt->execute([
        $userId,
        $courseId,
        $certificateCode
    ]);


    $certificateId =
        (int) $pdo->lastInsertId();


    // Get newly created certificate

    $stmt = $pdo->prepare("
        SELECT
            cert.id,
            cert.user_id,
            cert.course_id,
            cert.certificate_code,
            cert.certificate_file,
            cert.issued_at,
            cert.status,
            c.title AS course_title,
            u.name AS student_name
        FROM certificates cert
        INNER JOIN courses c
            ON cert.course_id = c.id
        INNER JOIN users u
            ON cert.user_id = u.id
        WHERE cert.id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $certificateId
    ]);

    $certificate =
        $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$certificate) {
        sendError(
            "Certificate record could not be created.",
            null,
            500
        );
    }
}


// =====================================
// Check Revoked Certificate
// =====================================

if ($certificate['status'] === 'revoked') {

    sendError(
        "This certificate has been revoked.",
        null,
        403
    );
}


// =====================================
// Certificate Directory
// =====================================

$uploadDirectory =
    __DIR__ . '/../../uploads/certificates/';


// =====================================
// Create Directory
// =====================================

if (!is_dir($uploadDirectory)) {

    if (!mkdir(
        $uploadDirectory,
        0777,
        true
    )) {

        sendError(
            "Certificate upload directory could not be created.",
            [
                'directory' => $uploadDirectory
            ],
            500
        );
    }
}


// =====================================
// File Name
// =====================================

$fileName =
    'certificate_' .
    $certificate['certificate_code'] .
    '.pdf';

$filePath =
    $uploadDirectory .
    $fileName;


// =====================================
// Certificate Information
// =====================================

$studentName = htmlspecialchars(
    $certificate['student_name'] ?? 'Student',
    ENT_QUOTES,
    'UTF-8'
);

$courseTitle = htmlspecialchars(
    $certificate['course_title'] ?? 'Course',
    ENT_QUOTES,
    'UTF-8'
);

$certificateCode = htmlspecialchars(
    $certificate['certificate_code'],
    ENT_QUOTES,
    'UTF-8'
);

$issuedDate =
    !empty($certificate['issued_at'])
        ? date(
            'd F Y',
            strtotime($certificate['issued_at'])
        )
        : date('d F Y');


// =====================================
// Certificate HTML
// EXACTLY ONE A4 LANDSCAPE PAGE
// =====================================


$html = '
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<style>

@page {
    size: A4 landscape;
    margin: 0;
}

html,
body {
    margin: 0;
    padding: 0;
}

body {
    font-family: DejaVu Sans, sans-serif;
    background: #ffffff;
}


/* =====================================
   CERTIFICATE
   ===================================== */

.certificate {

    position: absolute;

    left: 5mm;
    top: 5mm;

    width: 287mm;
    height: 200mm;

    box-sizing: border-box;

    border: 3mm solid #1f4e79;

    padding: 5mm;

    background: #ffffff;

}


/* =====================================
   INNER BORDER
   ===================================== */

.inner {

    width: 100%;
    height: 100%;

    box-sizing: border-box;

    border: 1mm solid #d4af37;

    padding: 7mm;

    text-align: center;

}


/* =====================================
   TOP
   ===================================== */

```css
.top-decoration {
    font-size: 14px;
    color: #d4af37;
    margin-bottom: 3mm;
}

.title {
    font-size: 32px;
    font-weight: bold;
    color: #1f4e79;
    margin-bottom: 5mm;
}

.subtitle {
    font-size: 15px;
    color: #666666;
    margin-bottom: 5mm;
}

.student {
    font-size: 29px;
    font-weight: bold;
    color: #222222;
    margin-bottom: 5mm;
    padding-bottom: 2mm;
    border-bottom: 1px solid #d4af37;
}

.course-text {
    font-size: 15px;
    color: #555555;
    margin-bottom: 3mm;
}

.course {
    font-size: 24px;
    font-weight: bold;
    color: #1f4e79;
    margin-bottom: 5mm;
}

.message {
    font-size: 12px;
    color: #666666;
    line-height: 1.4;
    margin-bottom: 5mm;
}

.details {
    font-size: 12px;
    color: #555555;
    margin-bottom: 5mm;
}

.code {
    font-weight: bold;
    color: #1f4e79;
}

.footer {
    font-size: 11px;
    color: #777777;
}

.signature {
    width: 45mm;
    margin: 0 auto 2mm auto;
    padding-top: 2mm;
    border-top: 1px solid #333333;
    font-size: 11px;
    color: #444444;
}

.bottom-title {
    font-size: 12px;
    font-weight: bold;
    color: #1f4e79;
    margin-top: 1mm;
}

.bottom-subtitle {
    font-size: 10px;
    color: #777777;
}

.bottom-decoration {
    font-size: 13px;
    color: #d4af37;
    margin-top: 2mm;
}



</style>

</head>


<body>


<div class="certificate">


    <div class="inner">


        <div class="top-decoration">
            ✦ &nbsp; ✦ &nbsp; ✦
        </div>


        <div class="title">
            CERTIFICATE OF COMPLETION
        </div>


        <div class="subtitle">
            This certificate is proudly presented to
        </div>


        <div class="student">
            ' . $studentName . '
        </div>


        <div class="course-text">
            for successfully completing the course
        </div>


        <div class="course">
            ' . $courseTitle . '
        </div>


        <div class="message">
            This certificate recognizes the successful completion
            of all required course lessons and learning activities.
        </div>


        <div class="details">

            Certificate Code:

            <span class="code">
                ' . $certificateCode . '
            </span>

            &nbsp;&nbsp;&nbsp;&nbsp;

            Issued Date:

            ' . $issuedDate . '

        </div>


        <div class="footer">

            <div class="signature">
                LMS Instructor
            </div>

            <div class="bottom-title">
                LMS
            </div>

            <div class="bottom-subtitle">
                Learning Management System
            </div>

        </div>


        <div class="bottom-decoration">
            ✦ &nbsp; ✦ &nbsp; ✦
        </div>


    </div>


</div>


</body>
</html>
';




// =====================================
// Dompdf Configuration
// =====================================

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


// =====================================
// Generate PDF
// =====================================

try {

    $dompdf->loadHtml(
        $html,
        'UTF-8'
    );

    $dompdf->setPaper(
        'A4',
        'landscape'
    );

    $dompdf->render();

} catch (Throwable $e) {

    sendError(
        "Certificate PDF generation failed.",
        [
            'error' => $e->getMessage()
        ],
        500
    );
}


// =====================================
// Get PDF Content
// =====================================

$pdfContent =
    $dompdf->output();

if (
    $pdfContent === false ||
    strlen($pdfContent) === 0
) {

    sendError(
        "Certificate PDF is empty.",
        null,
        500
    );
}


// =====================================
// Save PDF
// =====================================

$saved =
    file_put_contents(
        $filePath,
        $pdfContent
    );

if ($saved === false) {

    sendError(
        "Certificate PDF could not be saved.",
        [
            'file_path' => $filePath
        ],
        500
    );
}


// =====================================
// Verify PDF
// =====================================

if (
    !file_exists($filePath) ||
    filesize($filePath) === 0
) {

    sendError(
        "Certificate PDF was not created correctly.",
        [
            'file_path' => $filePath
        ],
        500
    );
}


// =====================================
// Update Database
// =====================================

try {

    $stmt = $pdo->prepare("
        UPDATE certificates
        SET
            certificate_file = ?,
            issued_at = COALESCE(
                issued_at,
                NOW()
            )
        WHERE id = ?
    ");

    $stmt->execute([
        $fileName,
        (int) $certificate['id']
    ]);

} catch (Throwable $e) {

    sendError(
        "Database update failed.",
        [
            'error' => $e->getMessage()
        ],
        500
    );
}


// =====================================
// Verify Database Value
// =====================================

$stmt = $pdo->prepare("
    SELECT
        cert.id,
        cert.user_id,
        cert.course_id,
        cert.certificate_code,
        cert.certificate_file,
        cert.issued_at,
        cert.status,
        c.title AS course_title,
        u.name AS student_name
    FROM certificates cert
    INNER JOIN courses c
        ON cert.course_id = c.id
    INNER JOIN users u
        ON cert.user_id = u.id
    WHERE cert.id = ?
    LIMIT 1
");

$stmt->execute([
    (int) $certificate['id']
]);

$updatedCertificate =
    $stmt->fetch(PDO::FETCH_ASSOC);


if (!$updatedCertificate) {

    sendError(
        "Certificate record not found after database update.",
        null,
        500
    );
}


// =====================================
// Verify certificate_file
// =====================================

if (
    empty($updatedCertificate['certificate_file'])
) {

    sendError(
        "PDF was created, but certificate_file is still NULL in database.",
        [
            'certificate_id' =>
                $updatedCertificate['id'],

            'file_name' =>
                $fileName
        ],
        500
    );
}


// =====================================
// Certificate URL
// =====================================

$certificateUrl =
    'http://localhost/php-lms-project/backend/uploads/certificates/' .
    $updatedCertificate['certificate_file'];


// =====================================
// Response Data
// =====================================

$updatedCertificate['certificate_url'] =
    $certificateUrl;

$updatedCertificate['course_title'] =
    $certificate['course_title'];

$updatedCertificate['student_name'] =
    $certificate['student_name'];


// =====================================
// Final Response
// =====================================

sendResponse(
    true,
    "Certificate PDF generated successfully.",
    $updatedCertificate
);

