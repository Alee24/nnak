<?php
/**
 * Product Controller
 * Golf Shop inventory, categories, stock movements, low stock alerts
 */

class ProductController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'categories') {
            if ($method === 'GET') $this->getCategories();
            elseif ($method === 'POST') $this->createCategory();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'low-stock') {
            if ($method === 'GET') $this->getLowStock();
            else $this->methodNotAllowed();
            return;
        }

        if (numeric_id($action)) {
            $id = (int)$action;
            $sub = $parts[1] ?? '';

            if ($sub === 'stock') {
                if ($method === 'POST') $this->addStock($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'sell') {
                if ($method === 'POST') $this->sellProduct($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'movements') {
                if ($method === 'GET') $this->getMovements($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getProduct($id);
                elseif ($method === 'PUT') $this->updateProduct($id);
                elseif ($method === 'DELETE') $this->deleteProduct($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listProducts();
                elseif ($method === 'POST') $this->createProduct();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listProducts() {
        $pag = Auth::paginate($_GET);
        $where = ["p.deleted_at IS NULL"];
        $bindings = [];

        if (!empty($_GET['type'])) {
            $where[] = "pc.type = ?";
            $bindings[] = $_GET['type'];
        }

        if (!empty($_GET['category_id'])) {
            $where[] = "p.category_id = ?";
            $bindings[] = (int)$_GET['category_id'];
        }

        if (!empty($_GET['search'])) {
            $where[] = "(p.name LIKE ? OR p.sku LIKE ?)";
            $term = "%" . $_GET['search'] . "%";
            array_push($bindings, $term, $term);
        }

        $whereClause = implode(" AND ", $where);

        $stmt = $this->db->prepare("
            SELECT p.*, pc.name as category_name, pc.type as category_type
            FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id
            WHERE $whereClause ORDER BY p.name ASC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute($bindings);

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE $whereClause");
        $cnt->execute($bindings);

        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll(), 'total' => (int)$cnt->fetchColumn()]);
    }

    private function getProduct($id) {
        $stmt = $this->db->prepare("SELECT p.*, pc.name as category_name FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.id = ? AND p.deleted_at IS NULL");
        $stmt->execute([$id]);
        $prod = $stmt->fetch();
        if (!$prod) $this->sendResponse(404, ['error' => 'Product not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $prod]);
    }

    private function createProduct() {
        Auth::requireRole('admin', 'super_admin', 'store_manager');
        $data = $this->getJsonInput();
        $sku = $data['sku'] ?? ('SKU-' . rand(1000, 9999));

        $stmt = $this->db->prepare("
            INSERT INTO products (sku, name, description, category_id, unit, selling_price, cost_price, member_price, stock_quantity, minimum_stock, is_rentable, rental_rate, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $sku,
            $data['name'],
            $data['description'] ?? null,
            $data['category_id'] ?? null,
            $data['unit'] ?? 'each',
            $data['selling_price'],
            $data['cost_price'] ?? 0.00,
            $data['member_price'] ?? null,
            $data['stock_quantity'] ?? 0,
            $data['minimum_stock'] ?? 5,
            !empty($data['is_rentable']) ? 1 : 0,
            $data['rental_rate'] ?? 0.00,
            Auth::userId()
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'id' => $id, 'message' => 'Product created']);
    }

    private function updateProduct($id) {
        Auth::requireRole('admin', 'super_admin', 'store_manager');
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE products SET name=?, category_id=?, selling_price=?, cost_price=?, member_price=?, minimum_stock=?, is_rentable=?, rental_rate=? WHERE id=?");
        $stmt->execute([$data['name'], $data['category_id'], $data['selling_price'], $data['cost_price'], $data['member_price'], $data['minimum_stock'], !empty($data['is_rentable']) ? 1 : 0, $data['rental_rate'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Product updated']);
    }

    private function deleteProduct($id) {
        Auth::requireRole('admin', 'super_admin', 'store_manager');
        $stmt = $this->db->prepare("UPDATE products SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Product deleted']);
    }

    private function getCategories() {
        $stmt = $this->db->prepare("SELECT * FROM product_categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function createCategory() {
        Auth::requireRole('admin', 'super_admin', 'store_manager');
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("INSERT INTO product_categories (name, code, type, description) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['code'] ?? strtoupper(substr($data['name'], 0, 4)), $data['type'] ?? 'golf_shop', $data['description'] ?? null]);
        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function addStock($productId) {
        Auth::requireRole('admin', 'super_admin', 'store_manager');
        $data = $this->getJsonInput();
        $qty = (float)($data['quantity'] ?? 0);

        $stmt = $this->db->prepare("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?");
        $stmt->execute([$qty, $productId]);

        $mStmt = $this->db->prepare("INSERT INTO inventory_movements (product_id, movement_type, quantity, unit_cost, notes, performed_by) VALUES (?, 'purchase', ?, ?, ?, ?)");
        $mStmt->execute([$productId, $qty, $data['unit_cost'] ?? 0, $data['notes'] ?? 'Restock', Auth::userId()]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Stock added']);
    }

    private function sellProduct($productId) {
        $data = $this->getJsonInput();
        $qty = (float)($data['quantity'] ?? 1);

        $stmt = $this->db->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
        $stmt->execute([$qty, $productId]);

        $mStmt = $this->db->prepare("INSERT INTO inventory_movements (product_id, movement_type, quantity, performed_by) VALUES (?, 'sale', ?, ?)");
        $mStmt->execute([$productId, -$qty, Auth::userId()]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Sale recorded']);
    }

    private function getMovements($productId) {
        $stmt = $this->db->prepare("SELECT im.*, u.first_name, u.last_name FROM inventory_movements im LEFT JOIN members u ON im.performed_by = u.id WHERE im.product_id = ? ORDER BY im.id DESC");
        $stmt->execute([$productId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getLowStock() {
        $stmt = $this->db->prepare("SELECT p.*, pc.name as category_name FROM products p LEFT JOIN product_categories pc ON p.category_id = pc.id WHERE p.stock_quantity <= p.minimum_stock AND p.deleted_at IS NULL");
        $stmt->execute();
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
