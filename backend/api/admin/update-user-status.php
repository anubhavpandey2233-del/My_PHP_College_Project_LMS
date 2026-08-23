
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

$userId = (int)($data['user_id'] ?? 0);
$name   = trim($data['name'] ?? '');
$email  = trim($data['email'] ?? '');
$role   = trim($data['role'] ?? '');
$status = trim($data['status'] ?? '');


// ===============================
// Validation
// ===============================
$errors = [];

if (!$userId) {
    $errors['user_id'] = "User ID is required";
}

if ($name === '' || strlen($name) < 3) {
    $errors['name'] = "Name must be at least 3 characters";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = "Valid email is required";
}

if (!in_array($role, ['admin', 'teacher', 'student'])) {
    $errors['role'] = "Invalid role";
}

if (!in_array($status, ['active', 'inactive', 'banned'])) {
    $errors['status'] = "Invalid status";
}

if (!empty($errors)) {
    sendError("Validation failed", $errors, 422);
}


// ===============================
// Don't allow admin to modify itself
// ===============================
if ($userId === (int)$user['id']) {

    // Admin cannot change its own role/status
    $role = 'admin';
    $status = 'active';
}


// ===============================
// Check User Exists
// ===============================
$stmt = $pdo->prepare("
    SELECT id, name, email, role_id, status
    FROM users
    WHERE id = ?
");

$stmt->execute([$userId]);

$targetUser = $stmt->fetch();

if (!$targetUser) {
    sendError("User not found", null, 404);
}


// ===============================
// Role ID
// ===============================
$roleIds = [
    'admin'   => 1,
    'teacher' => 2,
    'student' => 3
];

$roleId = $roleIds[$role];


// ===============================
// Check Duplicate Email
// ===============================
$stmt = $pdo->prepare("
    SELECT id
    FROM users
    WHERE email = ?
    AND id != ?
");

$stmt->execute([
    $email,
    $userId
]);

if ($stmt->fetch()) {
    sendError(
        "Email already registered by another user",
        null,
        409
    );
}


// ===============================
// Update User
// ===============================
try {

    $stmt = $pdo->prepare("
        UPDATE users
        SET
            name = ?,
            email = ?,
            role_id = ?,
            status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $name,
        $email,
        $roleId,
        $status,
        $userId
    ]);


    // ===============================
    // Success Response
    // ===============================
    sendResponse(true, "User updated successfully", [
        "user_id" => $userId,
        "name"    => $name,
        "email"   => $email,
        "role"    => $role,
        "status"  => $status
    ]);


} catch (Exception $e) {

    sendError(
        "Failed to update user",
        $e->getMessage(),
        500
    );
}

