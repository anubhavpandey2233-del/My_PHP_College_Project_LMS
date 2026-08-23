<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
$user = authenticate($pdo, ['student']);
$stmt = $pdo->prepare("SELECT cert.*, c.title as course_title FROM certificates cert JOIN courses c ON cert.course_id = c.id WHERE cert.user_id = ? ORDER BY cert.issued_at DESC");
$stmt->execute([$user['id']]);
sendResponse(true, "Certificates", $stmt->fetchAll());
