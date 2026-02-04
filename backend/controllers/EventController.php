<?php
/**
 * Event Controller
 * Handles event management operations
 */

class EventController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';
        
        // Publicly accessible for now, or check auth if needed
        // For admin events, we probably want auth.
         if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Authentication required']);
        }
        
        if (empty($action)) {
            // /api/event
            if ($method === 'GET') {
                $this->listEvents();
            } elseif ($method === 'POST') {
                $this->createEvent();
            } else {
                $this->methodNotAllowed();
            }
        } else {
            // /api/event/:id
            $id = $action;
            if ($method === 'DELETE') {
                $this->deleteEvent($id);
            } else {
                $this->methodNotAllowed();
            }
        }
    }

    private function listEvents() {
        try {
            $status = $_GET['status'] ?? 'all';
            
            $sql = "SELECT * FROM events WHERE deleted_at IS NULL";
            if ($status === 'upcoming') {
                $sql .= " AND date >= CURRENT_DATE()";
            } elseif ($status === 'past') {
                $sql .= " AND date < CURRENT_DATE()";
            }
            
            $sql .= " ORDER BY date ASC";
            
            $stmt = $this->db->query($sql);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format for frontend if needed, but raw is usually fine
            // Maybe add calculated fields like is_upcoming
            
            $this->sendResponse(200, ['events' => $events]);
            
        } catch (PDOException $e) {
            error_log("List events error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve events']);
        }
    }

    private function createEvent() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $data = $this->getJsonInput();
        
        // Validation
        if (empty($data['title']) || empty($data['date'])) {
            $this->sendResponse(400, ['error' => 'Title and Date are required']);
        }

        try {
            $sql = "INSERT INTO events (title, description, date, time, location, type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            
            $stmt->execute([
                $data['title'],
                $data['description'] ?? '',
                $data['date'],
                $data['time'] ?? null,
                $data['location'] ?? '',
                $data['type'] ?? 'General',
                $_SESSION['user_id'] ?? 1 // Fallback or strict
            ]);
            
            $id = $this->db->lastInsertId();
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Event created successfully',
                'id' => $id
            ]);
            
        } catch (PDOException $e) {
            error_log("Create event error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to create event']);
        }
    }

    private function deleteEvent($id) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            $stmt = $this->db->prepare("UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                 $this->sendResponse(404, ['error' => 'Event not found']);
            }
            
            $this->sendResponse(200, ['success' => true, 'message' => 'Event deleted']);
            
        } catch (PDOException $e) {
            error_log("Delete event error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to delete event']);
        }
    }

    // Helpers (Could be in a BaseController)
    private function isAuthenticated() {
        return isset($_SESSION['user_id']); // Assuming session auth from MemberController logic
    }
    
    private function isAdmin() {
        // Assuming session role check
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
    }

    private function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    private function sendResponse($code, $data) {
        http_response_code($code);
        echo json_encode($data);
        exit;
    }
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
