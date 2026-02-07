<?php
class DashboardController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        if ($method === 'GET') {
            $this->getStats();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
    }

    private function getStats() {
        try {
            // Total members
            $stmt = $this->db->query("SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL");
            $totalMembers = $stmt->fetch()['count'];

            // Status counts
            $stmt = $this->db->query("
                SELECT status, COUNT(*) as count 
                FROM members 
                WHERE deleted_at IS NULL 
                GROUP BY status
            ");
            $statusCounts = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

            // Recent members
            $stmt = $this->db->query("
                SELECT id, first_name, last_name, status, join_date 
                FROM members 
                WHERE deleted_at IS NULL 
                ORDER BY created_at DESC 
                LIMIT 5
            ");
            $recentMembers = $stmt->fetchAll();

            echo json_encode([
                'success' => true,
                'stats' => [
                    'total_members' => $totalMembers,
                    'active' => $statusCounts['active'] ?? 0,
                    'suspended' => $statusCounts['suspended'] ?? 0,
                    'pending' => $statusCounts['pending'] ?? 0,
                    'inactive' => $statusCounts['inactive'] ?? 0,
                ],
                'recent_members' => $recentMembers
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
        }
    }
}
?>
