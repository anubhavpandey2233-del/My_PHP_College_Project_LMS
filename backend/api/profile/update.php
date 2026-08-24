
<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = authenticate($pdo);


// =====================================
// Get Form Data
// =====================================

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$phone = trim($_POST['phone'] ?? '');
$bio = trim($_POST['bio'] ?? '');


// =====================================
// Validation
// =====================================

if ($name === '') {
    sendError("Name is required", null, 422);
}

if ($email === '') {
    sendError("Email is required", null, 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError("Invalid email address", null, 422);
}


// =====================================
// Check Duplicate Email
// =====================================

try {

    $stmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        AND id != ?
        LIMIT 1
    ");

    $stmt->execute([
        $email,
        $user['id']
    ]);

    if ($stmt->fetch()) {
        sendError(
            "Email already exists",
            null,
            409
        );
    }


    // =====================================
    // Existing Avatar
    // =====================================

    $stmt = $pdo->prepare("
        SELECT avatar
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $user['id']
    ]);

    $existingUser = $stmt->fetch(
        PDO::FETCH_ASSOC
    );

    $avatar = $existingUser['avatar'] ?? null;


    // =====================================
    // Avatar Upload
    // =====================================

    if (
        isset($_FILES['avatar']) &&
        $_FILES['avatar']['error'] === UPLOAD_ERR_OK
    ) {

        $file = $_FILES['avatar'];


        // Maximum size: 2MB
        if ($file['size'] > 2 * 1024 * 1024) {

            sendError(
                "Image size must be less than 2MB",
                null,
                422
            );
        }


        // Allowed MIME types
        $allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];


        $fileType = mime_content_type(
            $file['tmp_name']
        );


        if (!in_array(
            $fileType,
            $allowedTypes,
            true
        )) {

            sendError(
                "Only JPG, PNG and WEBP images are allowed",
                null,
                422
            );
        }


        // =====================================
        // Upload Directory
        // =====================================

        $uploadDir =
            __DIR__ .
            '/../../uploads/avatars/';


        if (!is_dir($uploadDir)) {

            mkdir(
                $uploadDir,
                0777,
                true
            );
        }


        // =====================================
        // Generate Unique File Name
        // =====================================

        $extension =
            strtolower(
                pathinfo(
                    $file['name'],
                    PATHINFO_EXTENSION
                )
            );


        $fileName =
            'avatar_' .
            $user['id'] .
            '_' .
            time() .
            '.' .
            $extension;


        $destination =
            $uploadDir .
            $fileName;


        // =====================================
        // Move Uploaded File
        // =====================================

        if (!move_uploaded_file(
            $file['tmp_name'],
            $destination
        )) {

            sendError(
                "Failed to upload avatar",
                null,
                500
            );
        }


        // =====================================
        // Delete Old Avatar
        // =====================================

        if (
            !empty($avatar) &&
            file_exists(
                $uploadDir . $avatar
            )
        ) {

            unlink(
                $uploadDir . $avatar
            );
        }


        $avatar = $fileName;
    }


    // =====================================
    // Update User
    // =====================================

    $stmt = $pdo->prepare("
        UPDATE users
        SET
            name = ?,
            email = ?,
            phone = ?,
            avatar = ?,
            bio = ?
        WHERE id = ?
    ");


    $stmt->execute([
        $name,
        $email,
        $phone !== ''
            ? $phone
            : null,

        $avatar,

        $bio !== ''
            ? $bio
            : null,

        $user['id']
    ]);


    // =====================================
    // Fetch Updated User
    // =====================================

    $stmt = $pdo->prepare("
        SELECT
            id,
            name,
            email,
            role_id,
            phone,
            avatar,
            bio,
            status,
            created_at
        FROM users
        WHERE id = ?
        LIMIT 1
    ");


    $stmt->execute([
        $user['id']
    ]);


    $updatedUser =
        $stmt->fetch(
            PDO::FETCH_ASSOC
        );


    // =====================================
    // Response
    // =====================================

    sendResponse(
        true,
        "Profile updated successfully",
        [
            "user" => $updatedUser
        ]
    );


} catch (PDOException $e) {

    sendError(
        "Failed to update profile",
        $e->getMessage(),
        500
    );
}

