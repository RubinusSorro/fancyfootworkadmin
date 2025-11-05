<?php
header('Content-Type: application/json');
require 'connection.php';

$id = $_POST['id'] ?? '';
$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? '';
$stock = $_POST['stock'] ?? '';

if(!$id || !$name || !$description || !$price || !$stock){
    http_response_code(400);
    echo json_encode(["error"=>"All fields are required"]);
    exit;
}

// Get existing product
$result = $conn->query("SELECT * FROM products WHERE id='$id'");
$product = $result->fetch_assoc();
if(!$product){
    http_response_code(404);
    echo json_encode(["error"=>"Product not found"]);
    exit;
}

$imagePath = $product['image'];
if(isset($_FILES['image']) && $_FILES['image']['error'] === 0){
    $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $imagePath = 'uploads/' . uniqid() . '.' . $ext;
    move_uploaded_file($_FILES['image']['tmp_name'], '../' . $imagePath);
}

$stmt = $conn->prepare("UPDATE products SET name=?, description=?, price=?, stock=?, image=? WHERE id=?");
$stmt->bind_param("ssdiss", $name, $description, $price, $stock, $imagePath, $id);
$stmt->execute();

echo json_encode(["success"=>true]);
?>
