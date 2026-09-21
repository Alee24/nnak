<?php
/**
 * Handicap Controller
 * Manages member handicap index, updates, history, and distribution statistics
 */

class HandicapController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'distribution') {
            if ($method === 'GET') $this->getDistribution();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'bulk-update') {
            if ($method === 'POST') $this->bulkUpdate();
            else $this->methodNotAllowed();
            return;
        }

        if (numeric_id($action)) {
            $memberId = (int)$action;
            $sub = $parts[1] ?? '';

            if ($sub === 'history') {
                if ($method === 'GET') $this->getHistory($memberId);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getHandicap($memberId);
                elseif ($method === 'PUT') $this->updateHandicap($memberId);
                else $this->methodNotAllowed();
            }
            return;
        }

        $this->sendResponse(404, ['error' => 'Action not found']);
    }

    private function getHandicap($memberId) {
        $stmt = $this->db->prepare("SELECT id, first_name, last_name, membership_number, handicap_index, home_club FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        $member = $stmt->fetch();
        if (!$member) $this->sendResponse(404, ['error' => 'Member not found']);

        $hStmt = $this->db->prepare("SELECT * FROM handicap_history WHERE member_id = ? ORDER BY id DESC LIMIT 20");
        $hStmt->execute([$memberId]);
        $member['history'] = $hStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $member]);
    }

    private function updateHandicap($memberId) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager', 'golf_professional');
        $data = $this->getJsonInput();

        if (!isset($data['new_handicap'])) {
            $this->sendResponse(400, ['error' => 'new_handicap is required']);
        }

        $newHcp = (float)$data['new_handicap'];

        $stmt = $this->db->prepare("SELECT handicap_index FROM members WHERE id = ?");
        $stmt->execute([$memberId]);
        $oldHcp = $stmt->fetchColumn();

        $upd = $this->db->prepare("UPDATE members SET handicap_index = ? WHERE id = ?");
        $upd->execute([$newHcp, $memberId]);

        $hist = $this->db->prepare("
            INSERT INTO handicap_history (member_id, old_handicap, new_handicap, change_reason, updated_by)
            VALUES (?, ?, ?, ?, ?)
        ");
        $hist->execute([$memberId, $oldHcp, $newHcp, $data['change_reason'] ?? 'Manual update', Auth::userId()]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Handicap updated', 'new_handicap' => $newHcp]);
    }

    private function getHistory($memberId) {
        $stmt = $this->db->prepare("SELECT * FROM handicap_history WHERE member_id = ? ORDER BY id DESC");
        $stmt->execute([$memberId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getDistribution() {
        $stmt = $this->db->prepare("
            SELECT
              CASE
                WHEN handicap_index IS NULL THEN 'Unassigned'
                WHEN handicap_index <= 5.0 THEN '0 - 5 (Single Figure)'
                WHEN handicap_index <= 12.0 THEN '6 - 12 (Mid)'
                WHEN handicap_index <= 18.0 THEN '13 - 18'
                WHEN handicap_index <= 24.0 THEN '19 - 24'
                ELSE '25+ (High)'
              END as bracket,
              COUNT(*) as count
            FROM members
            WHERE deleted_at IS NULL
            GROUP BY bracket
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function bulkUpdate() {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $data = $this->getJsonInput();
        $updates = $data['updates'] ?? [];

        foreach ($updates as $u) {
            if (!empty($u['member_id']) && isset($u['new_handicap'])) {
                $mId = (int)$u['member_id'];
                $nHcp = (float)$u['new_handicap'];
                $this->db->prepare("UPDATE members SET handicap_index = ? WHERE id = ?")->execute([$nHcp, $mId]);
            }
        }
        $this->sendResponse(200, ['success' => true, 'message' => 'Bulk handicap update complete']);
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
