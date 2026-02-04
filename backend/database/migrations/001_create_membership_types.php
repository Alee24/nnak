<?php
/**
 * Create membership_types table
 * This migration creates the membership types table that is missing
 */

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Creating membership_types table...\n\n";
    
    // Create membership_types table
    $sql = "CREATE TABLE IF NOT EXISTS membership_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        duration_months INT NOT NULL DEFAULT 12,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $db->exec($sql);
    echo "✓ membership_types table created successfully\n\n";
    
    // Insert default membership types
    echo "Inserting default membership types...\n";
    
    $insertSql = "INSERT INTO membership_types (name, description, price, duration_months) VALUES
        ('Regular Nurse', 'Standard membership for registered nurses', 5000.00, 12),
        ('Midwife', 'Membership for registered midwives', 5000.00, 12),
        ('Associate Member', 'Associate membership for nursing associates', 3000.00, 12),
        ('Student Nurse', 'Discounted membership for nursing students', 2000.00, 12),
        ('Lifetime Member', 'One-time payment for lifetime membership', 50000.00, 0)
    ON DUPLICATE KEY UPDATE name=name";
    
    $db->exec($insertSql);
    echo "✓ Default membership types inserted\n\n";
    
    // Verify
    $stmt = $db->query("SELECT id, name, price, duration_months FROM membership_types");
    $types = $stmt->fetchAll();
    
    echo "Membership types in database:\n";
    foreach ($types as $type) {
        echo "  - ID: {$type['id']}, Name: {$type['name']}, Price: KES {$type['price']}, Duration: {$type['duration_months']} months\n";
    }
    
    echo "\n✓ Migration completed successfully!\n";
    
} catch (PDOException $e) {
    echo "✗ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
