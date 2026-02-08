<?php
ob_start();
/**
 * API Router and Request Handler
 * Main entry point for all API requests
 */

header('Content-Type: application/json');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Force JSON errors
set_exception_handler(function($e) {
    http_response_code(500);
    $isDebug = (defined('APP_DEBUG') && APP_DEBUG) || (defined('APP_ENV') && APP_ENV === 'development');
    echo json_encode([
        'error' => 'Internal Server Error',
        'message' => $e->getMessage(),
        'trace' => $isDebug ? $e->getTraceAsString() : null,
        'file' => $isDebug ? $e->getFile() : null,
        'line' => $isDebug ? $e->getLine() : null
    ]);
    exit();
});

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_CORE_ERROR || $error['type'] === E_COMPILE_ERROR)) {
        http_response_code(500);
        header('Content-Type: application/json');
        $isDebug = (defined('APP_DEBUG') && APP_DEBUG) || (defined('APP_ENV') && APP_ENV === 'development');
        echo json_encode([
            'error' => 'Fatal Error',
            'message' => $error['message'],
            'file' => $isDebug ? $error['file'] : null,
            'line' => $isDebug ? $error['line'] : null
        ]);
    }
});

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Normalization.php';

// Start session
session_start();

// Get request details
$method = $_SERVER['REQUEST_METHOD'];
$request = $_GET['request'] ?? '';
$requestParts = array_filter(explode('/', $request));

// Helper function to send JSON response
function sendResponse($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Helper function to get JSON input
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

// Route the request
try {
    // API routes start with 'api'
    if (empty($requestParts) || $requestParts[0] !== 'api') {
        sendResponse(404, ['error' => 'Not found']);
    }
    
    // Remove 'api' from parts
    array_shift($requestParts);
    
    if (empty($requestParts)) {
        sendResponse(200, [
            'message' => 'NNAK Membership API',
            'version' => '1.0',
            'status' => 'active'
        ]);
    }
    
    // Get controller name
    $controllerName = $requestParts[0];
    $controllerFile = __DIR__ . '/controllers/' . ucfirst($controllerName) . 'Controller.php';
    
    if (!file_exists($controllerFile)) {
        sendResponse(404, ['error' => 'Controller not found']);
    }
    
    require_once $controllerFile;
    
    $controllerClass = ucfirst($controllerName) . 'Controller';
    if (!class_exists($controllerClass)) {
        sendResponse(500, ['error' => 'Controller class not found']);
    }
    
    $controller = new $controllerClass();
    
    // Remove controller name from parts
    array_shift($requestParts);
    
    // Call the controller method
    $controller->handleRequest($method, $requestParts);
    
} catch (Throwable $e) {
    if (APP_DEBUG || APP_ENV === 'development') {
        sendResponse(500, [
            'error' => 'Internal server error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);
    } else {
        error_log($e->getMessage());
        sendResponse(500, ['error' => 'Internal server error']);
    }
}
ob_end_flush();
