
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $stmt = $pdo->query("
        SELECT
            s.id,
            s.category_id,
            s.name,
            s.slug,
            s.description,
            s.status,
            s.created_at,
            s.updated_at,

            c.name AS category_name

        FROM subcategories s

        INNER JOIN categories c
            ON s.category_id = c.id

        ORDER BY c.name ASC, s.name ASC
    ");

    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(
        true,
        "Subcategories fetched",
        $subcategories
    );

} catch (PDOException $e) {

    sendError(
        "Failed to fetch subcategories",
        $e->getMessage(),
        500
    );
}

