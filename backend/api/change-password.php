
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
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';


// ===============================
// Authentication
// ===============================
$user = authenticate($pdo, ['admin', 'teacher', 'student']);


// ===============================
// Get Request Data
// ===============================
$data = json_decode(file_get_contents("php://input"), true);

$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';


// ===============================
// Validation
// ===============================
$errors = [];

if ($currentPassword === '') {
    $errors['current_password'] = 'Current password is required';
}

if ($newPassword === '') {
    $errors['new_password'] = 'New password is required';
} elseif (strlen($newPassword) < 6) {
    $errors['new_password'] = 'New password must be at least 6 characters';
}

if (!empty($errors)) {
    sendError('Validation failed', $errors, 422);
}


// ===============================
// Get User Password
// ===============================
$stmt = $pdo->prepare("
    SELECT id, password
    FROM users
    WHERE id = ?
");

$stmt->execute([$user['id']]);

$dbUser = $stmt->fetch();

if (!$dbUser) {
    sendError('User not found', null, 404);
}


// ===============================
// Verify Current Password
// ===============================
if (!password_verify($currentPassword, $dbUser['password'])) {
    sendError('Current password is incorrect', null, 401);
}


// ===============================
// Prevent Same Password
// ===============================
if (password_verify($newPassword, $dbUser['password'])) {
    sendError(
        'New password must be different from current password',
        null,
        422
    );
}


// ===============================
// Hash New Password
// ===============================
$hashedPassword = password_hash(
    $newPassword,
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
        $user['id']
    ]);

    sendResponse(
        true,
        'Password changed successfully',
        null
    );

} catch (Exception $e) {

    sendError(
        'Failed to change password',
        $e->getMessage(),
        500
    );
}

