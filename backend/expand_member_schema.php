<?php
// Database Migration: Expand Members Table
// Adds fields from the official NNAK registration form

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "NNAK Database Migration: Expand Members Schema\n";
echo "============================================\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    $columnsToAdd = [
        'designation' => 'VARCHAR(150) DEFAULT NULL AFTER qualifications',
        'work_station' => 'VARCHAR(150) DEFAULT NULL AFTER organization',
        'sub_county' => 'VARCHAR(100) DEFAULT NULL AFTER county',
        'cadre' => 'VARCHAR(100) DEFAULT NULL AFTER occupation',
        'employment_status' => 'VARCHAR(100) DEFAULT NULL AFTER cadre',
        'is_signed' => 'TINYINT(1) DEFAULT 0',
        'signature_date' => 'DATE DEFAULT NULL'
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
    
    echo "\n[DONE] Schema expansion completed successfully.\n";

} catch (PDOException $e) {
    echo "\n[ERROR] Database Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "\n[ERROR] System Error: " . $e->getMessage() . "\n";
}
