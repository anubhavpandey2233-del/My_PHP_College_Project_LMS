<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo);

sendResponse(true, "User fetched successfully", [
    "user" => [
        "id"            => $user['id'],
        "name"          => $user['name'],
        "email"         => $user['email'],
        "role"          => $user['role'],
        "phone"         => $user['phone'],
        "avatar"        => $user['avatar'],
        "bio"           => $user['bio'],
        "status"        => $user['status'],
        "created_at"    => $user['created_at']
    ]
]);