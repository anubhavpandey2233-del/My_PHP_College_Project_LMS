
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


// =====================================
// Get JSON Data
// =====================================

$data = json_decode(
    file_get_contents("php://input"),
    true
);

$name = trim(
    $data['name'] ?? ''
);

$email = trim(
    $data['email'] ?? ''
);

$password = $data['password'] ?? '';

$role = strtolower(
    trim($data['role'] ?? 'student')
);


// =====================================
// Validation
// =====================================

$errors = [];

if (
    empty($name) ||
    strlen($name) < 3
) {
    $errors['name'] =
        "Name must be at least 3 characters";
}


if (
    empty($email) ||
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    $errors['email'] =
        "Valid email is required";
}


if (
    empty($password) ||
    strlen($password) < 6
) {
    $errors['password'] =
        "Password must be at least 6 characters";
}


if (
    !in_array(
        $role,
        ['admin', 'teacher', 'student'],
        true
    )
) {
    $errors['role'] =
        "Invalid role";
}


if (!empty($errors)) {

    sendError(
        "Validation failed",
        $errors,
        422
    );
}


// =====================================
// CHECK EMAIL EXISTS
// =====================================

$stmt = $pdo->prepare("
    SELECT id
    FROM users
    WHERE email = ?
    LIMIT 1
");

$stmt->execute([
    $email
]);

if ($stmt->fetch()) {

    sendError(
        "Email already registered",
        null,
        409
    );
}


// =====================================
// ADMIN CHECK
//
// Only ONE admin account is allowed.
// Logout does NOT delete the account.
// Therefore another admin cannot register
// until the existing admin is deleted
// from the database.
// =====================================

if ($role === 'admin') {

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE role_id = 1
        LIMIT 1
    ");

    $stmt->execute();

    $existingAdmin =
        $stmt->fetch();

    if ($existingAdmin) {

        sendError(
            "An admin account already exists. Another admin cannot be registered.",
            null,
            409
        );
    }
}


// =====================================
// ROLE ID
// =====================================

if ($role === 'admin') {

    $roleId = 1;

} elseif ($role === 'teacher') {

    $roleId = 2;

} else {

    $roleId = 3;
}


// =====================================
// HASH PASSWORD
// =====================================

$hashedPassword =
    password_hash(
        $password,
        PASSWORD_DEFAULT
    );


// =====================================
// CREATE USER
// =====================================

$stmt = $pdo->prepare("
    INSERT INTO users (
        role_id,
        name,
        email,
        password
    )
    VALUES (?, ?, ?, ?)
");

$stmt->execute([
    $roleId,
    $name,
    $email,
    $hashedPassword
]);


// =====================================
// USER ID
// =====================================

$userId =
    $pdo->lastInsertId();


// =====================================
// RESPONSE
// =====================================

sendResponse(
    true,
    "Registration successful",
    [
        "user" => [
            "id" => $userId,
            "name" => $name,
            "email" => $email,
            "role" => $role
        ]
    ],
    201
);

