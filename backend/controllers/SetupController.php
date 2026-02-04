<?php
/**
 * Database Setup Controller
 * Handles database setup and migrations
 */

class SetupController {
    private $db;
    
    public function __construct() {
        // Connect without database first
        try {
            $dsn = "mysql:host=" . DB_HOST;
            $this->db = new PDO($dsn, DB_USER, DB_PASS);
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->sendResponse(500, [
                'error' => 'MySQL connection failed',
                'message' => $e->getMessage(),
                'help' => 'Please ensure MySQL is running and credentials in .env are correct'
            ]);
        }
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';
        
        if ($action === 'create-database') {
            if ($method === 'POST') {
                $this->createDatabase();
            } else {
                $this->methodNotAllowed();
            }
        } elseif ($action === 'run-migrations') {
            if ($method === 'POST') {
                $this->runMigrations();
            } else {
                $this->methodNotAllowed();
            }
        } elseif ($action === 'status') {
            if ($method === 'GET') {
                $this->getDatabaseStatus();
            } else {
                $this->methodNotAllowed();
            }
        } else {
            $this->sendResponse(200, [
                'message' => 'Database Setup API',
                'endpoints' => [
                    'POST /api/setup/create-database' => 'Create the database',
                    'POST /api/setup/run-migrations' => 'Run all migrations',
                    'GET /api/setup/status' => 'Check database status'
                ]
            ]);
        }
    }
    
    private function getDatabaseStatus() {
        try {
            // Check if database exists
            $stmt = $this->db->query("SHOW DATABASES LIKE '" . DB_NAME . "'");
            $dbExists = $stmt->rowCount() > 0;
            
            $status = [
                'database_exists' => $dbExists,
                'database_name' => DB_NAME,
                'tables' => []
            ];
            
            if ($dbExists) {
                $this->db->exec("USE " . DB_NAME);
                $stmt = $this->db->query("SHOW TABLES");
                $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                foreach ($tables as $table) {
                    $countStmt = $this->db->query("SELECT COUNT(*) FROM `$table`");
                    $status['tables'][$table] = $countStmt->fetchColumn();
                }
            }
            
            $this->sendResponse(200, $status);
            
        } catch (PDOException $e) {
            $this->sendResponse(500, [
                'error' => 'Failed to get database status',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    private function createDatabase() {
        try {
            $this->db->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Database "' . DB_NAME . '" created successfully',
                'next_step' => 'Run migrations to create tables'
            ]);
            
        } catch (PDOException $e) {
            $this->sendResponse(500, [
                'error' => 'Failed to create database',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    private function runMigrations() {
        try {
            // First check if database exists, create if not
            $stmt = $this->db->query("SHOW DATABASES LIKE '" . DB_NAME . "'");
            $dbExists = $stmt->rowCount() > 0;
            
            if (!$dbExists) {
                // Create database first
                $this->db->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            }
            
            // Use the database
            $this->db->exec("USE " . DB_NAME);
            
            $migrationsPath = __DIR__ . '/../database/migrations/';
            $files = glob($migrationsPath . '*.sql');
            sort($files);
            
            if (empty($files)) {
                $this->sendResponse(404, ['error' => 'No migration files found']);
            }
            
            $results = [];
            $errors = [];
            
            foreach ($files as $file) {
                $filename = basename($file);
                
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
                            $this->db->exec($statement);
                        }
                    }
                    
                    $results[] = $filename . ' - SUCCESS';
                    
                } catch (PDOException $e) {
                    $errors[] = $filename . ' - FAILED: ' . $e->getMessage();
                }
            }
            
            // Also run PHP migrations
            $phpFiles = glob($migrationsPath . '*.php');
            foreach ($phpFiles as $file) {
                $filename = basename($file);
                try {
                    // Capture output to prevent echoes from corrupting JSON
                    ob_start();
                    
                    // Pass database connection to migration
                    $pdo = $this->db;
                    require_once $file;
                    
                    // Get and discard output
                    $output = ob_get_clean();
                    
                    $results[] = $filename . ' - SUCCESS';
                } catch (Exception $e) {
                    // Clean buffer in case of error
                    if (ob_get_level() > 0) {
                        ob_end_clean();
                    }
                    $errors[] = $filename . ' - FAILED: ' . $e->getMessage();
                }
            }
            
            // Get final table list
            $stmt = $this->db->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Migrations completed',
                'results' => $results,
                'errors' => $errors,
                'tables_created' => $tables
            ]);
            
        } catch (PDOException $e) {
            $this->sendResponse(500, [
                'error' => 'Migration failed',
                'message' => $e->getMessage(),
                'help' => 'Please check that MySQL is running and you have permissions to create databases'
            ]);
        } catch (Exception $e) {
            $this->sendResponse(500, [
                'error' => 'Migration failed',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    private function sendResponse($code, $data) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
