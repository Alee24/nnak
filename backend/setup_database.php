<?php
/**
 * Database Setup Script
 * Re-initializes the database from schema.sql and seeds the admin user
 */

// Initialize Environment
define('APP_INIT', true);
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "NNAK Database Initialization\n";
echo "============================\n\n";

try {
    // 1. Connect
    echo "1. Connecting to Database... ";
    $db = Database::getInstance()->getConnection();
    echo "[OK]\n";

    // 2. Read Schema
    $schemaFile = __DIR__ . '/schema.sql';
    echo "2. Reading Schema from " . basename($schemaFile) . "... ";
    if (!file_exists($schemaFile)) {
        throw new Exception("Schema file not found!");
    }
    $sql = file_get_contents($schemaFile);
    echo "[OK]\n";

    // 3. Execute Schema
    echo "3. executing Schema (Dropping & Creating Tables)... ";
    $db->exec($sql);
    echo "[OK]\n";

    // 4. Seed Admin User
    echo "4. Seeding Admin User... ";
    $adminData = [
        ':member_id' => 'ADMIN001',
        ':first_name' => 'Metto',
        ':last_name' => 'Alex',
        ':email' => 'mettoalex@gmail.com',
        ':password_hash' => password_hash('admin123', PASSWORD_BCRYPT),
        ':role' => 'admin',
        ':status' => 'active',
        ':registration_number' => 'ADM-001',
        ':join_date' => date('Y-m-d')
    ];

    $stmt = $db->prepare("
        INSERT INTO members 
        (member_id, first_name, last_name, email, password_hash, role, status, registration_number, join_date)
        VALUES 
        (:member_id, :first_name, :last_name, :email, :password_hash, :role, :status, :registration_number, :join_date)
    ");
    
    $stmt->execute($adminData);
    echo "[OK]\n";
    echo "   -> Admin Created: mettoalex@gmail.com / admin123\n";

    echo "\n\n[SUCCESS] Database setup completed successfully!\n";

} catch (PDOException $e) {
    echo "\n\n[ERROR] Database Error: " . $e->getMessage() . "\n";
    die();
} catch (Exception $e) {
    echo "\n\n[ERROR] System Error: " . $e->getMessage() . "\n";
    die();
}
