<?php
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/config/config.php';

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query('SELECT * FROM membership_types');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
