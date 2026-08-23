
<?php

// ===============================
// CORS
// ===============================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// ===============================
// Required Files
// ===============================
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';


// ===============================
// Admin Authentication
// ===============================
$user = authenticate($pdo, ['admin']);


// ===============================
// Get Request Data
// ===============================
$data = json_decode(file_get_contents("php://input"), true);

$userId = (int)($data['user_id'] ?? 0);

if (!$userId) {
    sendError("User ID is required", null, 422);
}


// ===============================
// Don't allow admin to delete itself
// ===============================
if ($userId === (int)$user['id']) {
    sendError("You cannot delete your own account", null, 403);
}


// ===============================
// Check User Exists
// ===============================
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

    $pdo->beginTransaction();


    // ==========================================
    // Delete lesson progress of this user
    // ==========================================
    $stmt = $pdo->prepare("
        DELETE FROM lesson_progress
        WHERE user_id = ?
    ");

    $stmt->execute([$userId]);


    // ==========================================
    // Delete enrollments of this student
    // ==========================================
    $stmt = $pdo->prepare("
        DELETE FROM enrollments
        WHERE student_id = ?
    ");

    $stmt->execute([$userId]);


    // ==========================================
    // Delete reviews made by this user
    // ==========================================
    // reviews table uses user_id, NOT student_id
    $stmt = $pdo->prepare("
        DELETE FROM reviews
        WHERE user_id = ?
    ");

    $stmt->execute([$userId]);


    // ==========================================
    // If user is Teacher
    // role_id = 2
    // ==========================================
    if ((int)$targetUser['role_id'] === 2) {


        // ==========================================
        // Get all courses created by teacher
        // ==========================================
        $stmt = $pdo->prepare("
            SELECT id
            FROM courses
            WHERE teacher_id = ?
        ");

        $stmt->execute([$userId]);

        $courses = $stmt->fetchAll(PDO::FETCH_COLUMN);


        foreach ($courses as $courseId) {


            // ==========================================
            // Delete course enrollments
            // ==========================================
            $stmt = $pdo->prepare("
                DELETE FROM enrollments
                WHERE course_id = ?
            ");

            $stmt->execute([$courseId]);


            // ==========================================
            // Delete course reviews
            // ==========================================
            $stmt = $pdo->prepare("
                DELETE FROM reviews
                WHERE course_id = ?
            ");

            $stmt->execute([$courseId]);


            // ==========================================
            // Get chapters of course
            // ==========================================
            $stmt = $pdo->prepare("
                SELECT id
                FROM chapters
                WHERE course_id = ?
            ");

            $stmt->execute([$courseId]);

            $chapters = $stmt->fetchAll(PDO::FETCH_COLUMN);


            foreach ($chapters as $chapterId) {


                // ==========================================
                // Get lessons of chapter
                // ==========================================
                $stmt = $pdo->prepare("
                    SELECT id
                    FROM lessons
                    WHERE chapter_id = ?
                ");

                $stmt->execute([$chapterId]);

                $lessons = $stmt->fetchAll(PDO::FETCH_COLUMN);


                foreach ($lessons as $lessonId) {

                    // Delete lesson progress
                    $stmt = $pdo->prepare("
                        DELETE FROM lesson_progress
                        WHERE lesson_id = ?
                    ");

                    $stmt->execute([$lessonId]);
                }


                // ==========================================
                // Delete lessons
                // ==========================================
                $stmt = $pdo->prepare("
                    DELETE FROM lessons
                    WHERE chapter_id = ?
                ");

                $stmt->execute([$chapterId]);
            }


            // ==========================================
            // Delete chapters
            // ==========================================
            $stmt = $pdo->prepare("
                DELETE FROM chapters
                WHERE course_id = ?
            ");

            $stmt->execute([$courseId]);


            // ==========================================
            // Delete course
            // ==========================================
            $stmt = $pdo->prepare("
                DELETE FROM courses
                WHERE id = ?
            ");

            $stmt->execute([$courseId]);
        }
    }


    // ==========================================
    // Finally delete user
    // ==========================================
    $stmt = $pdo->prepare("
        DELETE FROM users
        WHERE id = ?
    ");

    $stmt->execute([$userId]);


    // ==========================================
    // Commit transaction
    // ==========================================
    $pdo->commit();


    // ==========================================
    // Success Response
    // ==========================================
    sendResponse(true, "User deleted successfully", [
        "deleted_user_id"   => $userId,
        "deleted_user_name" => $targetUser['name']
    ]);


} catch (Exception $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError(
        "Failed to delete user",
        $e->getMessage(),
        500
    );
}

