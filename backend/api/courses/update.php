<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/slug.php';
require_once __DIR__ . '/../../helpers/upload.php';

$user = authenticate($pdo, ['admin', 'teacher']);

$id = $_POST['id'] ?? 0;
if (!$id) sendError("Course ID required", null, 422);

$stmt = $pdo->prepare("SELECT teacher_id FROM courses WHERE id = ?");
$stmt->execute([$id]);
$course = $stmt->fetch();
if (!$course) sendError("Course not found", null, 404);

if ($user['role'] === 'teacher' && $course['teacher_id'] != $user['id']) {
    sendError("You can only edit your own courses", null, 403);
}

$title = trim($_POST['title'] ?? '');
$short_description = trim($_POST['short_description'] ?? '');
$description = trim($_POST['description'] ?? '');
$category_id = $_POST['category_id'] ?? 0;
$subcategory_id = $_POST['subcategory_id'] ?: null;
$level = $_POST['level'] ?? 'beginner';
$language = $_POST['language'] ?? 'English';
$price = $_POST['price'] ?? 0;
$discount_price = $_POST['discount_price'] ?: null;
$duration_hours = $_POST['duration_hours'] ?? 0;
$status = $_POST['status'] ?? 'draft';

$slug = createSlug($title);

$thumbnailSql = "";
$params = [$title, $slug, $short_description, $description, $category_id, $subcategory_id, $price, $discount_price, $level, $language, $duration_hours, $status];

if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $upload = uploadCourseThumbnail($_FILES['thumbnail']);
    if (!$upload['success']) sendError($upload['message'], null, 422);
    $thumbnailSql = ", thumbnail = ?";
    $params[] = $upload['filename'];
}

$params[] = $id;

$sql = "UPDATE courses SET title=?, slug=?, short_description=?, description=?, category_id=?, subcategory_id=?, 
        price=?, discount_price=?, level=?, language=?, duration_hours=?, status=? $thumbnailSql WHERE id=?";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);

if (isset($_POST['requirements'])) {
    $pdo->prepare("DELETE FROM course_requirements WHERE course_id = ?")->execute([$id]);
    $reqs = json_decode($_POST['requirements'], true);
    if (is_array($reqs)) {
        foreach ($reqs as $i => $req) {
            if (trim($req)) {
                $pdo->prepare("INSERT INTO course_requirements (course_id, requirement, sort_order) VALUES (?, ?, ?)")
                    ->execute([$id, trim($req), $i]);
            }
        }
    }
}

if (isset($_POST['outcomes'])) {
    $pdo->prepare("DELETE FROM course_outcomes WHERE course_id = ?")->execute([$id]);
    $outs = json_decode($_POST['outcomes'], true);
    if (is_array($outs)) {
        foreach ($outs as $i => $out) {
            if (trim($out)) {
                $pdo->prepare("INSERT INTO course_outcomes (course_id, outcome, sort_order) VALUES (?, ?, ?)")
                    ->execute([$id, trim($out), $i]);
            }
        }
    }
}

sendResponse(true, "Course updated successfully");
