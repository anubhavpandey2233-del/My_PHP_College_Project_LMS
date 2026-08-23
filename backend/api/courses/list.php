<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$search    = trim($_GET['search'] ?? '');
$category  = $_GET['category_id'] ?? '';
$level     = $_GET['level'] ?? '';
$teacherId = $_GET['teacher_id'] ?? '';

$page = max(1, (int)($_GET['page'] ?? 1));
$limit = 12;
$offset = ($page - 1) * $limit;


// =====================================
// WHERE CONDITIONS
// =====================================

$where = [
    "c.status = 'published'"
];

$params = [];


// =====================================
// Search
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
// Category
// =====================================

if ($category !== '') {

    $where[] = "c.category_id = ?";

    $params[] = (int)$category;
}


// =====================================
// Level
// =====================================

if ($level !== '') {

    $where[] = "c.level = ?";

    $params[] = $level;
}


// =====================================
// Teacher
// =====================================

if ($teacherId !== '') {

    $where[] = "c.teacher_id = ?";

    $params[] = (int)$teacherId;
}


// =====================================
// WHERE SQL
// =====================================

$whereSql = implode(' AND ', $where);


// =====================================
// Total Courses
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
// Fetch Courses
// =====================================

$sql = "
    SELECT
        c.*,

        u.name AS teacher_name,

        cat.name AS category_name,

        sub.name AS subcategory_name

    FROM courses c

    JOIN users u
        ON c.teacher_id = u.id

    JOIN categories cat
        ON c.category_id = cat.id

    LEFT JOIN subcategories sub
        ON c.subcategory_id = sub.id

    WHERE $whereSql

    ORDER BY c.created_at DESC

    LIMIT $limit OFFSET $offset
";

$stmt = $pdo->prepare($sql);

$stmt->execute($params);

$courses = $stmt->fetchAll(PDO::FETCH_ASSOC);


// =====================================
// Response
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
            "pages" => $total > 0
                ? (int)ceil($total / $limit)
                : 0
        ]
    ]
);