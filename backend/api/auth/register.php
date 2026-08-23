<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$data = json_decode(file_get_contents("php://input"), true);

$name     = trim($data['name'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$role     = $data['role'] ?? 'student';

$errors = [];

if (empty($name) || strlen($name) < 3) {
    $errors['name'] = "Name must be at least 3 characters";
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = "Valid email is required";
}
if (empty($password) || strlen($password) < 6) {
    $errors['password'] = "Password must be at least 6 characters";
}
if (!in_array($role, ['student', 'teacher'])) {
    $errors['role'] = "Invalid role. Only student or teacher allowed for registration.";
}

if (!empty($errors)) {
    sendError("Validation failed", $errors, 422);
}

// Check email exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    sendError("Email already registered", null, 409);
}

$roleId = ($role === 'teacher') ? 2 : 3;
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO users (role_id, name, email, password) VALUES (?, ?, ?, ?)");
$stmt->execute([$roleId, $name, $email, $hashedPassword]);

$userId = $pdo->lastInsertId();

sendResponse(true, "Registration successful", [
    "user" => [
        "id"    => $userId,
        "name"  => $name,
        "email" => $email,
        "role"  => $role
    ]
], 201);
