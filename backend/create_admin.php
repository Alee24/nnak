<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

// Admin user details
$email = 'admin@nnak.org';
$password = 'admin123';
$firstName = 'Admin';
$lastName = 'User';

// Check if admin already exists
$stmt = $db->prepare("SELECT id FROM members WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo "Admin user already exists!\n";
    exit(0);
}

// Generate member ID
$year = date('Y');
$memberId = "NNAK{$year}0001";

// Hash password
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

// Insert admin user
$stmt = $db->prepare("
    INSERT INTO members (
        member_id, email, password_hash, first_name, last_name,
        phone, status, join_date, role
    ) VALUES (?, ?, ?, ?, ?, ?, 'active', CURDATE(), 'admin')
");

$stmt->execute([
    $memberId,
    $email,
    $passwordHash,
    $firstName,
    $lastName,
    '+254700000000'
]);

echo "✓ Admin user created successfully!\n";
echo "Email: $email\n";
echo "Password: $password\n";
echo "Member ID: $memberId\n";
