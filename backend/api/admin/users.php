<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin']);

$stmt = $pdo->prepare("
    SELECT 
        u.id,
        u.name,
        u.email,       
        u.status,
        u.created_at,
        u.updated_at,
        r.id AS role_id,
        r.name AS role
    FROM users u
    INNER JOIN roles r ON u.role_id = r.id
    ORDER BY u.id DESC
");

$stmt->execute();

$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

sendResponse(true, "Users fetched successfully", $users);