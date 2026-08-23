<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher']);
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

$stmt = $pdo->prepare("SELECT c.teacher_id FROM chapters ch JOIN courses c ON ch.course_id = c.id WHERE ch.id = ?");
$stmt->execute([$id]);
$row = $stmt->fetch();
if (!$row || ($user['role'] === 'teacher' && $row['teacher_id'] != $user['id'])) {
    sendError("Unauthorized", null, 403);
}

$pdo->prepare("DELETE FROM chapters WHERE id = ?")->execute([$id]);
sendResponse(true, "Chapter deleted");
