<?php
/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

class AuthController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';
        
        switch ($action) {
            case 'register':
                if ($method === 'POST') {
                    $this->register();
                } else {
                    $this->methodNotAllowed();
                }
                break;
                
            case 'login':
                if ($method === 'POST') {
                    $this->login();
                } else {
                    $this->methodNotAllowed();
                }
                break;

            case 'verify-otp':
                if ($method === 'POST') {
                    $this->verifyOtp();
                } else {
                    $this->methodNotAllowed();
                }
                break;
                
            case 'logout':
                if ($method === 'POST') {
                    $this->logout();
                } else {
                    $this->methodNotAllowed();
                }
                break;
                
            case 'profile':
                if ($method === 'GET') {
                    $this->getProfile();
                } else {
                    $this->methodNotAllowed();
                }
                break;

            case 'change-password':
                if ($method === 'POST') {
                    $this->changePassword();
                } else {
                    $this->methodNotAllowed();
                }
                break;
                
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function changePassword() {
        if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Not authenticated']);
        }

        $data = $this->getJsonInput();
        
        if (empty($data['current_password']) || empty($data['new_password'])) {
            $this->sendResponse(400, ['error' => 'Current and new password are required']);
        }
        
        if (strlen($data['new_password']) < 6) {
            $this->sendResponse(400, ['error' => 'New password must be at least 6 characters']);
        }

        try {
            // Get current user password hash
            $stmt = $this->db->prepare("SELECT password_hash FROM members WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($data['current_password'], $user['password_hash'])) {
                $this->sendResponse(401, ['error' => 'Incorrect current password']);
            }

            // Update password
            $newHash = password_hash($data['new_password'], PASSWORD_DEFAULT);
            $updateStmt = $this->db->prepare("UPDATE members SET password_hash = ? WHERE id = ?");
            $updateStmt->execute([$newHash, $_SESSION['user_id']]);

            $this->sendResponse(200, ['success' => true, 'message' => 'Password updated successfully']);

        } catch (PDOException $e) {
            error_log("Change password error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update password']);
        }
    }
    
    private function register() {
        $data = $this->getJsonInput();
        
        // Validate required fields
        $required = ['email', 'password', 'first_name', 'last_name', 'phone'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $this->sendResponse(400, ['error' => "Field '$field' is required"]);
            }
        }
        
        // Validate email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $this->sendResponse(400, ['error' => 'Invalid email format']);
        }
        
        // Validate password strength
        if (strlen($data['password']) < 6) {
            $this->sendResponse(400, ['error' => 'Password must be at least 6 characters']);
        }
        
        try {
            // Normalize data casing
            Normalization::normalizeMemberData($data);

            // Check if email already exists
            $stmt = $this->db->prepare("SELECT id FROM members WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                $this->sendResponse(409, ['error' => 'Email already registered']);
            }
            
            // Generate unique member ID
            $memberId = $this->generateMemberId();
            
            // Hash password
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Insert member
            $stmt = $this->db->prepare("
                INSERT INTO members (
                    member_id, email, password_hash, first_name, last_name, phone,
                    date_of_birth, gender, address_line1, city, state, postal_code,
                    membership_type_id, status, join_date, occupation, organization,
                    qualifications, personal_number, registration_number, chapter, county, 
                    sub_county, id_number, designation, work_station, cadre, employment_status,
                    is_signed, signature_date, profile_picture
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $memberId,
                $data['email'],
                $passwordHash,
                $data['first_name'],
                $data['last_name'],
                $data['phone'],
                $data['date_of_birth'] ?? null,
                $data['gender'] ?? null,
                $data['address_line1'] ?? null,
                $data['city'] ?? null,
                $data['state'] ?? null,
                $data['postal_code'] ?? null,
                $data['membership_type_id'] ?? null,
                $data['occupation'] ?? null,
                $data['organization'] ?? null,
                $data['qualifications'] ?? null,
                $data['personal_number'] ?? null,
                $data['registration_number'] ?? null,
                $data['chapter'] ?? null,
                $data['county'] ?? null,
                $data['sub_county'] ?? null,
                $data['id_number'] ?? null,
                $data['designation'] ?? null,
                $data['work_station'] ?? null,
                $data['cadre'] ?? null,
                $data['employment_status'] ?? null,
                isset($data['is_signed']) ? (int)$data['is_signed'] : 0,
                $data['signature_date'] ?? null,
                $data['profile_picture'] ?? null
            ]);
            
            $userId = $this->db->lastInsertId();
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Registration successful',
                'member_id' => $memberId,
                'user_id' => $userId
            ]);
            
        } catch (PDOException $e) {
            error_log("Registration error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Registration failed. Please try again.']);
        }
    }
    
    private function login() {
        $data = $this->getJsonInput();
        
        if (empty($data['email']) || empty($data['password'])) {
            $this->sendResponse(400, ['error' => 'Email and password are required']);
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT id, member_id, email, password_hash, first_name, last_name, 
                       role, status, membership_type_id
                FROM members 
                WHERE email = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                $this->sendResponse(401, ['error' => 'Invalid email or password']);
            }
            
            if (!password_verify($data['password'], $user['password_hash'])) {
                $this->sendResponse(401, ['error' => 'Invalid email or password']);
            }
            
            if ($user['status'] === 'suspended') {
                $this->sendResponse(403, ['error' => 'Account suspended. Please contact support.']);
            }
            
            // OTP IMPLEMENTATION: Start two-step flow
            // Store user data temporarily in session
            unset($user['password_hash']);
            $_SESSION['pending_user'] = $user;
            
            $this->sendResponse(200, [
                'success' => true,
                'otp_required' => true,
                'message' => 'OTP verification required',
                'email' => $user['email']
            ]);
            
        } catch (PDOException $e) {
            error_log("Login error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Login failed. Please try again.']);
        }
    }

    private function verifyOtp() {
        $data = $this->getJsonInput();
        
        if (empty($data['otp'])) {
            $this->sendResponse(400, ['error' => 'OTP is required']);
        }
        
        if ($data['otp'] !== '2424') {
            $this->sendResponse(401, ['error' => 'Invalid OTP code']);
        }
        
        if (!isset($_SESSION['pending_user'])) {
            $this->sendResponse(401, ['error' => 'Session expired. Please login again.']);
        }
        
        $user = $_SESSION['pending_user'];
        
        // Create full secure session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['member_id'] = $user['member_id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['login_time'] = time();
        
        // Clean up pending state
        unset($_SESSION['pending_user']);
        
        $this->sendResponse(200, [
            'success' => true,
            'message' => 'OTP verified successfully',
            'user' => $user
        ]);
    }
    
    private function logout() {
        session_destroy();
        $this->sendResponse(200, [
            'success' => true,
            'message' => 'Logout successful'
        ]);
    }
    
    private function getProfile() {
        if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Not authenticated']);
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT m.*, mt.name as membership_type_name
                FROM members m
                LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
                WHERE m.id = ? AND m.deleted_at IS NULL
            ");
            $stmt->execute([$_SESSION['user_id']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                $this->sendResponse(404, ['error' => 'User not found']);
            }
            
            unset($user['password_hash']);
            
            $this->sendResponse(200, ['user' => $user]);
            
        } catch (PDOException $e) {
            error_log("Get profile error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve profile']);
        }
    }
    
    private function generateMemberId() {
        $year = date('Y');
        $prefix = "NNAK{$year}";
        
        // Get the last member ID for this year
        $stmt = $this->db->prepare("
            SELECT member_id FROM members 
            WHERE member_id LIKE ? 
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute(["{$prefix}%"]);
        $lastId = $stmt->fetchColumn();
        
        if ($lastId) {
            $number = intval(substr($lastId, -4)) + 1;
        } else {
            $number = 1;
        }
        
        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
    
    private function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
    
    private function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    private function sendResponse($statusCode, $data) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
