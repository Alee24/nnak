<?php
/**
 * Guest Controller
 * Handles guest registrations, pass generation, guest fees
 */

class GuestController {
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

            if ($sub === 'pass') {
                if ($method === 'GET') $this->getGuestPass($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getGuest($id);
                elseif ($method === 'PUT') $this->updateGuest($id);
                elseif ($method === 'DELETE') $this->deleteGuest($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listGuests();
                elseif ($method === 'POST') $this->createGuest();
                else $this->methodNotAllowed();
                break;
            case 'today':
                if ($method === 'GET') $this->getTodaysGuests();
                else $this->methodNotAllowed();
                break;
            case 'member':
                if ($method === 'GET') $this->getMemberGuests((int)($parts[1] ?? 0));
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listGuests() {
        $pag = Auth::paginate($_GET);
        $where = ["g.deleted_at IS NULL"];
        $bindings = [];

        if (Auth::isMemberOnly()) {
            $where[] = "g.host_member_id = ?";
            $bindings[] = Auth::userId();
        }

        if (!empty($_GET['search'])) {
            $where[] = "(g.first_name LIKE ? OR g.last_name LIKE ? OR g.phone LIKE ? OR m.first_name LIKE ?)";
            $term = "%" . $_GET['search'] . "%";
            array_push($bindings, $term, $term, $term, $term);
        }

        $whereClause = implode(" AND ", $where);

        $stmt = $this->db->prepare("
            SELECT g.*, m.first_name as host_fn, m.last_name as host_ln, m.membership_number as host_mn
            FROM guests g JOIN members m ON g.host_member_id = m.id
            WHERE $whereClause ORDER BY g.id DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute($bindings);

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM guests g JOIN members m ON g.host_member_id = m.id WHERE $whereClause");
        $cnt->execute($bindings);

        $this->sendResponse(200, [
            'success' => true,
            'data' => $stmt->fetchAll(),
            'total' => (int)$cnt->fetchColumn()
        ]);
    }

    private function getGuest($id) {
        $stmt = $this->db->prepare("SELECT g.*, m.first_name as host_fn, m.last_name as host_ln FROM guests g JOIN members m ON g.host_member_id = m.id WHERE g.id = ?");
        $stmt->execute([$id]);
        $guest = $stmt->fetch();
        if (!$guest) $this->sendResponse(404, ['error' => 'Guest not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $guest]);
    }

    private function createGuest() {
        $data = $this->getJsonInput();
        $hostId = Auth::isMemberOnly() ? Auth::userId() : ($data['host_member_id'] ?? Auth::userId());
        $fee = (float)($data['guest_fee'] ?? 2500.00);
        $passNum = 'GP-' . date('Ym') . '-' . str_pad((string)rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO guests (host_member_id, first_name, last_name, phone, email, id_number, nationality, visit_date, purpose, guest_fee, payment_status, guest_pass_number, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
        ");
        $stmt->execute([
            $hostId,
            $data['first_name'],
            $data['last_name'],
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['id_number'] ?? null,
            $data['nationality'] ?? 'Kenyan',
            $data['visit_date'] ?? date('Y-m-d'),
            $data['purpose'] ?? 'Golf',
            $fee,
            $passNum,
            $data['notes'] ?? null
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'message' => 'Guest registered', 'id' => $id, 'guest_pass_number' => $passNum]);
    }

    private function updateGuest($id) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE guests SET first_name=?, last_name=?, phone=?, visit_date=?, purpose=?, guest_fee=?, payment_status=? WHERE id=?");
        $stmt->execute([$data['first_name'], $data['last_name'], $data['phone'] ?? null, $data['visit_date'], $data['purpose'], $data['guest_fee'], $data['payment_status'] ?? 'pending', $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Guest updated']);
    }

    private function deleteGuest($id) {
        $stmt = $this->db->prepare("UPDATE guests SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Guest deleted']);
    }

    private function getGuestPass($id) {
        $this->getGuest($id);
    }

    private function getTodaysGuests() {
        $stmt = $this->db->prepare("
            SELECT g.*, m.first_name as host_fn, m.last_name as host_ln
            FROM guests g JOIN members m ON g.host_member_id = m.id
            WHERE g.visit_date = CURDATE() AND g.deleted_at IS NULL
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getMemberGuests($memberId) {
        if (Auth::isMemberOnly() && $memberId !== Auth::userId()) Auth::requireAdmin();
        $stmt = $this->db->prepare("SELECT * FROM guests WHERE host_member_id = ? AND deleted_at IS NULL ORDER BY visit_date DESC");
        $stmt->execute([$memberId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
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
