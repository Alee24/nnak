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
        if (($parts[0] ?? '') === 'image') {
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
            $subAction = $parts[1] ?? '';

            if ($subAction === 'attendees') {
                if ($method === 'GET') {
                    $this->getEventAttendees($id);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'attendance') {
                if ($method === 'POST') {
                    $this->toggleAttendance($id);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'invite-all') {
                if ($method === 'POST') {
                    $this->inviteAllMembers($id);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'respond') {
                if ($method === 'POST') {
                    $this->respondToInvite($id);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($method === 'POST' || $method === 'PUT') {
                // Support POST for multipart updates (images)
                $this->updateEvent($id);
            } elseif ($method === 'DELETE') {
                $this->deleteEvent($id);
            } elseif ($method === 'GET') {
                $this->getEvent($id);
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
        $type = $_POST['type'] ?? 'General';

        // Validation
        if (empty($title) || empty($date)) {
            $this->sendResponse(400, ['error' => 'Title and Date are required']);
        }

        // Handle Image Upload
        $imageUrl = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            try {
                $uploadDir = __DIR__ . '/../../frontend/public/uploads/events/';
                if (!is_dir($uploadDir)) {
                    if (!mkdir($uploadDir, 0777, true)) {
                        error_log("Failed to create upload directory: $uploadDir");
                    }
                }
                
                $fileExt = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                if (in_array($fileExt, $allowed)) {
                    $fileName = uniqid('event_') . '.' . $fileExt;
                    $targetFile = $uploadDir . $fileName;
                    
                    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFile)) {
                        // Relative path for frontend
                        $imageUrl = 'uploads/events/' . $fileName;
                    } else {
                        error_log("Failed to move uploaded file to $targetFile");
                    }
                }
            } catch (Throwable $e) {
                error_log("Image upload error: " . $e->getMessage());
            }
        }

        try {
            $sql = "INSERT INTO events (title, description, event_date, event_time, location, type, fee, cpd_points, image_url, created_by, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $this->db->prepare($sql);
            
            $stmt->execute([
                $title,
                $description,
                $date,
                $time,
                $location,
                $type,
                $fee,
                $cpd_points,
                $imageUrl,
                $_SESSION['user_id'] ?? null
            ]);
            
            $id = $this->db->lastInsertId();
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Event created successfully',
                'id' => $id,
                'image_url' => $imageUrl
            ]);
            
        } catch (Throwable $e) {
            error_log("Create event error: " . $e->getMessage());
            error_log("Trace: " . $e->getTraceAsString());
            $this->sendResponse(500, [
                'error' => 'Failed to create event',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
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
    
    /**
     * Mark member as attended and award CPD points
     */
    private function toggleAttendance($eventId) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $data = $this->getJsonInput();
        $memberId = $data['member_id'] ?? null;
        $status = $data['status'] ?? 'attended'; // attended, registered

        if (!$memberId) {
            $this->sendResponse(400, ['error' => 'Member ID is required']);
        }

        try {
            // Start transaction
            $this->db->beginTransaction();

            // 1. Get event details (to know points)
            $stmt = $this->db->prepare("SELECT title, cpd_points FROM events WHERE id = ?");
            $stmt->execute([$eventId]);
            $event = $stmt->fetch();

            if (!$event) {
                throw new Exception('Event not found');
            }

            // 2. Upsert attendance record
            $sql = "INSERT INTO event_attendance (event_id, member_id, status, attended_at) 
                    VALUES (?, ?, ?, NOW()) 
                    ON DUPLICATE KEY UPDATE status = VALUES(status), attended_at = NOW()";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$eventId, $memberId, $status]);

            // 3. Award points if status is 'attended' and not already awarded
            if ($status === 'attended') {
                // Check if already awarded for this event
                $stmt = $this->db->prepare("SELECT id FROM cpd_points WHERE member_id = ? AND event_id = ?");
                $stmt->execute([$memberId, $eventId]);
                if (!$stmt->fetch()) {
                    // Award points
                    $points = intval($event['cpd_points']);
                    if ($points > 0) {
                        // Insert CPD record
                        $sql = "INSERT INTO cpd_points (member_id, event_id, points, activity_type, description, awarded_by, awarded_date)
                                VALUES (?, ?, ?, 'Event Attendance', ?, ?, CURDATE())";
                        $stmt = $this->db->prepare($sql);
                        $stmt->execute([
                            $memberId,
                            $eventId,
                            $points,
                            "Attended: " . $event['title'],
                            $_SESSION['user_id']
                        ]);

                        // Update member total
                        $sql = "UPDATE members SET total_cpd_points = COALESCE(total_cpd_points, 0) + ? WHERE id = ?";
                        $stmt = $this->db->prepare($sql);
                        $stmt->execute([$points, $memberId]);
                        
                        $stmt = $this->db->prepare("UPDATE event_attendance SET points_awarded = 1 WHERE event_id = ? AND member_id = ?");
                        $stmt->execute([$eventId, $memberId]);

                        // Log interaction
                        $this->addInteraction($memberId, 'CPD_AWARD', "Auto-awarded $points points for attending: " . $event['title']);
                    }
                }
            }

            $this->db->commit();
            $this->sendResponse(200, ['success' => true, 'message' => 'Attendance updated successfully']);

        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendResponse(500, ['error' => $e->getMessage()]);
        }
    }

    private function getEventAttendees($eventId) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            $sql = "SELECT ea.*, m.first_name, m.last_name, m.member_id as membership_number, m.email
                    FROM event_attendance ea
                    JOIN members m ON ea.member_id = m.id
                    WHERE ea.event_id = ?
                    ORDER BY ea.created_at DESC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$eventId]);
            $attendees = $stmt->fetchAll();

            $this->sendResponse(200, ['attendees' => $attendees]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to fetch attendees']);
        }
    }

    private function getEvent($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM events WHERE id = ? AND deleted_at IS NULL");
            $stmt->execute([$id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$event) {
                $this->sendResponse(404, ['error' => 'Event not found']);
            }

            $this->sendResponse(200, ['event' => $event]);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to retrieve event']);
        }
    }

    private function updateEvent($id) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        // Use $_POST for Multipart/Form-Data (even for updates)
        $title = $_POST['title'] ?? '';
        $date = $_POST['date'] ?? '';
        $time = $_POST['time'] ?? null;
        $location = $_POST['location'] ?? '';
        $description = $_POST['description'] ?? '';
        $fee = $_POST['fee'] ?? 0;
        $cpd_points = $_POST['cpd_points'] ?? 0;
        $type = $_POST['type'] ?? 'General';
        $status = $_POST['status'] ?? 'published';

        if (empty($title) || empty($date)) {
            $this->sendResponse(400, ['error' => 'Title and Date are required']);
        }

        // Handle Image Upload if provided
        $imageUrl = $_POST['existing_image'] ?? null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            try {
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
                        $imageUrl = 'uploads/events/' . $fileName;
                    }
                }
            } catch (Throwable $e) {
                error_log("Image upload update error: " . $e->getMessage());
            }
        }

        try {
            $sql = "UPDATE events SET 
                    title = ?, description = ?, event_date = ?, event_time = ?, 
                    location = ?, type = ?, fee = ?, cpd_points = ?, image_url = ?, status = ?
                    WHERE id = ? AND deleted_at IS NULL";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                $title, $description, $date, $time, 
                $location, $type, $fee, $cpd_points, $imageUrl, $status,
                $id
            ]);

            $this->sendResponse(200, ['success' => true, 'message' => 'Event updated successfully']);
        } catch (PDOException $e) {
            error_log("Update event error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update event']);
        }
    }

    private function inviteAllMembers($eventId) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            // Check if event exists
            $stmt = $this->db->prepare("SELECT id FROM events WHERE id = ? AND deleted_at IS NULL");
            $stmt->execute([$eventId]);
            if (!$stmt->fetch()) {
                $this->sendResponse(404, ['error' => 'Event not found']);
            }

            // Fetch all active members
            $stmt = $this->db->query("SELECT id FROM members WHERE status = 'active' AND deleted_at IS NULL AND role = 'member'");
            $members = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if (empty($members)) {
                $this->sendResponse(200, ['success' => true, 'message' => 'No active members to invite', 'invited_count' => 0]);
            }

            // Insert into event_attendance with 'invited' status
            // Use INSERT IGNORE to skip existing records
            $sql = "INSERT IGNORE INTO event_attendance (event_id, member_id, status) VALUES (?, ?, 'invited')";
            $stmt = $this->db->prepare($sql);
            
            $invitedCount = 0;
            foreach ($members as $memberId) {
                $stmt->execute([$eventId, $memberId]);
                if ($stmt->rowCount() > 0) {
                    $invitedCount++;
                }
            }

            $this->sendResponse(200, [
                'success' => true, 
                'message' => "Successfully invited $invitedCount new members",
                'invited_count' => $invitedCount
            ]);

        } catch (PDOException $e) {
            error_log("Invite all members error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to invite members']);
        }
    }

    private function respondToInvite($eventId) {
        // Members respond to invitations
        if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Authentication required']);
        }

        $data = $this->getJsonInput();
        $response = $data['response'] ?? ''; // 'registered' (accept) or 'rejected'
        $memberId = $_SESSION['user_id'];

        if (!in_array($response, ['registered', 'rejected'])) {
            $this->sendResponse(400, ['error' => 'Invalid response status']);
        }

        try {
            $sql = "INSERT INTO event_attendance (event_id, member_id, status) 
                    VALUES (?, ?, ?) 
                    ON DUPLICATE KEY UPDATE status = VALUES(status)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$eventId, $memberId, $response]);

            $this->sendResponse(200, [
                'success' => true, 
                'message' => $response === 'registered' ? 'Invite accepted' : 'Invite rejected',
                'status' => $response
            ]);

        } catch (PDOException $e) {
            error_log("Respond to invite error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update response']);
        }
    }

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

    private function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true);
    }
    
    private function addInteraction($memberId, $type, $desc) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO member_interactions (member_id, action_type, description, performed_by)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$memberId, $type, $desc, $_SESSION['user_id'] ?? null]);
        } catch (Exception $e) {
            error_log("Failed to log interaction: " . $e->getMessage());
        }
    }
}

