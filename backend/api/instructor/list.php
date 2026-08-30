<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            name,
            email,
            qualification,
            experience,
            expertise,
            reason,
            bio,
            status,
            created_at
        FROM instructor_applications
        ORDER BY id DESC
    ");

    $stmt->execute();

    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(
        true,
        "Instructor applications fetched successfully",
        [
            "applications" => $applications
        ],
        200
    );

} catch (PDOException $e) {

    sendError(
        "Unable to fetch instructor applications",
        $e->getMessage(),
        500
    );
}