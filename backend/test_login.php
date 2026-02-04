<?php
/**
 * Test Login Script
 * This script tests logging in with admin credentials
 */

session_start();
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Check if admin user exists
    $stmt = $db->prepare("SELECT id, member_id, email, password_hash, first_name, last_name, role, status FROM members WHERE role = 'admin' OR role = 'super_admin' LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch();
    
    if (!$admin) {
        echo "✗ No admin user found in database\n";
        echo "Please create an admin user first.\n";
        exit(1);
    }
    
    echo "Found admin user:\n";
    echo "  Email: {$admin['email']}\n";
    echo "  Name: {$admin['first_name']} {$admin['last_name']}\n";
    echo "  Role: {$admin['role']}\n\n";
    
    // Test password (default password is 'password123')
    $testPassword = 'password123';
    
    if (password_verify($testPassword, $admin['password_hash'])) {
        echo "✓ Password verification successful for password: '$testPassword'\n\n";
        
        // Create session (simulate login)
        $_SESSION['user_id'] = $admin['id'];
        $_SESSION['member_id'] = $admin['member_id'];
        $_SESSION['email'] = $admin['email'];
        $_SESSION['role'] = $admin['role'];
        $_SESSION['login_time'] = time();
        
        echo "✓ Session created successfully\n";
        echo "Session data:\n";
        print_r($_SESSION);
        
    } else {
        echo "✗ Password verification failed\n";
        echo "You may need to reset the admin password.\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
