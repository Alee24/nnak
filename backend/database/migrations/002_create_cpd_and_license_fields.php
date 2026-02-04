<?php
/**
 * Create CPD Points Table
 * This migration creates a table to track CPD (Continuing Professional Development) points
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "=== Creating CPD Points Tracking System ===\n\n";
    
    // Create cpd_points table
    echo "1. Creating cpd_points table...\n";
    $sql = "CREATE TABLE IF NOT EXISTS cpd_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        points INT NOT NULL,
        activity_type VARCHAR(100),
        description TEXT,
        awarded_by INT,
        awarded_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_member_id (member_id),
        INDEX idx_awarded_date (awarded_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $db->exec($sql);
    echo "   ✓ cpd_points table created successfully\n\n";
    
    // Add license fields to members table
    echo "2. Adding license fields to members table...\n";
    
    // Check if columns already exist
    $stmt = $db->query("SHOW COLUMNS FROM members LIKE 'license_number'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE members ADD COLUMN license_number VARCHAR(50) AFTER phone");
        echo "   ✓ Added license_number column\n";
    } else {
        echo "   - license_number column already exists\n";
    }
    
    $stmt = $db->query("SHOW COLUMNS FROM members LIKE 'license_expiry_date'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE members ADD COLUMN license_expiry_date DATE AFTER license_number");
        echo "   ✓ Added license_expiry_date column\n";
    } else {
        echo "   - license_expiry_date column already exists\n";
    }
    
    $stmt = $db->query("SHOW COLUMNS FROM members LIKE 'license_status'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE members ADD COLUMN license_status ENUM('active', 'expired', 'suspended', 'not_set') DEFAULT 'not_set' AFTER license_expiry_date");
        echo "   ✓ Added license_status column\n";
    } else {
        echo "   - license_status column already exists\n";
    }
    
    $stmt = $db->query("SHOW COLUMNS FROM members LIKE 'total_cpd_points'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE members ADD COLUMN total_cpd_points INT DEFAULT 0 AFTER license_status");
        echo "   ✓ Added total_cpd_points column\n";
    } else {
        echo "   - total_cpd_points column already exists\n";
    }
    
    echo "\n✓ Migration completed successfully!\n\n";
    
    // Show table structure
    echo "=== CPD Points Table Structure ===\n";
    $stmt = $db->query("DESCRIBE cpd_points");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "  - {$col['Field']}: {$col['Type']}\n";
    }
    
    echo "\n=== Updated Members Table (License Fields) ===\n";
    $stmt = $db->query("SHOW COLUMNS FROM members WHERE Field IN ('license_number', 'license_expiry_date', 'license_status', 'total_cpd_points')");
    $columns = $stmt->fetchAll();
    foreach ($columns as $col) {
        echo "  - {$col['Field']}: {$col['Type']}\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
