<?php
// 2026_02_06_ensure_members_schema.php

echo "Checking members table schema...\n";

// Ensure table exists
$pdo->exec("
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
");

$columns = [
    'membership_number' => "VARCHAR(50) AFTER member_id",
    'phone' => "VARCHAR(20) AFTER password_hash",
    'gender' => "VARCHAR(20) AFTER phone",
    'date_of_birth' => "DATE AFTER gender",
    'address_line1' => "VARCHAR(255) AFTER date_of_birth",
    'address_line2' => "VARCHAR(255) AFTER address_line1",
    'city' => "VARCHAR(100) AFTER address_line2",
    'state' => "VARCHAR(100) AFTER city",
    'postal_code' => "VARCHAR(20) AFTER state",
    'occupation' => "VARCHAR(100) AFTER postal_code",
    'organization' => "VARCHAR(150) AFTER occupation",
    'profile_photo' => "VARCHAR(255) AFTER organization",
    'qualifications' => "TEXT AFTER profile_photo",
    'personal_number' => "VARCHAR(50) AFTER qualifications",
    'registration_number' => "VARCHAR(50) AFTER personal_number",
    'chapter' => "VARCHAR(100) AFTER registration_number",
    'county' => "VARCHAR(100) AFTER chapter",
    'id_number' => "VARCHAR(50) AFTER county",
    'membership_type_id' => "INT AFTER id_number",
    'status' => "ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending' AFTER membership_type_id",
    'role' => "ENUM('member', 'admin', 'user') DEFAULT 'member' AFTER status",
    'expiry_date' => "DATE AFTER role",
    'total_cpd_points' => "INT DEFAULT 0 AFTER expiry_date",
    'license_number' => "VARCHAR(50) AFTER total_cpd_points",
    'license_expiry_date' => "DATE AFTER license_number"
];

foreach ($columns as $col => $def) {
    try {
        $check = $pdo->query("SHOW COLUMNS FROM members LIKE '$col'");
        if ($check->rowCount() == 0) {
            echo "Adding column $col...\n";
            $pdo->exec("ALTER TABLE members ADD COLUMN $col $def");
        } else {
            echo "Column $col already exists.\n";
        }
    } catch (PDOException $e) {
        echo "Error checking/adding column $col: " . $e->getMessage() . "\n";
    }
}

echo "Members table schema check complete.\n";
?>
