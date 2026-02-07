<?php
/**
 * Settings Controller
 * Handles system settings and branding assets
 */

class SettingsController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';

        // Public settings available to all (logged in or not, though restricted for now)
        if ($action === 'public' && $method === 'GET') {
            $this->getPublicSettings();
            return;
        }

        // Check authentication for all other settings operations
        if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Authentication required']);
        }

        // Only admins can view full settings or update them
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        if ($method === 'GET') {
            $this->getSettings();
        } elseif ($method === 'POST') {
            $this->updateSettings();
        } else {
            $this->methodNotAllowed();
        }
    }

    private function getPublicSettings() {
        try {
            // Only select safe settings
            $safeKeys = [
                'association_name', 'association_tagline', 'system_logo', 'authorised_signature',
                'contact_email', 'contact_phone', 'contact_address', 'contact_map_url',
                'social_facebook', 'social_twitter', 'social_instagram', 'social_linkedin',
                'office_hours_weekdays', 'office_hours_saturday', 'office_hours_sunday',
                'mpesa_shortcode', 'mpesa_env', 'paypal_client_id', 'paypal_env',
                'stripe_publishable_key', 'stripe_env'
            ];
            
            $placeholders = implode(',', array_fill(0, count($safeKeys), '?'));
            $stmt = $this->db->prepare("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ($placeholders)");
            $stmt->execute($safeKeys);
            $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            $this->sendResponse(200, [
                'success' => true,
                'settings' => $settings
            ]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to fetch public settings']);
        }
    }

    private function getSettings() {
        try {
            $stmt = $this->db->query("SELECT setting_key, setting_value FROM settings");
            $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            $this->sendResponse(200, [
                'success' => true,
                'settings' => $settings
            ]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to fetch settings']);
        }
    }

    private function updateSettings() {
        $data = $this->getJsonInput();
        
        if (empty($data)) {
            $this->sendResponse(400, ['error' => 'No settings provided']);
        }

        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            
            foreach ($data as $key => $value) {
                $stmt->execute([$key, $value, $value]);
            }
            
            $this->db->commit();
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Settings updated successfully'
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendResponse(500, ['error' => 'Failed to update settings: ' . $e->getMessage()]);
        }
    }

    private function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
    
    private function isAdmin() {
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
    }
    
    private function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    
    private function sendResponse($code, $data) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
