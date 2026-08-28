
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$search = trim($_GET['search'] ?? '');
$category = $_GET['category_id'] ?? '';
$level = $_GET['level'] ?? '';
$teacherId = $_GET['teacher_id'] ?? '';

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 12;
$offset = ($page - 1) * $limit;


// =====================================
// WHERE
// =====================================

$where = [
    "c.status = 'published'"
];

$params = [];


// =====================================
// SEARCH
// =====================================

if ($search !== '') {

    $where[] = "
        (
            c.title LIKE ?
            OR c.short_description LIKE ?
        )
    ";

    $params[] = "%{$search}%";
    $params[] = "%{$search}%";
}


// =====================================
// CATEGORY
// =====================================

if ($category !== '') {

    $where[] = "c.category_id = ?";

    $params[] = (int)$category;
}


// =====================================
// LEVEL
// =====================================

if ($level !== '') {

    $where[] = "c.level = ?";

    $params[] = $level;
}


// =====================================
// TEACHER
// =====================================

if ($teacherId !== '') {

    $where[] = "c.teacher_id = ?";

    $params[] = (int)$teacherId;
}


$whereSql = implode(' AND ', $where);


// =====================================
// TOTAL
// =====================================

$countSql = "
    SELECT COUNT(*)
    FROM courses c
    WHERE $whereSql
";

$countStmt = $pdo->prepare($countSql);

$countStmt->execute($params);

$total = (int)$countStmt->fetchColumn();


// =====================================
// COURSES
// =====================================

$sql = "
    SELECT
        c.*,

        u.name AS teacher_name,
        u.avatar AS teacher_image,

        cat.name AS category_name,

        sub.name AS subcategory_name,

        COALESCE(r.average_rating, 0) AS average_rating,
        COALESCE(r.review_count, 0) AS review_count

    FROM courses c

    JOIN users u
        ON c.teacher_id = u.id

    JOIN categories cat
        ON c.category_id = cat.id

    LEFT JOIN subcategories sub
        ON c.subcategory_id = sub.id

    LEFT JOIN (
        SELECT
            course_id,
            ROUND(AVG(rating), 2) AS average_rating,
            COUNT(*) AS review_count

        FROM reviews

        WHERE status = 'approved'

        GROUP BY course_id
    ) r

        ON c.id = r.course_id

    WHERE $whereSql

    ORDER BY c.created_at DESC

    LIMIT $limit OFFSET $offset
";


$stmt = $pdo->prepare($sql);

$stmt->execute($params);

$courses =
    $stmt->fetchAll(PDO::FETCH_ASSOC);


// =====================================
// PROJECT BASE URL
// =====================================

$scriptDirectory =
    str_replace(
        '\\',
        '/',
        dirname($_SERVER['SCRIPT_NAME'])
    );

/*
 * Example:
 *
 * /php-lms-project/api/courses
 *
 * dirname once:
 * /php-lms-project/api
 *
 * dirname twice:
 * /php-lms-project
 */

$projectBaseUrl =
    dirname(
        dirname(
            $scriptDirectory
        )
    );

$projectBaseUrl =
    rtrim(
        $projectBaseUrl,
        '/'
    );


// =====================================
// IMAGE URL HELPER
// =====================================

function makeFileUrl(
    $file,
    $folder,
    $projectBaseUrl
) {

    if (
        empty($file)
    ) {
        return null;
    }


    $file = trim(
        (string)$file
    );


    /*
     * Already complete URL
     */

    if (
        str_starts_with(
            $file,
            'http://'
        ) ||
        str_starts_with(
            $file,
            'https://'
        )
    ) {

        return $file;
    }


    /*
     * Remove starting slash
     */

    $file =
        ltrim(
            $file,
            '/'
        );


    /*
     * If database already contains
     * uploads/courses/file.jpg
     */

    if (
        str_starts_with(
            $file,
            'uploads/'
        )
    ) {

        return
            $projectBaseUrl .
            '/' .
            $file;
    }


    /*
     * Normal filename
     */

    return
        $projectBaseUrl .
        '/uploads/' .
        $folder .
        '/' .
        $file;
}


// =====================================
// PREPARE RESPONSE
// =====================================

foreach (
    $courses as &$course
) {

    $course['average_rating'] =
        (float)$course[
            'average_rating'
        ];


    $course['review_count'] =
        (int)$course[
            'review_count'
        ];


    // =================================
    // COURSE IMAGE
    // =================================

    $courseImage =
        $course['thumbnail']
        ?? $course['image']
        ?? null;


    $course['thumbnail_url'] =
        makeFileUrl(
            $courseImage,
            'courses',
            $projectBaseUrl
        );


    // =================================
    // TEACHER IMAGE
    // =================================

    $teacherImage =
        $course['teacher_image']
        ?? null;


    $course['teacher_image_url'] =
        makeFileUrl(
            $teacherImage,
            'avatars',
            $projectBaseUrl
        );
}

unset($course);


// =====================================
// RESPONSE
// =====================================

sendResponse(
    true,
    "Courses fetched",
    [
        "courses" => $courses,

        "pagination" => [
            "page" => $page,

            "limit" => $limit,

            "total" => $total,

            "pages" =>
                $total > 0
                    ? (int)ceil(
                        $total / $limit
                    )
                    : 0
        ]
    ]
);

