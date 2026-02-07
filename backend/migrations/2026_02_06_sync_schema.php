<?php
/**
 * Migration: Sync Database Schema
 * Ensures all tables and columns are present and standardized.
 */
define('APP_INIT', true);
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Starting schema synchronization...\n";

    // 1. Ensure membership_types table exists
    echo "Checking membership_types table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS membership_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) DEFAULT 0.00,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Seed if empty
    $count = $db->query("SELECT COUNT(*) FROM membership_types")->fetchColumn();
    if ($count == 0) {
        $db->exec("INSERT INTO membership_types (name, price, description) VALUES 
            ('Full Member', 5000.00, 'Standard membership for registered nurses'),
            ('Associate Member', 3000.00, 'For students and health professionals'),
            ('Life Member', 50000.00, 'Lifetime membership access')");
        echo "Seeded default membership types.\n";
    }

    // 2. Sync members table
    echo "Syncing members table columns...\n";
    $stmt = $db->query("DESCRIBE members");
    $existingCols = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $memberUpdates = [
        'membership_number' => "ADD COLUMN membership_number VARCHAR(50) AFTER member_id",
        'role' => "ADD COLUMN role ENUM('member', 'admin', 'super_admin') DEFAULT 'member' AFTER email",
        'total_cpd_points' => "ADD COLUMN total_cpd_points INT DEFAULT 0 AFTER expiry_date",
        'license_number' => "ADD COLUMN license_number VARCHAR(50) AFTER total_cpd_points",
        'license_expiry_date' => "ADD COLUMN license_expiry_date DATE AFTER license_number",
        'profile_photo' => "ADD COLUMN profile_photo VARCHAR(255) AFTER work_station"
    ];

    foreach ($memberUpdates as $col => $sql) {
        if (!in_array($col, $existingCols)) {
            $db->exec("ALTER TABLE members $sql");
            echo "Added column: $col to members\n";
        }
    }

    // Standardize profile image field if profile_photo already exists but name differs
    // (Handled by the check above, but we might want to consolidate)
    if (in_array('profile_picture', $existingCols) && !in_array('profile_photo', $existingCols)) {
        // This won't run because of the loop above, but let's ensure we use one
    }

    // 3. Ensure cpd_points table exists
    echo "Checking cpd_points table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS cpd_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        points INT NOT NULL,
        activity_type VARCHAR(100),
        description TEXT,
        awarded_by INT,
        awarded_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (member_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // 4. Update events table
    echo "Syncing events table columns...\n";
    $stmt = $db->query("DESCRIBE events");
    $eventCols = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (!in_array('type', $eventCols)) {
        $db->exec("ALTER TABLE events ADD COLUMN type VARCHAR(100) DEFAULT 'General' AFTER location");
        echo "Added 'type' column to events.\n";
    }
    
    if (!in_array('created_by', $eventCols)) {
        $db->exec("ALTER TABLE events ADD COLUMN created_by INT NULL AFTER status");
        echo "Added 'created_by' column to events.\n";
    }

    echo "Schema synchronization complete.\n";

} catch (PDOException $e) {
    die("Migration failed: " . $e->getMessage() . "\n");
}
