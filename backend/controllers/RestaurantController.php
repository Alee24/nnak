<?php
/**
 * Restaurant Controller
 * POS orders, tables, member charges, menu items
 */

class RestaurantController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'tables') {
            $id = (int)($parts[1] ?? 0);
            $sub = $parts[2] ?? '';
            if ($id > 0) {
                if ($sub === 'status') {
                    if ($method === 'PUT') $this->updateTableStatus($id);
                    else $this->methodNotAllowed();
                } else {
                    if ($method === 'PUT') $this->updateTable($id);
                    else $this->methodNotAllowed();
                }
            } else {
                if ($method === 'GET') $this->listTables();
                elseif ($method === 'POST') $this->createTable();
                else $this->methodNotAllowed();
            }
            return;
        }

        if ($action === 'menu') {
            if ($method === 'GET') $this->getMenu();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'daily-sales') {
            if ($method === 'GET') $this->getDailySales();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'orders') {
            $id = (int)($parts[1] ?? 0);
            $sub = $parts[2] ?? '';

            if ($id > 0) {
                if ($sub === 'status') {
                    if ($method === 'PUT') $this->updateOrderStatus($id);
                    else $this->methodNotAllowed();
                } elseif ($sub === 'items') {
                    if ($method === 'POST') $this->addOrderItems($id);
                    else $this->methodNotAllowed();
                } elseif ($sub === 'pay') {
                    if ($method === 'POST') $this->payOrder($id);
                    else $this->methodNotAllowed();
                } else {
                    if ($method === 'GET') $this->getOrder($id);
                    else $this->methodNotAllowed();
                }
            } else {
                if ($method === 'GET') $this->listOrders();
                elseif ($method === 'POST') $this->createOrder();
                else $this->methodNotAllowed();
            }
            return;
        }

        $this->sendResponse(404, ['error' => 'Action not found']);
    }

    private function listTables() {
        $stmt = $this->db->prepare("SELECT * FROM restaurant_tables ORDER BY table_number ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function createTable() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("INSERT INTO restaurant_tables (table_number, name, capacity, section) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['table_number'], $data['name'] ?? null, $data['capacity'] ?? 4, $data['section'] ?? 'indoor']);
        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function updateTable($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE restaurant_tables SET name=?, capacity=?, section=? WHERE id=?");
        $stmt->execute([$data['name'], $data['capacity'], $data['section'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Table updated']);
    }

    private function updateTableStatus($id) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE restaurant_tables SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Table status updated']);
    }

    private function getMenu() {
        $stmt = $this->db->prepare("
            SELECT p.*, pc.name as category_name
            FROM products p JOIN product_categories pc ON p.category_id = pc.id
            WHERE pc.type IN ('restaurant','bar') AND p.is_active = 1 AND p.deleted_at IS NULL
            ORDER BY pc.name ASC, p.name ASC
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function listOrders() {
        $pag = Auth::paginate($_GET);
        $stmt = $this->db->prepare("
            SELECT ro.*, rt.table_number, m.first_name, m.last_name
            FROM restaurant_orders ro
            LEFT JOIN restaurant_tables rt ON ro.table_id = rt.id
            LEFT JOIN members m ON ro.member_id = m.id
            ORDER BY ro.id DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getOrder($id) {
        $stmt = $this->db->prepare("SELECT ro.*, rt.table_number, m.first_name, m.last_name FROM restaurant_orders ro LEFT JOIN restaurant_tables rt ON ro.table_id = rt.id LEFT JOIN members m ON ro.member_id = m.id WHERE ro.id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        $iStmt = $this->db->prepare("SELECT * FROM restaurant_order_items WHERE order_id = ?");
        $iStmt->execute([$id]);
        $order['items'] = $iStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $order]);
    }

    private function createOrder() {
        $data = $this->getJsonInput();
        $orderNum = 'ORD-' . date('Ymd') . '-' . str_pad((string)rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $this->db->prepare("
            INSERT INTO restaurant_orders (order_number, table_id, member_id, guest_name, order_type, status, waiter_id)
            VALUES (?, ?, ?, ?, ?, 'pending', ?)
        ");
        $stmt->execute([
            $orderNum,
            $data['table_id'] ?? null,
            $data['member_id'] ?? null,
            $data['guest_name'] ?? null,
            $data['order_type'] ?? 'dine_in',
            Auth::userId()
        ]);

        $orderId = (int)$this->db->lastInsertId();

        if (!empty($data['items'])) {
            $this->addItemsInternal($orderId, $data['items']);
        }

        $this->sendResponse(201, ['success' => true, 'id' => $orderId, 'order_number' => $orderNum]);
    }

    private function addOrderItems($orderId) {
        $data = $this->getJsonInput();
        $this->addItemsInternal($orderId, $data['items'] ?? []);
        $this->sendResponse(200, ['success' => true, 'message' => 'Items added']);
    }

    private function addItemsInternal($orderId, array $items) {
        $iStmt = $this->db->prepare("INSERT INTO restaurant_order_items (order_id, product_id, product_name, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)");
        $subtotal = 0;
        foreach ($items as $item) {
            $qty = (float)($item['quantity'] ?? 1);
            $price = (float)($item['unit_price'] ?? 0);
            $tot = $qty * $price;
            $iStmt->execute([$orderId, $item['product_id'], $item['product_name'], $qty, $price, $tot]);
            $subtotal += $tot;
        }
        $upd = $this->db->prepare("UPDATE restaurant_orders SET subtotal = subtotal + ?, total_amount = total_amount + ? WHERE id = ?");
        $upd->execute([$subtotal, $subtotal, $orderId]);
    }

    private function updateOrderStatus($id) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE restaurant_orders SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Order status updated']);
    }

    private function payOrder($id) {
        $data = $this->getJsonInput();
        $method = $data['payment_method'] ?? 'cash';

        $stmt = $this->db->prepare("SELECT * FROM restaurant_orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if ($method === 'member_charge' && !empty($order['member_id'])) {
            // Post charge to member account (create invoice item or direct statement debit)
            $invStmt = $this->db->prepare("
                INSERT INTO member_statements (member_id, transaction_date, description, debit, balance, reference_type, reference_id)
                VALUES (?, CURDATE(), ?, ?, ?, 'restaurant_order', ?)
            ");
            $invStmt->execute([$order['member_id'], "Restaurant Order #{$order['order_number']}", $order['total_amount'], $order['total_amount'], $id]);
        }

        $upd = $this->db->prepare("UPDATE restaurant_orders SET payment_status = 'paid', payment_method = ?, status = 'served' WHERE id = ?");
        $upd->execute([$method, $id]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Order paid']);
    }

    private function getDailySales() {
        $date = $_GET['date'] ?? date('Y-m-d');
        $stmt = $this->db->prepare("
            SELECT SUM(total_amount) as total_sales, COUNT(*) as total_orders
            FROM restaurant_orders WHERE DATE(created_at) = ? AND payment_status = 'paid'
        ");
        $stmt->execute([$date]);
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
