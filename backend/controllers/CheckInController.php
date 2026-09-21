<?php
/**
 * CheckIn Controller
 * Fast member check-in interface, live on-course view, attendance history
 */

class CheckInController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if (numeric_id($action)) {
            $id = (int)$action;
            $sub = $parts[1] ?? '';

            if ($sub === 'checkout') {
                if ($method === 'POST') $this->checkout($id);
                else $this->methodNotAllowed();
            } else {
                $this->sendResponse(404, ['error' => 'Action not found']);
            }
            return;
        }

        switch ($action) {
            case '':
            case 'check-in':
                if ($method === 'POST') $this->checkin();
                else $this->methodNotAllowed();
                break;
            case 'today':
                if ($method === 'GET') $this->getTodayCheckIns();
                else $this->methodNotAllowed();
                break;
            case 'oncourse':
                if ($method === 'GET') $this->getMembersOnCourse();
                else $this->methodNotAllowed();
                break;
            case 'member':
                if ($method === 'GET') $this->getMemberCheckIns((int)($parts[1] ?? 0));
                else $this->methodNotAllowed();
                break;
            case 'stats':
                if ($method === 'GET') $this->getStats();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function checkin() {
        Auth::requireRole('admin', 'super_admin', 'receptionist', 'golf_manager', 'golf_professional', 'staff');
        $data = $this->getJsonInput();

        $memberId = null;

        // Search by membership number / ID / phone if member_id not direct
        if (!empty($data['member_id'])) {
            $memberId = (int)$data['member_id'];
        } elseif (!empty($data['search_query'])) {
            $q = trim($data['search_query']);
            $stmt = $this->db->prepare("
                SELECT id, status FROM members
                WHERE (membership_number = ? OR member_id = ? OR phone = ? OR email = ?) AND deleted_at IS NULL
            ");
            $stmt->execute([$q, $q, $q, $q]);
            $m = $stmt->fetch();
            if ($m) $memberId = (int)$m['id'];
        }

        if (!$memberId) {
            $this->sendResponse(404, ['error' => 'Member not found']);
        }

        // Check member status
        $mStmt = $this->db->prepare("SELECT first_name, last_name, membership_number, status, profile_picture FROM members WHERE id = ?");
        $mStmt->execute([$memberId]);
        $member = $mStmt->fetch();

        if ($member['status'] === 'suspended') {
            $this->sendResponse(403, ['error' => 'Member is suspended']);
        }

        $purpose = $data['purpose'] ?? 'Golf';
        $location = $data['location'] ?? 'Main Club';
        $method = $data['check_in_method'] ?? 'manual';

        $ins = $this->db->prepare("
            INSERT INTO check_ins (member_id, check_in_time, purpose, location, tee_time_id, guest_count, notes, recorded_by, check_in_method)
            VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?)
        ");
        $ins->execute([
            $memberId,
            $purpose,
            $location,
            $data['tee_time_id'] ?? null,
            (int)($data['guest_count'] ?? 0),
            $data['notes'] ?? null,
            Auth::userId(),
            $method
        ]);

        $checkInId = (int)$this->db->lastInsertId();

        $this->sendResponse(201, [
            'success' => true,
            'message' => 'Check-in successful',
            'id' => $checkInId,
            'member' => $member
        ]);
    }

    private function checkout($id) {
        $stmt = $this->db->prepare("UPDATE check_ins SET check_out_time = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Checked out']);
    }

    private function getTodayCheckIns() {
        $stmt = $this->db->prepare("
            SELECT ci.*, m.first_name, m.last_name, m.membership_number, m.profile_picture
            FROM check_ins ci JOIN members m ON ci.member_id = m.id
            WHERE DATE(ci.check_in_time) = CURDATE()
            ORDER BY ci.check_in_time DESC
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getMembersOnCourse() {
        $stmt = $this->db->prepare("
            SELECT ci.*, m.first_name, m.last_name, m.membership_number, m.handicap_index
            FROM check_ins ci JOIN members m ON ci.member_id = m.id
            WHERE DATE(ci.check_in_time) = CURDATE() AND ci.check_out_time IS NULL AND ci.purpose = 'Golf'
            ORDER BY ci.check_in_time ASC
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getMemberCheckIns($memberId) {
        if (Auth::isMemberOnly() && $memberId !== Auth::userId()) Auth::requireAdmin();
        $stmt = $this->db->prepare("SELECT * FROM check_ins WHERE member_id = ? ORDER BY check_in_time DESC LIMIT 50");
        $stmt->execute([$memberId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getStats() {
        $stmt = $this->db->prepare("
            SELECT
              COUNT(*) as total_today,
              SUM(CASE WHEN check_out_time IS NULL AND purpose='Golf' THEN 1 ELSE 0 END) as on_course,
              SUM(CASE WHEN purpose='Restaurant' THEN 1 ELSE 0 END) as restaurant
            FROM check_ins
            WHERE DATE(check_in_time) = CURDATE()
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetch()]);
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
