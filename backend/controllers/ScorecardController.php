<?php
/**
 * Scorecard Controller
 * Digital scorecards, hole-by-hole entries, gross/net/stableford calculations, approval workflow
 */

class ScorecardController {
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

            if ($sub === 'entries') {
                if ($method === 'POST') $this->saveEntries($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'approve') {
                if ($method === 'PUT') $this->approveScorecard($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'reject') {
                if ($method === 'PUT') $this->rejectScorecard($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getScorecard($id);
                elseif ($method === 'PUT') $this->updateScorecard($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listScorecards();
                elseif ($method === 'POST') $this->createScorecard();
                else $this->methodNotAllowed();
                break;
            case 'member':
                if ($method === 'GET') $this->getMemberScorecards((int)($parts[1] ?? 0));
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listScorecards() {
        $pag = Auth::paginate($_GET);
        $where = ["1=1"];
        $bindings = [];

        if (Auth::isMemberOnly()) {
            $where[] = "sc.member_id = ?";
            $bindings[] = Auth::userId();
        }

        if (!empty($_GET['competition_id'])) {
            $where[] = "sc.competition_id = ?";
            $bindings[] = (int)$_GET['competition_id'];
        }

        if (!empty($_GET['status'])) {
            $where[] = "sc.status = ?";
            $bindings[] = $_GET['status'];
        }

        $whereClause = implode(" AND ", $where);

        $stmt = $this->db->prepare("
            SELECT sc.*, m.first_name, m.last_name, m.membership_number, gc.name as course_name
            FROM scorecards sc
            JOIN members m ON sc.member_id = m.id
            JOIN golf_courses gc ON sc.course_id = gc.id
            WHERE $whereClause ORDER BY sc.play_date DESC, sc.id DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute($bindings);

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM scorecards sc WHERE $whereClause");
        $cnt->execute($bindings);

        $this->sendResponse(200, [
            'success' => true,
            'data' => $stmt->fetchAll(),
            'total' => (int)$cnt->fetchColumn()
        ]);
    }

    private function getScorecard($id) {
        $stmt = $this->db->prepare("
            SELECT sc.*, m.first_name, m.last_name, m.membership_number, gc.name as course_name
            FROM scorecards sc JOIN members m ON sc.member_id = m.id JOIN golf_courses gc ON sc.course_id = gc.id
            WHERE sc.id = ?
        ");
        $stmt->execute([$id]);
        $sc = $stmt->fetch();
        if (!$sc) $this->sendResponse(404, ['error' => 'Scorecard not found']);

        $eStmt = $this->db->prepare("SELECT * FROM scorecard_entries WHERE scorecard_id = ? ORDER BY hole_number ASC");
        $eStmt->execute([$id]);
        $sc['entries'] = $eStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $sc]);
    }

    private function createScorecard() {
        $data = $this->getJsonInput();
        $memberId = Auth::isMemberOnly() ? Auth::userId() : ($data['member_id'] ?? Auth::userId());

        // Get member handicap
        $hStmt = $this->db->prepare("SELECT handicap_index FROM members WHERE id = ?");
        $hStmt->execute([$memberId]);
        $hcp = (float)($hStmt->fetchColumn() ?: 0.0);

        $stmt = $this->db->prepare("
            INSERT INTO scorecards (member_id, course_id, competition_id, tee_time_id, play_date, tee_box, handicap_at_play, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        ");
        $stmt->execute([
            $memberId,
            $data['course_id'] ?? 1,
            $data['competition_id'] ?? null,
            $data['tee_time_id'] ?? null,
            $data['play_date'] ?? date('Y-m-d'),
            $data['tee_box'] ?? 'yellow',
            $hcp
        ]);

        $scId = (int)$this->db->lastInsertId();

        if (!empty($data['entries'])) {
            $this->saveHoleEntriesInternal($scId, $data['entries'], $hcp);
        }

        $this->sendResponse(201, ['success' => true, 'id' => $scId, 'message' => 'Scorecard created']);
    }

    private function saveEntries($id) {
        $data = $this->getJsonInput();
        $entries = $data['entries'] ?? [];

        $scStmt = $this->db->prepare("SELECT handicap_at_play FROM scorecards WHERE id = ?");
        $scStmt->execute([$id]);
        $hcp = (float)($scStmt->fetchColumn() ?: 0.0);

        $this->saveHoleEntriesInternal($id, $entries, $hcp);
        $this->sendResponse(200, ['success' => true, 'message' => 'Hole scores saved']);
    }

    private function saveHoleEntriesInternal($scId, array $entries, float $hcp) {
        $stmt = $this->db->prepare("
            INSERT INTO scorecard_entries (scorecard_id, hole_number, par, stroke_index, strokes, putts, fairway_hit, green_in_regulation, penalties, net_strokes, stableford_points)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE strokes=VALUES(strokes), putts=VALUES(putts), fairway_hit=VALUES(fairway_hit), green_in_regulation=VALUES(green_in_regulation), penalties=VALUES(penalties), net_strokes=VALUES(net_strokes), stableford_points=VALUES(stableford_points)
        ");

        $totalStrokes = 0;
        $totalPutts = 0;
        $totalStableford = 0;

        foreach ($entries as $e) {
            $holeNum = (int)$e['hole_number'];
            $par = (int)($e['par'] ?? 4);
            $si = (int)($e['stroke_index'] ?? $holeNum);
            $strokes = (int)($e['strokes'] ?? 0);
            $putts = (int)($e['putts'] ?? 0);

            // Compute handicap stroke allowance for this hole
            $hcpAllowance = (int)floor($hcp / 18) + (($hcp % 18 >= $si) ? 1 : 0);
            $netStrokes = max(1, $strokes - $hcpAllowance);

            // Stableford points = 2 + par - netStrokes
            $stb = max(0, 2 + $par - $netStrokes);

            $stmt->execute([
                $scId, $holeNum, $par, $si, $strokes, $putts,
                !empty($e['fairway_hit']) ? 1 : 0,
                !empty($e['green_in_regulation']) ? 1 : 0,
                (int)($e['penalties'] ?? 0),
                $netStrokes,
                $stb
            ]);

            $totalStrokes += $strokes;
            $totalPutts += $putts;
            $totalStableford += $stb;
        }

        // Update scorecard totals
        $upd = $this->db->prepare("
            UPDATE scorecards
            SET gross_score = ?, net_score = ?, stableford_points = ?, total_putts = ?, status = 'submitted'
            WHERE id = ?
        ");
        $upd->execute([$totalStrokes, max(1, $totalStrokes - (int)$hcp), $totalStableford, $totalPutts, $scId]);
    }

    private function approveScorecard($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager', 'golf_professional');
        $stmt = $this->db->prepare("UPDATE scorecards SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?");
        $stmt->execute([Auth::userId(), $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Scorecard approved']);
    }

    private function rejectScorecard($id) {
        Auth::requireRole('admin', 'super_admin', 'golf_manager', 'golf_professional');
        $stmt = $this->db->prepare("UPDATE scorecards SET status = 'rejected' WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Scorecard rejected']);
    }

    private function updateScorecard($id) {
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE scorecards SET notes = ? WHERE id = ?");
        $stmt->execute([$data['notes'] ?? null, $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Scorecard updated']);
    }

    private function getMemberScorecards($memberId) {
        if (Auth::isMemberOnly() && $memberId !== Auth::userId()) Auth::requireAdmin();
        $stmt = $this->db->prepare("SELECT sc.*, gc.name as course_name FROM scorecards sc JOIN golf_courses gc ON sc.course_id = gc.id WHERE sc.member_id = ? ORDER BY sc.play_date DESC");
        $stmt->execute([$memberId]);
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
