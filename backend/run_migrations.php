<?php
/**
 * Direct Migration Runner
 * Simple HTML-based migration runner that bypasses JSON API
 */

require_once __DIR__ . '/config/config.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Running Migrations - NNAK</title>
    <style>
        body {
            font-family: 'Consolas', 'Monaco', monospace;
            background: #1a1a1a;
            color: #00ff00;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: #00ff00;
            border-bottom: 2px solid #00ff00;
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
            background: #00ff00;
            color: #000;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
        }
        .continue-btn:hover {
            background: #00cc00;
        }
    </style>
</head>
<body>
    <h1>🚀 NNAK Database Migration Runner</h1>
    
<?php

try {
    // Connect without selecting database
    $dsn = "mysql:host=" . DB_HOST;
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<pre>\n";
    echo "=== DATABASE SETUP ===\n\n";
    
    // Check if database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE '" . DB_NAME . "'");
    $dbExists = $stmt->rowCount() > 0;
    
    if (!$dbExists) {
        echo "<span class='info'>Creating database: " . DB_NAME . "...</span>\n";
        $pdo->exec("CREATE DATABASE `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo "<span class='success'>✓ Database created successfully</span>\n\n";
    } else {
        echo "<span class='success'>✓ Database '" . DB_NAME . "' already exists</span>\n\n";
    }
    
    // Use the database
    $pdo->exec("USE " . DB_NAME);
    
    echo "=== RUNNING SQL MIGRATIONS ===\n\n";
    
    // Get all SQL migration files
    $migrationsPath = __DIR__ . '/database/migrations/';
    $files = glob($migrationsPath . '*.sql');
    sort($files);
    
    if (empty($files)) {
        echo "<span class='warning'>⚠ No SQL migration files found</span>\n";
    } else {
        foreach ($files as $file) {
            $filename = basename($file);
            echo "Running: <span class='info'>$filename</span> ... ";
            
            try {
                $sql = file_get_contents($file);
                
                // Split by semicolon
                $statements = array_filter(
                    array_map('trim', explode(';', $sql)),
                    function($stmt) {
                        return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
                    }
                );
                
                foreach ($statements as $statement) {
                    if (!empty($statement)) {
                        $pdo->exec($statement);
                    }
                }
                
                echo "<span class='success'>✓ SUCCESS</span>\n";
                
            } catch (PDOException $e) {
                echo "<span class='error'>✗ FAILED</span>\n";
                echo "   <span class='error'>Error: " . htmlspecialchars($e->getMessage()) . "</span>\n";
            }
        }
    }
    
    echo "\n=== RUNNING PHP MIGRATIONS ===\n\n";
    
    // Get all PHP migration files
    $phpFiles = glob($migrationsPath . '*.php');
    sort($phpFiles);
    
    if (empty($phpFiles)) {
        echo "<span class='warning'>⚠ No PHP migration files found</span>\n";
    } else {
        foreach ($phpFiles as $file) {
            $filename = basename($file);
            echo "\nRunning: <span class='info'>$filename</span>\n";
            echo str_repeat('-', 60) . "\n";
            
            try {
                // Include the migration file
                include $file;
                
            } catch (Exception $e) {
                echo "<span class='error'>✗ FAILED: " . htmlspecialchars($e->getMessage()) . "</span>\n";
            }
            
            echo str_repeat('-', 60) . "\n";
        }
    }
    
    echo "\n=== MIGRATION SUMMARY ===\n\n";
    
    // Show all tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<span class='success'>Database: " . DB_NAME . "</span>\n";
    echo "<span class='success'>Total Tables: " . count($tables) . "</span>\n\n";
    
    foreach ($tables as $table) {
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
        $count = $countStmt->fetchColumn();
        echo "  <span class='info'>• $table</span> ($count rows)\n";
    }
    
    echo "\n<span class='success'>✓✓✓ ALL MIGRATIONS COMPLETED ✓✓✓</span>\n";
    echo "</pre>\n";
    
    echo "<a href='../frontend/public/pages/login.html' class='continue-btn'>→ Continue to Login</a>\n";
    
} catch (PDOException $e) {
    echo "<pre><span class='error'>✗ DATABASE ERROR:</span>\n";
    echo "<span class='error'>" . htmlspecialchars($e->getMessage()) . "</span>\n";
    echo "\n<span class='info'>Please check:</span>\n";
    echo "  • MySQL is running\n";
    echo "  • Database credentials in .env are correct\n";
    echo "  • User has permissions to create databases and tables\n";
    echo "</pre>";
}
?>

</body>
</html>
