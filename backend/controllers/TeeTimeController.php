<?php
/**
 * Tee Time Controller
 * Handles tee-time booking, slot generation, player assignments, daily sheets
 */

class TeeTimeController {
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

            if ($sub === 'book') {
                if ($method === 'POST') $this->bookSlot($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'players') {
                if ($method === 'DELETE') $this->removePlayer($id, (int)($parts[2] ?? 0));
                else $this->methodNotAllowed();
            } elseif ($sub === 'checkin') {
                if ($method === 'POST') $this->checkinPlayer($id, (int)($parts[2] ?? 0));
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getTeeTime($id);
                elseif ($method === 'DELETE') $this->cancelTeeTime($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listTeeTimes();
                elseif ($method === 'POST') $this->createSlot();
                else $this->methodNotAllowed();
                break;
            case 'available':
                if ($method === 'GET') $this->getAvailable();
                else $this->methodNotAllowed();
                break;
            case 'daily':
                if ($method === 'GET') $this->getDailySheet();
                else $this->methodNotAllowed();
                break;
            case 'generate-slots':
                if ($method === 'POST') $this->generateSlots();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listTeeTimes() {
        $date = $_GET['date'] ?? date('Y-m-d');
        $courseId = $_GET['course_id'] ?? 1;

        $stmt = $this->db->prepare("
            SELECT tt.*, gc.name as course_name
            FROM tee_times tt
            JOIN golf_courses gc ON tt.course_id = gc.id
            WHERE tt.booking_date = ? AND tt.course_id = ? AND tt.deleted_at IS NULL
            ORDER BY tt.tee_time ASC
        ");
        $stmt->execute([$date, $courseId]);
        $slots = $stmt->fetchAll();

        foreach ($slots as &$slot) {
            $pStmt = $this->db->prepare("
                SELECT tp.*, m.first_name, m.last_name, m.membership_number, g.first_name as guest_fn, g.last_name as guest_ln
                FROM tee_time_players tp
                LEFT JOIN members m ON tp.member_id = m.id
                LEFT JOIN guests g ON tp.guest_id = g.id
                WHERE tp.tee_time_id = ?
            ");
            $pStmt->execute([$slot['id']]);
            $slot['players'] = $pStmt->fetchAll();
        }

        $this->sendResponse(200, ['success' => true, 'data' => $slots]);
    }

    private function getTeeTime($id) {
        $stmt = $this->db->prepare("SELECT tt.*, gc.name as course_name FROM tee_times tt JOIN golf_courses gc ON tt.course_id = gc.id WHERE tt.id = ?");
        $stmt->execute([$id]);
        $slot = $stmt->fetch();
        if (!$slot) $this->sendResponse(404, ['error' => 'Tee time slot not found']);

        $pStmt = $this->db->prepare("SELECT tp.*, m.first_name, m.last_name, m.membership_number FROM tee_time_players tp LEFT JOIN members m ON tp.member_id = m.id WHERE tp.tee_time_id = ?");
        $pStmt->execute([$id]);
        $slot['players'] = $pStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $slot]);
    }

    private function createSlot() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("INSERT INTO tee_times (course_id, booking_date, tee_time, starting_hole, max_players, status, created_by) VALUES (?, ?, ?, ?, ?, 'available', ?)");
        $stmt->execute([
            $data['course_id'] ?? 1,
            $data['booking_date'],
            $data['tee_time'],
            $data['starting_hole'] ?? 1,
            $data['max_players'] ?? 4,
            Auth::userId()
        ]);
        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function bookSlot($id) {
        $data = $this->getJsonInput();
        $memberId = Auth::isMemberOnly() ? Auth::userId() : ($data['member_id'] ?? Auth::userId());

        // Check slot capacity
        $slotStmt = $this->db->prepare("SELECT * FROM tee_times WHERE id = ?");
        $slotStmt->execute([$id]);
        $slot = $slotStmt->fetch();

        if (!$slot || $slot['status'] === 'blocked') {
            $this->sendResponse(400, ['error' => 'Tee time is unavailable or blocked']);
        }

        if ($slot['booked_players'] >= $slot['max_players']) {
            $this->sendResponse(400, ['error' => 'Tee time slot is fully booked']);
        }

        // Prevent double booking for same member on same date
        $checkStmt = $this->db->prepare("
            SELECT COUNT(*) FROM tee_time_players tp
            JOIN tee_times tt ON tp.tee_time_id = tt.id
            WHERE tp.member_id = ? AND tt.booking_date = ? AND tt.status NOT IN ('cancelled')
        ");
        $checkStmt->execute([$memberId, $slot['booking_date']]);
        if ((int)$checkStmt->fetchColumn() > 0) {
            $this->sendResponse(400, ['error' => 'Member already has a booking on this date']);
        }

        $this->db->beginTransaction();
        try {
            $pStmt = $this->db->prepare("
                INSERT INTO tee_time_players (tee_time_id, member_id, player_type, caddy_id, cart_id, handicap)
                VALUES (?, ?, 'member', ?, ?, ?)
            ");
            $pStmt->execute([
                $id,
                $memberId,
                $data['caddy_id'] ?? null,
                $data['cart_id'] ?? null,
                $data['handicap'] ?? null
            ]);

            $newCount = $slot['booked_players'] + 1;
            $newStatus = ($newCount >= $slot['max_players']) ? 'booked' : 'available';

            $upd = $this->db->prepare("UPDATE tee_times SET booked_players = ?, status = ? WHERE id = ?");
            $upd->execute([$newCount, $newStatus, $id]);

            $this->db->commit();
            $this->sendResponse(200, ['success' => true, 'message' => 'Tee time booked successfully']);
        } catch (Exception $e) {
            $this->db->rollBack();
            $this->sendResponse(500, ['error' => 'Booking failed: ' . $e->getMessage()]);
        }
    }

    private function removePlayer($teeTimeId, $playerId) {
        $stmt = $this->db->prepare("DELETE FROM tee_time_players WHERE id = ? AND tee_time_id = ?");
        $stmt->execute([$playerId, $teeTimeId]);

        // Recount
        $cntStmt = $this->db->prepare("SELECT COUNT(*) FROM tee_time_players WHERE tee_time_id = ?");
        $cntStmt->execute([$teeTimeId]);
        $cnt = (int)$cntStmt->fetchColumn();

        $upd = $this->db->prepare("UPDATE tee_times SET booked_players = ?, status = 'available' WHERE id = ?");
        $upd->execute([$cnt, $teeTimeId]);

        $this->sendResponse(200, ['success' => true, 'message' => 'Player removed']);
    }

    private function cancelTeeTime($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE tee_times SET status = 'cancelled' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Tee time cancelled']);
    }

    private function checkinPlayer($teeTimeId, $playerId) {
        $stmt = $this->db->prepare("UPDATE tee_time_players SET checked_in = 1, checked_in_at = NOW() WHERE id = ? AND tee_time_id = ?");
        $stmt->execute([$playerId, $teeTimeId]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Player checked in']);
    }

    private function getAvailable() {
        $date = $_GET['date'] ?? date('Y-m-d');
        $courseId = $_GET['course_id'] ?? 1;

        $stmt = $this->db->prepare("
            SELECT * FROM tee_times
            WHERE booking_date = ? AND course_id = ? AND booked_players < max_players AND status != 'blocked' AND deleted_at IS NULL
            ORDER BY tee_time ASC
        ");
        $stmt->execute([$date, $courseId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getDailySheet() {
        $this->listTeeTimes();
    }

    private function generateSlots() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $date = $data['booking_date'] ?? date('Y-m-d');
        $courseId = (int)($data['course_id'] ?? 1);
        $interval = (int)($data['interval_minutes'] ?? 10);
        $startStr = $data['start_time'] ?? '06:30';
        $endStr = $data['end_time'] ?? '17:30';

        $start = strtotime("$date $startStr");
        $end = strtotime("$date $endStr");

        $stmt = $this->db->prepare("
            INSERT IGNORE INTO tee_times (course_id, booking_date, tee_time, starting_hole, max_players, status, created_by)
            VALUES (?, ?, ?, 1, 4, 'available', ?)
        ");

        $count = 0;
        for ($t = $start; $t <= $end; $t += ($interval * 60)) {
            $tTime = date('H:i:00', $t);
            $stmt->execute([$courseId, $date, $tTime, Auth::userId()]);
            $count++;
        }

        $this->sendResponse(200, ['success' => true, 'message' => "Generated $count slots for $date"]);
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
