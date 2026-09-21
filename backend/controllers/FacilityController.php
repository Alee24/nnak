<?php
/**
 * Facility Controller
 * Club facility management and bookings with conflict prevention
 */

class FacilityController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'available') {
            if ($method === 'GET') $this->checkAvailability();
            else $this->methodNotAllowed();
            return;
        }

        if ($action === 'booking') {
            $sub = $parts[1] ?? '';
            if (numeric_id($sub)) {
                $bId = (int)$sub;
                $action2 = $parts[2] ?? '';
                if ($action2 === 'confirm') {
                    if ($method === 'PUT') $this->confirmBooking($bId);
                    else $this->methodNotAllowed();
                } else {
                    if ($method === 'GET') $this->getBooking($bId);
                    elseif ($method === 'DELETE') $this->cancelBooking($bId);
                    else $this->methodNotAllowed();
                }
            } else {
                if ($method === 'GET') $this->listBookings();
                elseif ($method === 'POST') $this->createBooking();
                else $this->methodNotAllowed();
            }
            return;
        }

        if (numeric_id($action)) {
            $id = (int)$action;
            $sub = $parts[1] ?? '';

            if ($sub === 'bookings') {
                if ($method === 'GET') $this->getFacilityBookings($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getFacility($id);
                elseif ($method === 'PUT') $this->updateFacility($id);
                elseif ($method === 'DELETE') $this->deleteFacility($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listFacilities();
                elseif ($method === 'POST') $this->createFacility();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listFacilities() {
        $stmt = $this->db->prepare("SELECT * FROM facilities WHERE deleted_at IS NULL ORDER BY name ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getFacility($id) {
        $stmt = $this->db->prepare("SELECT * FROM facilities WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$id]);
        $fac = $stmt->fetch();
        if (!$fac) $this->sendResponse(404, ['error' => 'Facility not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $fac]);
    }

    private function createFacility() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("
            INSERT INTO facilities (name, code, type, capacity, location, hourly_rate, daily_rate, member_hourly_rate, member_daily_rate, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
        ");
        $stmt->execute([
            $data['name'],
            $data['code'] ?? strtoupper(substr($data['name'], 0, 4)),
            $data['type'] ?? 'general',
            $data['capacity'] ?? 20,
            $data['location'] ?? null,
            $data['hourly_rate'] ?? 0,
            $data['daily_rate'] ?? 0,
            $data['member_hourly_rate'] ?? 0,
            $data['member_daily_rate'] ?? 0,
            $data['description'] ?? null
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'id' => $id, 'message' => 'Facility created']);
    }

    private function updateFacility($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE facilities SET name=?, capacity=?, hourly_rate=?, member_hourly_rate=?, daily_rate=?, member_daily_rate=?, description=?, status=? WHERE id=?");
        $stmt->execute([$data['name'], $data['capacity'], $data['hourly_rate'], $data['member_hourly_rate'], $data['daily_rate'], $data['member_daily_rate'], $data['description'] ?? null, $data['status'] ?? 'available', $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Facility updated']);
    }

    private function deleteFacility($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE facilities SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Facility deleted']);
    }

    private function checkAvailability() {
        $facilityId = (int)($_GET['facility_id'] ?? 0);
        $startTime = $_GET['start_time'] ?? '';
        $endTime = $_GET['end_time'] ?? '';

        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM facility_bookings
            WHERE facility_id = ? AND status NOT IN ('cancelled') AND ((start_time < ? AND end_time > ?))
        ");
        $stmt->execute([$facilityId, $endTime, $startTime]);
        $conflicts = (int)$stmt->fetchColumn();

        $this->sendResponse(200, ['success' => true, 'available' => ($conflicts === 0)]);
    }

    private function createBooking() {
        $data = $this->getJsonInput();
        $facilityId = (int)$data['facility_id'];
        $memberId = Auth::isMemberOnly() ? Auth::userId() : ($data['member_id'] ?? Auth::userId());
        $startTime = $data['start_time'];
        $endTime = $data['end_time'];

        // Conflict check
        $stmt = $this->db->prepare("
            SELECT COUNT(*) FROM facility_bookings
            WHERE facility_id = ? AND status NOT IN ('cancelled') AND ((start_time < ? AND end_time > ?))
        ");
        $stmt->execute([$facilityId, $endTime, $startTime]);
        if ((int)$stmt->fetchColumn() > 0) {
            $this->sendResponse(400, ['error' => 'Facility is already booked during this time slot']);
        }

        $bStmt = $this->db->prepare("
            INSERT INTO facility_bookings (facility_id, member_id, booking_date, start_time, end_time, purpose, total_amount, payment_status, status, created_by)
            VALUES (?, ?, DATE(?), ?, ?, ?, ?, 'pending', 'confirmed', ?)
        ");
        $bStmt->execute([
            $facilityId,
            $memberId,
            $startTime,
            $startTime,
            $endTime,
            $data['purpose'] ?? 'General',
            $data['total_amount'] ?? 0.00,
            Auth::userId()
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'id' => $id, 'message' => 'Facility booked']);
    }

    private function listBookings() {
        $pag = Auth::paginate($_GET);
        $where = ["fb.deleted_at IS NULL"];
        $bindings = [];

        if (Auth::isMemberOnly()) {
            $where[] = "fb.member_id = ?";
            $bindings[] = Auth::userId();
        }

        $whereClause = implode(" AND ", $where);

        $stmt = $this->db->prepare("
            SELECT fb.*, f.name as facility_name, m.first_name, m.last_name, m.membership_number
            FROM facility_bookings fb
            JOIN facilities f ON fb.facility_id = f.id
            JOIN members m ON fb.member_id = m.id
            WHERE $whereClause ORDER BY fb.start_time DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute($bindings);

        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getBooking($id) {
        $stmt = $this->db->prepare("
            SELECT fb.*, f.name as facility_name, m.first_name, m.last_name, m.membership_number
            FROM facility_bookings fb JOIN facilities f ON fb.facility_id = f.id JOIN members m ON fb.member_id = m.id
            WHERE fb.id = ?
        ");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetch()]);
    }

    private function confirmBooking($id) {
        $stmt = $this->db->prepare("UPDATE facility_bookings SET status = 'confirmed' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Booking confirmed']);
    }

    private function cancelBooking($id) {
        $stmt = $this->db->prepare("UPDATE facility_bookings SET status = 'cancelled' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Booking cancelled']);
    }

    private function getFacilityBookings($facilityId) {
        $stmt = $this->db->prepare("
            SELECT fb.*, m.first_name, m.last_name FROM facility_bookings fb JOIN members m ON fb.member_id = m.id
            WHERE fb.facility_id = ? AND fb.status != 'cancelled' ORDER BY fb.start_time DESC
        ");
        $stmt->execute([$facilityId]);
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
