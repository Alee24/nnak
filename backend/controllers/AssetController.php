<?php
/**
 * Asset Controller
 * Club assets, maintenance history, condition tracking
 */

class AssetController {
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

            if ($sub === 'maintenance') {
                if ($method === 'GET') $this->getMaintenanceHistory($id);
                elseif ($method === 'POST') $this->addMaintenance($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getAsset($id);
                elseif ($method === 'PUT') $this->updateAsset($id);
                elseif ($method === 'DELETE') $this->deleteAsset($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listAssets();
                elseif ($method === 'POST') $this->createAsset();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listAssets() {
        $pag = Auth::paginate($_GET);
        $stmt = $this->db->prepare("SELECT * FROM assets WHERE deleted_at IS NULL ORDER BY asset_number ASC LIMIT {$pag['limit']} OFFSET {$pag['offset']}");
        $stmt->execute();

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM assets WHERE deleted_at IS NULL");
        $cnt->execute();

        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll(), 'total' => (int)$cnt->fetchColumn()]);
    }

    private function getAsset($id) {
        $stmt = $this->db->prepare("SELECT * FROM assets WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$id]);
        $asset = $stmt->fetch();
        if (!$asset) $this->sendResponse(404, ['error' => 'Asset not found']);

        $mStmt = $this->db->prepare("SELECT * FROM asset_maintenance WHERE asset_id = ? ORDER BY scheduled_date DESC");
        $mStmt->execute([$id]);
        $asset['maintenance'] = $mStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $asset]);
    }

    private function createAsset() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $astNum = 'AST-' . date('Y') . '-' . str_pad((string)rand(1, 999), 3, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO assets (asset_number, name, category, location, purchase_date, purchase_cost, `condition`, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'in_service', ?)
        ");
        $stmt->execute([
            $astNum,
            $data['name'],
            $data['category'] ?? 'general',
            $data['location'] ?? null,
            $data['purchase_date'] ?? date('Y-m-d'),
            $data['purchase_cost'] ?? 0.00,
            $data['condition'] ?? 'good',
            Auth::userId()
        ]);

        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId(), 'asset_number' => $astNum]);
    }

    private function updateAsset($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE assets SET name=?, category=?, location=?, purchase_cost=?, `condition`=?, status=? WHERE id=?");
        $stmt->execute([$data['name'], $data['category'], $data['location'], $data['purchase_cost'], $data['condition'], $data['status'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Asset updated']);
    }

    private function deleteAsset($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE assets SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Asset deleted']);
    }

    private function getMaintenanceHistory($assetId) {
        $stmt = $this->db->prepare("SELECT * FROM asset_maintenance WHERE asset_id = ? ORDER BY id DESC");
        $stmt->execute([$assetId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function addMaintenance($assetId) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("
            INSERT INTO asset_maintenance (asset_id, maintenance_type, description, scheduled_date, cost, status, created_by)
            VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
        ");
        $stmt->execute([
            $assetId,
            $data['maintenance_type'] ?? 'routine',
            $data['description'],
            $data['scheduled_date'] ?? date('Y-m-d'),
            $data['cost'] ?? 0.00,
            Auth::userId()
        ]);
        $this->sendResponse(201, ['success' => true, 'message' => 'Asset maintenance recorded']);
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
