<?php
/**
 * Notification Controller
 * In-app notifications, unread counts, broadcast, reminders, templates
 */

class NotificationController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'unread-count') {
            if ($method === 'GET') $this->getUnreadCount();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'read-all') {
            if ($method === 'PUT') $this->markAllRead();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'broadcast') {
            if ($method === 'POST') $this->broadcast();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'templates') {
            if ($method === 'GET') $this->getTemplates();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'membership-reminders') {
            if ($method === 'POST') $this->triggerReminders();
            else $this->methodNotAllowed();
            return;
        }

        if (numeric_id($action)) {
            $id = (int)$action;
            $sub = $parts[1] ?? '';
            if ($sub === 'read') {
                if ($method === 'PUT') $this->markRead($id);
                else $this->methodNotAllowed();
            } else {
                $this->sendResponse(404, ['error' => 'Action not found']);
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listNotifications();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listNotifications() {
        $pag = Auth::paginate($_GET);
        $userId = Auth::userId();

        $stmt = $this->db->prepare("
            SELECT * FROM notifications
            WHERE (member_id = ? OR member_id IS NULL)
            ORDER BY id DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute([$userId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getUnreadCount() {
        $userId = Auth::userId();
        $stmt = $this->db->prepare("SELECT COUNT(*) FROM notifications WHERE (member_id = ? OR member_id IS NULL) AND is_read = 0");
        $stmt->execute([$userId]);
        $this->sendResponse(200, ['success' => true, 'count' => (int)$stmt->fetchColumn()]);
    }

    private function markRead($id) {
        $userId = Auth::userId();
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND (member_id = ? OR member_id IS NULL)");
        $stmt->execute([$id, $userId]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Notification marked as read']);
    }

    private function markAllRead() {
        $userId = Auth::userId();
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE (member_id = ? OR member_id IS NULL) AND is_read = 0");
        $stmt->execute([$userId]);
        $this->sendResponse(200, ['success' => true, 'message' => 'All notifications marked as read']);
    }

    private function broadcast() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("
            INSERT INTO notifications (member_id, title, message, type, category, created_by)
            VALUES (NULL, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['title'],
            $data['message'],
            $data['type'] ?? 'info',
            $data['category'] ?? 'general',
            Auth::userId()
        ]);

        $this->sendResponse(201, ['success' => true, 'message' => 'Broadcast notification sent']);
    }

    private function getTemplates() {
        $stmt = $this->db->prepare("SELECT * FROM communication_templates WHERE is_active = 1 ORDER BY name ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function triggerReminders() {
        Auth::requireAdmin();
        // Insert expiration reminders for members expiring in 30 days
        $stmt = $this->db->prepare("
            INSERT INTO notifications (member_id, title, message, type, category)
            SELECT id, 'Membership Renewal Reminder', 'Your membership is due to expire soon. Please contact the office to renew.', 'warning', 'membership'
            FROM members WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) AND status = 'active'
        ");
        $stmt->execute();
        $count = $stmt->rowCount();

        $this->sendResponse(200, ['success' => true, 'message' => "Generated $count membership reminders"]);
    }

    private function sendResponse($code, $data) {
        http_response_code($code);
        echo json_encode($data);
        exit();
    }

    private function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
