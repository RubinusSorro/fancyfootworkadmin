<?php
header('Content-Type: application/json');
require 'connection.php';

$result = $conn->query("SELECT * FROM orders ORDER BY id DESC");
if ($result === false) {
	http_response_code(500);
	echo json_encode(["error" => "Database query failed: " . $conn->error]);
	exit;
}

$orders = $result->fetch_all(MYSQLI_ASSOC);

echo json_encode($orders);
?>
