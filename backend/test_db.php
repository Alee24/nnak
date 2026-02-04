<?php
/**
 * Database Connection Test
 * This script tests the database connection and checks if members exist
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    echo "Testing Database Connection...\n\n";
    
    // Get database instance
    $db = Database::getInstance()->getConnection();
    echo "✓ Database connection successful!\n\n";
    
    // Check if members table exists
    $stmt = $db->query("SHOW TABLES LIKE 'members'");
    if ($stmt->rowCount() > 0) {
        echo "✓ 'members' table exists\n\n";
        
        // Count total members
        $stmt = $db->query("SELECT COUNT(*) as total FROM members WHERE deleted_at IS NULL");
        $result = $stmt->fetch();
        echo "Total members in database: " . $result['total'] . "\n\n";
        
        // Get sample members
        $stmt = $db->query("SELECT id, member_id, first_name, last_name, email, status FROM members WHERE deleted_at IS NULL LIMIT 5");
        $members = $stmt->fetchAll();
        
        if (count($members) > 0) {
            echo "Sample members:\n";
            foreach ($members as $member) {
                echo "  - ID: {$member['id']}, Member ID: {$member['member_id']}, Name: {$member['first_name']} {$member['last_name']}, Status: {$member['status']}\n";
            }
        } else {
            echo "⚠ No members found in database\n";
        }
    } else {
        echo "✗ 'members' table does NOT exist!\n";
        echo "You may need to run migrations.\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Database Error: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
