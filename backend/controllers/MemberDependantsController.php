<?php
/**
 * Member Dependants Controller
 * Family/dependant relationship management
 */

class MemberDependantsController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $principalId = (int)($parts[0] ?? 0);
        $dependantId = (int)($parts[1] ?? 0);

        if (!$principalId) {
            $this->sendResponse(400, ['error' => 'Principal Member ID required']);
        }

        if (Auth::isMemberOnly() && $principalId !== Auth::userId()) {
            Auth::requireAdmin();
        }

        if ($dependantId > 0) {
            if ($method === 'GET') $this->getDependant($principalId, $dependantId);
            elseif ($method === 'PUT') $this->updateDependant($principalId, $dependantId);
            elseif ($method === 'DELETE') $this->deleteDependant($principalId, $dependantId);
            else $this->methodNotAllowed();
        } else {
            if ($method === 'GET') $this->listDependants($principalId);
            elseif ($method === 'POST') $this->addDependant($principalId);
            else $this->methodNotAllowed();
        }
    }

    private function listDependants($principalId) {
        $stmt = $this->db->prepare("SELECT * FROM member_dependants WHERE principal_member_id = ? AND deleted_at IS NULL ORDER BY id ASC");
        $stmt->execute([$principalId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getDependant($principalId, $dependantId) {
        $stmt = $this->db->prepare("SELECT * FROM member_dependants WHERE id = ? AND principal_member_id = ? AND deleted_at IS NULL");
        $stmt->execute([$dependantId, $principalId]);
        $dep = $stmt->fetch();
        if (!$dep) $this->sendResponse(404, ['error' => 'Dependant not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $dep]);
    }

    private function addDependant($principalId) {
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("
            INSERT INTO member_dependants (principal_member_id, first_name, last_name, relationship, date_of_birth, gender, phone, email, id_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([
            $principalId,
            $data['first_name'],
            $data['last_name'],
            $data['relationship'] ?? 'child',
            $data['date_of_birth'] ?? null,
            $data['gender'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['id_number'] ?? null
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'message' => 'Dependant added', 'id' => $id]);
    }

    private function updateDependant($principalId, $dependantId) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE member_dependants SET first_name=?, last_name=?, relationship=?, date_of_birth=?, gender=?, phone=?, email=? WHERE id=? AND principal_member_id=?");
        $stmt->execute([
            $data['first_name'], $data['last_name'], $data['relationship'], $data['date_of_birth'] ?? null, $data['gender'] ?? null, $data['phone'] ?? null, $data['email'] ?? null, $dependantId, $principalId
        ]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Dependant updated']);
    }

    private function deleteDependant($principalId, $dependantId) {
        $stmt = $this->db->prepare("UPDATE member_dependants SET deleted_at = NOW() WHERE id = ? AND principal_member_id = ?");
        $stmt->execute([$dependantId, $principalId]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Dependant removed']);
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
