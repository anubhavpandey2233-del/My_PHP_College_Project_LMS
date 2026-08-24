
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// =====================================
// Admin Authentication
// =====================================

$user = authenticate($pdo, ['admin']);


// =====================================
// Get Category ID
// =====================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$id = (int)($data['id'] ?? 0);


// =====================================
// Validation
// =====================================

if (!$id) {
    sendError("Category ID is required", null, 422);
}


// =====================================
// Check Category Exists
// =====================================

$stmt = $pdo->prepare("
    SELECT id, name, status
    FROM categories
    WHERE id = ?
");

$stmt->execute([$id]);

$category = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$category) {
    sendError("Category not found", null, 404);
}


// =====================================
// Already Inactive
// =====================================

if ($category['status'] === 'inactive') {
    sendError("Category is already inactive", null, 400);
}


// =====================================
// Deactivate Category
// =====================================

$stmt = $pdo->prepare("
    UPDATE categories
    SET status = 'inactive'
    WHERE id = ?
");

$stmt->execute([$id]);


// =====================================
// Response
// =====================================

sendResponse(
    true,
    "Category deactivated successfully",
    [
        "id" => $id,
        "status" => "inactive"
    ]
);

