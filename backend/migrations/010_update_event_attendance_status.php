<?php
/**
 * Migration: Update Event Attendance Status
 * Adds 'invited' and 'rejected' to the status enum.
 */
if (!defined('DB_HOST')) {
    require_once __DIR__ . '/../config/config.php';
}
if (!class_exists('Database')) {
    require_once __DIR__ . '/../config/Database.php';
}

try {
    $db = Database::getInstance()->getConnection();
    echo "Updating event_attendance table status enum...\n";

    // Update status enum
    $sql = "ALTER TABLE event_attendance MODIFY COLUMN status ENUM('invited', 'registered', 'attended', 'rejected', 'certificate_issued') DEFAULT 'invited'";
    $db->exec($sql);

    echo "Status enum updated successfully.\n";

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
