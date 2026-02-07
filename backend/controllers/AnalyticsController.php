<?php
class AnalyticsController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        if ($method === 'GET') {
            $this->getAnalytics();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
        }
    }

    private function getAnalytics() {
        try {
            // 1. Membership Growth (Last 12 Months)
            $growth = $this->getMonthlyGrowth();

            // 2. Demographics (Gender)
            $gender = $this->getGenderDistribution();

            // 3. Demographics (City)
            $cities = $this->getCityDistribution();

            // 4. Revenue Overview
            $revenue = $this->getRevenueStats();

            // 5. Membership Types Distribution
            $types = $this->getMembershipTypeDistribution();

            echo json_encode([
                'success' => true,
                'data' => [
                    'growth' => $growth,
                    'gender' => $gender,
                    'cities' => $cities,
                    'revenue' => $revenue,
                    'types' => $types
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error', 'message' => $e->getMessage()]);
        }
    }

    private function getMonthlyGrowth() {
        $stmt = $this->db->query("
            SELECT 
                DATE_FORMAT(join_date, '%Y-%m') as month,
                COUNT(*) as count
            FROM members 
            WHERE join_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
              AND deleted_at IS NULL
            GROUP BY month
            ORDER BY month ASC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getGenderDistribution() {
        $stmt = $this->db->query("
            SELECT gender, COUNT(*) as count 
            FROM members 
            WHERE deleted_at IS NULL 
            GROUP BY gender
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getCityDistribution() {
        $stmt = $this->db->query("
            SELECT city, COUNT(*) as count 
            FROM members 
            WHERE deleted_at IS NULL AND city IS NOT NULL
            GROUP BY city 
            ORDER BY count DESC 
            LIMIT 5
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function getRevenueStats() {
        // Calculate potential revenue based on active members * membership price
        $stmt = $this->db->query("
            SELECT 
                SUM(mt.price) as total_potential_revenue,
                SUM(CASE WHEN m.status = 'active' THEN mt.price ELSE 0 END) as realized_revenue,
                SUM(CASE WHEN m.status = 'pending' THEN mt.price ELSE 0 END) as pending_revenue
            FROM members m
            JOIN membership_types mt ON m.membership_type_id = mt.id
            WHERE m.deleted_at IS NULL
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getMembershipTypeDistribution() {
        $stmt = $this->db->query("
            SELECT mt.name, COUNT(m.id) as count
            FROM members m
            JOIN membership_types mt ON m.membership_type_id = mt.id
            WHERE m.deleted_at IS NULL
            GROUP BY mt.name
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>
