<?php
/**
 * Login Debug Script
 * This script checks why the login for mettoalex@gmail.com might be failing
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$email = 'mettoalex@gmail.com';
$password = 'Digital2025';

header('Content-Type: text/plain');

try {
    $db = Database::getInstance()->getConnection();
    
    echo "--- Database Connection --- \n";
    echo "Connected successfully to " . DB_NAME . "\n\n";

    echo "--- Checking User: $email ---\n";
    $stmt = $db->prepare("SELECT * FROM members WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo "ERROR: User not found in 'members' table.\n";
        
        echo "\nExisting users in table:\n";
        $stmt = $db->query("SELECT email FROM members LIMIT 10");
        while ($row = $stmt->fetch()) {
            echo "- " . $row['email'] . "\n";
        }
    } else {
        echo "User found!\n";
        echo "ID: " . $user['id'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Status: " . $user['status'] . "\n";
        echo "Role: " . ($user['role'] ?? 'NOT SET') . "\n";
        echo "Deleted At: " . ($user['deleted_at'] === null ? 'NULL (OK)' : $user['deleted_at']) . "\n";
        
        echo "\n--- Password Verification ---\n";
        if (empty($user['password_hash'])) {
            echo "ERROR: password_hash column is empty for this user.\n";
        } else {
            echo "Hash found: " . substr($user['password_hash'], 0, 10) . "...\n";
            if (password_verify($password, $user['password_hash'])) {
                echo "SUCCESS: Password matches hash!\n";
            } else {
                echo "ERROR: Password does NOT match hash.\n";
                echo "Generating expected hash for '$password':\n";
                echo password_hash($password, PASSWORD_BCRYPT) . "\n";
            }
        }
    }

} catch (Exception $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "\n";
}
