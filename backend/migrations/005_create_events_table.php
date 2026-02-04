<?php
/**
 * Migration: Create Events Table
 */
$db = Database::getInstance()->getConnection();

try {
    $sql = "
    CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME,
        location VARCHAR(255),
        type VARCHAR(100) DEFAULT 'General',
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'published',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    $db->exec($sql);
    echo "Migration successful: Created 'events' table.\n";

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
