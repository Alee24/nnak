<?php
// Force error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/plain');
echo "NNAK System Verification\n========================\n";

try {
    echo "1. Database Connection\n";
    $db = Database::getInstance()->getConnection();
    echo "[PASS] Connected to database: " . DB_NAME . "\n\n";

    // 2. Schema Check
    echo "2. Schema Verification (Table: members)\n";
    $stmt = $db->query("DESCRIBE members");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredColumns = [
        'id', 'member_id', 'email', 'first_name', 'last_name', 
        'phone', 'status', 'role', 'created_at', 'join_date',
        'registration_number', 'password_hash', 'qualifications',
        'personal_number', 'chapter', 'county', 'id_number', 'profile_image'
    ];
    
    $missing = array_diff($requiredColumns, $columns);
    
    if (empty($missing)) {
        echo "[PASS] All critical columns present.\n\n";
    } else {
        echo "[FAIL] Missing columns: " . implode(', ', $missing) . "\n\n";
    }
    
    echo "Current Columns:\n";
    foreach ($columns as $col) {
        echo "- $col\n";
    }
    echo "\n";

    // 3. Admin User Check
    echo "3. Admin User Check\n";
    $email = 'mettoalex@gmail.com';
    $stmt = $db->prepare("SELECT id, first_name, last_name, role, status FROM members WHERE email = ?");
    $stmt->execute([$email]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo "[PASS] Admin user found: {$admin['first_name']} {$admin['last_name']} ({$admin['email']})\n";
        echo "Role: {$admin['role']}, Status: {$admin['status']}\n\n";
    } else {
        echo "[FAIL] Admin user '$email' NOT found.\n\n";
    }

    // 4. API Simulation (List Members via SQL)
    echo "4. API Simulation (Direct SQL)\n";
    $sql = "
        SELECT m.id, m.member_id, m.email, m.first_name, m.last_name, 
               m.phone, m.status, m.role,
               m.created_at,
               m.registration_number, 'Member' as membership_type_name
        FROM members m
        WHERE m.deleted_at IS NULL
        ORDER BY m.created_at DESC
        LIMIT 5
    ";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "[PASS] Valid SQL Query execution.\n";
    echo "Found " . count($members) . " members (showing max 5).\n\n";
    
    // 5. Controller Test
    echo "5. Controller Instantiation Test\n";
    require_once __DIR__ . '/controllers/MemberController.php';
    if (class_exists('MemberController')) {
        echo "[PASS] MemberController class found.\n";
        try {
            // Mock Session for Admin
            if (session_status() === PHP_SESSION_NONE) session_start();
            $_SESSION['user_id'] = $admin['id'] ?? 1;
            $_SESSION['role'] = 'admin';
            
            $controller = new MemberController();
            echo "[PASS] MemberController instantiated successfully.\n";
            
            // Check if method exists
            if (method_exists($controller, 'handleRequest')) {
                echo "[PASS] handleRequest method exists.\n\n";
            } else {
                echo "[FAIL] handleRequest method MISSING.\n\n";
            }

        } catch (Throwable $e) {
            echo "[FAIL] Controller Crash: " . $e->getMessage() . "\n";
            echo $e->getTraceAsString() . "\n\n";
        }
    } else {
        echo "[FAIL] MemberController class NOT found.\n\n";
    }


    // 6. Log Write Test
    echo "6. Log Write Test\n";
    $logPath = __DIR__ . '/debug_log.txt';
    echo "Attempting to write to: $logPath\n";
    if (file_put_contents($logPath, "Test log entry " . date('Y-m-d H:i:s') . "\n", FILE_APPEND)) {
        echo "[PASS] Successfully wrote to log file.\n\n";
    } else {
        echo "[FAIL] Failed to write to log file. Permissions issue?\n\n";
    }
    flush();

    echo "7. PHP Configuration\n";
    echo "PHP Version: " . phpversion() . "\n";
    echo "Display Errors: " . ini_get('display_errors') . "\n";
    echo "Memory Limit: " . ini_get('memory_limit') . "\n";
    flush();

} catch (PDOException $e) {
    echo "\nDATABASE ERROR: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "\nSYSTEM ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
