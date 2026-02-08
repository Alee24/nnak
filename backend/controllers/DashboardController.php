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
            $res = $stmt->fetch();
            $totalMembers = $res ? $res['count'] : 0;

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
            $recentMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Growth calculation (this month vs last month)
            $thisMonthStmt = $this->db->query("SELECT COUNT(*) as count FROM members WHERE join_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01') AND deleted_at IS NULL");
            $resThis = $thisMonthStmt->fetch();
            $thisMonth = $resThis ? $resThis['count'] : 0;
            
            $lastMonthStmt = $this->db->query("SELECT COUNT(*) as count FROM members WHERE join_date >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND join_date < DATE_FORMAT(CURDATE(), '%Y-%m-01') AND deleted_at IS NULL");
            $resLast = $lastMonthStmt->fetch();
            $lastMonth = $resLast ? $resLast['count'] : 0;
            
            $growth = ($lastMonth > 0) ? (($thisMonth - $lastMonth) / $lastMonth) * 100 : 0;

            // Revenue summary
            $revStmt = $this->db->query("
                SELECT 
                    SUM(mt.price) as total_potential_revenue,
                    SUM(CASE WHEN m.status = 'active' THEN mt.price ELSE 0 END) as realized_revenue
                FROM members m
                JOIN membership_types mt ON m.membership_type_id = mt.id
                WHERE m.deleted_at IS NULL
            ");
            $revenue = $revStmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'stats' => [
                    'total_members' => $totalMembers,
                    'active' => $statusCounts['active'] ?? 0,
                    'suspended' => $statusCounts['suspended'] ?? 0,
                    'pending' => $statusCounts['pending'] ?? 0,
                    'inactive' => $statusCounts['inactive'] ?? 0,
                    'growth' => round($growth, 1),
                    'revenue' => $revenue['realized_revenue'] ?? 0
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
