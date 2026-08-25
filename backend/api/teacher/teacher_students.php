
<?php

// =====================================
// CORS
// =====================================

require_once __DIR__ . '/../../config/cors.php';


// =====================================
// Required Files
// =====================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// =====================================
// Authenticate Teacher
// =====================================

$teacher = authenticate($pdo, ['teacher']);

$teacherId = (int) $teacher['id'];


// =====================================
// Get Teacher Enrollments
// =====================================

$stmt = $pdo->prepare("
    SELECT
        e.id AS enrollment_id,
        e.progress,
        e.status AS enrollment_status,
        e.enrolled_at,
        e.completed_at,

        u.id AS student_id,
        u.name AS student_name,
        u.email,
        u.phone,
        u.avatar,

        c.id AS course_id,
        c.title AS course_name,
        c.price,

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

    WHERE c.teacher_id = ?

    ORDER BY e.enrolled_at DESC
");

$stmt->execute([
    $teacherId
]);

$students = $stmt->fetchAll(PDO::FETCH_ASSOC);


// =====================================
// Format Data
// =====================================

$data = [];

foreach ($students as $student) {

    // =================================
    // Progress
    // =================================

    $progress = (float) ($student['progress'] ?? 0);

    if ($progress < 0) {
        $progress = 0;
    }

    if ($progress > 100) {
        $progress = 100;
    }


    // =================================
    // Status
    // =================================

    if ($progress >= 100) {

        $displayStatus = 'Completed';

    } elseif (
        strtolower(
            (string) $student['enrollment_status']
        ) === 'dropped'
    ) {

        $displayStatus = 'Dropped';

    } else {

        $displayStatus = 'In Progress';

    }


    // =================================
    // Certificate
    // =================================

    $certificate = null;

    if (
        !empty($student['certificate_id']) &&
        !empty($student['certificate_file'])
    ) {

        $certificateFile =
            basename($student['certificate_file']);

        $certificate = [

            'id' =>
                (int) $student['certificate_id'],

            'certificate_code' =>
                $student['certificate_code'],

            'certificate_file' =>
                $certificateFile,

            'certificate_url' =>
                'http://localhost/php-lms-project/backend/uploads/certificates/'
                . rawurlencode($certificateFile),

            'issued_at' =>
                $student['certificate_issued_at'],

            'status' =>
                $student['certificate_status']

        ];

    }


    // =================================
    // Final Data
    // =================================

    $data[] = [

        'enrollment_id' =>
            (int) $student['enrollment_id'],

        'student' => [

            'id' =>
                (int) $student['student_id'],

            'name' =>
                $student['student_name'],

            'email' =>
                $student['email'],

            'phone' =>
                $student['phone'],

            'avatar' =>
                !empty($student['avatar'])
                    ? 'http://localhost/php-lms-project/backend/uploads/avatars/'
                        . $student['avatar']
                    : null

        ],

        'course' => [

            'id' =>
                (int) $student['course_id'],

            'name' =>
                $student['course_name'],

            'price' =>
                (float) $student['price']

        ],

        'progress' =>
            $progress,

        'status' =>
            $displayStatus,

        'enrollment_status' =>
            $student['enrollment_status'],

        'enrolled_at' =>
            $student['enrolled_at'],

        'completed_at' =>
            $student['completed_at'],

        'certificate' =>
            $certificate

    ];
}


// =====================================
// Response
// =====================================

sendResponse(
    true,
    'Teacher enrollments fetched successfully',
    $data
);

