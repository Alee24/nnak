<?php
/**
 * Audit Controller
 * Read-only audit log inspection for super_admin and auditor roles
 */

class AuditController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireRole('super_admin', 'admin', 'auditor');

        $action = $parts[0] ?? '';

        if ($action === 'export') {
            if ($method === 'GET') $this->exportCsv();
            else $this->methodNotAllowed();
            return;
        }

        if (numeric_id($action)) {
            if ($method === 'GET') $this->getLog((int)$action);
            else $this->methodNotAllowed();
            return;
        }

        if ($method === 'GET') $this->listLogs();
        else $this->methodNotAllowed();
    }

    private function listLogs() {
        $pag = Auth::paginate($_GET);
        $where = ["1=1"];
        $bindings = [];

        if (!empty($_GET['module'])) {
            $where[] = "module = ?";
            $bindings[] = $_GET['module'];
        }

        if (!empty($_GET['action'])) {
            $where[] = "action = ?";
            $bindings[] = $_GET['action'];
        }

        if (!empty($_GET['search'])) {
            $where[] = "(user_name LIKE ? OR notes LIKE ? OR module LIKE ?)";
            $term = "%" . $_GET['search'] . "%";
            array_push($bindings, $term, $term, $term);
        }

        $whereClause = implode(" AND ", $where);

        $stmt = $this->db->prepare("SELECT * FROM audit_logs WHERE $whereClause ORDER BY id DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}");
        $stmt->execute($bindings);

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM audit_logs WHERE $whereClause");
        $cnt->execute($bindings);

        $this->sendResponse(200, [
            'success' => true,
            'data' => $stmt->fetchAll(),
            'total' => (int)$cnt->fetchColumn()
        ]);
    }

    private function getLog($id) {
        $stmt = $this->db->prepare("SELECT * FROM audit_logs WHERE id = ?");
        $stmt->execute([$id]);
        $log = $stmt->fetch();
        if (!$log) $this->sendResponse(404, ['error' => 'Audit log entry not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $log]);
    }

    private function exportCsv() {
        $stmt = $this->db->prepare("SELECT id, user_name, action, module, record_id, ip_address, notes, created_at FROM audit_logs ORDER BY id DESC LIMIT 1000");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function sendResponse($code, $data) {
        http_response_code($code);
        echo json_encode($data);
        exit();
    }

    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
