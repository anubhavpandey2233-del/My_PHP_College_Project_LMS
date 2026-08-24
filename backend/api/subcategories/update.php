
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'] ?? '';
    $categoryId = $data['category_id'] ?? '';
    $name = trim($data['name'] ?? '');
    $description = trim($data['description'] ?? '');
    $status = $data['status'] ?? 'active';

    // ==============================
    // Validation
    // ==============================

    if ($id === '') {
        sendError("Subcategory ID is required", "", 400);
    }

    if ($categoryId === '') {
        sendError("Category is required", "", 400);
    }

    if ($name === '') {
        sendError("Subcategory name is required", "", 400);
    }

    if (!in_array($status, ['active', 'inactive'])) {
        sendError("Invalid status", "", 400);
    }

    // ==============================
    // Check Subcategory
    // ==============================

    $subStmt = $pdo->prepare("
        SELECT id
        FROM subcategories
        WHERE id = ?
        LIMIT 1
    ");

    $subStmt->execute([$id]);

    if (!$subStmt->fetch()) {
        sendError("Subcategory not found", "", 404);
    }

    // ==============================
    // Check Category
    // ==============================

    $categoryStmt = $pdo->prepare("
        SELECT id
        FROM categories
        WHERE id = ?
        LIMIT 1
    ");

    $categoryStmt->execute([$categoryId]);

    if (!$categoryStmt->fetch()) {
        sendError("Category not found", "", 404);
    }

    // ==============================
    // Create Slug
    // ==============================

    $slug = strtolower(trim($name));

    $slug = preg_replace('/[^a-z0-9]+/i', '-', $slug);
    $slug = trim($slug, '-');

    // ==============================
    // Check Duplicate
    // ==============================

    $checkStmt = $pdo->prepare("
        SELECT id
        FROM subcategories
        WHERE category_id = ?
          AND (name = ? OR slug = ?)
          AND id != ?
        LIMIT 1
    ");

    $checkStmt->execute([
        $categoryId,
        $name,
        $slug,
        $id
    ]);

    if ($checkStmt->fetch()) {
        sendError(
            "This subcategory already exists in the selected category",
            "",
            409
        );
    }

    // ==============================
    // Update
    // ==============================

    $stmt = $pdo->prepare("
        UPDATE subcategories
        SET
            category_id = ?,
            name = ?,
            slug = ?,
            description = ?,
            status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $categoryId,
        $name,
        $slug,
        $description !== '' ? $description : null,
        $status,
        $id
    ]);

    // ==============================
    // Response
    // ==============================

    sendResponse(
        true,
        "Subcategory updated successfully",
        [
            'id' => $id,
            'category_id' => $categoryId,
            'name' => $name,
            'slug' => $slug,
            'description' => $description,
            'status' => $status
        ]
    );

} catch (PDOException $e) {

    sendError(
        "Failed to update subcategory",
        $e->getMessage(),
        500
    );
}

