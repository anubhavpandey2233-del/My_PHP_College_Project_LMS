<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../helpers/slug.php';
require_once __DIR__ . '/../../helpers/upload.php';

$user = authenticate($pdo, ['admin', 'teacher']);

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

if (empty($title) || !$category_id) {
    sendError("Title and category are required", null, 422);
}

$slug = createSlug($title);
$stmt = $pdo->prepare("SELECT id FROM courses WHERE slug = ?");
$stmt->execute([$slug]);
if ($stmt->fetch()) $slug .= '-' . time();

$thumbnail = null;
if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
    $upload = uploadCourseThumbnail($_FILES['thumbnail']);
    if (!$upload['success']) sendError($upload['message'], null, 422);
    $thumbnail = $upload['filename'];
}

$teacher_id = ($user['role'] === 'admin' && !empty($_POST['teacher_id'])) 
    ? $_POST['teacher_id'] 
    : $user['id'];

$stmt = $pdo->prepare("INSERT INTO courses 
    (teacher_id, category_id, subcategory_id, title, slug, short_description, description, thumbnail, price, discount_price, level, language, duration_hours, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $teacher_id, $category_id, $subcategory_id, $title, $slug, $short_description, $description,
    $thumbnail, $price, $discount_price, $level, $language, $duration_hours, $status
]);

$courseId = $pdo->lastInsertId();

if (!empty($_POST['requirements'])) {
    $reqs = json_decode($_POST['requirements'], true);
    if (is_array($reqs)) {
        foreach ($reqs as $i => $req) {
            if (trim($req)) {
                $pdo->prepare("INSERT INTO course_requirements (course_id, requirement, sort_order) VALUES (?, ?, ?)")
                    ->execute([$courseId, trim($req), $i]);
            }
        }
    }
}

if (!empty($_POST['outcomes'])) {
    $outs = json_decode($_POST['outcomes'], true);
    if (is_array($outs)) {
        foreach ($outs as $i => $out) {
            if (trim($out)) {
                $pdo->prepare("INSERT INTO course_outcomes (course_id, outcome, sort_order) VALUES (?, ?, ?)")
                    ->execute([$courseId, trim($out), $i]);
            }
        }
    }
}

sendResponse(true, "Course created successfully", ["id" => $courseId, "slug" => $slug], 201);
