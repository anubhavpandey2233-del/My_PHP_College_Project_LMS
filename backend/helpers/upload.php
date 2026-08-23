<?php
/**
 * File Upload Helper
 */

function uploadCourseThumbnail($file) {
    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    $maxSize = 2 * 1024 * 1024; // 2MB

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Upload error'];
    }
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'message' => 'File too large (max 2MB)'];
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        return ['success' => false, 'message' => 'Only jpg, jpeg, png, webp allowed'];
    }

    $filename    = uniqid('course_', true) . '.' . $ext;
    $destination = __DIR__ . '/../uploads/courses/' . $filename;

    if (!is_dir(dirname($destination))) {
        mkdir(dirname($destination), 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return ['success' => true, 'filename' => $filename];
    }
    return ['success' => false, 'message' => 'Failed to move file'];
}

function uploadResource($file) {
    $allowed = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'zip', 'jpg', 'jpeg', 'png'];
    $maxSize = 10 * 1024 * 1024; // 10MB

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Upload error'];
    }
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'message' => 'File too large (max 10MB)'];
    }

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        return ['success' => false, 'message' => 'Invalid file type'];
    }

    $filename    = uniqid('res_', true) . '.' . $ext;
    $destination = __DIR__ . '/../uploads/resources/' . $filename;

    if (!is_dir(dirname($destination))) {
        mkdir(dirname($destination), 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return ['success' => true, 'filename' => $filename, 'size' => $file['size'], 'type' => $ext];
    }
    return ['success' => false, 'message' => 'Failed to move file'];
}
