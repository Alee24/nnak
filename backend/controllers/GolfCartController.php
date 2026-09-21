<?php
/**
 * Golf Cart Controller
 * Cart inventory, status, rentals, damage reports
 */

class GolfCartController {
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

            if ($sub === 'book') {
                if ($method === 'POST') $this->bookCart($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'return') {
                if ($method === 'PUT') $this->returnCart($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getCart($id);
                elseif ($method === 'PUT') $this->updateCart($id);
                elseif ($method === 'DELETE') $this->deleteCart($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listCarts();
                elseif ($method === 'POST') $this->createCart();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listCarts() {
        $stmt = $this->db->prepare("SELECT * FROM golf_carts WHERE deleted_at IS NULL ORDER BY cart_number ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getCart($id) {
        $stmt = $this->db->prepare("SELECT * FROM golf_carts WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$id]);
        $c = $stmt->fetch();
        if (!$c) $this->sendResponse(404, ['error' => 'Golf Cart not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $c]);
    }

    private function createCart() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $cNum = $data['cart_number'] ?? ('CART-' . rand(10, 99));

        $stmt = $this->db->prepare("
            INSERT INTO golf_carts (cart_number, asset_number, make, model, type, capacity, round_rate, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'available')
        ");
        $stmt->execute([
            $cNum,
            $data['asset_number'] ?? null,
            $data['make'] ?? 'EZ-GO',
            $data['model'] ?? 'TXT',
            $data['type'] ?? 'electric',
            $data['capacity'] ?? 2,
            $data['round_rate'] ?? 2000.00
        ]);

        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function updateCart($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE golf_carts SET make=?, model=?, type=?, capacity=?, round_rate=?, status=? WHERE id=?");
        $stmt->execute([$data['make'], $data['model'], $data['type'], $data['capacity'], $data['round_rate'], $data['status'] ?? 'available', $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Cart updated']);
    }

    private function deleteCart($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE golf_carts SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Cart deleted']);
    }

    private function getAvailable() {
        $stmt = $this->db->prepare("SELECT * FROM golf_carts WHERE status = 'available' AND deleted_at IS NULL");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function bookCart($cartId) {
        $data = $this->getJsonInput();
        $memberId = Auth::isMemberOnly() ? Auth::userId() : ($data['member_id'] ?? Auth::userId());

        $bStmt = $this->db->prepare("
            INSERT INTO cart_bookings (cart_id, tee_time_id, member_id, booking_date, amount_charged, status)
            VALUES (?, ?, ?, CURDATE(), ?, 'in_use')
        ");
        $bStmt->execute([$cartId, $data['tee_time_id'] ?? null, $memberId, $data['amount'] ?? 2000.00]);

        $cStmt = $this->db->prepare("UPDATE golf_carts SET status = 'in_use' WHERE id = ?");
        $cStmt->execute([$cartId]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Golf Cart booked']);
    }

    private function returnCart($cartId) {
        $data = $this->getJsonInput();
        $damage = !empty($data['damage_reported']);
        $notes = $data['damage_notes'] ?? null;

        $newStatus = $damage ? 'maintenance' : 'available';

        $stmt = $this->db->prepare("UPDATE golf_carts SET status = ? WHERE id = ?");
        $stmt->execute([$newStatus, $cartId]);

        $bStmt = $this->db->prepare("UPDATE cart_bookings SET status = 'returned', return_time = NOW(), damage_reported = ?, damage_notes = ? WHERE cart_id = ? AND status = 'in_use'");
        $bStmt->execute([$damage ? 1 : 0, $notes, $cartId]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Cart returned']);
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
