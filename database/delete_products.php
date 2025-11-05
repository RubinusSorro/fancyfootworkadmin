<?php
header('Content-Type: application/json');
require 'connection.php';

$id = $_GET['id'] ?? '';
if(!$id){
    http_response_code(400);
    echo json_encode(["error"=>"Product ID required"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM products WHERE id=?");
$stmt->bind_param("s", $id);
$stmt->execute();

echo json_encode(["success"=>true]);
?>
