<?php
require 'connection.php';

$sql = "CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profile_name VARCHAR(255) DEFAULT 'Admin User',
    profile_email VARCHAR(255) DEFAULT 'admin@fancyworks.com',
    profile_password VARCHAR(255),
    site_title VARCHAR(255) DEFAULT 'Fancy Footwork',
    site_logo VARCHAR(255),
    site_theme VARCHAR(50) DEFAULT 'light',
    site_currency VARCHAR(10) DEFAULT 'PHP',
    notify_low_stock TINYINT(1) DEFAULT 1,
    notify_new_orders TINYINT(1) DEFAULT 1,
    notify_sales TINYINT(1) DEFAULT 0,
    enable_2fa TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Settings table created successfully.";

    // Insert default settings if table is empty
    $check = $conn->query("SELECT COUNT(*) as count FROM settings");
    $row = $check->fetch_assoc();
    if ($row['count'] == 0) {
        $insert = "INSERT INTO settings (id) VALUES (1)";
        if ($conn->query($insert) === TRUE) {
            echo " Default settings inserted.";
        } else {
            echo " Error inserting default settings: " . $conn->error;
        }
    }
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
