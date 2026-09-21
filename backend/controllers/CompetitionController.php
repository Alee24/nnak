<?php
/**
 * Competition Controller
 * Handles golf competitions, registration, live leaderboards, starting lists, and result publishing
 */

class CompetitionController {
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

            if ($sub === 'register') {
                if ($method === 'POST') $this->registerMember($id);
                elseif ($method === 'DELETE') $this->withdrawMember($id, (int)($parts[2] ?? 0));
                else $this->methodNotAllowed();
            } elseif ($sub === 'registrations') {
                if ($method === 'GET') $this->getRegistrations($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'leaderboard') {
                if ($method === 'GET') $this->getLeaderboard($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'tee-sheet') {
                if ($method === 'GET') $this->getTeeSheet($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'publish-results') {
                if ($method === 'POST') $this->publishResults($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'status') {
                if ($method === 'PUT') $this->updateStatus($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getCompetition($id);
                elseif ($method === 'PUT') $this->updateCompetition($id);
                elseif ($method === 'DELETE') $this->deleteCompetition($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listCompetitions();
                elseif ($method === 'POST') $this->createCompetition();
                else $this->methodNotAllowed();
                break;
            case 'upcoming':
                if ($method === 'GET') $this->getUpcoming();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listCompetitions() {
        $pag = Auth::paginate($_GET);
        $where = ["c.deleted_at IS NULL"];
        $bindings = [];

        if (!empty($_GET['status'])) {
            $where[] = "c.status = ?";
            $bindings[] = $_GET['status'];
        }

        $whereClause = implode(" AND ", $where);

        $stmt = $this->db->prepare("
            SELECT c.*, gc.name as course_name,
              (SELECT COUNT(*) FROM competition_registrations cr WHERE cr.competition_id = c.id) as registered_count
            FROM competitions c
            LEFT JOIN golf_courses gc ON c.course_id = gc.id
            WHERE $whereClause
            ORDER BY c.competition_date DESC
            LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute($bindings);

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM competitions c WHERE $whereClause");
        $cnt->execute($bindings);

        $this->sendResponse(200, [
            'success' => true,
            'data' => $stmt->fetchAll(),
            'total' => (int)$cnt->fetchColumn()
        ]);
    }

    private function getCompetition($id) {
        $stmt = $this->db->prepare("SELECT c.*, gc.name as course_name FROM competitions c LEFT JOIN golf_courses gc ON c.course_id = gc.id WHERE c.id = ? AND c.deleted_at IS NULL");
        $stmt->execute([$id]);
        $comp = $stmt->fetch();
        if (!$comp) $this->sendResponse(404, ['error' => 'Competition not found']);

        $regStmt = $this->db->prepare("
            SELECT cr.*, m.first_name, m.last_name, m.membership_number, m.handicap_index
            FROM competition_registrations cr JOIN members m ON cr.member_id = m.id
            WHERE cr.competition_id = ?
        ");
        $regStmt->execute([$id]);
        $comp['registrations'] = $regStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $comp]);
    }

    private function createCompetition() {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $data = $this->getJsonInput();

        $name = trim($data['name'] ?? '');
        if (!$name) $this->sendResponse(400, ['error' => 'Competition name required']);

        $stmt = $this->db->prepare("
            INSERT INTO competitions (name, course_id, competition_date, registration_deadline, format, entry_fee, sponsor, max_participants, prizes, description, rules, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'registration_open', ?)
        ");
        $stmt->execute([
            $name,
            $data['course_id'] ?? 1,
            $data['competition_date'],
            $data['registration_deadline'] ?? null,
            $data['format'] ?? 'stableford',
            $data['entry_fee'] ?? 0.00,
            $data['sponsor'] ?? null,
            $data['max_participants'] ?? 100,
            $data['prizes'] ?? null,
            $data['description'] ?? null,
            $data['rules'] ?? null,
            Auth::userId()
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'id' => $id, 'message' => 'Competition created']);
    }

    private function updateCompetition($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("UPDATE competitions SET name=?, competition_date=?, format=?, entry_fee=?, sponsor=?, max_participants=?, prizes=?, description=?, rules=? WHERE id=?");
        $stmt->execute([
            $data['name'], $data['competition_date'], $data['format'] ?? 'stableford', $data['entry_fee'] ?? 0, $data['sponsor'] ?? null, $data['max_participants'] ?? 100, $data['prizes'] ?? null, $data['description'] ?? null, $data['rules'] ?? null, $id
        ]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Competition updated']);
    }

    private function updateStatus($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE competitions SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Status updated']);
    }

    private function deleteCompetition($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $stmt = $this->db->prepare("UPDATE competitions SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Competition deleted']);
    }

    private function registerMember($comp_id) {
        $data = $this->getJsonInput();
        $memberId = Auth::isMemberOnly() ? Auth::userId() : ($data['member_id'] ?? Auth::userId());

        // Check if competition is open
        $compStmt = $this->db->prepare("SELECT * FROM competitions WHERE id = ? AND deleted_at IS NULL");
        $compStmt->execute([$comp_id]);
        $comp = $compStmt->fetch();

        if (!$comp || $comp['status'] === 'cancelled') {
            $this->sendResponse(400, ['error' => 'Competition not available for registration']);
        }

        // Get member handicap
        $hStmt = $this->db->prepare("SELECT handicap_index FROM members WHERE id = ?");
        $hStmt->execute([$memberId]);
        $hcp = $hStmt->fetchColumn() ?: 0.0;

        $stmt = $this->db->prepare("
            INSERT INTO competition_registrations (competition_id, member_id, handicap_at_registration, tee_box, payment_status, status)
            VALUES (?, ?, ?, ?, 'pending', 'registered')
            ON DUPLICATE KEY UPDATE status='registered'
        ");
        $stmt->execute([$comp_id, $memberId, $hcp, $data['tee_box'] ?? 'yellow']);

        $this->sendResponse(200, ['success' => true, 'message' => 'Registered for competition']);
    }

    private function withdrawMember($comp_id, $memberId) {
        if (Auth::isMemberOnly() && $memberId !== Auth::userId()) Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE competition_registrations SET status = 'withdrew' WHERE competition_id = ? AND member_id = ?");
        $stmt->execute([$comp_id, $memberId]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Withdrawn from competition']);
    }

    private function getRegistrations($id) {
        $stmt = $this->db->prepare("
            SELECT cr.*, m.first_name, m.last_name, m.membership_number, m.handicap_index, m.phone, m.email
            FROM competition_registrations cr JOIN members m ON cr.member_id = m.id
            WHERE cr.competition_id = ? AND cr.status != 'withdrew'
            ORDER BY cr.id ASC
        ");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getLeaderboard($id) {
        $compStmt = $this->db->prepare("SELECT format FROM competitions WHERE id = ?");
        $compStmt->execute([$id]);
        $format = $compStmt->fetchColumn() ?: 'stableford';

        $orderBy = ($format === 'stroke_play') ? "sc.net_score ASC" : "sc.stableford_points DESC";

        $stmt = $this->db->prepare("
            SELECT
              cr.id, cr.member_id, cr.handicap_at_registration, cr.status as reg_status,
              m.first_name, m.last_name, m.membership_number,
              sc.gross_score, sc.net_score, sc.stableford_points, sc.status as scorecard_status,
              (SELECT COUNT(*) FROM scorecard_entries se WHERE se.scorecard_id = sc.id AND se.strokes > 0) as holes_completed
            FROM competition_registrations cr
            JOIN members m ON cr.member_id = m.id
            LEFT JOIN scorecards sc ON (sc.competition_id = cr.competition_id AND sc.member_id = cr.member_id)
            WHERE cr.competition_id = ? AND cr.status != 'withdrew'
            ORDER BY $orderBy, sc.gross_score ASC
        ");
        $stmt->execute([$id]);
        $rows = $stmt->fetchAll();

        // Compute leaderboard positions
        $pos = 1;
        foreach ($rows as &$row) {
            $row['position'] = $pos++;
            $row['thru'] = $row['holes_completed'] ?: 0;
            $parDiff = ($row['gross_score'] ? ($row['gross_score'] - 72) : null);
            $row['score_to_par'] = ($parDiff === 0 ? 'E' : ($parDiff > 0 ? "+$parDiff" : (string)$parDiff));
        }

        $this->sendResponse(200, ['success' => true, 'data' => $rows, 'format' => $format]);
    }

    private function getTeeSheet($id) {
        $stmt = $this->db->prepare("
            SELECT cr.*, m.first_name, m.last_name, m.membership_number, m.handicap_index
            FROM competition_registrations cr JOIN members m ON cr.member_id = m.id
            WHERE cr.competition_id = ? AND cr.status != 'withdrew'
            ORDER BY cr.flight ASC, cr.tee_time ASC
        ");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function publishResults($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager');
        $stmt = $this->db->prepare("UPDATE competitions SET results_published = 1, status = 'completed' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Competition results published']);
    }

    private function getUpcoming() {
        $stmt = $this->db->prepare("
            SELECT c.*, gc.name as course_name
            FROM competitions c LEFT JOIN golf_courses gc ON c.course_id = gc.id
            WHERE c.competition_date >= CURDATE() AND c.status != 'cancelled' AND c.deleted_at IS NULL
            ORDER BY c.competition_date ASC LIMIT 5
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
