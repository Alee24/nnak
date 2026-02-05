<?php
/**
 * CPD Controller
 * Handles CPD points management
 */

class CpdController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        // Auth check (temporarily disabled for testing if needed, but best to keep)
        if (!$this->isAdmin()) {
             $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        $action = $parts[0] ?? '';
        
        switch ($action) {
            case 'stats':
                $this->getStats();
                break;
            case 'award':
                $this->awardPoints();
                break;
            case 'history':
                $memberId = $parts[1] ?? null;
                $this->getHistory($memberId);
                break;
            case 'recent':
                $this->getRecentWithDetails();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Endpoint not found']);
        }
    }
    
    private function getStats() {
        try {
            // Total Points Awarded
            $stmt = $this->db->query("SELECT SUM(points) FROM cpd_points");
            $totalPoints = $stmt->fetchColumn() ?? 0;
            
            // Programs/Activities Count (Unique Descriptions or Count)
            $stmt = $this->db->query("SELECT COUNT(*) FROM cpd_points");
            $totalAwards = $stmt->fetchColumn();
            
            // Top Member (by total points)
            $stmt = $this->db->query("
                SELECT m.first_name, m.last_name, m.total_cpd_points
                FROM members m
                ORDER BY total_cpd_points DESC
                LIMIT 1
            ");
            $topMember = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(200, [
                'total_points' => $totalPoints,
                'total_awards' => $totalAwards,
                'top_member' => $topMember
            ]);
            
        } catch (PDOException $e) {
            error_log("CPD Stats Error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to fetch CPD stats']);
        }
    }
    
    private function awardPoints() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendResponse(405, ['error' => 'Method not allowed']);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['member_id']) || empty($data['points']) || empty($data['activity_type'])) {
            $this->sendResponse(400, ['error' => 'Missing required fields']);
        }
        
        try {
            $this->db->beginTransaction();
            
            // Insert CPD Record
            $stmt = $this->db->prepare("
                INSERT INTO cpd_points (member_id, points, activity_type, description, awarded_date, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([
                $data['member_id'],
                $data['points'],
                $data['activity_type'],
                $data['description'] ?? '',
                $data['awarded_date'] ?? date('Y-m-d')
            ]);
            
            // Update Member Total
            $stmt = $this->db->prepare("
                UPDATE members 
                SET total_cpd_points = total_cpd_points + ? 
                WHERE id = ?
            ");
            $stmt->execute([$data['points'], $data['member_id']]);
            
            $this->db->commit();
            $this->sendResponse(201, ['message' => 'CPD points awarded successfully']);
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            error_log("Award CPD Error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to award points ' . $e->getMessage()]);
        }
    }
    
    private function getHistory($memberId) {
        if (!$memberId) {
            $this->sendResponse(400, ['error' => 'Member ID required']);
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT * FROM cpd_points 
                WHERE member_id = ? 
                ORDER BY awarded_date DESC
            ");
            $stmt->execute([$memberId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->sendResponse(200, $history);
        } catch (PDOException $e) {
            $this->sendResponse(500, ['error' => 'Failed to fetch history']);
        }
    }

    private function getRecentWithDetails() {
         try {
            $stmt = $this->db->query("
                SELECT c.*, m.first_name, m.last_name, m.membership_number
                FROM cpd_points c
                JOIN members m ON c.member_id = m.id
                ORDER BY c.created_at DESC
                LIMIT 10
            ");
            $recent = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $this->sendResponse(200, $recent);
         } catch (PDOException $e) {
             error_log("CPD Recent Error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to fetch recent awards']);
         }
    }
    
    private function isAdmin() {
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
    }
    
    private function sendResponse($statusCode, $data) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
}
