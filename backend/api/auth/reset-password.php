
<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$data = json_decode(file_get_contents("php://input"), true);

$token = trim($data['token'] ?? '');
$newPassword = $data['newPassword'] ?? '';
$confirmPassword = $data['confirmPassword'] ?? '';

if ($token === '' || $newPassword === '' || $confirmPassword === '') {
    sendError("All fields are required", null, 422);
}

if (strlen($newPassword) < 8) {
    sendError("Password must be at least 8 characters", null, 422);
}

if ($newPassword !== $confirmPassword) {
    sendError("Passwords do not match", null, 422);
}

$tokenHash = hash('sha256', $token);

$stmt = $pdo->prepare("
    SELECT id, user_id
    FROM password_resets
    WHERE token_hash = ? AND expires_at > NOW()
    LIMIT 1
");
$stmt->execute([$tokenHash]);
$reset = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$reset) {
    sendError("Invalid or expired reset token", null, 400);
}

$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $reset['user_id']]);

    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE id = ?");
    $stmt->execute([$reset['id']]);

    $pdo->commit();

    sendResponse(true, "Password updated successfully. Please login with your new password.");
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendError("Unable to reset password", null, 500);
}
