
<?php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo, ['admin']);

$data = json_decode(file_get_contents("php://input"), true);

$userId = (int)($data['user_id'] ?? 0);
$status = trim($data['status'] ?? '');

if (!$userId) {
    sendError("User ID is required", null, 422);
}

if (!in_array($status, ['active', 'inactive', 'banned'])) {
    sendError("Invalid status", null, 422);
}

if ($userId === (int)$user['id']) {
    sendError("You cannot change your own account status", null, 403);
}

$stmt = $pdo->prepare("
    SELECT id, name, role_id
    FROM users
    WHERE id = ?
");

$stmt->execute([$userId]);

$targetUser = $stmt->fetch();

if (!$targetUser) {
    sendError("User not found", null, 404);
}

try {

    $stmt = $pdo->prepare("
        UPDATE users
        SET status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $status,
        $userId
    ]);

    sendResponse(true, "User status updated successfully", [
        "user_id" => $userId,
        "name" => $targetUser['name'],
        "status" => $status
    ]);

} catch (Exception $e) {

    sendError(
        "Failed to update user status",
        $e->getMessage(),
        500
    );
}

