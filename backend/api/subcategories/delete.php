
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'] ?? '';

    // ==============================
    // Validation
    // ==============================

    if ($id === '') {
        sendError("Subcategory ID is required", "", 400);
    }

    // ==============================
    // Check Subcategory
    // ==============================

    $checkStmt = $pdo->prepare("
        SELECT id, name, status
        FROM subcategories
        WHERE id = ?
        LIMIT 1
    ");

    $checkStmt->execute([$id]);

    $subcategory = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$subcategory) {
        sendError("Subcategory not found", "", 404);
    }

    // ==============================
    // Already Inactive
    // ==============================

    if ($subcategory['status'] === 'inactive') {
        sendError("Subcategory is already inactive", "", 400);
    }

    // ==============================
    // Deactivate
    // ==============================

    $stmt = $pdo->prepare("
        UPDATE subcategories
        SET status = 'inactive'
        WHERE id = ?
    ");

    $stmt->execute([$id]);

    // ==============================
    // Response
    // ==============================

    sendResponse(
        true,
        "Subcategory deactivated successfully",
        [
            'id' => $id,
            'name' => $subcategory['name'],
            'status' => 'inactive'
        ]
    );

} catch (PDOException $e) {

    sendError(
        "Failed to deactivate subcategory",
        $e->getMessage(),
        500
    );
}

