<?php
/**
 * Payment Controller
 * Handles payment processing and tracking
 */

require_once __DIR__ . '/../services/MpesaService.php';
require_once __DIR__ . '/../services/PaypalService.php';
require_once __DIR__ . '/../services/StripeService.php';

class PaymentController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        // Special case for callbacks - no auth required
        $id = $parts[0] ?? '';
        if ($id === 'callback' && $method === 'POST') {
            $this->handleMpesaCallback();
            return;
        }

        if ($id === 'stripe-webhook' && $method === 'POST') {
            $this->handleStripeWebhook();
            return;
        }

        if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Authentication required']);
        }
        
        $subAction = $parts[1] ?? '';
        
        // /api/payment/callback handled above
        
        if (empty($id)) {
            // /api/payment - create payment
            if ($method === 'POST') {
                $this->createPayment();
            } else {
                $this->methodNotAllowed();
            }
        } else if ($subAction === 'status') {
            // /api/payment/:id/status - update payment status
            if ($method === 'PUT') {
                $this->updatePaymentStatus($id);
            } else {
                $this->methodNotAllowed();
            }
        } else if ($id === 'paypal-capture' && $method === 'POST') {
            $this->capturePaypalOrder();
        } else {
            // /api/payment/:id - get payment details
            if ($method === 'GET') {
                if ($id === 'list' || isset($_GET['all'])) {
                     $this->listPayments();
                } else {
                     $this->getPayment($id);
                }
            } else {
                $this->methodNotAllowed();
            }
        }
    }
    
    private function createPayment() {
        $data = $this->getJsonInput();
        
        $required = ['amount', 'payment_method', 'payment_type'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                $this->sendResponse(400, ['error' => "Field '$field' is required"]);
            }
        }
        
        // Use current user's ID if not admin
        $memberId = $this->isAdmin() && isset($data['member_id']) 
            ? $data['member_id'] 
            : $_SESSION['user_id'];
        
        try {
            // Generate invoice number
            $invoiceNumber = $this->generateInvoiceNumber();
            
            $stmt = $this->db->prepare("
                INSERT INTO payments (
                    member_id, amount, currency, payment_method, transaction_reference,
                    payment_status, payment_type, description, invoice_number, 
                    invoice_date, membership_type_id, event_id, payment_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?)
            ");
            
            $stmt->execute([
                $memberId,
                $data['amount'],
                $data['currency'] ?? 'KES',
                $data['payment_method'],
                $data['transaction_reference'] ?? null,
                $data['payment_status'] ?? 'pending',
                $data['payment_type'],
                $data['description'] ?? null,
                $invoiceNumber,
                $data['membership_type_id'] ?? null,
                $data['event_id'] ?? null,
                $data['payment_date'] ?? null
            ]);
            
            $paymentId = $this->db->lastInsertId();
            $gatewayResponse = null;

            // Handle M-Pesa STK Push
            if (in_array(strtolower($data['payment_method']), ['mpesa', 'm-pesa'])) {
                if (empty($data['phone_number'])) {
                    $this->updatePaymentStatusDb($paymentId, 'failed');
                    $this->sendResponse(400, ['error' => 'Phone number required for M-Pesa payment']);
                }

                try {
                    $mpesaService = new MpesaService();
                    $response = $mpesaService->stkPush($data['phone_number'], $data['amount'], $invoiceNumber);
                    
                    if (isset($response->ResponseCode) && $response->ResponseCode === '0') {
                        $gatewayResponse = $response;
                        $this->updateTransactionRef($paymentId, $response->CheckoutRequestID);
                    } else {
                        throw new Exception($response->errorMessage ?? 'M-Pesa request failed');
                    }
                } catch (Exception $e) {
                    $this->updatePaymentStatusDb($paymentId, 'failed');
                    $this->sendResponse(500, ['error' => 'M-Pesa initiation failed: ' . $e->getMessage()]);
                }
            } 
            // Handle PayPal Order Creation
            else if (strtolower($data['payment_method']) === 'paypal') {
                try {
                    $paypalService = new PaypalService();
                    $order = $paypalService->createOrder($data['amount'], $data['currency'] ?? 'USD', $invoiceNumber);
                    
                    if (isset($order->id)) {
                        $gatewayResponse = $order;
                        $this->updateTransactionRef($paymentId, $order->id);
                    } else {
                        throw new Exception('Failed to create PayPal order');
                    }
                } catch (Exception $e) {
                    $this->updatePaymentStatusDb($paymentId, 'failed');
                    $this->sendResponse(500, ['error' => 'PayPal initiation failed: ' . $e->getMessage()]);
                }
            }
            // Handle Stripe PaymentIntent
            else if (in_array(strtolower($data['payment_method']), ['stripe', 'card', 'visa'])) {
                try {
                    $stripeService = new StripeService();
                    $intent = $stripeService->createPaymentIntent($data['amount'], $data['currency'] ?? 'usd', [
                        'payment_id' => $paymentId,
                        'invoice_number' => $invoiceNumber,
                        'member_id' => $memberId
                    ]);
                    
                    if (isset($intent->id)) {
                        $gatewayResponse = $intent;
                        $this->updateTransactionRef($paymentId, $intent->id);
                    } else {
                        throw new Exception('Failed to create Stripe PaymentIntent');
                    }
                } catch (Exception $e) {
                    $this->updatePaymentStatusDb($paymentId, 'failed');
                    $this->sendResponse(500, ['error' => 'Stripe initiation failed: ' . $e->getMessage()]);
                }
            }
            
            // If payment is for membership and status is completed (manual), update member
            if ($data['payment_type'] === 'membership' && 
                ($data['payment_status'] ?? 'pending') === 'completed' &&
                isset($data['membership_type_id'])) {
                $this->updateMembershipStatus($memberId, $data['membership_type_id']);
            }
            
            $this->sendResponse(201, [
                'success' => true,
                'message' => 'Payment recorded successfully',
                'payment_id' => $paymentId,
                'invoice_number' => $invoiceNumber,
                'gateway_response' => $gatewayResponse
            ]);
            
        } catch (PDOException $e) {
            error_log("Create payment error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to record payment']);
        }
    }
    
    private function handleMpesaCallback() {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        // Log callback for debugging
        file_put_contents(__DIR__ . '/../../mpesa.log', date('[Y-m-d H:i:s] ') . $json . "\n", FILE_APPEND);
        
        if (!isset($data['Body']['stkCallback'])) {
            $this->sendResponse(400, ['error' => 'Invalid callback data']);
        }
        
        $callback = $data['Body']['stkCallback'];
        $checkoutRequestId = $callback['CheckoutRequestID'];
        $resultCode = $callback['ResultCode'];
        
        try {
            // Find payment by CheckoutRequestID (stored in transaction_reference)
            $stmt = $this->db->prepare("SELECT id, payment_type, membership_type_id, member_id FROM payments WHERE transaction_reference = ?");
            $stmt->execute([$checkoutRequestId]);
            $payment = $stmt->fetch();
            
            if ($payment) {
                $status = ($resultCode == 0) ? 'completed' : 'failed';
                $this->updatePaymentStatusDb($payment['id'], $status);
                
                if ($status === 'completed' && $payment['payment_type'] === 'membership') {
                    $this->updateMembershipStatus($payment['member_id'], $payment['membership_type_id']);
                }
            }
            
        } catch (PDOException $e) {
            error_log("M-Pesa Callback Error: " . $e->getMessage());
        }
        
        // Always respond success to Safaricom
        $this->sendResponse(200, ['result' => 'success']);
    }

    private function capturePaypalOrder() {
        $data = $this->getJsonInput();
        if (empty($data['order_id']) || empty($data['payment_id'])) {
            $this->sendResponse(400, ['error' => 'Order ID and Payment ID are required']);
        }
        
        try {
            $paypalService = new PaypalService();
            $capture = $paypalService->captureOrder($data['order_id']);
            
            if (isset($capture->status) && $capture->status === 'COMPLETED') {
                $this->updatePaymentStatusDb($data['payment_id'], 'completed');
                
                // Get payment details to update membership
                $stmt = $this->db->prepare("SELECT member_id, payment_type, membership_type_id FROM payments WHERE id = ?");
                $stmt->execute([$data['payment_id']]);
                $payment = $stmt->fetch();
                
                if ($payment && $payment['payment_type'] === 'membership') {
                    $this->updateMembershipStatus($payment['member_id'], $payment['membership_type_id']);
                }
                
                $this->sendResponse(200, ['success' => true, 'capture' => $capture]);
            } else {
                throw new Exception('PayPal capture failed or incomplete');
            }
        } catch (Exception $e) {
            $this->sendResponse(500, ['error' => 'PayPal capture error: ' . $e->getMessage()]);
        }
    }

    private function handleStripeWebhook() {
        $payload = file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        
        // Log webhook for debugging
        file_put_contents(__DIR__ . '/../../stripe.log', date('[Y-m-d H:i:s] ') . $payload . "\n", FILE_APPEND);
        
        $data = json_decode($payload, true);
        if (!$data) $this->sendResponse(400, ['error' => 'Invalid payload']);

        $eventType = $data['type'];
        
        if ($eventType === 'payment_intent.succeeded') {
            $intentId = $data['data']['object']['id'];
            
            try {
                // Find payment by Transaction Reference (Intent ID)
                $stmt = $this->db->prepare("SELECT id, member_id, payment_type, membership_type_id FROM payments WHERE transaction_reference = ?");
                $stmt->execute([$intentId]);
                $payment = $stmt->fetch();
                
                if ($payment) {
                    $this->updatePaymentStatusDb($payment['id'], 'completed');
                    
                    if ($payment['payment_type'] === 'membership') {
                        $this->updateMembershipStatus($payment['member_id'], $payment['membership_type_id']);
                    }
                }
            } catch (PDOException $e) {
                error_log("Stripe Webhook DB Error: " . $e->getMessage());
            }
        }
        
        $this->sendResponse(200, ['received' => true]);
    }

    private function updateTransactionRef($id, $ref) {
        $stmt = $this->db->prepare("UPDATE payments SET transaction_reference = ? WHERE id = ?");
        $stmt->execute([$ref, $id]);
    }

    private function updatePaymentStatusDb($id, $status) {
        $stmt = $this->db->prepare("UPDATE payments SET payment_status = ?, payment_date = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$status, $id]);
    }
    
    private function getPayment($id) {
        try {
            $stmt = $this->db->prepare("
                SELECT p.*, m.first_name, m.last_name, m.email,
                       mt.name as membership_type_name
                FROM payments p
                JOIN members m ON p.member_id = m.id
                LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
                WHERE p.id = ?
            ");
            $stmt->execute([$id]);
            $payment = $stmt->fetch();
            
            if (!$payment) {
                $this->sendResponse(404, ['error' => 'Payment not found']);
            }
            
            // Check access rights
            if (!$this->isAdmin() && $payment['member_id'] != $_SESSION['user_id']) {
                $this->sendResponse(403, ['error' => 'Access denied']);
            }
            
            $this->sendResponse(200, ['payment' => $payment]);
            
        } catch (PDOException $e) {
            error_log("Get payment error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve payment']);
        }
    }
    
    private function listPayments() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(100, max(10, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
            
            $status = $_GET['status'] ?? null;
            $type = $_GET['type'] ?? null;
            $search = $_GET['search'] ?? null;
            
            $where = [];
            $params = [];
            
            if ($status) {
                $where[] = "p.payment_status = ?";
                $params[] = $status;
            }
            
            if ($type) {
                $where[] = "p.payment_type = ?";
                $params[] = $type;
            }

            if ($search) {
                $where[] = "(m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ? OR p.invoice_number LIKE ? OR p.transaction_reference LIKE ?)";
                $term = "%$search%";
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
            }
            
            $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
            
            // Count total
            $countStmt = $this->db->prepare("SELECT COUNT(*) FROM payments p $whereClause");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            // Get payments
            $stmt = $this->db->prepare("
                SELECT p.*, m.first_name, m.last_name, m.email,
                       mt.name as membership_type_name
                FROM payments p
                LEFT JOIN members m ON p.member_id = m.id
                LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
                $whereClause
                ORDER BY p.created_at DESC
                LIMIT $limit OFFSET $offset
            ");
            $stmt->execute($params);
            $payments = $stmt->fetchAll();
            
            $this->sendResponse(200, [
                'payments' => $payments,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log("List payments error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to list payments']);
        }
    }

    private function updatePaymentStatus($id) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        $data = $this->getJsonInput();
        
        if (empty($data['payment_status'])) {
            $this->sendResponse(400, ['error' => 'Payment status is required']);
        }
        
        try {
            // Get payment details
            $stmt = $this->db->prepare("
                SELECT member_id, payment_type, membership_type_id 
                FROM payments WHERE id = ?
            ");
            $stmt->execute([$id]);
            $payment = $stmt->fetch();
            
            if (!$payment) {
                $this->sendResponse(404, ['error' => 'Payment not found']);
            }
            
            // Update payment status
            $this->updatePaymentStatusDb($id, $data['payment_status']);
            
            // If payment completed for membership, update member status
            if ($data['payment_status'] === 'completed' && 
                $payment['payment_type'] === 'membership' &&
                $payment['membership_type_id']) {
                $this->updateMembershipStatus($payment['member_id'], $payment['membership_type_id']);
            }
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Payment status updated successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log("Update payment status error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update payment status']);
        }
    }
    
    private function updateMembershipStatus($memberId, $membershipTypeId) {
        try {
            // Get membership type details
            $stmt = $this->db->prepare("
                SELECT duration_type, duration_months 
                FROM membership_types WHERE id = ?
            ");
            $stmt->execute([$membershipTypeId]);
            $type = $stmt->fetch();
            
            if (!$type) return;
            
            // Calculate expiry date
            $expiryDate = null;
            if ($type['duration_type'] !== 'lifetime' && $type['duration_months']) {
                $expiryDate = date('Y-m-d', strtotime("+{$type['duration_months']} months"));
            }
            
            // Update member
            $stmt = $this->db->prepare("
                UPDATE members 
                SET membership_type_id = ?, status = 'active', expiry_date = ?
                WHERE id = ?
            ");
            $stmt->execute([$membershipTypeId, $expiryDate, $memberId]);
            
        } catch (PDOException $e) {
            error_log("Update membership status error: " . $e->getMessage());
        }
    }
    
    private function generateInvoiceNumber() {
        $year = date('Y');
        $month = date('m');
        $prefix = "INV{$year}{$month}";
        
        $stmt = $this->db->prepare("
            SELECT invoice_number FROM payments 
            WHERE invoice_number LIKE ? 
            ORDER BY id DESC LIMIT 1
        ");
        $stmt->execute(["{$prefix}%"]);
        $lastInvoice = $stmt->fetchColumn();
        
        if ($lastInvoice) {
            $number = intval(substr($lastInvoice, -4)) + 1;
        } else {
            $number = 1;
        }
        
        return $prefix . str_pad($number, 4, '0', STR_PAD_LEFT);
    }
    
    private function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
    
    private function isAdmin() {
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
    }
    
    private function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }
    
    private function sendResponse($statusCode, $data) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit();
    }
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
