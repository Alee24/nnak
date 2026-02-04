<?php
/**
 * Membership Type Controller
 * Handles membership type management
 */

class MembershipController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $id = $parts[0] ?? '';
        
        if (empty($id)) {
            // /api/membership - list or create
            switch ($method) {
                case 'GET':
                    $this->listTypes();
                    break;
                case 'POST':
                    $this->createType();
                    break;
                default:
                    $this->methodNotAllowed();
            }
        } else {
            // /api/membership/:id - update or delete
            switch ($method) {
                case 'GET':
                    $this->getType($id);
                    break;
                case 'PUT':
                    $this->updateType($id);
                    break;
                case 'DELETE':
                    $this->deleteType($id);
                    break;
                default:
                    $this->methodNotAllowed();
            }
        }
    }
    
    private function listTypes() {
        try {
            $showAll = isset($_GET['all']) && $this->isAdmin();
            
            $query = "SELECT * FROM membership_types";
            if (!$showAll) {
                $query .= " WHERE is_active = 1";
            }
            $query .= " ORDER BY display_order, name";
            
            $stmt = $this->db->query($query);
            $types = $stmt->fetchAll();
            
            $this->sendResponse(200, ['membership_types' => $types]);
            
        } catch (PDOException $e) {
            error_log("List membership types error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve membership types']);
        }
    }
    
    private function getType($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM membership_types WHERE id = ?");
            $stmt->execute([$id]);
            $type = $stmt->fetch();
            
            if (!$type) {
                $this->sendResponse(404, ['error' => 'Membership type not found']);
            }
            
            $this->sendResponse(200, ['membership_type' => $type]);
            
        } catch (PDOException $e) {
            error_log("Get membership type error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve membership type']);
        }
    }
    
    private function createType() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        $data = $this->getJsonInput();
        
        if (empty($data['name']) || !isset($data['price'])) {
            $this->sendResponse(400, ['error' => 'Name and price are required']);
        }
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO membership_types (
                    name, description, price, currency, duration_type, 
                    duration_months, benefits, max_events, display_order
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'],
                $data['description'] ?? null,
                $data['price'],
                $data['currency'] ?? 'KES',
                $data['duration_type'] ?? 'annual',
                $data['duration_months'] ?? 12,
                $data['benefits'] ?? null,
                $data['max_events'] ?? null,
                $data['display_order'] ?? 0
            ]);
            
            $id = $this->db->lastInsertId();
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Membership type created successfully',
                'id' => $id
            ]);
            
        } catch (PDOException $e) {
            error_log("Create membership type error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to create membership type']);
        }
    }
    
    private function updateType($id) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        $data = $this->getJsonInput();
        
        try {
            $allowedFields = [
                'name', 'description', 'price', 'currency', 'duration_type',
                'duration_months', 'benefits', 'max_events', 'is_active', 'display_order'
            ];
            
            $updates = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($updates)) {
                $this->sendResponse(400, ['error' => 'No valid fields to update']);
            }
            
            $params[] = $id;
            $updateClause = implode(', ', $updates);
            
            $stmt = $this->db->prepare("
                UPDATE membership_types 
                SET $updateClause, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $stmt->execute($params);
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Membership type updated successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log("Update membership type error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update membership type']);
        }
    }
    
    private function deleteType($id) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        try {
            $stmt = $this->db->prepare("DELETE FROM membership_types WHERE id = ?");
            $stmt->execute([$id]);
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Membership type deleted successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log("Delete membership type error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to delete membership type']);
        }
    }
    
    private function isAdmin() {
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
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
