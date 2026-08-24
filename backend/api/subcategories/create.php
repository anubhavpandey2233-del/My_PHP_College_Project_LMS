
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $data = json_decode(file_get_contents("php://input"), true);

    $categoryId = $data['category_id'] ?? '';
    $name = trim($data['name'] ?? '');
    $description = trim($data['description'] ?? '');
    $status = $data['status'] ?? 'active';

    // ==============================
    // Validation
    // ==============================

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
    // Check Category
    // ==============================

    $categoryStmt = $pdo->prepare("
        SELECT id
        FROM categories
        WHERE id = ?
          AND status = 'active'
        LIMIT 1
    ");

    $categoryStmt->execute([$categoryId]);

    if (!$categoryStmt->fetch()) {
        sendError("Selected category is not available", "", 400);
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
          AND (
              name = ?
              OR slug = ?
          )
        LIMIT 1
    ");

    $checkStmt->execute([
        $categoryId,
        $name,
        $slug
    ]);

    if ($checkStmt->fetch()) {
        sendError(
            "This subcategory already exists in the selected category",
            "",
            409
        );
    }

    // ==============================
    // Insert
    // ==============================

    $stmt = $pdo->prepare("
        INSERT INTO subcategories
        (
            category_id,
            name,
            slug,
            description,
            status
        )
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $categoryId,
        $name,
        $slug,
        $description !== '' ? $description : null,
        $status
    ]);

    $id = $pdo->lastInsertId();

    // ==============================
    // Response
    // ==============================

    sendResponse(
        true,
        "Subcategory created successfully",
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
        "Failed to create subcategory",
        $e->getMessage(),
        500
    );
}

