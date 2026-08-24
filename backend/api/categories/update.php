
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// =====================================
// Admin Authentication
// =====================================

$user = authenticate($pdo, ['admin']);


// =====================================
// Get JSON Data
// =====================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$id = (int)($data['id'] ?? 0);
$name = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$status = $data['status'] ?? 'active';


// =====================================
// Validation
// =====================================

if (!$id) {
    sendError("Category ID is required", null, 422);
}

if ($name === '') {
    sendError("Category name is required", null, 422);
}

if (!in_array($status, ['active', 'inactive'], true)) {
    sendError("Invalid category status", null, 422);
}


// =====================================
// Check Category Exists
// =====================================

$stmt = $pdo->prepare("
    SELECT id
    FROM categories
    WHERE id = ?
");

$stmt->execute([$id]);

$category = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$category) {
    sendError("Category not found", null, 404);
}


// =====================================
// Check Duplicate Name
// =====================================

$stmt = $pdo->prepare("
    SELECT id
    FROM categories
    WHERE LOWER(name) = LOWER(?)
      AND id != ?
");

$stmt->execute([
    $name,
    $id
]);

if ($stmt->fetch()) {
    sendError("Category name already exists", null, 409);
}


// =====================================
// Create Slug
// =====================================

$slug = strtolower(
    preg_replace(
        '/[^a-z0-9]+/',
        '-',
        $name
    )
);

$slug = trim($slug, '-');


// =====================================
// Check Duplicate Slug
// =====================================

$stmt = $pdo->prepare("
    SELECT id
    FROM categories
    WHERE slug = ?
      AND id != ?
");

$stmt->execute([
    $slug,
    $id
]);

if ($stmt->fetch()) {
    sendError("Category slug already exists", null, 409);
}


// =====================================
// Update Category
// =====================================

$stmt = $pdo->prepare("
    UPDATE categories
    SET
        name = ?,
        slug = ?,
        description = ?,
        status = ?
    WHERE id = ?
");

$stmt->execute([
    $name,
    $slug,
    $description !== '' ? $description : null,
    $status,
    $id
]);


// =====================================
// Response
// =====================================

sendResponse(
    true,
    "Category updated successfully",
    [
        "id" => $id,
        "name" => $name,
        "slug" => $slug,
        "description" => $description,
        "status" => $status
    ]
);

