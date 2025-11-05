<?php
header('Content-Type: application/json');
require 'connection.php';

// Handle GET request to retrieve settings
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $conn->query("SELECT * FROM settings WHERE id = 1");
    if ($result === false) {
        http_response_code(500);
        echo json_encode(["error" => "Database query failed: " . $conn->error]);
        exit;
    }

    $settings = $result->fetch_assoc();
    if (!$settings) {
        // If no settings exist, return default values
        $settings = [
            'profile_name' => 'Admin User',
            'profile_email' => 'admin@fancyworks.com',
            'site_title' => 'Fancy Footwork',
            'site_theme' => 'light',
            'site_currency' => 'PHP',
            'notify_low_stock' => 1,
            'notify_new_orders' => 1,
            'notify_sales' => 0,
            'enable_2fa' => 0
        ];
    }
    echo json_encode($settings);
    exit;
}

// Handle POST request to update settings
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON data"]);
        exit;
    }

    // Prepare the update query
    $fields = [];
    $values = [];
    $types = '';

    $allowedFields = [
        'profile_name' => 's',
        'profile_email' => 's',
        'profile_password' => 's',
        'site_title' => 's',
        'site_theme' => 's',
        'site_currency' => 's',
        'notify_low_stock' => 'i',
        'notify_new_orders' => 'i',
        'notify_sales' => 'i',
        'enable_2fa' => 'i'
    ];

    foreach ($allowedFields as $field => $type) {
        if (isset($data[$field])) {
            $fields[] = "$field = ?";
            $values[] = $data[$field];
            $types .= $type;
        }
    }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(["error" => "No valid fields to update"]);
        exit;
    }

    $query = "UPDATE settings SET " . implode(', ', $fields) . " WHERE id = 1";

    $stmt = $conn->prepare($query);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param($types, ...$values);

    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        exit;
    }

    echo json_encode(["message" => "Settings updated successfully"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
?>
