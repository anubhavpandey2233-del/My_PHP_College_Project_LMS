<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// =====================================
// Teacher Authentication
// =====================================

$user = authenticate($pdo, ['teacher']);

$teacherId = $user['id'];


// =====================================
// Get Teacher Courses
// Draft + Published
// Archived NOT included
// =====================================

$sql = "
    SELECT
        c.*,

        cat.name AS category_name,

        sub.name AS subcategory_name,

        (
            SELECT COUNT(*)
            FROM enrollments e
            WHERE e.course_id = c.id
        ) AS total_students,

        (
            SELECT COUNT(*)
            FROM chapters ch
            WHERE ch.course_id = c.id
        ) AS total_chapters,

        (
            SELECT COUNT(*)
            FROM lessons l
            JOIN chapters ch2
                ON l.chapter_id = ch2.id
            WHERE ch2.course_id = c.id
        ) AS total_lessons

    FROM courses c

    JOIN categories cat
        ON c.category_id = cat.id

    LEFT JOIN subcategories sub
        ON c.subcategory_id = sub.id

    WHERE c.teacher_id = ?

    AND c.status IN ('draft', 'published')

    ORDER BY c.created_at DESC
";


$stmt = $pdo->prepare($sql);

$stmt->execute([
    $teacherId
]);

$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);


// =====================================
// Response
// =====================================

sendResponse(
    true,
    "Teacher courses fetched successfully",
    [
        "courses" => $courses
    ]
);