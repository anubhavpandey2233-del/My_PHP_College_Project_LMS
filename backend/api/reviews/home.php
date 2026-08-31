<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError(
        "Only GET method is allowed",
        null,
        405
    );
}

try {

    $stmt = $pdo->prepare("
        SELECT
            rv.id,
            rv.user_id,
            rv.course_id,
            u.name AS student_name,
            u.avatar AS student_avatar,
            c.title AS course_title,
            rv.rating,
            rv.review_text,
            rv.created_at
        FROM reviews rv
        INNER JOIN users u
            ON rv.user_id = u.id
        INNER JOIN courses c
            ON rv.course_id = c.id
        WHERE rv.status = 'approved'
        ORDER BY rv.id DESC
    ");

    $stmt->execute();

    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(
        true,
        "Approved reviews fetched successfully",
        $reviews,
        200
    );

} catch (PDOException $e) {

    sendError(
        "Unable to fetch reviews",
        $e->getMessage(),
        500
    );
}