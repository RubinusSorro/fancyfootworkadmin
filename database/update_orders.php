<?php
header('Content-Type: application/json');
require 'connection.php';

$id = $_POST['id'] ?? '';
$status = $_POST['status'] ?? '';

if (!$id || $status === '') {
    http_response_code(400);
    echo json_encode(["error" => "ID and status required"]);
    exit;
}

$stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
if ($stmt === false) {
    http_response_code(500);
    echo json_encode(["error" => "Prepare failed: " . $conn->error]);
    exit;
}

// Bind types: status likely string, id likely integer
$bindId = is_numeric($id) ? (int)$id : $id;
$stmt->bind_param("si", $status, $bindId);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
    exit;
}

echo json_encode(["success" => true]);
?>
