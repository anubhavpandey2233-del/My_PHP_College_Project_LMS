
<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Only POST method is allowed", null, 405);
}

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    sendError("Invalid JSON data", null, 400);
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$subject = trim($data['subject'] ?? '');
$message = trim($data['message'] ?? '');

if ($name === '') {
    sendError("Name is required", null, 422);
}

if (
    $email === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    sendError("Valid email is required", null, 422);
}

if ($subject === '') {
    sendError("Subject is required", null, 422);
}

if ($message === '') {
    sendError("Message is required", null, 422);
}

try {

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO contact_messages
        (
            name,
            email,
            subject,
            message,
            status
        )
        VALUES (?, ?, ?, ?, 'new')
    ");

    $stmt->execute([
        $name,
        $email,
        $subject,
        $message
    ]);

    $contactMessageId =
        (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare("
        SELECT
            u.id
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        WHERE r.name = 'admin'
        AND u.status = 'active'
    ");

    $stmt->execute();

    $admins =
        $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($admins as $admin) {

        $notificationTitle =
            "New Contact Message";

        $notificationMessage =
            $name .
            " sent a new contact message: \"" .
            $subject .
            "\".";

        $notificationLink =
            "/admin/contact-messages";

        $notificationStmt = $pdo->prepare("
            INSERT INTO notifications
            (
                user_id,
                title,
                message,
                type,
                is_read,
                link
            )
            VALUES
            (
                ?,
                ?,
                ?,
                'contact',
                0,
                ?
            )
        ");

        $notificationStmt->execute([
            $admin['id'],
            $notificationTitle,
            $notificationMessage,
            $notificationLink
        ]);
    }

    $pdo->commit();

    sendResponse(
        true,
        "Your message has been submitted successfully",
        [
            "contact_message_id" =>
                $contactMessageId
        ],
        201
    );

} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        "Contact Submit Error: " .
        $e->getMessage()
    );

    sendError(
        "Failed to submit your message",
        null,
        500
    );
}
