<?php
include 'connect.php';

if ($conn->connect_error) {
    echo "Connection failed: " . $conn->connect_error;
} else {
    echo "Connected successfully to the database.";
}

$conn->close();
?>
