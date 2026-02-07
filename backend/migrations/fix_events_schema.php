<?php
if (!defined('DB_HOST')) {
    require_once __DIR__ . '/../config/config.php';
}
if (!class_exists('Database')) {
    require_once __DIR__ . '/../config/Database.php';
}

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Updating events table schema...\n";
    
    // Add image_url if not exists
    try {
        $db->query("SELECT image_url FROM events LIMIT 1");
        echo "Column 'image_url' already exists.\n";
    } catch (PDOException $e) {
        $db->exec("ALTER TABLE events ADD COLUMN image_url VARCHAR(255) NULL");
        echo "Added column 'image_url'.\n";
    }
    
    // Add deleted_at if not exists
    try {
        $db->query("SELECT deleted_at FROM events LIMIT 1");
        echo "Column 'deleted_at' already exists.\n";
    } catch (PDOException $e) {
        $db->exec("ALTER TABLE events ADD COLUMN deleted_at TIMESTAMP NULL");
        echo "Added column 'deleted_at'.\n";
    }

    echo "Schema update complete.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
