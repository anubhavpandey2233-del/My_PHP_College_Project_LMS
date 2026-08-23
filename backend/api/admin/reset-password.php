
<?php

// ===============================
// CORS
// ===============================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ===============================
// Required Files
// ===============================
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ===============================
// Admin Authentication
// ===============================
$user = authenticate($pdo, ['admin']);


// ===============================
// Get Request Data
// ===============================
$data = json_decode(file_get_contents("php://input"), true);

$userId = (int)($data['id'] ?? 0);

if (!$userId) {
    sendError("User ID is required", null, 422);
}


// ===============================
// Don't allow admin password reset
// ===============================
if ($userId === (int)$user['id']) {
    sendError(
        "You cannot reset your own password from here",
        null,
        403
    );
}


// ===============================
// Check User Exists
// ===============================
$stmt = $pdo->prepare("
    SELECT id, name, role_id
    FROM users
    WHERE id = ?
");

$stmt->execute([$userId]);

$targetUser = $stmt->fetch();

if (!$targetUser) {
    sendError("User not found", null, 404);
}


// ===============================
// Generate Temporary Password
// ===============================
$temporaryPassword = 'Lms@' . rand(1000, 9999);


// ===============================
// Hash Password
// ===============================
$hashedPassword = password_hash(
    $temporaryPassword,
    PASSWORD_DEFAULT
);


// ===============================
// Update Password
// ===============================
try {

    $stmt = $pdo->prepare("
        UPDATE users
        SET password = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $hashedPassword,
        $userId
    ]);


    // ===============================
    // Success Response
    // ===============================
    sendResponse(true, "Password reset successfully", [
        "user_id" => $userId,
        "name" => $targetUser['name'],
        "temporary_password" => $temporaryPassword
    ]);


} catch (Exception $e) {

    sendError(
        "Failed to reset password",
        $e->getMessage(),
        500
    );
}

