<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin', 'teacher']);
$data = json_decode(file_get_contents("php://input"), true);

$chapterId = $data['chapter_id'] ?? 0;
$title = trim($data['title'] ?? '');
$content = $data['content'] ?? '';
$videoUrl = $data['video_url'] ?? '';
$videoDuration = (int)($data['video_duration'] ?? 0);
$isPreview = !empty($data['is_preview']) ? 1 : 0;

if (!$chapterId || empty($title)) sendError("chapter_id and title required", null, 422);

$stmt = $pdo->prepare("SELECT c.teacher_id FROM chapters ch JOIN courses c ON ch.course_id = c.id WHERE ch.id = ?");
$stmt->execute([$chapterId]);
$row = $stmt->fetch();
if (!$row || ($user['role'] === 'teacher' && $row['teacher_id'] != $user['id'])) {
    sendError("Unauthorized", null, 403);
}

$stmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM lessons WHERE chapter_id = ?");
$stmt->execute([$chapterId]);
$sort = $stmt->fetchColumn();

$stmt = $pdo->prepare("INSERT INTO lessons (chapter_id, title, content, video_url, video_duration, is_preview, sort_order) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$chapterId, $title, $content, $videoUrl, $videoDuration, $isPreview, $sort]);

sendResponse(true, "Lesson created", ["id" => $pdo->lastInsertId()], 201);
