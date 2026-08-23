<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    $stmt = $pdo->query("SELECT 1");
    sendResponse(true, "Database connected successfully", [
        "database" => "php_lms_project",
        "status"   => "OK"
    ]);
} catch (Exception $e) {
    sendError("Database connection test failed", $e->getMessage(), 500);
}
