<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();

    // Check if column already exists
    $stmt = $db->query("SHOW COLUMNS FROM members LIKE 'profile_picture'");
    if (!$stmt->fetch()) {
        echo "Adding profile_picture column to members table...\n";
        $db->exec("ALTER TABLE members ADD COLUMN profile_picture LONGTEXT NULL AFTER status");
        echo "Column added successfully.\n";
    } else {
        echo "profile_picture column already exists.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
