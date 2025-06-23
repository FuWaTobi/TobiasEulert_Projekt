<?php
$pdo = new PDO('mysql:host=localhost;dbname=szenen;charset=utf8', 'root', '');
$stmt = $pdo->query("SELECT * FROM szenen_data");
$result = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($result);
?>