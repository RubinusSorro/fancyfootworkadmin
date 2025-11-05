<?php
include 'connect.php';

// Ensure upload folder exists
$targetDir = "../uploads/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// Sanitize input
$name = $conn->real_escape_string($_POST['name']);
$price = $conn->real_escape_string($_POST['price']);
$category = $conn->real_escape_string($_POST['category']);
$description = $conn->real_escape_string($_POST['description']);
$stock = (int) $_POST['stock'];

// Handle image upload
$imageName = '';
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $imageName = time() . "_" . basename($_FILES['image']['name']);
    $targetFile = $targetDir . $imageName;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
        echo "Error uploading image.";
        exit;
    }
} else {
    echo "Image file is required.";
    exit;
}

// Insert into database
$sql = "INSERT INTO products (name, description, price, stock, category, image)
        VALUES ('$name', '$description', '$price', '$stock', '$category', '$imageName')";

if ($conn->query($sql)) {
    echo "✅ Product added successfully!";
} else {
    echo "❌ Error: " . $conn->error;
}

$conn->close();
?>
