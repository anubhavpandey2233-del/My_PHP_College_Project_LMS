<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$data = json_decode(
    file_get_contents("php://input"),
    true
);

if (!is_array($data)) {
    sendError(
        "Invalid JSON data",
        null,
        400
    );
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$qualification = trim($data['qualification'] ?? '');
$experience = trim($data['experience'] ?? '');
$expertise = trim($data['expertise'] ?? '');
$reason = trim($data['reason'] ?? '');
$bio = trim($data['bio'] ?? '');

if (
    empty($name) ||
    empty($email) ||
    empty($qualification) ||
    empty($experience) ||
    empty($expertise) ||
    empty($reason)
) {
    sendError(
        "Please fill all required fields",
        null,
        422
    );
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError(
        "Please enter a valid email address",
        null,
        422
    );
}

/*
 * Check existing application
 */
$stmt = $pdo->prepare("
    SELECT id, status
    FROM instructor_applications
    WHERE email = ?
    ORDER BY id DESC
    LIMIT 1
");

$stmt->execute([$email]);

$existingApplication = $stmt->fetch(PDO::FETCH_ASSOC);

if ($existingApplication) {

    if ($existingApplication['status'] === 'pending') {
        sendError(
            "Your instructor application is already pending",
            null,
            409
        );
    }

    if ($existingApplication['status'] === 'approved') {
        sendError(
            "Your instructor application has already been approved",
            null,
            409
        );
    }
}

/*
 * Create instructor application
 */
$stmt = $pdo->prepare("
    INSERT INTO instructor_applications
    (
        user_id,
        name,
        email,
        qualification,
        experience,
        expertise,
        reason,
        bio,
        status
    )
    VALUES
    (
        NULL,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'pending'
    )
");

$stmt->execute([
    $name,
    $email,
    $qualification,
    $experience,
    $expertise,
    $reason,
    $bio
]);

$applicationId = $pdo->lastInsertId();

/*
 * Get all active admins
 */
$stmt = $pdo->prepare("
    SELECT u.id
    FROM users u
    INNER JOIN roles r
        ON u.role_id = r.id
    WHERE r.name = 'admin'
    AND u.status = 'active'
");

$stmt->execute();

$admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

/*
 * Create notification for admins
 */
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
        ?,
        0,
        ?
    )
");

foreach ($admins as $admin) {

    $notificationStmt->execute([
        $admin['id'],
        'New Instructor Application',
        $name . ' has submitted an application to become an instructor.',
        'instructor_application',
        '/admin/instructor-applications'
    ]);
}

sendResponse(
    true,
    "Instructor application submitted successfully",
    [
        "application_id" => (int) $applicationId,
        "status" => "pending"
    ],
    201
);