<?php
/**
 * Test Members API with Session
 * This script simulates a logged-in user and tests the members API
 */

session_start();
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/controllers/MemberController.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "=== Testing Members API ===\n\n";
    
    // 1. Setup session (simulate logged-in admin)
    $stmt = $db->prepare("SELECT id, member_id, email, role FROM members WHERE email = 'mettoalex@gmail.com' LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch();
    
    if (!$admin) {
        echo "✗ Admin user not found\n";
        exit(1);
    }
    
    $_SESSION['user_id'] = $admin['id'];
    $_SESSION['member_id'] = $admin['member_id'];
    $_SESSION['email'] = $admin['email'];
    $_SESSION['role'] = $admin['role'];
    
    echo "✓ Session created for: {$admin['email']}\n";
    echo "  Role: {$admin['role']}\n\n";
    
    // 2. Check if membership_types table exists
    echo "--- Checking Database Tables ---\n";
    $stmt = $db->query("SHOW TABLES LIKE 'membership_types'");
    if ($stmt->rowCount() > 0) {
        echo "✓ membership_types table exists\n";
        
        // Count membership types
        $stmt = $db->query("SELECT COUNT(*) as count FROM membership_types");
        $result = $stmt->fetch();
        echo "  Membership types count: {$result['count']}\n\n";
    } else {
        echo "✗ membership_types table DOES NOT exist\n";
        echo "This may cause the LEFT JOIN to fail!\n\n";
    }
    
    // 3. Test the exact query from listMembers()
    echo "--- Testing Members Query ---\n";
    $whereClause = "m.deleted_at IS NULL";
    
    try {
        $sql = "
            SELECT m.id, m.member_id, m.email, m.first_name, m.last_name, 
                   m.phone, m.status, m.join_date, m.expiry_date, m.role,
                   'Member' as membership_type_name
            FROM members m
            WHERE $whereClause
            ORDER BY m.created_at DESC
            LIMIT 20 OFFSET 0
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([]);
        $members = $stmt->fetchAll();
        
        echo "✓ Query executed successfully\n";
        echo "  Members found: " . count($members) . "\n\n";
        
        if (count($members) > 0) {
            echo "Sample member:\n";
            $sample = $members[0];
            echo "  ID: {$sample['id']}\n";
            echo "  Member ID: {$sample['member_id']}\n";
            echo "  Name: {$sample['first_name']} {$sample['last_name']}\n";
            echo "  Email: {$sample['email']}\n";
            echo "  Status: {$sample['status']}\n";
            echo "  Membership Type: " . ($sample['membership_type_name'] ?? 'NULL') . "\n";
        }
        
    } catch (PDOException $e) {
        echo "✗ Query failed!\n";
        echo "  Error: {$e->getMessage()}\n";
        echo "  Code: {$e->getCode()}\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
