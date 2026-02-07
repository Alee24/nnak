<?php
/**
 * Contact Controller
 * Handles contact form submissions and message management
 */

class ContactController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? null;
        $id = $parts[1] ?? null;

        if ($method === 'POST' && $action === 'submit') {
            $this->submitMessage();
        } elseif ($method === 'GET' && $action === 'messages') {
            $this->requireAdmin();
            $this->getMessages();
        } elseif ($method === 'POST' && $action === 'read' && $id) {
            $this->requireAdmin();
            $this->markAsRead($id);
        } elseif ($method === 'GET' && $action === 'unread-count') {
            $this->requireAdmin();
            $this->getUnreadCount();
        } else {
            $this->methodNotAllowed();
        }
    }

    // Public: Submit a contact message
    private function submitMessage() {
        $data = $this->getJsonInput();
        
        if (empty($data['name']) || empty($data['email']) || empty($data['subject']) || empty($data['message'])) {
            $this->sendResponse(400, ['error' => 'All fields are required']);
        }

        try {
            $stmt = $this->db->prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['name'],
                $data['email'],
                $data['subject'],
                $data['message']
            ]);
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Message sent successfully. We will get back to you soon.'
            ]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to send message']);
        }
    }

    // Admin: Get all messages
    private function getMessages() {
        try {
            $stmt = $this->db->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->sendResponse(200, [
                'success' => true,
                'messages' => $messages
            ]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to fetch messages']);
        }
    }

    // Admin: Mark message as read
    private function markAsRead($id) {
        try {
            $stmt = $this->db->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
            $stmt->execute([$id]);
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Message marked as read'
            ]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to update message status']);
        }
    }

    // Admin: Get unread message count
    private function getUnreadCount() {
        try {
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(200, [
                'success' => true,
                'count' => (int)$result['count']
            ]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to fetch unread count']);
        }
    }

    private function requireAdmin() {
        if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'super_admin'])) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
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
