<?php
$pdo = new PDO('mysql:host=localhost;dbname=szenen;charset=utf8', 'root', '');

// JSON-Daten auslesen
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data["szenenName"])) {
    $stmt = $pdo->prepare("DELETE FROM szenen_data WHERE name = ?");
    $stmt->execute([$data["szenenName"]]);
    echo json_encode(["status" => "deleted"]);
} else {
    echo json_encode(["status" => "error", "message" => "Name fehlt"]);
}
?>