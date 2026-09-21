<?php
/**
 * Staff Controller
 * Club employee profiles, departments, employment status
 */

class StaffController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireRole('admin', 'super_admin', 'general_manager');
        $action = $parts[0] ?? '';

        if (numeric_id($action)) {
            $id = (int)$action;
            if ($method === 'GET') $this->getStaffMember($id);
            elseif ($method === 'PUT') $this->updateStaffMember($id);
            elseif ($method === 'DELETE') $this->deactivateStaff($id);
            else $this->methodNotAllowed();
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listStaff();
                elseif ($method === 'POST') $this->createStaff();
                else $this->methodNotAllowed();
                break;
            case 'departments':
                if ($method === 'GET') $this->getDepartments();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listStaff() {
        $stmt = $this->db->prepare("
            SELECT sp.*, m.first_name, m.last_name, m.email, m.phone, m.role
            FROM staff_profiles sp JOIN members m ON sp.member_id = m.id
            ORDER BY sp.department ASC, m.first_name ASC
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getStaffMember($id) {
        $stmt = $this->db->prepare("
            SELECT sp.*, m.first_name, m.last_name, m.email, m.phone, m.role
            FROM staff_profiles sp JOIN members m ON sp.member_id = m.id WHERE sp.id = ?
        ");
        $stmt->execute([$id]);
        $staff = $stmt->fetch();
        if (!$staff) $this->sendResponse(404, ['error' => 'Staff profile not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $staff]);
    }

    private function createStaff() {
        $data = $this->getJsonInput();
        $memberId = (int)($data['member_id'] ?? 0);
        $empNum = 'EMP-' . str_pad((string)rand(1, 999), 3, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO staff_profiles (member_id, employee_number, department, position, employment_type, employment_start_date, salary, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
            ON DUPLICATE KEY UPDATE department=VALUES(department), position=VALUES(position), salary=VALUES(salary)
        ");
        $stmt->execute([
            $memberId,
            $empNum,
            $data['department'] ?? 'administration',
            $data['position'] ?? 'Staff',
            $data['employment_type'] ?? 'permanent',
            $data['employment_start_date'] ?? date('Y-m-d'),
            $data['salary'] ?? 0.00
        ]);

        // Update member role if role provided
        if (!empty($data['role'])) {
            $upd = $this->db->prepare("UPDATE members SET role = ? WHERE id = ?");
            $upd->execute([$data['role'], $memberId]);
        }

        $this->sendResponse(201, ['success' => true, 'message' => 'Staff profile created']);
    }

    private function updateStaffMember($id) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE staff_profiles SET department=?, position=?, employment_type=?, salary=?, status=? WHERE id=?");
        $stmt->execute([$data['department'], $data['position'], $data['employment_type'], $data['salary'], $data['status'] ?? 'active', $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Staff profile updated']);
    }

    private function deactivateStaff($id) {
        $stmt = $this->db->prepare("UPDATE staff_profiles SET status = 'terminated' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Staff member deactivated']);
    }

    private function getDepartments() {
        $depts = ['administration', 'finance', 'golf', 'grounds', 'restaurant', 'security', 'ict', 'membership', 'maintenance'];
        $this->sendResponse(200, ['success' => true, 'data' => $depts]);
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
