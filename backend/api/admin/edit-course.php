
<?php

// ===============================
// CORS
// ===============================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ===============================
// Required Files
// ===============================
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ===============================
// Admin Authentication
// ===============================
$user = authenticate($pdo, ['admin']);


// ===============================
// Get Request Data
// ===============================
$data = json_decode(
    file_get_contents("php://input"),
    true
);


$courseId = (int)($data['course_id'] ?? 0);

$teacherId = (int)($data['teacher_id'] ?? 0);

$categoryId = (int)($data['category_id'] ?? 0);

$subcategoryId = !empty($data['subcategory_id'])
    ? (int)$data['subcategory_id']
    : null;

$title = trim($data['title'] ?? '');

$shortDescription =
    trim($data['short_description'] ?? '');

$description =
    trim($data['description'] ?? '');

$price = (float)($data['price'] ?? 0);

$discountPrice =
    ($data['discount_price'] !== '' &&
     $data['discount_price'] !== null)
        ? (float)$data['discount_price']
        : null;

$level = trim($data['level'] ?? 'beginner');

$language =
    trim($data['language'] ?? 'English');

$durationHours =
    (float)($data['duration_hours'] ?? 0);

$status =
    trim($data['status'] ?? 'draft');

$isFeatured =
    !empty($data['is_featured']) ? 1 : 0;


// ===============================
// Validation
// ===============================
$errors = [];


if (!$courseId) {
    $errors['course_id'] =
        "Course ID is required";
}


if ($title === '' || strlen($title) < 3) {
    $errors['title'] =
        "Course title must be at least 3 characters";
}


if (!$teacherId) {
    $errors['teacher_id'] =
        "Teacher is required";
}


if (!$categoryId) {
    $errors['category_id'] =
        "Category is required";
}


if ($price < 0) {
    $errors['price'] =
        "Price cannot be negative";
}


if ($discountPrice !== null && $discountPrice < 0) {
    $errors['discount_price'] =
        "Discount price cannot be negative";
}


if (
    $discountPrice !== null &&
    $discountPrice > $price
) {
    $errors['discount_price'] =
        "Discount cannot be greater than price";
}


if (!in_array(
    $level,
    ['beginner', 'intermediate', 'advanced']
)) {
    $errors['level'] =
        "Invalid level";
}


if (!in_array(
    $status,
    ['draft', 'published', 'archived']
)) {
    $errors['status'] =
        "Invalid course status";
}


if (!empty($errors)) {

    sendError(
        "Validation failed",
        $errors,
        422
    );
}


// ===============================
// Check Course Exists
// ===============================
$stmt = $pdo->prepare("
    SELECT id
    FROM courses
    WHERE id = ?
");

$stmt->execute([
    $courseId
]);

if (!$stmt->fetch()) {

    sendError(
        "Course not found",
        null,
        404
    );
}


// ===============================
// Check Teacher
// ===============================
$stmt = $pdo->prepare("
    SELECT id
    FROM users
    WHERE id = ?
    AND role_id = 2
    AND status = 'active'
");

$stmt->execute([
    $teacherId
]);

if (!$stmt->fetch()) {

    sendError(
        "Selected teacher is invalid or inactive",
        null,
        422
    );
}


// ===============================
// Check Category
// ===============================
$stmt = $pdo->prepare("
    SELECT id
    FROM categories
    WHERE id = ?
");

$stmt->execute([
    $categoryId
]);

if (!$stmt->fetch()) {

    sendError(
        "Selected category not found",
        null,
        422
    );
}


// ===============================
// Check Subcategory
// ===============================
if ($subcategoryId !== null) {

    $stmt = $pdo->prepare("
        SELECT id
        FROM subcategories
        WHERE id = ?
        AND category_id = ?
    ");

    $stmt->execute([
        $subcategoryId,
        $categoryId
    ]);

    if (!$stmt->fetch()) {

        sendError(
            "Selected subcategory is invalid",
            null,
            422
        );
    }
}


// ===============================
// Generate Slug
// ===============================
$slug = strtolower(
    trim(
        preg_replace(
            '/[^A-Za-z0-9-]+/',
            '-',
            $title
        ),
        '-'
    )
);


// ===============================
// Check Duplicate Slug
// ===============================
$stmt = $pdo->prepare("
    SELECT id
    FROM courses
    WHERE slug = ?
    AND id != ?
");

$stmt->execute([
    $slug,
    $courseId
]);

if ($stmt->fetch()) {

    $slug .= '-' . time();
}


// ===============================
// Update Course
// ===============================
try {

    $stmt = $pdo->prepare("
        UPDATE courses

        SET
            teacher_id = ?,
            category_id = ?,
            subcategory_id = ?,

            title = ?,
            slug = ?,

            short_description = ?,
            description = ?,

            price = ?,
            discount_price = ?,

            level = ?,
            language = ?,
            duration_hours = ?,

            status = ?,
            is_featured = ?

        WHERE id = ?
    ");


    $stmt->execute([

        $teacherId,

        $categoryId,

        $subcategoryId,

        $title,

        $slug,

        $shortDescription,

        $description,

        $price,

        $discountPrice,

        $level,

        $language,

        $durationHours,

        $status,

        $isFeatured,

        $courseId

    ]);


    // ===============================
    // Success
    // ===============================

    sendResponse(

        true,

        "Course updated successfully",

        [
            "course_id" => $courseId,
            "title" => $title,
            "slug" => $slug,
            "status" => $status
        ]

    );


} catch (PDOException $e) {

    sendError(

        "Failed to update course",

        $e->getMessage(),

        500

    );
}

