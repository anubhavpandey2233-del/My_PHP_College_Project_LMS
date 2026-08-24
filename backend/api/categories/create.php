
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// =====================================
// Admin Authentication
// =====================================

$user = authenticate($pdo, ['admin']);


// =====================================
// Get Request Data
// =====================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$name = trim($data['name'] ?? '');
$description = trim($data['description'] ?? '');
$status = trim($data['status'] ?? 'active');


// =====================================
// Validation
// =====================================

$errors = [];

if ($name === '') {
    $errors['name'] = 'Category name is required';
} elseif (strlen($name) < 2) {
    $errors['name'] = 'Category name must be at least 2 characters';
} elseif (strlen($name) > 100) {
    $errors['name'] = 'Category name cannot exceed 100 characters';
}

if (!in_array($status, ['active', 'inactive'], true)) {
    $errors['status'] = 'Invalid category status';
}

if (!empty($errors)) {
    sendError('Validation failed', $errors, 422);
}


// =====================================
// Generate Slug
// =====================================

$slug = strtolower(
    trim(
        preg_replace(
            '/[^A-Za-z0-9]+/',
            '-',
            $name
        ),
        '-'
    )
);


// =====================================
// Check Duplicate Name
// =====================================

$stmt = $pdo->prepare("
    SELECT id
    FROM categories
    WHERE name = ?
    LIMIT 1
");

$stmt->execute([$name]);

if ($stmt->fetch()) {
    sendError(
        'Category already exists',
        null,
        409
    );
}


// =====================================
// Check Duplicate Slug
// =====================================

$stmt = $pdo->prepare("
    SELECT id
    FROM categories
    WHERE slug = ?
    LIMIT 1
");

$stmt->execute([$slug]);

if ($stmt->fetch()) {
    sendError(
        'Category with this slug already exists',
        null,
        409
    );
}


// =====================================
// Insert Category
// =====================================

try {

    $stmt = $pdo->prepare("
        INSERT INTO categories
        (
            name,
            slug,
            description,
            status
        )
        VALUES
        (
            ?,
            ?,
            ?,
            ?
        )
    ");

    $stmt->execute([
        $name,
        $slug,
        $description !== '' ? $description : null,
        $status
    ]);

    $categoryId = $pdo->lastInsertId();


    // =====================================
    // Response
    // =====================================

    sendResponse(
        true,
        'Category created successfully',
        [
            'id' => (int)$categoryId,
            'name' => $name,
            'slug' => $slug,
            'description' => $description,
            'status' => $status
        ]
    );

} catch (PDOException $e) {

    sendError(
        'Failed to create category',
        $e->getMessage(),
        500
    );
}

