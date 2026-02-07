<?php
// Force error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "NNAK Database Migration: Add Missing Columns\n";
echo "============================================\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // List of columns to check and add
    // Format: 'column_name' => 'definition'
    $columnsToAdd = [
        'registration_number' => 'VARCHAR(50) DEFAULT NULL AFTER role',
        'qualifications' => 'TEXT DEFAULT NULL',
        'personal_number' => 'VARCHAR(50) DEFAULT NULL',
        'chapter' => 'VARCHAR(100) DEFAULT NULL',
        'county' => 'VARCHAR(100) DEFAULT NULL',
        'id_number' => 'VARCHAR(50) DEFAULT NULL',
        // 'registration_date' => 'DATE DEFAULT NULL' // Using join_date instead, but can add if strictly needed
    ];

    // Get current columns
    $stmt = $db->query("DESCRIBE members");
    $currentColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($columnsToAdd as $col => $def) {
        if (in_array($col, $currentColumns)) {
            echo "[SKIP] Column '$col' already exists.\n";
        } else {
            echo "[ADD] Adding column '$col'...\n";
            $sql = "ALTER TABLE members ADD COLUMN $col $def";
            $db->exec($sql);
            echo "   -> Success!\n";
        }
    }
    
    echo "\n[DONE] Schema update completed successfully.\n";

} catch (PDOException $e) {
    echo "\n[ERROR] Database Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "\n[ERROR] System Error: " . $e->getMessage() . "\n";
}
