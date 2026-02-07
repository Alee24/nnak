<?php
/**
 * Application Configuration
 * Robust environment loading and constant definition
 */

declare(strict_types=1);

// Prevent direct access
if (!defined('APP_INIT')) {
    // Check if we are being included safely, otherwise define it for root scripts
    if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
        die('No direct script access allowed');
    }
}

// Helper to safely get environment variables
function getEnvSafe(string $key, $default = null) {
    // Check $_ENV
    if (array_key_exists($key, $_ENV)) return $_ENV[$key];
    
    // Check getenv()
    $val = getenv($key);
    if ($val !== false) return $val;
    
    // Check $_SERVER
    if (array_key_exists($key, $_SERVER)) return $_SERVER[$key];
    
    return $default;
}

// Load .env file manually if safe
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            
            if (!array_key_exists($key, $_ENV)) {
                $_ENV[$key] = $value;
                putenv("$key=$value");
                $_SERVER[$key] = $value;
            }
        }
    }
}

// --- Database Configuration ---
define('DB_HOST', getEnvSafe('DB_HOST', 'localhost'));
define('DB_NAME', getEnvSafe('DB_NAME', 'nnak_system')); // Corrected DB name from previous files
define('DB_USER', getEnvSafe('DB_USER', 'root'));
define('DB_PASS', getEnvSafe('DB_PASS', ''));
define('DB_CHARSET', 'utf8mb4');

// --- Application Settings ---
define('APP_NAME', getEnvSafe('APP_NAME', 'NNAK Membership System'));
define('APP_URL', getEnvSafe('APP_URL', 'http://localhost/NNAK'));
define('APP_ENV', getEnvSafe('APP_ENV', 'development')); // Default to development for safety
define('APP_DEBUG', filter_var(getEnvSafe('APP_DEBUG', 'true'), FILTER_VALIDATE_BOOLEAN));

// --- Security ---
define('SESSION_LIFETIME', (int)getEnvSafe('SESSION_LIFETIME', 7200));
define('JWT_SECRET', getEnvSafe('JWT_SECRET', 'default-insecure-secret-please-change'));

// --- Error Reporting ---
if (APP_DEBUG || APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// --- Timezone ---
date_default_timezone_set('Africa/Nairobi');

// --- Session Setup ---
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.gc_maxlifetime', (string)SESSION_LIFETIME);
    // session_start(); // Don't auto-start, let controllers handle it or entry point
}
