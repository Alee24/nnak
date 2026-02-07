<?php
/**
 * Migration: Standardize Events Table
 * Renames columns to match EventController expectations
 */

if (!defined('DB_HOST')) {
    require_once __DIR__ . '/../config/config.php';
}
if (!class_exists('Database')) {
    require_once __DIR__ . '/../config/Database.php';
}

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Standardizing events table schema...\n";
    
    // Check if table exists
    $db->exec("CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        event_time TIME,
        location VARCHAR(255),
        fee DECIMAL(10,2) DEFAULT 0.00,
        cpd_points INT DEFAULT 0,
        image_url VARCHAR(255),
        status ENUM('published', 'draft', 'cancelled') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Check for old column names and rename if they exist
    $cols = $db->query("DESCRIBE events")->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('date', $cols) && !in_array('event_date', $cols)) {
        $db->exec("ALTER TABLE events CHANGE COLUMN `date` `event_date` DATE NOT NULL");
        echo "Renamed 'date' to 'event_date'.\n";
    }
    
    if (in_array('time', $cols) && !in_array('event_time', $cols)) {
        $db->exec("ALTER TABLE events CHANGE COLUMN `time` `event_time` TIME");
        echo "Renamed 'time' to 'event_time'.\n";
    }

    // Ensure fee and cpd_points columns exist
    if (!in_array('fee', $cols)) {
        $db->exec("ALTER TABLE events ADD COLUMN fee DECIMAL(10,2) DEFAULT 0.00");
        echo "Added 'fee' column.\n";
    }
    if (!in_array('cpd_points', $cols)) {
        $db->exec("ALTER TABLE events ADD COLUMN cpd_points INT DEFAULT 0");
        echo "Added 'cpd_points' column.\n";
    }

    echo "Standardization complete.\n";

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
