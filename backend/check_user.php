<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();
$stmt = $db->prepare("SELECT id, email, password_hash, role, status FROM members WHERE email = ?");
$stmt->execute(['mettoalex@gmail.com']);
$user = $stmt->fetch();

if ($user) {
    echo "User found:\n";
    print_r($user);
} else {
    echo "User mettoalex@gmail.com not found in members table.\n";
    
    // Check all users
    echo "\nAll users in table:\n";
    $stmt = $db->query("SELECT id, email FROM members LIMIT 10");
    while ($row = $stmt->fetch()) {
        echo "- " . $row['email'] . " (ID: " . $row['id'] . ")\n";
    }
}
