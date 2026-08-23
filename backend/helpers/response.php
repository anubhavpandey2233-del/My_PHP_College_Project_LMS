<?php
/**
 * Standardized JSON Response Helpers
 */

function sendResponse($status, $message, $data = null, $code = 200) {
    http_response_code($code);
    $response = [
        "status"  => $status,
        "message" => $message
    ];
    if ($data !== null) {
        $response["data"] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

function sendError($message, $errors = null, $code = 400) {
    http_response_code($code);
    $response = [
        "status"  => false,
        "message" => $message
    ];
    if ($errors !== null) {
        $response["errors"] = $errors;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}
