<?php
/**
 * Database Setup Helper
 * This script checks if the database exists and creates it if needed
 */

// Database connection parameters
$host = '127.0.0.1';
$user = 'root';
$pass = '';
$dbname = 'nnak_db';

try {
    // First, connect without selecting a database
    $conn = new PDO("mysql:host=$host", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if database exists
    $stmt = $conn->query("SHOW DATABASES LIKE '$dbname'");
    $dbExists = $stmt->rowCount() > 0;
    
    if (!$dbExists) {
        // Create the database
        $conn->exec("CREATE DATABASE `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo json_encode([
            'success' => true,
            'message' => "Database '$dbname' created successfully"
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'message' => "Database '$dbname' already exists"
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database setup failed',
        'message' => $e->getMessage()
    ]);
}
