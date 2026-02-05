<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();
$newHash = password_hash('password123', PASSWORD_DEFAULT);

$stmt = $db->prepare("UPDATE members SET password_hash = ? WHERE email = ?");
$stmt->execute([$newHash, 'mettoalex@gmail.com']);

echo "Password for mettoalex@gmail.com reset to 'password123'\n";
echo "New hash: $newHash\n";
