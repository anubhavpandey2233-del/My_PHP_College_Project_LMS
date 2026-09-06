
<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    sendError("Invalid JSON data", null, 400);
}

$applicationId = (int) ($data['application_id'] ?? 0);
$status = trim($data['status'] ?? '');

if ($applicationId <= 0) {
    sendError("Invalid application ID", null, 422);
}

if (!in_array($status, ['approved', 'rejected'], true)) {
    sendError("Invalid application status", null, 422);
}

try {
    $stmt = $pdo->prepare("
        SELECT id, user_id, name, email, status
        FROM instructor_applications
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$applicationId]);

    $application = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$application) {
        sendError("Instructor application not found", null, 404);
    }

    if ($application['status'] === $status) {
        sendError(
            $status === 'approved'
                ? "Application is already approved"
                : "Application is already rejected",
            null,
            409
        );
    }

    $userId = !empty($application['user_id'])
        ? (int) $application['user_id']
        : null;

    if ($status === 'approved') {

        if (!$userId) {
            $stmt = $pdo->prepare("
                SELECT id
                FROM users
                WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
                LIMIT 1
            ");
            $stmt->execute([$application['email']]);

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $userId = (int) $user['id'];

                $stmt = $pdo->prepare("
                    UPDATE instructor_applications
                    SET user_id = ?
                    WHERE id = ?
                ");
                $stmt->execute([$userId, $applicationId]);
            }
        }

        if ($userId) {
            $stmt = $pdo->prepare("
                UPDATE users
                SET role_id = 2
                WHERE id = ?
            ");
            $stmt->execute([$userId]);
        }
    }

    $stmt = $pdo->prepare("
        UPDATE instructor_applications
        SET status = ?
        WHERE id = ?
    ");
    $stmt->execute([$status, $applicationId]);

    sendResponse(
        true,
        $status === 'approved'
            ? "Instructor application approved successfully"
            : "Instructor application rejected successfully",
        [
            "application_id" => $applicationId,
            "status" => $status,
            "user_id" => $userId
        ],
        200
    );

} catch (PDOException $e) {
    sendError(
        "Unable to update instructor application",
        $e->getMessage(),
        500
    );
}

