
<?php

// ==========================================
// CORS
// ==========================================

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");


// ==========================================
// PREFLIGHT
// ==========================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ==========================================
// FILES
// ==========================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

$user = authenticate($pdo, ['admin']);


// ==========================================
// METHOD CHECK
// ==========================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    sendError(
        "Only POST method is allowed",
        null,
        405
    );

}


// ==========================================
// GET JSON DATA
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {

    sendError(
        "Invalid JSON data",
        null,
        400
    );

}


// ==========================================
// GET DATA
// ==========================================

$reviewId = (int)($data['id'] ?? 0);

$rating = (int)($data['rating'] ?? 0);

$reviewText = trim(
    $data['review_text'] ?? ''
);

$status = strtolower(
    trim($data['status'] ?? '')
);


// ==========================================
// VALIDATION
// ==========================================

if ($reviewId <= 0) {

    sendError(
        "Review id is required",
        null,
        422
    );

}


if ($rating < 1 || $rating > 5) {

    sendError(
        "Rating must be between 1 and 5",
        null,
        422
    );

}


$allowedStatuses = [
    'pending',
    'approved',
    'rejected'
];

if (!in_array($status, $allowedStatuses, true)) {

    sendError(
        "Invalid review status",
        null,
        422
    );

}


// ==========================================
// CHECK REVIEW
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        id
    FROM reviews
    WHERE id = ?
    LIMIT 1
");

$stmt->execute([
    $reviewId
]);

$review = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$review) {

    sendError(
        "Review not found",
        null,
        404
    );

}


// ==========================================
// UPDATE REVIEW
// ==========================================

$stmt = $pdo->prepare("
    UPDATE reviews
    SET
        rating = ?,
        review_text = ?,
        status = ?
    WHERE id = ?
");

$stmt->execute([
    $rating,
    $reviewText !== ''
        ? $reviewText
        : null,
    $status,
    $reviewId
]);


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Review updated successfully",
    [
        "review_id" => $reviewId
    ]
);

