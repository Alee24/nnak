<?php
/**
 * Database Cleanup Script
 * Drops all tables to start fresh
 */

require_once __DIR__ . '/config/config.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Cleanup - NNAK</title>
    <style>
        body {
            font-family: 'Consolas', 'Monaco', monospace;
            background: #1a1a1a;
            color: #ff6600;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #ff6600;
            border-bottom: 2px solid #ff6600;
            padding-bottom: 10px;
        }
        .success {
            color: #00ff00;
        }
        .error {
            color: #ff0000;
        }
        .info {
            color: #00aaff;
        }
        .warning {
            color: #ffaa00;
        }
        pre {
            background: #000;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .continue-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 15px 30px;
            background: #ff6600;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
        }
        .continue-btn:hover {
            background: #ff8800;
        }
    </style>
</head>
<body>
    <h1>🧹 NNAK Database Cleanup</h1>
    
<?php

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<pre>\n";
    echo "=== CLEANING DATABASE: " . DB_NAME . " ===\n\n";
    
    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    echo "<span class='info'>✓ Disabled foreign key checks</span>\n\n";
    
    // Get all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "<span class='warning'>⚠ No tables found in database</span>\n";
    } else {
        echo "<span class='info'>Found " . count($tables) . " tables to drop:</span>\n\n";
        
        foreach ($tables as $table) {
            echo "Dropping table: <span class='warning'>$table</span> ... ";
            try {
                $pdo->exec("DROP TABLE IF EXISTS `$table`");
                echo "<span class='success'>✓ DROPPED</span>\n";
            } catch (PDOException $e) {
                echo "<span class='error'>✗ FAILED: " . htmlspecialchars($e->getMessage()) . "</span>\n";
            }
        }
    }
    
    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "\n<span class='info'>✓ Re-enabled foreign key checks</span>\n";
    
    // Verify cleanup
    $stmt = $pdo->query("SHOW TABLES");
    $remaining = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "\n=== CLEANUP SUMMARY ===\n\n";
    
    if (empty($remaining)) {
        echo "<span class='success'>✓✓✓ ALL TABLES REMOVED ✓✓✓</span>\n";
        echo "<span class='info'>Database is now clean and ready for fresh migrations</span>\n";
    } else {
        echo "<span class='error'>⚠ Some tables could not be removed:</span>\n";
        foreach ($remaining as $table) {
            echo "  • $table\n";
        }
    }
    
    echo "</pre>\n";
    
    echo "<a href='run_migrations.php' class='continue-btn'>→ Run Migrations Now</a>\n";
    
} catch (PDOException $e) {
    echo "<pre><span class='error'>✗ DATABASE ERROR:</span>\n";
    echo "<span class='error'>" . htmlspecialchars($e->getMessage()) . "</span>\n</pre>";
}
?>

</body>
</html>
