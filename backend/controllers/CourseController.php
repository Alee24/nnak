<?php
/**
 * Course Controller
 * Golf courses & hole configuration
 */

class CourseController {
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

            if ($sub === 'holes') {
                if ($method === 'GET') $this->getCourseHoles($id);
                elseif ($method === 'POST') $this->saveCourseHoles($id);
                else $this->methodNotAllowed();
            } elseif ($sub === 'status') {
                if ($method === 'PUT') $this->updateStatus($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getCourse($id);
                elseif ($method === 'PUT') $this->updateCourse($id);
                elseif ($method === 'DELETE') $this->deleteCourse($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listCourses();
                elseif ($method === 'POST') $this->createCourse();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listCourses() {
        $stmt = $this->db->prepare("SELECT * FROM golf_courses WHERE deleted_at IS NULL ORDER BY name ASC");
        $stmt->execute();
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function getCourse($id) {
        $stmt = $this->db->prepare("SELECT * FROM golf_courses WHERE id = ? AND deleted_at IS NULL");
        $stmt->execute([$id]);
        $course = $stmt->fetch();
        if (!$course) $this->sendResponse(404, ['error' => 'Course not found']);

        $holesStmt = $this->db->prepare("SELECT * FROM golf_holes WHERE course_id = ? ORDER BY hole_number ASC");
        $holesStmt->execute([$id]);
        $course['holes'] = $holesStmt->fetchAll();

        $this->sendResponse(200, ['success' => true, 'data' => $course]);
    }

    private function createCourse() {
        Auth::requireAdmin();
        $data = $this->getJsonInput();

        $name = trim($data['name'] ?? '');
        if (!$name) $this->sendResponse(400, ['error' => 'Course name required']);

        $stmt = $this->db->prepare("
            INSERT INTO golf_courses (name, code, num_holes, par, course_rating, slope_rating, location, course_rules, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
        ");
        $stmt->execute([
            $name,
            $data['code'] ?? strtoupper(substr($name, 0, 4)),
            $data['num_holes'] ?? 18,
            $data['par'] ?? 72,
            $data['course_rating'] ?? 72.0,
            $data['slope_rating'] ?? 113,
            $data['location'] ?? null,
            $data['course_rules'] ?? null,
            Auth::userId()
        ]);

        $id = (int)$this->db->lastInsertId();
        $this->sendResponse(201, ['success' => true, 'message' => 'Course created', 'id' => $id]);
    }

    private function updateCourse($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE golf_courses SET name=?, par=?, course_rating=?, slope_rating=?, location=?, course_rules=? WHERE id=?");
        $stmt->execute([
            $data['name'], $data['par'], $data['course_rating'], $data['slope_rating'], $data['location'] ?? null, $data['course_rules'] ?? null, $id
        ]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Course updated']);
    }

    private function updateStatus($id) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $status = $data['status'] ?? 'open';
        $notes = $data['notes'] ?? null;

        $stmt = $this->db->prepare("UPDATE golf_courses SET status = ?, status_notes = ? WHERE id = ?");
        $stmt->execute([$status, $notes, $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Status updated']);
    }

    private function deleteCourse($id) {
        Auth::requireAdmin();
        $stmt = $this->db->prepare("UPDATE golf_courses SET deleted_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Course deleted']);
    }

    private function getCourseHoles($courseId) {
        $stmt = $this->db->prepare("SELECT * FROM golf_holes WHERE course_id = ? ORDER BY hole_number ASC");
        $stmt->execute([$courseId]);
        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll()]);
    }

    private function saveCourseHoles($courseId) {
        Auth::requireAdmin();
        $data = $this->getJsonInput();
        $holes = $data['holes'] ?? [];

        $stmt = $this->db->prepare("
            INSERT INTO golf_holes (course_id, hole_number, par, stroke_index, distance_yellow, distance_white, distance_red)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE par=VALUES(par), stroke_index=VALUES(stroke_index), distance_yellow=VALUES(distance_yellow), distance_white=VALUES(distance_white), distance_red=VALUES(distance_red)
        ");

        foreach ($holes as $h) {
            $stmt->execute([
                $courseId,
                $h['hole_number'],
                $h['par'] ?? 4,
                $h['stroke_index'] ?? $h['hole_number'],
                $h['distance_yellow'] ?? 350,
                $h['distance_white'] ?? 370,
                $h['distance_red'] ?? 300
            ]);
        }
        $this->sendResponse(200, ['success' => true, 'message' => 'Holes saved']);
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
