<?php
/**
 * Migration: Enhance CPD System
 * Adds event tracking to CPD points and creates attendance table.
 */
define('APP_INIT', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Enhancing CPD Points system schema...\n";

    // 1. Add event_id to cpd_points if it doesn't exist
    $stmt = $db->query("DESCRIBE cpd_points");
    $cols = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('event_id', $cols)) {
        $db->exec("ALTER TABLE cpd_points ADD COLUMN event_id INT NULL AFTER member_id");
        $db->exec("ALTER TABLE cpd_points ADD INDEX (event_id)");
        echo "Added 'event_id' column to cpd_points.\n";
    }

    // 2. Create event_attendance table
    echo "Creating event_attendance table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS event_attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        member_id INT NOT NULL,
        status ENUM('registered', 'attended', 'certificate_issued') DEFAULT 'registered',
        points_awarded TINYINT(1) DEFAULT 0,
        attended_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (event_id, member_id),
        INDEX (event_id),
        INDEX (member_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    echo "CPD System enhancement complete.\n";

} catch (PDOException $e) {
    die("CPD Migration failed: " . $e->getMessage() . "\n");
}
