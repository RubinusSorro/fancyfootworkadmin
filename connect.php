<?php
$host = ""; // 🔹     (SQL hostname natin nasa  InfinityFree Control Panel makikita)
$user = "if0_40199044";            
$pass = "Dr3XemehT42UX";           
$db   = ""; // 🔹  InfinityFree database name (Nasa "MySQL Databases")


$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// echo "Connected successfully";
?>