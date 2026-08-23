<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
$user = authenticate($pdo, ['student']);
$data = json_decode(file_get_contents("php://input"), true);
$courseId = $data['course_id'] ?? 0;
$rating = (int)($data['rating'] ?? 0);
$reviewText = trim($data['review_text'] ?? '');
if (!$courseId || $rating < 1 || $rating > 5) sendError("Valid course_id and rating (1-5) required", null, 422);
$stmt = $pdo->prepare("SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?");
$stmt->execute([$user['id'], $courseId]);
if (!$stmt->fetch()) sendError("You must be enrolled to review", null, 403);
$stmt = $pdo->prepare("SELECT id FROM reviews WHERE user_id = ? AND course_id = ?");
$stmt->execute([$user['id'], $courseId]);
if ($stmt->fetch()) sendError("You already reviewed this course", null, 409);
$stmt = $pdo->prepare("INSERT INTO reviews (user_id, course_id, rating, review_text, status) VALUES (?, ?, ?, ?, 'pending')");
$stmt->execute([$user['id'], $courseId, $rating, $reviewText]);
sendResponse(true, "Review submitted for approval", null, 201);
