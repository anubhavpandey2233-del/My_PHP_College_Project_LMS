<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
$code = $_GET['code'] ?? '';
if (empty($code)) sendError("Certificate code required", null, 422);
$stmt = $pdo->prepare("SELECT cert.*, c.title as course_title, u.name as student_name, t.name as teacher_name FROM certificates cert JOIN courses c ON cert.course_id = c.id JOIN users u ON cert.user_id = u.id JOIN users t ON c.teacher_id = t.id WHERE cert.certificate_code = ? AND cert.status = 'issued'");
$stmt->execute([$code]);
$cert = $stmt->fetch();
if (!$cert) sendError("Invalid or revoked certificate", null, 404);
sendResponse(true, "Certificate verified", $cert);
