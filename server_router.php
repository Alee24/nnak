<?php
// PHP Built-in Server Router for NNAK Project
// Serves static files from frontend/public and API from backend

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// 1. Handle API Requests
if (strpos($uri, '/api') === 0) {
    // Ensure we handle /api vs /api/
    $requestPath = substr($uri, 1);
    if ($requestPath === 'api') $requestPath = 'api/';
    
    // Set query parameter expected by backend/index.php
    $_GET['request'] = $requestPath;
    
    // Change directory to backend so its relative includes work
    chdir(__DIR__ . '/backend');
    
    // Execute the backend
    require 'index.php';
    return true;
}

// Handle Setup Scripts
if ($uri === '/setup_admin.php' || $uri === '/run_migrations.php' || $uri === '/cleanup_db.php' || $uri === '/debug_list_members.php' || $uri === '/verify_system.php' || $uri === '/add_missing_columns.php' || $uri === '/setup_database.php') {
    chdir(__DIR__ . '/backend');
    require basename($uri);
    return true;
}

// 2. Handle Static Files from frontend/public
// If URI is "/" redirect to members page
if ($uri === '/' || $uri === '/index.php' || $uri === '/index.html') {
    header('Location: /pages/members.html');
    exit;
}

$publicDir = __DIR__ . '/frontend/public';
$filePath = $publicDir . $uri;

if (file_exists($filePath) && !is_dir($filePath)) {
    // Determine MIME type
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimes = [
        'css' => 'text/css',
        'js' => 'application/javascript',
        'html' => 'text/html',
        'png' => 'image/png',
        'jpg' => 'image/jpeg',
        'svg' => 'image/svg+xml',
        'json' => 'application/json',
        'ico'  => 'image/x-icon'
    ];
    $contentType = $mimes[$ext] ?? 'text/plain';
    
    header("Content-Type: $contentType");
    readfile($filePath);
    return true;
}

// 3. Fallback / 404
http_response_code(404);
echo "404 Not Found - File: " . htmlspecialchars($uri);
