<?php
/**
 * Migration: Final Standardize Events Table
 */
define('APP_INIT', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Ensuring events table is standardized...\n";
    
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    $db->exec("DROP TABLE IF EXISTS events");
    $db->exec("CREATE TABLE events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME,
        location VARCHAR(255),
        fee DECIMAL(10,2) DEFAULT 0.00,
        cpd_points INT DEFAULT 0,
        type VARCHAR(100) DEFAULT 'General',
        image_url VARCHAR(255),
        status ENUM('published', 'draft', 'cancelled') DEFAULT 'published',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "Events table (re)created with correct schema.\n";

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
