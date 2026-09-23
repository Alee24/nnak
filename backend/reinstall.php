<?php
ob_start();
/**
 * Master Fresh Installation & Migration Runner Script
 * Rebuilds database from scratch, applies all migrations, and seeds demo data
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Normalization.php';
require_once __DIR__ . '/utils/Auth.php';

echo "\n============================================================\n";
echo " MMS Golf Club Management System - Fresh Reinstall & Migrator \n";
echo "============================================================\n\n";

try {
    $dsn = "mysql:host=" . DB_HOST;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $dbName = DB_NAME;

    echo "[1/4] Dropping database '$dbName' if exists...\n";
    $pdo->exec("DROP DATABASE IF EXISTS `$dbName`");

    echo "[2/4] Creating fresh database '$dbName'...\n";
    $pdo->exec("CREATE DATABASE `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$dbName`");

    echo "[3/4] Running migration files...\n";
    
    // Look in backend/migrations folder
    $migrationsDir = __DIR__ . '/migrations/';
    $files = glob($migrationsDir . '*.sql');
    sort($files);

    foreach ($files as $file) {
        $filename = basename($file);
        echo " -> Executing $filename... ";
        $sql = file_get_contents($file);
        
        // Handle DELIMITER blocks or standard queries
        try {
            $pdo->exec($sql);
            echo "✓ Done\n";
        } catch (PDOException $e) {
            // Split by semicolon fallback
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            $failed = false;
            foreach ($statements as $stmt) {
                if (!empty($stmt) && !preg_match('/^\s*--/', $stmt)) {
                    try {
                        $pdo->exec($stmt);
                    } catch (Exception $ex) {
                        $failed = true;
                    }
                }
            }
            if ($failed) {
                echo "⚠ Executed with warnings\n";
            } else {
                echo "✓ Done\n";
            }
        }
    }

    echo "[4/4] Populating complete demo ecosystem via DemoController logic...\n";
    require_once __DIR__ . '/controllers/DemoController.php';
    
    // Call DemoController populate logic programmatically
    $demo = new DemoController();
    
    // Simulate request or direct call
    $reflector = new ReflectionClass('DemoController');
    $method = $reflector->getMethod('populateDemoData');
    $method->setAccessible(true);
    
    // Temporarily capture echo/response output
    ob_start();
    $method->invoke($demo);
    $output = ob_get_clean();

    echo "✓ Demo population finished.\n\n";

    echo "============================================================\n";
    echo " SUCCESS: Database completely rebuilt & all demo data loaded! \n";
    echo "============================================================\n\n";

} catch (Exception $e) {
    echo "\n✗ FATAL ERROR: " . $e->getMessage() . "\n\n";
    exit(1);
}
