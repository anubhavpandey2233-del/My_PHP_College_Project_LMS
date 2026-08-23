<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user  = authenticate($pdo);
$token = getBearerToken();

$stmt = $pdo->prepare("DELETE FROM user_tokens WHERE token = ?");
$stmt->execute([$token]);

sendResponse(true, "Logged out successfully");
