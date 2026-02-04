<?php
/**
 * Database Connection Class
 * Singleton pattern for PDO connection management
 */

class Database {
    private static $instance = null;
    private $connection;
    
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            // Log error
            error_log("Database connection failed: " . $e->getMessage());
            
            // Send JSON error response
            http_response_code(500);
            header('Content-Type: application/json');
            
            $errorResponse = ['error' => 'Database connection failed'];
            
            // Include detailed error message in development mode
            if (APP_ENV === 'development') {
                $errorResponse['message'] = $e->getMessage();
                $errorResponse['code'] = $e->getCode();
            }
            
            echo json_encode($errorResponse);
            exit();
        }
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        return $this->connection;
    }
    
    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
