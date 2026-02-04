<?php
/**
 * Reset Admin Password
 * This script resets the admin password to 'password123'
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Find admin user
    $stmt = $db->prepare("SELECT id, email, first_name, last_name FROM members WHERE email = 'mettoalex@gmail.com' LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch();
    
    if (!$admin) {
        echo "✗ Admin user not found\n";
        exit(1);
    }
    
    // Reset password to 'password123'
    $newPassword = 'password123';
    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);
    
    $updateStmt = $db->prepare("UPDATE members SET password_hash = ? WHERE id = ?");
    $updateStmt->execute([$passwordHash, $admin['id']]);
    
    echo "✓ Password reset successfully!\n\n";
    echo "Admin Login Credentials:\n";
    echo "========================\n";
    echo "Email: {$admin['email']}\n";
    echo "Password: $newPassword\n";
    echo "Name: {$admin['first_name']} {$admin['last_name']}\n\n";
    echo "You can now login at: http://localhost:8000/../frontend/public/pages/login.html\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}
