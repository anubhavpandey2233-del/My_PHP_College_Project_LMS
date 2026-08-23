<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
$user = authenticate($pdo, ['admin', 'teacher', 'student']);
$courseId = $_GET['course_id'] ?? null;
$sql = "SELECT q.*, c.title as course_title FROM quizzes q JOIN courses c ON q.course_id = c.id WHERE 1=1";
$params = [];
if ($user['role'] === 'teacher') { $sql .= " AND c.teacher_id = ?"; $params[] = $user['id']; }
if ($courseId) { $sql .= " AND q.course_id = ?"; $params[] = $courseId; }
if ($user['role'] === 'student') { $sql .= " AND q.status = 'published'"; }
$sql .= " ORDER BY q.created_at DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
sendResponse(true, "Quizzes fetched", $stmt->fetchAll());
