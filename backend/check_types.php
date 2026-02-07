<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
$db = Database::getInstance()->getConnection();
$stmt = $db->query("DESCRIBE membership_types");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
