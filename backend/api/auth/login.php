
<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/token.php';


// ==========================================
// GET REQUEST DATA
// ==========================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';


// ==========================================
// VALIDATION
// ==========================================

if (empty($email) || empty($password)) {

    sendError(
        "Email and password are required",
        null,
        422
    );
}


// ==========================================
// GET USER
// ==========================================

$stmt = $pdo->prepare("
    SELECT
        u.id,
        u.name,
        u.email,
        u.password,
        u.phone,
        u.bio,
        u.avatar,
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

$user = $stmt->fetch(PDO::FETCH_ASSOC);


// ==========================================
// CHECK LOGIN
// ==========================================

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


// ==========================================
// CHECK USER STATUS
// ==========================================

if ($user['status'] !== 'active') {

    sendError(
        "Your account is inactive or banned",
        null,
        403
    );
}


// ==========================================
// CREATE TOKEN
// ==========================================

$token = createUserToken(
    $pdo,
    $user['id']
);


// ==========================================
// USER DATA
// ==========================================

$loggedInUser = [

    "id" => $user['id'],

    "name" => $user['name'],

    "email" => $user['email'],

    "phone" => $user['phone'] ?? '',

    "bio" => $user['bio'] ?? '',

    "avatar" => $user['avatar'] ?? '',

    "role" => $user['role']

];


// ==========================================
// RESPONSE
// ==========================================

sendResponse(
    true,
    "Login successful",
    [

        "token" => $token,

        "user" => $loggedInUser

    ]
);

