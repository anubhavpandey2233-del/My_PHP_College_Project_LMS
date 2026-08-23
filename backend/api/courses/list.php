<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$search   = $_GET['search'] ?? '';
$category = $_GET['category_id'] ?? '';
$level    = $_GET['level'] ?? '';
$status   = $_GET['status'] ?? '';
$teacherId = $_GET['teacher_id'] ?? '';
$page     = max(1, (int)($_GET['page'] ?? 1));
$limit    = 12;
$offset   = ($page - 1) * $limit;

$where  = ["1=1"];
$params = [];

// Public requests only see published
$isAuthenticated = false;
$headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
if (isset($headers['Authorization']) || isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $isAuthenticated = true;
}

if (!$isAuthenticated && empty($status)) {
    $where[] = "c.status = 'published'";
} elseif ($status) {
    $where[] = "c.status = ?";
    $params[] = $status;
}

if ($search) {
    $where[] = "(c.title LIKE ? OR c.short_description LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}
if ($category) {
    $where[] = "c.category_id = ?";
    $params[] = $category;
}
if ($level) {
    $where[] = "c.level = ?";
    $params[] = $level;
}
if ($teacherId) {
    $where[] = "c.teacher_id = ?";
    $params[] = $teacherId;
}

$whereSql = implode(' AND ', $where);

$countStmt = $pdo->prepare("SELECT COUNT(*) FROM courses c WHERE $whereSql");
$countStmt->execute($params);
$total = $countStmt->fetchColumn();

$sql = "SELECT c.*, u.name as teacher_name, cat.name as category_name, sub.name as subcategory_name
        FROM courses c
        JOIN users u ON c.teacher_id = u.id
        JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN subcategories sub ON c.subcategory_id = sub.id
        WHERE $whereSql
        ORDER BY c.created_at DESC
        LIMIT $limit OFFSET $offset";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$courses = $stmt->fetchAll();

sendResponse(true, "Courses fetched", [
    "courses" => $courses,
    "pagination" => [
        "page"  => $page,
        "limit" => $limit,
        "total" => (int)$total,
        "pages" => ceil($total / $limit)
    ]
]);
