<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher']);

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$title = trim($data['title'] ?? '');

if (!$id || !$title) {
    sendError("Chapter ID and title are required", null, 422);
}

$stmt = $pdo->prepare("SELECT id, course_id FROM chapters WHERE id = ?");
$stmt->execute([$id]);
$chapter = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$chapter) {
    sendError("Chapter not found", null, 404);
}

if ($user['role'] === 'teacher') {
    $stmt = $pdo->prepare("
        SELECT id 
        FROM courses 
        WHERE id = ? AND teacher_id = ?
    ");
    $stmt->execute([
        $chapter['course_id'],
        $user['id']
    ]);

    if (!$stmt->fetch()) {
        sendError("You are not allowed to update this chapter", null, 403);
    }
}

$stmt = $pdo->prepare("
    UPDATE chapters
    SET title = ?
    WHERE id = ?
");

$stmt->execute([
    $title,
    $id
]);

sendResponse(true, "Chapter updated successfully");