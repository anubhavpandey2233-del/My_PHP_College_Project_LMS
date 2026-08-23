<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/token.php';

$data = json_decode(file_get_contents("php://input"), true);

$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    sendError("Email and password are required", null, 422);
}

$stmt = $pdo->prepare("
    SELECT u.id, u.name, u.email, u.password, u.status, r.name as role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = ?
");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    sendError("Invalid email or password", null, 401);
}

if ($user['status'] !== 'active') {
    sendError("Your account is inactive or banned", null, 403);
}

$token = createUserToken($pdo, $user['id']);

sendResponse(true, "Login successful", [
    "token" => $token,
    "user"  => [
        "id"    => $user['id'],
        "name"  => $user['name'],
        "email" => $user['email'],
        "role"  => $user['role']
    ]
]);
