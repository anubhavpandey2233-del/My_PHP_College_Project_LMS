<?php

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';


// =====================================
// GET JSON DATA
// =====================================

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


// =====================================
// GET DATA
// =====================================

$applicationId = (int) (
    $data['application_id'] ?? 0
);

$status = trim(
    $data['status'] ?? ''
);


// =====================================
// VALIDATION
// =====================================

if ($applicationId <= 0) {

    sendError(
        "Invalid application ID",
        null,
        422
    );
}


if (!in_array(
    $status,
    ['approved', 'rejected'],
    true
)) {

    sendError(
        "Invalid application status",
        null,
        422
    );
}


// =====================================
// PROCESS
// =====================================

try {

    // =====================================
    // GET APPLICATION
    // =====================================

    $stmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            status
        FROM instructor_applications
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([
        $applicationId
    ]);

    $application = $stmt->fetch(
        PDO::FETCH_ASSOC
    );


    if (!$application) {

        sendError(
            "Instructor application not found",
            null,
            404
        );
    }


    // =====================================
    // CHECK CURRENT STATUS
    // =====================================

    if (
        $application['status'] === 'approved' &&
        $status === 'approved'
    ) {

        sendError(
            "Application is already approved",
            null,
            409
        );
    }


    // =====================================
    // APPROVE
    // =====================================

    if ($status === 'approved') {

        // Application must have a user
        if (
            empty($application['user_id'])
        ) {

            sendError(
                "This application is not linked to a registered user",
                null,
                422
            );
        }


        // =================================
        // CHECK USER EXISTS
        // =================================

        $stmt = $pdo->prepare("
            SELECT id, role_id
            FROM users
            WHERE id = ?
            LIMIT 1
        ");

        $stmt->execute([
            $application['user_id']
        ]);

        $user = $stmt->fetch(
            PDO::FETCH_ASSOC
        );


        if (!$user) {

            sendError(
                "User associated with this application was not found",
                null,
                404
            );
        }


        // =================================
        // CHANGE ROLE TO TEACHER
        // =================================

        $stmt = $pdo->prepare("
            UPDATE users
            SET role_id = 2
            WHERE id = ?
        ");

        $stmt->execute([
            $application['user_id']
        ]);
    }


    // =====================================
    // UPDATE APPLICATION STATUS
    // =====================================

    $stmt = $pdo->prepare("
        UPDATE instructor_applications
        SET status = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $status,
        $applicationId
    ]);


    // =====================================
    // RESPONSE
    // =====================================

    sendResponse(
        true,
        $status === 'approved'
            ? "Instructor application approved successfully"
            : "Instructor application rejected successfully",
        [
            "application_id" => $applicationId,
            "status" => $status,
            "user_id" => $application['user_id']
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