<?php
/**
 * Supplier & Purchase Order Controller
 */

class SupplierController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'purchase-orders') {
            $poId = (int)($parts[1] ?? 0);
            $sub = $parts[2] ?? '';
            if ($poId > 0) {
                if ($sub === 'approve') {
                    if ($method === 'PUT') $this->approvePo($poId);
                    else $this->methodNotAllowed();
                } elseif ($sub === 'receive') {
                    if ($method === 'PUT') $this->receivePo($poId);
                    else $this->methodNotAllowed();
                } else {
                    if ($method === 'GET') $this->getPo($poId);
                    else $this->methodNotAllowed();
                }
            } else {
                if ($method === 'GET') $this->listPos();
                elseif ($method === 'POST') $this->createPo();
                else $this->methodNotAllowed();
            }
            return;
        }

        if (numeric_id($action)) {
            $id = (int)$action;
            if ($method === 'GET') $this->getSupplier($id);
            elseif ($method === 'PUT') $this->updateSupplier($id);
            elseif ($method === 'DELETE') $this->deleteSupplier($id);
            else $this->methodNotAllowed();
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listSuppliers();
                elseif ($method === 'POST') $this->createSupplier();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listSuppliers() {
        $stmt = $this->db->prepare("SELECT * FROM suppliers WHERE deleted_at IS NULL ORDER BY name ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getSupplier($id) {
        $stmt = $this->db->prepare("SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$id]);
        $sup = $stmt->fetch();
        if (!$sup) $this->sendResponse(404, ['error' => 'Supplier not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $sup]);
    }

    private function createSupplier() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("
            INSERT INTO suppliers (name, code, contact_person, phone, email, address, pin_number, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
        ");
        $stmt->execute([
            $data['name'],
            $data['code'] ?? strtoupper(substr($data['name'], 0, 4)),
            $data['contact_person'] ?? null,
            $data['phone'] ?? null,
            $data['email'] ?? null,
            $data['address'] ?? null,
            $data['pin_number'] ?? null
        ]);
        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function updateSupplier($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=?, pin_number=? WHERE id=?");
        $stmt->execute([$data['name'], $data['contact_person'], $data['phone'], $data['email'], $data['address'], $data['pin_number'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Supplier updated']);
    }

    private function deleteSupplier($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE suppliers SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Supplier deleted']);
    }

    private function listPos() {
        $stmt = $this->db->prepare("
            SELECT po.*, s.name as supplier_name
            FROM purchase_orders po JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.deleted_at IS NULL ORDER BY po.id DESC
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getPo($id) {
        $stmt = $this->db->prepare("SELECT po.*, s.name as supplier_name FROM purchase_orders po JOIN suppliers s ON po.supplier_id = s.id WHERE po.id = ?");
        $stmt->execute([$id]);
        $po = $stmt->fetch();

        $iStmt = $this->db->prepare("SELECT * FROM purchase_order_items WHERE po_id = ?");
        $iStmt->execute([$id]);
        $po['items'] = $iStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $po]);
    }

    private function createPo() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $poNum = 'PO-' . date('Ym') . '-' . str_pad((string)rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO purchase_orders (po_number, supplier_id, order_date, expected_delivery_date, total_amount, balance, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, 'draft', ?)
        ");
        $tot = (float)($data['total_amount'] ?? 0);
        $stmt->execute([
            $poNum,
            $data['supplier_id'],
            $data['order_date'] ?? date('Y-m-d'),
            $data['expected_delivery_date'] ?? null,
            $tot,
            $tot,
            Auth::userId()
        ]);

        $poId = (int)$this->db->lastInsertId();

        if (!empty($data['items'])) {
            $iStmt = $this->db->prepare("INSERT INTO purchase_order_items (po_id, product_id, description, quantity, unit_cost, total) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($data['items'] as $it) {
                $qty = (float)($it['quantity'] ?? 1);
                $cost = (float)($it['unit_cost'] ?? 0);
                $iStmt->execute([$poId, $it['product_id'] ?? null, $it['description'], $qty, $cost, $qty * $cost]);
            }
        }

        $this->sendResponse(201, ['success' => true, 'id' => $poId, 'po_number' => $poNum]);
    }

    private function approvePo($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE purchase_orders SET status = 'approved', approved_by = ? WHERE id = ?");
        $stmt->execute([Auth::userId(), $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'PO approved']);
    }

    private function receivePo($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE purchase_orders SET status = 'delivered', delivered_date = CURDATE() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'PO marked received']);
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
