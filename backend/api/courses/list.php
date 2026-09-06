<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$search = trim($_GET['search'] ?? '');
$category = trim($_GET['category_id'] ?? '');
$level = trim($_GET['level'] ?? '');
$teacherId = trim($_GET['teacher_id'] ?? '');

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 12;
$offset = ($page - 1) * $limit;

$where = [
    "c.status = 'published'"
];

$params = [];

if ($search !== '') {

    $where[] = "
        (
            COALESCE(c.title, '') LIKE ?
            OR COALESCE(c.short_description, '') LIKE ?
            OR COALESCE(c.description, '') LIKE ?
            OR COALESCE(c.slug, '') LIKE ?
        )
    ";

    $searchValue = '%' . $search . '%';

    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
    $params[] = $searchValue;
}

if ($category !== '') {

    $where[] = "c.category_id = ?";
    $params[] = (int)$category;
}

if ($level !== '') {

    $where[] = "c.level = ?";
    $params[] = $level;
}

if ($teacherId !== '') {

    $where[] = "c.teacher_id = ?";
    $params[] = (int)$teacherId;
}

$whereSql = implode(' AND ', $where);

$countSql = "
    SELECT COUNT(*)
    FROM courses c
    WHERE $whereSql
";

$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);

$total = (int)$countStmt->fetchColumn();

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

$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

$scriptDirectory = str_replace(
    '\\',
    '/',
    dirname($_SERVER['SCRIPT_NAME'])
);

$projectBaseUrl = dirname(
    dirname(
        $scriptDirectory
    )
);

$projectBaseUrl = rtrim(
    $projectBaseUrl,
    '/'
);

function makeFileUrl(
    $file,
    $folder,
    $projectBaseUrl
) {
    if (empty($file)) {
        return null;
    }

    $file = trim((string)$file);

    if (
        str_starts_with($file, 'http://') ||
        str_starts_with($file, 'https://')
    ) {
        return $file;
    }

    $file = ltrim($file, '/');

    if (str_starts_with($file, 'uploads/')) {
        return $projectBaseUrl . '/' . $file;
    }

    return $projectBaseUrl .
        '/uploads/' .
        $folder .
        '/' .
        $file;
}

foreach ($courses as &$course) {

    $course['average_rating'] = (float)(
        $course['average_rating'] ?? 0
    );

    $course['review_count'] = (int)(
        $course['review_count'] ?? 0
    );

    $courseImage =
        $course['thumbnail']
        ?? $course['image']
        ?? null;

    $course['thumbnail_url'] = makeFileUrl(
        $courseImage,
        'courses',
        $projectBaseUrl
    );

    $teacherImage =
        $course['teacher_image']
        ?? null;

    $course['teacher_image_url'] = makeFileUrl(
        $teacherImage,
        'avatars',
        $projectBaseUrl
    );
}

unset($course);

sendResponse(
    true,
    "Courses fetched",
    [
        "courses" => $courses,

        "pagination" => [
            "page" => $page,
            "limit" => $limit,
            "total" => $total,
            "pages" => $total > 0
                ? (int)ceil($total / $limit)
                : 0
        ]
    ]
);