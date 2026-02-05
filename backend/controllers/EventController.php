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
        if ($parts[0] === 'image') {
            // Public access for images
            $this->serveImage();
            return;
        }

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
                $sql .= " AND event_date >= CURRENT_DATE()";
            } elseif ($status === 'past') {
                $sql .= " AND event_date < CURRENT_DATE()";
            }
            
            $sql .= " ORDER BY event_date ASC";
            
            $stmt = $this->db->query($sql);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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

        // Use $_POST for Multipart/Form-Data
        $title = $_POST['title'] ?? '';
        $date = $_POST['date'] ?? '';
        $time = $_POST['time'] ?? null;
        $location = $_POST['location'] ?? '';
        $description = $_POST['description'] ?? '';
        $fee = $_POST['fee'] ?? 0;
        $cpd_points = $_POST['cpd_points'] ?? 0;

        // Validation
        if (empty($title) || empty($date)) {
            $this->sendResponse(400, ['error' => 'Title and Date are required']);
        }

        // Handle Image Upload
        $imageUrl = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../frontend/public/uploads/events/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileExt = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            
            if (in_array($fileExt, $allowed)) {
                $fileName = uniqid('event_') . '.' . $fileExt;
                $targetFile = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
                    // Relative path for frontend
                    $imageUrl = 'uploads/events/' . $fileName;
                }
            }
        }

        try {
            $sql = "INSERT INTO events (title, description, event_date, event_time, location, fee, cpd_points, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $this->db->prepare($sql);
            
            $stmt->execute([
                $title,
                $description,
                $date,
                $time,
                $location,
                $fee,
                $cpd_points,
                $imageUrl
            ]);
            
            $id = $this->db->lastInsertId();
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Event created successfully',
                'id' => $id,
                'image_url' => $imageUrl
            ]);
            
        } catch (PDOException $e) {
            error_log("Create event error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to create event: ' . $e->getMessage()]);
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

    private function serveImage() {
        $path = $_GET['path'] ?? '';
        
        // Security check: only allow images from uploads/events
        if (empty($path) || strpos($path, 'uploads/events/') === false || strpos($path, '..') !== false) {
            header("HTTP/1.0 404 Not Found");
            exit;
        }
        
        $fullPath = __DIR__ . '/../../frontend/public/' . $path;
        
        if (file_exists($fullPath)) {
            $mime = mime_content_type($fullPath);
            header('Content-Type: ' . $mime);
            readfile($fullPath);
            exit;
        }
        
        header("HTTP/1.0 404 Not Found");
        exit;
    }

    // Helpers (Could be in a BaseController)
    private function isAuthenticated() {
        return isset($_SESSION['user_id']); // Assuming session auth from MemberController logic
    }
    
    private function isAdmin() {
        // Assuming session role check
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
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
