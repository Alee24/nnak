<?php
/**
 * Application Configuration
 * Load environment variables and define constants
 */

// Load environment variables from .env file
function loadEnv($path) {
    if (!file_exists($path)) {
        die("Error: .env file not found. Please copy .env.example to .env and configure it.\n");
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=VALUE
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }
    }
}

// Load .env file
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    loadEnv($envPath);
} else {
    // Try .env.example for development
    $envExamplePath = __DIR__ . '/../../.env.example';
    if (file_exists($envExamplePath)) {
        loadEnv($envExamplePath);
    }
}

// Database Configuration
// Database Configuration
if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'nnak_db');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'root');
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: '');

// Application Settings
define('APP_NAME', getenv('APP_NAME') ?: 'NNAK Membership System');
define('APP_URL', getenv('APP_URL') ?: 'http://localhost/NNAK');
define('APP_ENV', getenv('APP_ENV') ?: 'development');

// Security Settings
define('SESSION_LIFETIME', getenv('SESSION_LIFETIME') ?: 7200);
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'change-this-secret-key');

// Error Reporting
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('Africa/Nairobi');

// Session Configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
