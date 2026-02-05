<?php
require_once __DIR__ . '/../../config/Database.php';
require_once __DIR__ . '/../../config/config.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $sql = "CREATE TABLE IF NOT EXISTS member_interactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        description TEXT,
        performed_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (member_id),
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($sql);
    echo "Table 'member_interactions' created successfully.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
