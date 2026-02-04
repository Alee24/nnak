<?php
/**
 * Create Admin User
 * Creates an admin user account in the database
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    
    // Admin details
    $email = 'mettoalex@gmail.com';
    $password = 'Digital2025';
    $firstName = 'Admin';
    $lastName = 'User';
    
    // Check if user already exists
    $checkQuery = "SELECT id FROM members WHERE email = :email";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(':email', $email);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        echo "✓ User already exists with email: $email\n";
        
        // Update password for existing user
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $updateQuery = "UPDATE members SET password_hash = :password_hash, role = 'admin', status = 'active' WHERE email = :email";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':password_hash', $passwordHash);
        $updateStmt->bindParam(':email', $email);
        $updateStmt->execute();
        
        echo "✓ Password updated and role set to admin\n";
    } else {
        // Generate unique member ID
        $memberId = 'NNAK' . date('Y') . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert admin user
        $query = "INSERT INTO members (
            member_id, email, password_hash, first_name, last_name,
            phone, status, join_date, role, created_at
        ) VALUES (
            :member_id, :email, :password_hash, :first_name, :last_name,
            :phone, 'active', CURDATE(), 'admin', NOW()
        )";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':member_id', $memberId);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':password_hash', $passwordHash);
        $stmt->bindParam(':first_name', $firstName);
        $stmt->bindParam(':last_name', $lastName);
        $phone = '+254700000000';
        $stmt->bindParam(':phone', $phone);
        
        if ($stmt->execute()) {
            echo "✓ Admin user created successfully!\n";
            echo "\nLogin Credentials:\n";
            echo "==================\n";
            echo "Email: $email\n";
            echo "Password: $password\n";
            echo "Role: Admin\n";
            echo "Member ID: $memberId\n";
        } else {
            echo "✗ Failed to create admin user\n";
        }
    }
    
    // Show all users
    echo "\n=== Current Users in Database ===\n";
    $usersQuery = "SELECT member_id, email, first_name, last_name, role, status FROM members";
    $usersStmt = $db->query($usersQuery);
    $users = $usersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($users) > 0) {
        foreach ($users as $user) {
            echo sprintf(
                "- %s (%s %s) - %s [%s]\n",
                $user['email'],
                $user['first_name'],
                $user['last_name'],
                $user['role'],
                $user['status']
            );
        }
    } else {
        echo "No users found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
