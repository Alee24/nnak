<?php
/**
 * Script: Reset All Member Passwords
 * Sets every member's password to '123456789'
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    $newPassword = '123456789';
    $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);

    echo "Resetting all member passwords to: $newPassword\n";

    $stmt = $db->prepare("UPDATE members SET password_hash = ? WHERE deleted_at IS NULL");
    $stmt->execute([$passwordHash]);

    $count = $stmt->rowCount();
    echo "Successfully reset passwords for $count members.\n";

} catch (Exception $e) {
    die("Error resetting passwords: " . $e->getMessage() . "\n");
}
