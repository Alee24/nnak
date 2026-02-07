<?php
// backend/force_reset_admin.php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

$email = 'admin@nnak.org';
$password = 'admin123';
$hash = password_hash($password, PASSWORD_DEFAULT);

// Check if exists
$stmt = $db->prepare("SELECT id FROM members WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    $db->prepare("UPDATE members SET password_hash = ?, role = 'admin', status = 'active' WHERE email = ?")
       ->execute([$hash, $email]);
    echo "Updated existing admin password.\n";
} else {
    $db->prepare("INSERT INTO members (member_id, email, password_hash, first_name, last_name, role, status) VALUES (?, ?, ?, 'Admin', 'User', 'admin', 'active')")
       ->execute(['ADM001', $email, $hash]);
    echo "Created new admin user.\n";
}
?>
