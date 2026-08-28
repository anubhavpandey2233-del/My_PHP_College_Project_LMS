
<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';


// ==========================================
// ALLOW GET ONLY
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(
        "Only GET method is allowed",
        null,
        405
    );
}


// ==========================================
// RESPONSE DATA
// ==========================================

try {

    // ==========================================
    // CATEGORIES
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            id,
            name,
            slug,
            description
        FROM categories
        WHERE status = 'active'
        ORDER BY name ASC
    ");

    $stmt->execute();

    $categories = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    // ==========================================
    // SUBCATEGORIES
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            id,
            category_id,
            name,
            slug,
            description
        FROM subcategories
        WHERE status = 'active'
        ORDER BY name ASC
    ");

    $stmt->execute();

    $subcategories = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    // ==========================================
    // POPULAR / ALL COURSES
    // ==========================================

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
            c.total_lessons,
            c.total_students,
            c.average_rating,
            c.created_at,

            u.name AS teacher_name,
            u.avatar AS teacher_avatar,

            cat.name AS category_name,
            cat.slug AS category_slug,

            sub.name AS subcategory_name,
            sub.slug AS subcategory_slug

        FROM courses c

        INNER JOIN users u
            ON c.teacher_id = u.id

        INNER JOIN categories cat
            ON c.category_id = cat.id

        LEFT JOIN subcategories sub
            ON c.subcategory_id = sub.id

        WHERE c.status = 'published'
        AND u.status = 'active'
        AND cat.status = 'active'

        ORDER BY
            c.total_students DESC,
            c.created_at DESC

        LIMIT 20
    ");

    $stmt->execute();

    $courses = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    // ==========================================
    // BESTSELLER COURSE
    // ==========================================

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
            c.total_lessons,
            c.total_students,
            c.average_rating,
            c.created_at,

            u.name AS teacher_name,
            u.avatar AS teacher_avatar,

            cat.name AS category_name,
            cat.slug AS category_slug,

            sub.name AS subcategory_name,
            sub.slug AS subcategory_slug

        FROM courses c

        INNER JOIN users u
            ON c.teacher_id = u.id

        INNER JOIN categories cat
            ON c.category_id = cat.id

        LEFT JOIN subcategories sub
            ON c.subcategory_id = sub.id

        WHERE c.status = 'published'
        AND u.status = 'active'
        AND cat.status = 'active'

        ORDER BY c.total_students DESC

        LIMIT 8
    ");

    $stmt->execute();

    $bestSellerCourses = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    // ==========================================
    // NEW COURSES
    // ==========================================

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
            c.total_lessons,
            c.total_students,
            c.average_rating,
            c.created_at,

            u.name AS teacher_name,
            u.avatar AS teacher_avatar,

            cat.name AS category_name,
            cat.slug AS category_slug,

            sub.name AS subcategory_name,
            sub.slug AS subcategory_slug

        FROM courses c

        INNER JOIN users u
            ON c.teacher_id = u.id

        INNER JOIN categories cat
            ON c.category_id = cat.id

        LEFT JOIN subcategories sub
            ON c.subcategory_id = sub.id

        WHERE c.status = 'published'
        AND u.status = 'active'
        AND cat.status = 'active'

        ORDER BY c.created_at DESC

        LIMIT 8
    ");

    $stmt->execute();

    $newCourses = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    // ==========================================
    // STUDENT REVIEWS
    // ==========================================

    $stmt = $pdo->prepare("
        SELECT
            r.id,
            r.user_id,
            r.course_id,
            r.rating,
            r.review_text,
            r.created_at,

            u.name AS student_name,
            u.avatar AS student_avatar,

            c.title AS course_title,
            c.slug AS course_slug,
            c.thumbnail AS course_thumbnail

        FROM reviews r

        INNER JOIN users u
            ON r.user_id = u.id

        INNER JOIN courses c
            ON r.course_id = c.id

        WHERE r.status = 'approved'
        AND u.status = 'active'
        AND c.status = 'published'

        ORDER BY r.created_at DESC

        LIMIT 10
    ");

    $stmt->execute();

    $reviews = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    // ==========================================
    // RESPONSE
    // ==========================================

    sendResponse(
        true,
        "Home data loaded successfully",
        [
            "categories" => $categories,
            "subcategories" => $subcategories,
            "courses" => $courses,
            "best_sellers" => $bestSellerCourses,
            "new_courses" => $newCourses,
            "reviews" => $reviews
        ]
    );


} catch (Exception $e) {

    error_log(
        "Home API Error: " .
        $e->getMessage()
    );

    sendError(
        "Failed to load home data",
        null,
        500
    );
}

