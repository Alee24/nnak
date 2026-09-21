<?php
/**
 * Caddy Controller
 * Caddy profiles, availability, assignment to tee time players
 */

class CaddyController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'available') {
            if ($method === 'GET') $this->getAvailable();
            else $this->methodNotAllowed();
            return;
        }

        if (numeric_id($action)) {
            $id = (int)$action;
            $sub = $parts[1] ?? '';

            if ($sub === 'status') {
                if ($method === 'PUT') $this->updateStatus($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'assign') {
                if ($method === 'POST') $this->assignCaddy($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getCaddy($id);
                elseif ($method === 'PUT') $this->updateCaddy($id);
                elseif ($method === 'DELETE') $this->deleteCaddy($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listCaddies();
                elseif ($method === 'POST') $this->createCaddy();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listCaddies() {
        $stmt = $this->db->prepare("SELECT * FROM caddies WHERE deleted_at IS NULL ORDER BY caddy_number ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getCaddy($id) {
        $stmt = $this->db->prepare("SELECT * FROM caddies WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$id]);
        $c = $stmt->fetch();
        if (!$c) $this->sendResponse(404, ['error' => 'Caddy not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $c]);
    }

    private function createCaddy() {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $data = $this->getJsonInput();
        $cNum = $data['caddy_number'] ?? ('CAD-' . rand(100, 999));

        $stmt = $this->db->prepare("
            INSERT INTO caddies (caddy_number, first_name, last_name, phone, id_number, training_level, rating, standard_fee, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')
        ");
        $stmt->execute([
            $cNum,
            $data['first_name'],
            $data['last_name'],
            $data['phone'] ?? null,
            $data['id_number'] ?? null,
            $data['training_level'] ?? 'certified',
            $data['rating'] ?? 4.5,
            $data['standard_fee'] ?? 1500.00
        ]);

        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function updateCaddy($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE caddies SET first_name=?, last_name=?, phone=?, training_level=?, rating=?, standard_fee=? WHERE id=?");
        $stmt->execute([$data['first_name'], $data['last_name'], $data['phone'], $data['training_level'], $data['rating'], $data['standard_fee'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Caddy updated']);
    }

    private function updateStatus($id) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE caddies SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Caddy status updated']);
    }

    private function deleteCaddy($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $stmt = $this->db->prepare("UPDATE caddies SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Caddy deleted']);
    }

    private function getAvailable() {
        $stmt = $this->db->prepare("SELECT * FROM caddies WHERE status = 'available' AND deleted_at IS NULL ORDER BY rating DESC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function assignCaddy($caddyId) {
        $data = $this->getJsonInput();
        $playerId = (int)($data['player_id'] ?? 0);

        $stmt = $this->db->prepare("UPDATE tee_time_players SET caddy_id = ? WHERE id = ?");
        $stmt->execute([$caddyId, $playerId]);

        $cStmt = $this->db->prepare("UPDATE caddies SET status = 'assigned' WHERE id = ?");
        $cStmt->execute([$caddyId]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Caddy assigned']);
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
