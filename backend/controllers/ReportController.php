<?php
/**
 * Report Controller
 * Handles analytics and reporting
 */

class ReportController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        if ($method !== 'GET') {
            $this->methodNotAllowed();
        }
        
        $reportType = $parts[0] ?? '';
        
        switch ($reportType) {
            case 'members':
                $this->memberReport();
                break;
            case 'payments':
                $this->paymentReport();
                break;
            case 'events':
                $this->eventReport();
                break;
            case 'dashboard':
                $this->dashboardStats();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Report type not found']);
        }
    }
    
    private function memberReport() {
        try {
            // Total members by status
            $stmt = $this->db->query("
                SELECT status, COUNT(*) as count
                FROM members
                WHERE deleted_at IS NULL
                GROUP BY status
            ");
            $byStatus = $stmt->fetchAll();
            
            // Members by membership type
            $stmt = $this->db->query("
                SELECT mt.name, COUNT(m.id) as count
                FROM membership_types mt
                LEFT JOIN members m ON mt.id = m.membership_type_id AND m.deleted_at IS NULL
                GROUP BY mt.id, mt.name
                ORDER BY count DESC
            ");
            $byType = $stmt->fetchAll();
            
            // New members per month (last 12 months)
            $stmt = $this->db->query("
                SELECT DATE_FORMAT(join_date, '%Y-%m') as month, COUNT(*) as count
                FROM members
                WHERE deleted_at IS NULL
                  AND join_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY month
                ORDER BY month ASC
            ");
            $newMembersPerMonth = $stmt->fetchAll();
            
            // Expiring memberships (next 30 days)
            $stmt = $this->db->query("
                SELECT COUNT(*) as count
                FROM members
                WHERE deleted_at IS NULL
                  AND expiry_date IS NOT NULL
                  AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            ");
            $expiringCount = $stmt->fetchColumn();
            
            $this->sendResponse(200, [
                'by_status' => $byStatus,
                'by_type' => $byType,
                'new_members_per_month' => $newMembersPerMonth,
                'expiring_soon' => $expiringCount
            ]);
            
        } catch (PDOException $e) {
            error_log("Member report error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to generate member report']);
        }
    }
    
    private function paymentReport() {
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            // Total revenue by payment type
            $stmt = $this->db->prepare("
                SELECT payment_type, 
                       SUM(amount) as total_amount,
                       COUNT(*) as count
                FROM payments
                WHERE payment_status = 'completed'
                  AND payment_date BETWEEN ? AND ?
                GROUP BY payment_type
            ");
            $stmt->execute([$startDate, $endDate]);
            $byType = $stmt->fetchAll();
            
            // Revenue by payment method
            $stmt = $this->db->prepare("
                SELECT payment_method,
                       SUM(amount) as total_amount,
                       COUNT(*) as count
                FROM payments
                WHERE payment_status = 'completed'
                  AND payment_date BETWEEN ? AND ?
                GROUP BY payment_method
            ");
            $stmt->execute([$startDate, $endDate]);
            $byMethod = $stmt->fetchAll();
            
            // Revenue per month (last 12 months)
            $stmt = $this->db->query("
                SELECT DATE_FORMAT(payment_date, '%Y-%m') as month,
                       SUM(amount) as total_amount,
                       COUNT(*) as count
                FROM payments
                WHERE payment_status = 'completed'
                  AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY month
                ORDER BY month ASC
            ");
            $revenuePerMonth = $stmt->fetchAll();
            
            // Total revenue
            $stmt = $this->db->prepare("
                SELECT SUM(amount) as total_revenue
                FROM payments
                WHERE payment_status = 'completed'
                  AND payment_date BETWEEN ? AND ?
            ");
            $stmt->execute([$startDate, $endDate]);
            $totalRevenue = $stmt->fetchColumn() ?? 0;
            
            // Pending payments
            $stmt = $this->db->query("
                SELECT SUM(amount) as pending_amount, COUNT(*) as pending_count
                FROM payments
                WHERE payment_status = 'pending'
            ");
            $pending = $stmt->fetch();
            
            $this->sendResponse(200, [
                'total_revenue' => $totalRevenue,
                'by_type' => $byType,
                'by_method' => $byMethod,
                'revenue_per_month' => $revenuePerMonth,
                'pending_payments' => $pending,
                'date_range' => [
                    'start' => $startDate,
                    'end' => $endDate
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log("Payment report error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to generate payment report']);
        }
    }
    
    private function eventReport() {
        try {
            // Upcoming events with registration stats
            $stmt = $this->db->query("
                SELECT e.id, e.title, e.start_date, e.max_capacity,
                       e.current_registrations,
                       ROUND((e.current_registrations / NULLIF(e.max_capacity, 0)) * 100, 2) as fill_percentage
                FROM events e
                WHERE e.status = 'published'
                  AND e.start_date >= CURDATE()
                ORDER BY e.start_date ASC
                LIMIT 10
            ");
            $upcomingEvents = $stmt->fetchAll();
            
            // Event statistics
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total_events,
                    SUM(CASE WHEN start_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_events,
                    SUM(CASE WHEN start_date < CURDATE() THEN 1 ELSE 0 END) as past_events
                FROM events
                WHERE status = 'published'
            ");
            $stats = $stmt->fetch();
            
            // Events by type
            $stmt = $this->db->query("
                SELECT event_type, COUNT(*) as count
                FROM events
                WHERE status = 'published'
                GROUP BY event_type
                ORDER BY count DESC
            ");
            $byType = $stmt->fetchAll();
            
            // Average attendance
            $stmt = $this->db->query("
                SELECT AVG(current_registrations) as avg_attendance
                FROM events
                WHERE status = 'published'
                  AND start_date < CURDATE()
            ");
            $avgAttendance = $stmt->fetchColumn() ?? 0;
            
            $this->sendResponse(200, [
                'statistics' => $stats,
                'upcoming_events' => $upcomingEvents,
                'by_type' => $byType,
                'average_attendance' => round($avgAttendance, 2)
            ]);
            
        } catch (PDOException $e) {
            error_log("Event report error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to generate event report']);
        }
    }
    
    private function dashboardStats() {
        try {
            // Total members
            $stmt = $this->db->query("
                SELECT COUNT(*) FROM members WHERE deleted_at IS NULL
            ");
            $totalMembers = $stmt->fetchColumn();
            
            // Active members
            $stmt = $this->db->query("
                SELECT COUNT(*) FROM members WHERE status = 'active' AND deleted_at IS NULL
            ");
            $activeMembers = $stmt->fetchColumn();
            
            // Total revenue (this year)
            $stmt = $this->db->query("
                SELECT SUM(amount) FROM payments 
                WHERE payment_status = 'completed' 
                  AND YEAR(payment_date) = YEAR(CURDATE())
            ");
            $yearRevenue = $stmt->fetchColumn() ?? 0;
            
            // Total revenue (this month)
            $stmt = $this->db->query("
                SELECT SUM(amount) FROM payments 
                WHERE payment_status = 'completed' 
                  AND YEAR(payment_date) = YEAR(CURDATE())
                  AND MONTH(payment_date) = MONTH(CURDATE())
            ");
            $monthRevenue = $stmt->fetchColumn() ?? 0;
            
            // Upcoming events
            $stmt = $this->db->query("
                SELECT COUNT(*) FROM events 
                WHERE status = 'published' AND start_date >= CURDATE()
            ");
            $upcomingEvents = $stmt->fetchColumn();
            
            // Recent registrations (last 7 days)
            $stmt = $this->db->query("
                SELECT COUNT(*) FROM members 
                WHERE deleted_at IS NULL 
                  AND join_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ");
            $recentRegistrations = $stmt->fetchColumn();
            
            // Pending payments
            $stmt = $this->db->query("
                SELECT COUNT(*) as count, SUM(amount) as amount
                FROM payments WHERE payment_status = 'pending'
            ");
            $pendingPayments = $stmt->fetch();

            // Trends Calculation
            // Revenue Growth (This Month vs Last Month)
            $stmt = $this->db->query("
                SELECT SUM(amount) FROM payments 
                WHERE payment_status = 'completed' 
                  AND YEAR(payment_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                  AND MONTH(payment_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
            ");
            $lastMonthRevenue = $stmt->fetchColumn() ?? 0;
            $revenueGrowth = 0;
            if ($lastMonthRevenue > 0) {
                $revenueGrowth = round((($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1);
            } else if ($monthRevenue > 0) {
                $revenueGrowth = 100;
            }

            // Member Growth (This Month vs Last Month)
             $stmt = $this->db->query("
                SELECT COUNT(*) FROM members 
                WHERE deleted_at IS NULL 
                  AND YEAR(join_date) = YEAR(CURDATE())
                  AND MONTH(join_date) = MONTH(CURDATE())
            ");
            $thisMonthMembers = $stmt->fetchColumn();

            $stmt = $this->db->query("
                SELECT COUNT(*) FROM members 
                WHERE deleted_at IS NULL 
                  AND YEAR(join_date) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
                  AND MONTH(join_date) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
            ");
            $lastMonthMembers = $stmt->fetchColumn();
            
            $memberGrowth = 0;
             if ($lastMonthMembers > 0) {
                $memberGrowth = round((($thisMonthMembers - $lastMonthMembers) / $lastMonthMembers) * 100, 1);
            } else if ($thisMonthMembers > 0) {
                $memberGrowth = 100;
            }
            
            $this->sendResponse(200, [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'year_revenue' => $yearRevenue,
                'month_revenue' => $monthRevenue,
                'revenue_growth' => $revenueGrowth,
                'member_growth' => $memberGrowth,
                'upcoming_events' => $upcomingEvents,
                'recent_registrations' => $recentRegistrations,
                'pending_payments' => $pendingPayments
            ]);
            
        } catch (PDOException $e) {
            error_log("Dashboard stats error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to generate dashboard statistics']);
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
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
