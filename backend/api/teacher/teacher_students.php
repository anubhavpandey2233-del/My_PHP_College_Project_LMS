
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

$teacherId = $teacher['id'];


// =====================================
// Get Enrolled Students
// =====================================

$stmt = $pdo->prepare("
    SELECT
        e.id AS enrollment_id,

        u.id AS student_id,
        u.name AS student_name,
        u.email,
        u.phone,
        u.avatar,

        c.id AS course_id,
        c.title AS course_name,
        c.price,

        e.progress,
        e.status AS enrollment_status,
        e.enrolled_at,
        e.completed_at

    FROM enrollments e

    INNER JOIN users u
        ON e.student_id = u.id

    INNER JOIN courses c
        ON e.course_id = c.id

    WHERE c.teacher_id = ?

    ORDER BY e.enrolled_at DESC
");

$stmt->execute([
    $teacherId
]);

$students = $stmt->fetchAll();


// =====================================
// Format Data
// =====================================

$data = [];

foreach ($students as $student) {

    $progress = (float) ($student['progress'] ?? 0);

    // Keep progress between 0 and 100
    if ($progress < 0) {
        $progress = 0;
    }

    if ($progress > 100) {
        $progress = 100;
    }


    // Status for frontend
    if ($progress >= 100) {
        $displayStatus = 'Completed';
    } elseif ($student['enrollment_status'] === 'dropped') {
        $displayStatus = 'Dropped';
    } else {
        $displayStatus = 'In Progress';
    }


    $data[] = [

        'enrollment_id' => (int) $student['enrollment_id'],

        'student' => [
            'id' => (int) $student['student_id'],
            'name' => $student['student_name'],
            'email' => $student['email'],
            'phone' => $student['phone'],
            'avatar' => !empty($student['avatar'])
                ? 'http://localhost/php-lms-project/backend/uploads/avatars/' . $student['avatar']
                : null
                    ],

        'course' => [
            'id' => (int) $student['course_id'],
            'name' => $student['course_name'],
            'price' => (float) $student['price']
        ],

        'progress' => $progress,

        'status' => $displayStatus,

        'enrollment_status' => $student['enrollment_status'],

        'enrolled_at' => $student['enrolled_at'],

        'completed_at' => $student['completed_at']
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

