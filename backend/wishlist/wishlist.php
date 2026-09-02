<?php

require_once "../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {

    $user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

    if ($user_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "status" => false,
            "message" => "User ID is required"
        ]);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT 
            w.id AS wishlist_id,
            w.user_id,
            w.course_id,
            w.created_at,
            c.title,
            c.slug,
            c.thumbnail,
            c.price,
            c.discount_price,
            c.level,
            c.language,
            c.average_rating,
            c.total_students,
            u.name AS teacher_name
        FROM wishlists w
        INNER JOIN courses c ON w.course_id = c.id
        INNER JOIN users u ON c.teacher_id = u.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC
    ");

    $stmt->execute([$user_id]);

    $wishlist = $stmt->fetchAll();

    echo json_encode([
        "status" => true,
        "message" => "Wishlist fetched successfully",
        "data" => $wishlist
    ]);
    exit();
}


if ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
    $course_id = isset($data['course_id']) ? (int)$data['course_id'] : 0;

    if ($user_id <= 0 || $course_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "status" => false,
            "message" => "User ID and Course ID are required"
        ]);
        exit();
    }

    $courseStmt = $pdo->prepare("SELECT id FROM courses WHERE id = ?");
    $courseStmt->execute([$course_id]);

    if (!$courseStmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            "status" => false,
            "message" => "Course not found"
        ]);
        exit();
    }

    $checkStmt = $pdo->prepare("
        SELECT id 
        FROM wishlists 
        WHERE user_id = ? AND course_id = ?
    ");

    $checkStmt->execute([$user_id, $course_id]);

    if ($checkStmt->fetch()) {
        echo json_encode([
            "status" => false,
            "message" => "Course already exists in wishlist"
        ]);
        exit();
    }

    $stmt = $pdo->prepare("
        INSERT INTO wishlists (user_id, course_id)
        VALUES (?, ?)
    ");

    $stmt->execute([$user_id, $course_id]);

    echo json_encode([
        "status" => true,
        "message" => "Course added to wishlist",
        "wishlist_id" => $pdo->lastInsertId()
    ]);
    exit();
}


if ($method === 'DELETE') {

    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
    $course_id = isset($data['course_id']) ? (int)$data['course_id'] : 0;

    if ($user_id <= 0 || $course_id <= 0) {
        http_response_code(400);
        echo json_encode([
            "status" => false,
            "message" => "User ID and Course ID are required"
        ]);
        exit();
    }

    $stmt = $pdo->prepare("
        DELETE FROM wishlists
        WHERE user_id = ? AND course_id = ?
    ");

    $stmt->execute([$user_id, $course_id]);

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            "status" => false,
            "message" => "Course not found in wishlist"
        ]);
        exit();
    }

    echo json_encode([
        "status" => true,
        "message" => "Course removed from wishlist"
    ]);
    exit();
}


http_response_code(405);

echo json_encode([
    "status" => false,
    "message" => "Method not allowed"
]);