<?php
/**
 * Router script for PHP built-in development server
 * This handles routing since .htaccess doesn't work with php -S
 */

// Debug logging
$logFile = __DIR__ . '/server.log';
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

file_put_contents($logFile, date('[Y-m-d H:i:s] ') . $_SERVER['REQUEST_METHOD'] . ' ' . $uri . "\n", FILE_APPEND);

// Serve static files directly
if ($uri !== '/' && file_exists(__DIR__ . $uri) && is_file(__DIR__ . $uri)) {
    return false;
}

// Route API requests to index.php
if (preg_match('/^\/api\//', $uri)) {
    $_GET['request'] = substr($uri, 1); // Remove leading slash
    require __DIR__ . '/index.php';
    exit;
}

// For root, show API info
if ($uri === '/' || $uri === '') {
    header('Content-Type: application/json');
    echo json_encode([
        'message' => 'NNAK Membership API',
        'version' => '1.0',
        'status' => 'active',
        'endpoints' => [
            'auth' => '/api/auth/*',
            'members' => '/api/member/*',
            'events' => '/api/event/*'
        ]
    ]);
    exit;
}

// 404 for everything else
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found', 'path' => $uri]);
