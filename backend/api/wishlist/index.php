<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
$user = authenticate($pdo, ['student']);
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $stmt = $pdo->prepare("SELECT w.*, c.title, c.thumbnail, c.slug, c.price, c.discount_price FROM wishlists w JOIN courses c ON w.course_id = c.id WHERE w.user_id = ? ORDER BY w.created_at DESC");
    $stmt->execute([$user['id']]);
    sendResponse(true, "Wishlist", $stmt->fetchAll());
}
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $courseId = $data['course_id'] ?? 0;
    if (!$courseId) sendError("course_id required", null, 422);
    $pdo->prepare("INSERT IGNORE INTO wishlists (user_id, course_id) VALUES (?, ?)")->execute([$user['id'], $courseId]);
    sendResponse(true, "Added to wishlist");
}
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $courseId = $data['course_id'] ?? 0;
    $pdo->prepare("DELETE FROM wishlists WHERE user_id = ? AND course_id = ?")->execute([$user['id'], $courseId]);
    sendResponse(true, "Removed from wishlist");
}
