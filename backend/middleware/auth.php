<?php
/**
 * Authentication Middleware
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/token.php';

function getAuthorizationHeader() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER['Authorization']);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function getBearerToken() {
    $headers = getAuthorizationHeader();
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
        return $matches[1];
    }
    return null;
}

/**
 * Authenticate user and optionally check roles
 * @param PDO $pdo
 * @param array $allowedRoles e.g. ['admin', 'teacher']
 * @return array user data
 */
function authenticate($pdo, $allowedRoles = []) {
    $token = getBearerToken();

    if (!$token) {
        sendError("Unauthorized. Token missing.", null, 401);
    }

    $user = validateToken($pdo, $token);

    if (!$user) {
        sendError("Unauthorized. Invalid or expired token.", null, 401);
    }

    if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles)) {
        sendError("Forbidden. You do not have permission.", null, 403);
    }

    return $user;
}
