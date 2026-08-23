
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
// Get Course ID
// ===============================
$courseId = (int)($_GET['id'] ?? 0);


// ===============================
// Validation
// ===============================
if (!$courseId) {
    sendError(
        "Course ID is required",
        null,
        422
    );
}


// ===============================
// Fetch Course
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
            c.description,

            c.thumbnail,

            c.price,
            c.discount_price,

            c.level,
            c.language,
            c.duration_hours,

            c.status,
            c.is_featured,

            c.total_students,
            c.average_rating,

            c.created_at,
            c.updated_at,


            /* ==========================
               Actual Chapters
               ========================== */

            (
                SELECT COUNT(*)
                FROM chapters ch
                WHERE ch.course_id = c.id
            ) AS total_chapters,


            /* ==========================
               Actual Lessons
               ========================== */

            (
                SELECT COUNT(*)
                FROM lessons l
                INNER JOIN chapters ch2
                    ON l.chapter_id = ch2.id
                WHERE ch2.course_id = c.id
            ) AS actual_total_lessons,


            /* ==========================
               Teacher
               ========================== */

            u.name AS teacher_name,


            /* ==========================
               Category
               ========================== */

            cat.name AS category_name,


            /* ==========================
               Subcategory
               ========================== */

            sub.name AS subcategory_name


        FROM courses c


        /* ==========================
           Teacher
           ========================== */

        LEFT JOIN users u
            ON c.teacher_id = u.id


        /* ==========================
           Category
           ========================== */

        LEFT JOIN categories cat
            ON c.category_id = cat.id


        /* ==========================
           Subcategory
           ========================== */

        LEFT JOIN subcategories sub
            ON c.subcategory_id = sub.id


        WHERE c.id = ?

        LIMIT 1
    ");


    $stmt->execute([
        $courseId
    ]);


    $course = $stmt->fetch(PDO::FETCH_ASSOC);


    // ===============================
    // Course Not Found
    // ===============================

    if (!$course) {

        sendError(
            "Course not found",
            null,
            404
        );
    }


    // ===============================
    // Price Calculation
    // ===============================

    $price = (float)(
        $course['price'] ?? 0
    );

    $discount = (float)(
        $course['discount_price'] ?? 0
    );


    $finalPrice = $price - $discount;


    // Prevent negative price

    if ($finalPrice < 0) {
        $finalPrice = 0;
    }


    // ===============================
    // Add Final Price
    // ===============================

    $course['final_price'] = number_format(
        $finalPrice,
        2,
        '.',
        ''
    );


    // ===============================
    // Convert Numeric Values
    // ===============================

    $course['price'] = $price;


    $course['discount_price'] = $discount;


    $course['duration_hours'] =
        (float)(
            $course['duration_hours'] ?? 0
        );


    // Actual chapter count

    $course['total_chapters'] =
        (int)(
            $course['total_chapters'] ?? 0
        );


    // Actual lesson count

    $course['total_lessons'] =
        (int)(
            $course['actual_total_lessons'] ?? 0
        );


    // Remove temporary field

    unset(
        $course['actual_total_lessons']
    );


    $course['total_students'] =
        (int)(
            $course['total_students'] ?? 0
        );


    $course['average_rating'] =
        (float)(
            $course['average_rating'] ?? 0
        );


    $course['is_featured'] =
        (int)(
            $course['is_featured'] ?? 0
        );


    // ===============================
    // Success Response
    // ===============================

    sendResponse(

        true,

        "Course details fetched successfully",

        $course

    );


} catch (PDOException $e) {

    sendError(

        "Database error while fetching course details",

        $e->getMessage(),

        500

    );


} catch (Exception $e) {

    sendError(

        "Failed to fetch course details",

        $e->getMessage(),

        500

    );

}

