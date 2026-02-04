<?php
/**
 * Database Migration Script
 * Runs all SQL migration files in order
 */

require_once __DIR__ . '/../config/config.php';

class Migrator {
    private $pdo;
    private $migrationsPath;
    
    public function __construct() {
        $this->migrationsPath = __DIR__ . '/migrations/';
        $this->connect();
    }
    
    private function connect() {
        try {
            $dsn = "mysql:host=" . DB_HOST;
            $this->pdo = new PDO($dsn, DB_USER, DB_PASS);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Create database if it doesn't exist
            $this->pdo->exec("CREATE DATABASE IF NOT EXISTS " . DB_NAME . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $this->pdo->exec("USE " . DB_NAME);
            
            echo "✓ Connected to database: " . DB_NAME . "\n";
        } catch (PDOException $e) {
            die("✗ Connection failed: " . $e->getMessage() . "\n");
        }
    }
    
    public function migrate() {
        echo "\n=== Running Database Migrations ===\n\n";
        
        // Get all migration files
        $files = glob($this->migrationsPath . '*.sql');
        sort($files);
        
        if (empty($files)) {
            echo "✗ No migration files found\n";
            return;
        }
        
        foreach ($files as $file) {
            $filename = basename($file);
            echo "Running: $filename ... ";
            
            try {
                $sql = file_get_contents($file);
                
                // Split by semicolon to handle multiple statements
                $statements = array_filter(
                    array_map('trim', explode(';', $sql)),
                    function($stmt) {
                        return !empty($stmt) && !preg_match('/^\s*--/', $stmt);
                    }
                );
                
                foreach ($statements as $statement) {
                    if (!empty($statement)) {
                        $this->pdo->exec($statement);
                    }
                }
                
                echo "✓ Success\n";
            } catch (PDOException $e) {
                echo "✗ Failed\n";
                echo "   Error: " . $e->getMessage() . "\n";
            }
        }
        
        echo "\n=== Migration Complete ===\n\n";
        $this->showTables();
    }
    
    private function showTables() {
        echo "Database Tables:\n";
        $stmt = $this->pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($tables as $table) {
            $countStmt = $this->pdo->query("SELECT COUNT(*) FROM `$table`");
            $count = $countStmt->fetchColumn();
            echo "  - $table ($count rows)\n";
        }
        echo "\n";
    }
}

// Run migrations
$migrator = new Migrator();
$migrator->migrate();
