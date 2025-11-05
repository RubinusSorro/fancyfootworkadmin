<?php
require 'connection.php';

$id = $_POST['id'];
$name = $_POST['name'];
$description = $_POST['description'];
$price = $_POST['price'];
$stock = $_POST['stock'];
$image = $_POST['image'] ?? '';

$stmt = $conn->prepare("INSERT INTO products (id, name, description, price, stock, image) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdis", $id, $name, $description, $price, $stock, $image);

if($stmt->execute()){
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}
?>
