<?php
/**
 * API Bridge
 * Forwards requests to the actual backend logic
 */

// Enable error reporting for debugging bridge issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

$actualBackend = __DIR__ . '/../../../backend/index.php';

if (!file_exists($actualBackend)) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'error' => 'Backend Not Found',
        'message' => 'The API bridge could not find the backend logic at ' . realpath($actualBackend),
        'bridge_path' => __DIR__
    ]);
    exit();
}

require_once $actualBackend;
