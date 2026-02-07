<?php
/**
 * Database Connection Class
 * Robust Singleton pattern with comprehensive error handling
 */

class Database {
    private static $instance = null;
    private $connection;
    private $error;

    private function __construct() {
        // Try connecting
        $this->connect();
    }

    private function connect() {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false, // Set to false for dev environments to avoid connection issues
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET . " COLLATE " . DB_CHARSET . "_unicode_ci"
        ];

        try {
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            $this->error = $e->getMessage();
            $this->handleConnectionError($e);
        }
    }

    private function handleConnectionError($e) {
        $errorMsg = "Database Connection fatal error: " . $e->getMessage();
        error_log($errorMsg);
        
        // Determine if JSON response is expected
        $isJson = false;
        if ((isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
            (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
            (isset($_GET['request']) && strpos($_GET['request'], 'api/') !== false)) {
            $isJson = true;
        }
        
        if ($isJson) {
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'error' => 'Database Connection Failed',
                'message' => (defined('APP_DEBUG') && APP_DEBUG) ? $e->getMessage() : 'The system is currently experiencing technical difficulties. Please try again later.',
                'code' => $e->getCode()
            ]);
        } else {
            if (defined('APP_DEBUG') && APP_DEBUG) {
                echo "<h1>Database Connection Failed</h1>";
                echo "<p>Could not connect to the database. Please check your configuration.</p>";
                echo "<pre>" . $e->getMessage() . "</pre>";
            } else {
                header('HTTP/1.1 503 Service Unavailable');
                echo "<h1>Service Unavailable</h1>";
                echo "<p>The system is currently experiencing technical difficulties. Please try again later.</p>";
            }
        }
        exit();
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

    // Explicitly test connectivity (useful for health checks)
    public function isConnected() {
        try {
            if ($this->connection) {
                $this->connection->query('SELECT 1');
                return true;
            }
        } catch (PDOException $e) {
            return false;
        }
        return false;
    }

    // Prevent cloning
    private function __clone() {}

    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
