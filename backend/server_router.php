<?php
// Parse the URI
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If the file exists, serve it directly
if ($path !== '/' && file_exists(__DIR__ . $path)) {
    return false;
}

// Prepare $_GET['request'] for index.php
$_GET['request'] = ltrim($path, '/');

// Also ensure query string works if appended
if (isset($_SERVER['QUERY_STRING'])) {
    parse_str($_SERVER['QUERY_STRING'], $queryParams);
    $_GET = array_merge($_GET, $queryParams);
}

// Route to index.php
require_once __DIR__ . '/index.php';
