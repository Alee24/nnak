<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    $email = 'mettoalex@gmail.com';
    $password = 'Digital2025';
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM members WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Update existing user
        $stmt = $db->prepare("UPDATE members SET password_hash = ?, role = 'admin', status = 'active' WHERE email = ?");
        $stmt->execute([$passwordHash, $email]);
        echo "User updated successfully.\n";
    } else {
        // Create new admin user
        $stmt = $db->prepare("INSERT INTO members (member_id, first_name, last_name, email, password_hash, role, status, join_date) VALUES (?, ?, ?, ?, ?, 'admin', 'active', CURDATE())");
        $stmt->execute(['ADMIN-001', 'Alex', 'Metto', $email, $passwordHash]);
        echo "Admin user created successfully.\n";
    }
    
    // Also update old admin if exists to be regular member or delete? 
    // Just in case the user was using admin@nnak.org before
    // We will leave it for now.
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
