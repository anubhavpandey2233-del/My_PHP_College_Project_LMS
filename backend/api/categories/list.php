<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {
    $stmt = $pdo->query("
        SELECT *
        FROM categories
        WHERE status = 'active'
        ORDER BY name ASC
    ");

    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(true, "Categories fetched", $categories);

} catch (PDOException $e) {
    sendError("Failed to fetch categories", $e->getMessage(), 500);
}