<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher', 'student']);
$courseId = $_GET['course_id'] ?? 0;

if (!$courseId) sendError("course_id required", null, 422);

$stmt = $pdo->prepare("SELECT * FROM chapters WHERE course_id = ? ORDER BY sort_order ASC");
$stmt->execute([$courseId]);
$chapters = $stmt->fetchAll();

foreach ($chapters as &$ch) {
    $stmt2 = $pdo->prepare("SELECT * FROM lessons WHERE chapter_id = ? ORDER BY sort_order ASC");
    $stmt2->execute([$ch['id']]);
    $ch['lessons'] = $stmt2->fetchAll();
}

sendResponse(true, "Chapters fetched", $chapters);
