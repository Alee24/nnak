<?php
/**
 * Finance Controller
 * Financial summary, P&L, revenue breakdown, expense tracking, AR aging
 */

class FinanceController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireFinance();
        $action = $parts[0] ?? '';

        switch ($action) {
            case 'summary':
                if ($method === 'GET') $this->getSummary();
                else $this->methodNotAllowed();
                break;
            case 'income-statement':
                if ($method === 'GET') $this->getIncomeStatement();
                else $this->methodNotAllowed();
                break;
            case 'revenue-by-department':
                if ($method === 'GET') $this->getRevenueByDepartment();
                else $this->methodNotAllowed();
                break;
            case 'daily-sales':
                if ($method === 'GET') $this->getDailySales();
                else $this->methodNotAllowed();
                break;
            case 'ar-aging':
                if ($method === 'GET') $this->getArAging();
                else $this->methodNotAllowed();
                break;
            case 'outstanding-balances':
                if ($method === 'GET') $this->getOutstandingBalances();
                else $this->methodNotAllowed();
                break;
            case 'expenses':
                if ($method === 'GET') $this->getExpenses();
                elseif ($method === 'POST') $this->recordExpense();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function getSummary() {
        // Total payments collected
        $pStmt = $this->db->prepare("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'completed'");
        $pStmt->execute();
        $totalRevenue = (float)$pStmt->fetchColumn();

        // Total invoiced
        $iStmt = $this->db->prepare("SELECT COALESCE(SUM(total_amount), 0), COALESCE(SUM(balance), 0) FROM invoices WHERE status != 'cancelled' AND deleted_at IS NULL");
        $iStmt->execute();
        $inv = $iStmt->fetch();
        $totalInvoiced = (float)$inv[0];
        $totalOutstanding = (float)$inv[1];

        // Total expenses
        $eStmt = $this->db->prepare("SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE deleted_at IS NULL");
        $eStmt->execute();
        $totalExpenses = (float)$eStmt->fetchColumn();

        $this->sendResponse(200, [
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'total_invoiced' => $totalInvoiced,
                'total_outstanding' => $totalOutstanding,
                'total_expenses' => $totalExpenses,
                'net_income' => $totalRevenue - $totalExpenses,
                'currency' => 'KES'
            ]
        ]);
    }

    private function getIncomeStatement() {
        $year = $_GET['year'] ?? date('Y');

        $revStmt = $this->db->prepare("
            SELECT payment_type, COALESCE(SUM(amount), 0) as amount
            FROM payments WHERE payment_status = 'completed' AND YEAR(payment_date) = ?
            GROUP BY payment_type
        ");
        $revStmt->execute([$year]);
        $revenues = $revStmt->fetchAll();

        $expStmt = $this->db->prepare("
            SELECT category, COALESCE(SUM(amount), 0) as amount
            FROM expenses WHERE YEAR(expense_date) = ? AND deleted_at IS NULL
            GROUP BY category
        ");
        $expStmt->execute([$year]);
        $expenses = $expStmt->fetchAll();

        $this->sendResponse(200, [
            'success' => true,
            'year' => $year,
            'revenues' => $revenues,
            'expenses' => $expenses
        ]);
    }

    private function getRevenueByDepartment() {
        $stmt = $this->db->prepare("
            SELECT payment_type as department, COALESCE(SUM(amount), 0) as amount
            FROM payments WHERE payment_status = 'completed'
            GROUP BY payment_type
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getDailySales() {
        $days = (int)($_GET['days'] ?? 30);
        $stmt = $this->db->prepare("
            SELECT DATE(payment_date) as date, SUM(amount) as total
            FROM payments WHERE payment_status = 'completed' AND payment_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(payment_date) ORDER BY date ASC
        ");
        $stmt->execute([$days]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getArAging() {
        $stmt = $this->db->prepare("
            SELECT
              SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) <= 0 THEN balance ELSE 0 END) as current_due,
              SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) BETWEEN 1 AND 30 THEN balance ELSE 0 END) as overdue_30,
              SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) BETWEEN 31 AND 60 THEN balance ELSE 0 END) as overdue_60,
              SUM(CASE WHEN DATEDIFF(CURDATE(), due_date) > 60 THEN balance ELSE 0 END) as overdue_90_plus,
              SUM(balance) as total_ar
            FROM invoices
            WHERE status NOT IN ('paid','cancelled') AND balance > 0 AND deleted_at IS NULL
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetch()]);
    }

    private function getOutstandingBalances() {
        $stmt = $this->db->prepare("
            SELECT m.id, m.first_name, m.last_name, m.membership_number, m.phone, m.email,
                   SUM(i.balance) as total_balance,
                   COUNT(i.id) as overdue_invoices
            FROM invoices i JOIN members m ON i.member_id = m.id
            WHERE i.status NOT IN ('paid','cancelled') AND i.balance > 0 AND i.deleted_at IS NULL
            GROUP BY m.id ORDER BY total_balance DESC LIMIT 20
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getExpenses() {
        $pag = Auth::paginate($_GET);
        $stmt = $this->db->prepare("SELECT * FROM expenses WHERE deleted_at IS NULL ORDER BY expense_date DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function recordExpense() {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("
            INSERT INTO expenses (expense_date, category, description, amount, payment_method, reference, recorded_by, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['expense_date'] ?? date('Y-m-d'),
            $data['category'] ?? 'general',
            $data['description'],
            $data['amount'],
            $data['payment_method'] ?? 'cash',
            $data['reference'] ?? null,
            Auth::userId(),
            $data['notes'] ?? null
        ]);
        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId(), 'message' => 'Expense recorded']);
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
