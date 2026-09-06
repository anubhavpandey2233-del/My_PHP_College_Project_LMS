<?php

// ===============================
// CORS
// ===============================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ===============================
// Required Files
// ===============================
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ===============================
// Admin Authentication
// ===============================
$user = authenticate($pdo, ['admin']);


// ===============================
// Get Courses
// ===============================
try {

    $stmt = $pdo->prepare("
        SELECT
            c.id,
            c.teacher_id,
            c.category_id,
            c.subcategory_id,
            c.title,
            c.slug,
            c.short_description,
            c.thumbnail,
            c.price,
            c.discount_price,
            c.level,
            c.language,
            c.duration_hours,
            c.status,
            c.is_featured,
            c.total_lessons,
            c.total_students,

            COALESCE(
                (
                    SELECT AVG(r.rating)
                    FROM reviews r
                    WHERE r.course_id = c.id
                      AND r.status = 'approved'
                ),
                0
            ) AS average_rating,

            c.created_at,
            c.updated_at,

            u.name AS teacher_name,

            cat.name AS category_name,

            sub.name AS subcategory_name

        FROM courses c

        LEFT JOIN users u
            ON c.teacher_id = u.id

        LEFT JOIN categories cat
            ON c.category_id = cat.id

        LEFT JOIN subcategories sub
            ON c.subcategory_id = sub.id

        ORDER BY c.created_at DESC
    ");

    $stmt->execute();

    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ===============================
    // Success Response
    // ===============================
    sendResponse(
        true,
        "Courses fetched successfully",
        $courses
    );


} catch (Exception $e) {

    sendError(
        "Failed to fetch courses",
        $e->getMessage(),
        500
    );
}