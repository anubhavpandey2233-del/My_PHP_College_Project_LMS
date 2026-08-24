
<?php

// =====================================
// CORS
// =====================================

require_once __DIR__ . '/../../config/cors.php';


// =====================================
// Required Files
// =====================================

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/token.php';


// =====================================
// Get JSON Data
// =====================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email = trim(
    $data['email'] ?? ''
);

$password =
    $data['password'] ?? '';


// =====================================
// Validation
// =====================================

if (
    empty($email) ||
    empty($password)
) {

    sendError(
        "Email and password are required",
        null,
        422
    );
}


// =====================================
// Find User
// =====================================

$stmt = $pdo->prepare("
    SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.status,
        r.name AS role
    FROM users u
    JOIN roles r
        ON u.role_id = r.id
    WHERE u.email = ?
    LIMIT 1
");

$stmt->execute([
    $email
]);

$user =
    $stmt->fetch();


// =====================================
// Check Credentials
// =====================================

if (
    !$user ||
    !password_verify(
        $password,
        $user['password']
    )
) {

    sendError(
        "Invalid email or password",
        null,
        401
    );
}


// =====================================
// Check Account Status
// =====================================

if (
    $user['status'] !== 'active'
) {

    sendError(
        "Your account is inactive or banned",
        null,
        403
    );
}


// =====================================
// Create Token
// =====================================

$token = createUserToken(
    $pdo,
    $user['id']
);


// =====================================
// Response
// =====================================

sendResponse(
    true,
    "Login successful",
    [
        "token" => $token,

        "user" => [
            "id" => $user['id'],
            "name" => $user['name'],
            "email" => $user['email'],
            "role" => $user['role']
        ]
    ]
);

