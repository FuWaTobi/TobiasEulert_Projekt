<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$pdo = new PDO('mysql:host=localhost;dbname=szenen;charset=utf8', 'root', '');

// JSON aus dem Body lesen
$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $stmt = $pdo->prepare("INSERT INTO szenen_data (name, info, objekte) VALUES (?, ?, ?)");
    $stmt->execute([$data["szenenName"], $data["szenenInfo"], json_encode($data["Objekte"])]);
    echo json_encode(["status" => "ok"]);
} else {
    echo json_encode(["status" => "error"]);
}
?>