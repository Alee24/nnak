<?php
/**
 * Invoice Controller
 * Handles billing, invoices, items, and receipts
 */

class InvoiceController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if (numeric_id($action)) {
            $id = (int)$action;
            $subAction = $parts[1] ?? '';

            if ($subAction === 'items') {
                if ($method === 'POST') $this->addItem($id);
                elseif ($method === 'DELETE') $this->removeItem($id, (int)($parts[2] ?? 0));
                else $this->methodNotAllowed();
            } elseif ($subAction === 'send') {
                if ($method === 'PUT') $this->sendInvoice($id);
                else $this->methodNotAllowed();
            } elseif ($subAction === 'pdf') {
                if ($method === 'GET') $this->getInvoicePdfData($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getInvoice($id);
                elseif ($method === 'PUT') $this->updateInvoice($id);
                elseif ($method === 'DELETE') $this->cancelInvoice($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listInvoices();
                elseif ($method === 'POST') $this->createInvoice();
                else $this->methodNotAllowed();
                break;
            case 'member':
                if ($method === 'GET') $this->getMemberInvoices((int)($parts[1] ?? 0));
                else $this->methodNotAllowed();
                break;
            case 'overdue':
                if ($method === 'GET') $this->getOverdueInvoices();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listInvoices() {
        $params = $_GET;
        $pag = Auth::paginate($params);
        
        $where = ["i.deleted_at IS NULL"];
        $bindings = [];

        if (!empty($params['status'])) {
            $where[] = "i.status = ?";
            $bindings[] = $params['status'];
        }

        if (!empty($params['member_id'])) {
            $where[] = "i.member_id = ?";
            $bindings[] = (int)$params['member_id'];
        }

        if (!empty($params['search'])) {
            $where[] = "(i.invoice_number LIKE ? OR m.first_name LIKE ? OR m.last_name LIKE ? OR m.membership_number LIKE ?)";
            $term = "%" . $params['search'] . "%";
            array_push($bindings, $term, $term, $term, $term);
        }

        if (Auth::isMemberOnly()) {
            $where[] = "i.member_id = ?";
            $bindings[] = Auth::userId();
        }

        $whereClause = implode(" AND ", $where);

        $countStmt = $this->db->prepare("SELECT COUNT(*) FROM invoices i JOIN members m ON i.member_id = m.id WHERE $whereClause");
        $countStmt->execute($bindings);
        $total = (int)$countStmt->fetchColumn();

        $stmt = $this->db->prepare("
            SELECT i.*, m.first_name, m.last_name, m.email, m.membership_number, m.phone
            FROM invoices i
            JOIN members m ON i.member_id = m.id
            WHERE $whereClause
            ORDER BY i.id DESC
            LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute($bindings);
        $invoices = $stmt->fetchAll();

        $this->sendResponse(200, [
            'success' => true,
            'data' => $invoices,
            'total' => $total,
            'page' => $pag['page'],
            'limit' => $pag['limit']
        ]);
    }

    private function getInvoice($id) {
        $stmt = $this->db->prepare("
            SELECT i.*, m.first_name, m.last_name, m.email, m.membership_number, m.phone, m.postal_address
            FROM invoices i
            JOIN members m ON i.member_id = m.id
            WHERE i.id = ? AND i.deleted_at IS NULL
        ");
        $stmt->execute([$id]);
        $invoice = $stmt->fetch();

        if (!$invoice) {
            $this->sendResponse(404, ['error' => 'Invoice not found']);
        }

        if (Auth::isMemberOnly() && (int)$invoice['member_id'] !== Auth::userId()) {
            Auth::requireAdmin();
        }

        $itemsStmt = $this->db->prepare("SELECT * FROM invoice_items WHERE invoice_id = ?");
        $itemsStmt->execute([$id]);
        $invoice['items'] = $itemsStmt->fetchAll();

        $pmtStmt = $this->db->prepare("SELECT * FROM payments WHERE invoice_id = ? AND payment_status = 'completed'");
        $pmtStmt->execute([$id]);
        $invoice['payments'] = $pmtStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $invoice]);
    }

    private function createInvoice() {
        Auth::requireFinance();
        $data = $this->getJsonInput();

        if (empty($data['member_id'])) {
            $this->sendResponse(400, ['error' => 'Member ID is required']);
        }

        $memberId = (int)$data['member_id'];
        $invoiceDate = $data['invoice_date'] ?? date('Y-m-d');
        $dueDate = $data['due_date'] ?? date('Y-m-d', strtotime('+30 days'));
        $invoiceNum = 'INV-' . date('Ym') . '-' . str_pad((string)rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $items = $data['items'] ?? [];
        $subtotal = 0;
        foreach ($items as $item) {
            $subtotal += ($item['quantity'] ?? 1) * ($item['unit_price'] ?? 0);
        }
        $taxAmount = $data['tax_amount'] ?? 0;
        $totalAmount = $subtotal + $taxAmount;

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("
                INSERT INTO invoices (invoice_number, member_id, invoice_date, due_date, subtotal, tax_amount, total_amount, balance, status, notes, terms, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
            ");
            $stmt->execute([
                $invoiceNum,
                $memberId,
                $invoiceDate,
                $dueDate,
                $subtotal,
                $taxAmount,
                $totalAmount,
                $totalAmount,
                $data['notes'] ?? null,
                $data['terms'] ?? 'Payment due within 30 days.',
                Auth::userId()
            ]);
            $invoiceId = (int)$this->db->lastInsertId();

            if (!empty($items)) {
                $itemStmt = $this->db->prepare("
                    INSERT INTO invoice_items (invoice_id, description, item_type, quantity, unit_price, total)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                foreach ($items as $item) {
                    $qty = (float)($item['quantity'] ?? 1);
                    $price = (float)($item['unit_price'] ?? 0);
                    $tot = $qty * $price;
                    $itemStmt->execute([$invoiceId, $item['description'] ?? 'Item', $item['item_type'] ?? 'general', $qty, $price, $tot]);
                }
            }

            // Create Member Statement Entry (Debit)
            $stmtStmt = $this->db->prepare("
                INSERT INTO member_statements (member_id, transaction_date, description, debit, balance, reference_type, reference_id)
                VALUES (?, ?, ?, ?, ?, 'invoice', ?)
            ");
            $stmtStmt->execute([$memberId, $invoiceDate, "Invoice #$invoiceNum", $totalAmount, $totalAmount, $invoiceId]);

            $this->db->commit();
            Auth::audit($this->db, 'CREATE', 'Invoices', $invoiceId, 'Invoice', null, $invoiceNum);

            $this->sendResponse(201, ['success' => true, 'message' => 'Invoice created', 'id' => $invoiceId, 'invoice_number' => $invoiceNum]);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendResponse(500, ['error' => 'Failed to create invoice: ' . $e->getMessage()]);
        }
    }

    private function updateInvoice($id) {
        Auth::requireFinance();
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("UPDATE invoices SET notes = ?, terms = ?, due_date = ? WHERE id = ?");
        $stmt->execute([$data['notes'] ?? null, $data['terms'] ?? null, $data['due_date'] ?? null, $id]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Invoice updated']);
    }

    private function cancelInvoice($id) {
        Auth::requireFinance();
        $stmt = $this->db->prepare("UPDATE invoices SET status = 'cancelled' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Invoice cancelled']);
    }

    private function addItem($invoiceId) {
        Auth::requireFinance();
        $data = $this->getJsonInput();
        $qty = (float)($data['quantity'] ?? 1);
        $price = (float)($data['unit_price'] ?? 0);
        $total = $qty * $price;

        $stmt = $this->db->prepare("INSERT INTO invoice_items (invoice_id, description, item_type, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$invoiceId, $data['description'] ?? 'Item', $data['item_type'] ?? 'general', $qty, $price, $total]);

        // Recalculate totals
        $this->recalculateInvoice($invoiceId);
        $this->sendResponse(200, ['success' => true, 'message' => 'Item added']);
    }

    private function removeItem($invoiceId, $itemId) {
        Auth::requireFinance();
        $stmt = $this->db->prepare("DELETE FROM invoice_items WHERE id = ? AND invoice_id = ?");
        $stmt->execute([$itemId, $invoiceId]);
        $this->recalculateInvoice($invoiceId);
        $this->sendResponse(200, ['success' => true, 'message' => 'Item removed']);
    }

    private function recalculateInvoice($invoiceId) {
        $stmt = $this->db->prepare("SELECT SUM(total) FROM invoice_items WHERE invoice_id = ?");
        $stmt->execute([$invoiceId]);
        $subtotal = (float)$stmt->fetchColumn();

        $invStmt = $this->db->prepare("SELECT tax_amount, amount_paid FROM invoices WHERE id = ?");
        $invStmt->execute([$invoiceId]);
        $inv = $invStmt->fetch();

        $tax = (float)($inv['tax_amount'] ?? 0);
        $total = $subtotal + $tax;
        $paid = (float)($inv['amount_paid'] ?? 0);
        $balance = $total - $paid;

        $upd = $this->db->prepare("UPDATE invoices SET subtotal = ?, total_amount = ?, balance = ? WHERE id = ?");
        $upd->execute([$subtotal, $total, $balance, $invoiceId]);
    }

    private function sendInvoice($id) {
        Auth::requireFinance();
        $stmt = $this->db->prepare("UPDATE invoices SET status = 'sent' WHERE id = ? AND status = 'draft'");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Invoice sent']);
    }

    private function getInvoicePdfData($id) {
        $this->getInvoice($id);
    }

    private function getMemberInvoices($memberId) {
        if (Auth::isMemberOnly() && $memberId !== Auth::userId()) {
            Auth::requireAdmin();
        }
        $stmt = $this->db->prepare("SELECT * FROM invoices WHERE member_id = ? AND deleted_at IS NULL ORDER BY id DESC");
        $stmt->execute([$memberId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getOverdueInvoices() {
        Auth::requireFinance();
        $stmt = $this->db->prepare("
            SELECT i.*, m.first_name, m.last_name, m.phone, m.email
            FROM invoices i JOIN members m ON i.member_id = m.id
            WHERE i.due_date < CURDATE() AND i.balance > 0 AND i.status NOT IN ('paid','cancelled') AND i.deleted_at IS NULL
            ORDER BY i.due_date ASC
        ");
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

if (!function_exists('numeric_id')) {
    function numeric_id($val) {
        return is_numeric($val) && (int)$val > 0;
    }
}
