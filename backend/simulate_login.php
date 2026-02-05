<?php
// Fully simulate index.php and AuthController login
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['request'] = 'api/auth/login';

// Mock input
$mockInput = json_encode(['email' => 'mettoalex@gmail.com', 'password' => 'password123']);
$tempFile = tempnam(sys_get_temp_dir(), 'php_input');
file_put_contents($tempFile, $mockInput);

// We need to override get_contents('php://input') which is impossible in pure PHP.
// But we can override the getJsonInput function if we were in the class.

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

// Check for any output so far
if (ob_get_length() > 0) {
    echo "Output already sent: [" . ob_get_contents() . "]\n";
}

try {
    session_start();
    echo "Session started successfully\n";
} catch (Exception $e) {
    echo "Session failed: " . $e->getMessage() . "\n";
}

require_once __DIR__ . '/controllers/AuthController.php';

$auth = new AuthController();
// Use reflection to call private login()
$reflection = new ReflectionClass('AuthController');
$method = $reflection->getMethod('login');
$method->setAccessible(true);

// Mocking php://input is still the issue. Let's patch getJsonInput temporarily for this test.
// Actually, let's just use the direct logic from AuthController.login but with data.

class TestAuthController extends AuthController {
    public function testLogin($data) {
        $db = Database::getInstance()->getConnection();
        
        try {
            $stmt = $db->prepare("
                SELECT id, member_id, email, password_hash, first_name, last_name, 
                       role, status, membership_type_id
                FROM members 
                WHERE email = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                echo "User not found\n";
                return;
            }
            
            echo "User found, verifying password...\n";
            if (!password_verify($data['password'], $user['password_hash'])) {
                echo "Invalid password\n";
                return;
            }
            
            echo "Login success!\n";
            print_r($user);
            
        } catch (Exception $e) {
            echo "Error: " . $e->getMessage() . "\n";
        }
    }
}

$testAuth = new TestAuthController();
$testAuth->testLogin(['email' => 'mettoalex@gmail.com', 'password' => 'password123']);
