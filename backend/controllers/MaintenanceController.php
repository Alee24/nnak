<?php
/**
 * Maintenance Controller
 * Course maintenance scheduling, tasks, staff assignments, cost tracking
 */

class MaintenanceController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        Auth::requireAuth();
        $action = $parts[0] ?? '';

        if ($action === 'overdue') {
            if ($method === 'GET') $this->getOverdue();
            else $this->methodNotAllowed();
            return;
        }

        if (numeric_id($action)) {
            $id = (int)$action;
            $sub = $parts[1] ?? '';

            if ($sub === 'complete') {
                if ($method === 'PUT') $this->completeTask($id);
                else $this->methodNotAllowed();
            } else {
                if ($method === 'GET') $this->getTask($id);
                elseif ($method === 'PUT') $this->updateTask($id);
                elseif ($method === 'DELETE') $this->deleteTask($id);
                else $this->methodNotAllowed();
            }
            return;
        }

        switch ($action) {
            case '':
            case 'list':
                if ($method === 'GET') $this->listTasks();
                elseif ($method === 'POST') $this->createTask();
                else $this->methodNotAllowed();
                break;
            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function listTasks() {
        $pag = Auth::paginate($_GET);
        $stmt = $this->db->prepare("
            SELECT cm.*, gc.name as course_name
            FROM course_maintenance cm LEFT JOIN golf_courses gc ON cm.course_id = gc.id
            ORDER BY cm.scheduled_date DESC LIMIT {$pag['limit']} OFFSET {$pag['offset']}
        ");
        $stmt->execute();

        $cnt = $this->db->prepare("SELECT COUNT(*) FROM course_maintenance");
        $cnt->execute();

        $this->sendResponse(200, ['success' => true, 'data' => $stmt->fetchAll(), 'total' => (int)$cnt->fetchColumn()]);
    }

    private function getTask($id) {
        $stmt = $this->db->prepare("SELECT cm.*, gc.name as course_name FROM course_maintenance cm LEFT JOIN golf_courses gc ON cm.course_id = gc.id WHERE cm.id = ?");
        $stmt->execute([$id]);
        $task = $stmt->fetch();
        if (!$task) $this->sendResponse(404, ['error' => 'Task not found']);
        $this->sendResponse(200, ['success' => true, 'data' => $task]);
    }

    private function createTask() {
        Auth::requireRole('admin', 'super_admin', 'course_manager');
        $data = $this->getJsonInput();

        $stmt = $this->db->prepare("
            INSERT INTO course_maintenance (course_id, task_type, area, description, assigned_to, scheduled_date, due_date, estimated_cost, priority, status, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
        ");
        $stmt->execute([
            $data['course_id'] ?? 1,
            $data['task_type'] ?? 'mowing',
            $data['area'] ?? 'Greens',
            $data['description'],
            $data['assigned_to'] ?? null,
            $data['scheduled_date'] ?? date('Y-m-d'),
            $data['due_date'] ?? null,
            $data['estimated_cost'] ?? 0.00,
            $data['priority'] ?? 'medium',
            Auth::userId()
        ]);

        $this->sendResponse(201, ['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function updateTask($id) {
        Auth::requireRole('admin', 'super_admin', 'course_manager');
        $data = $this->getJsonInput();
        $stmt = $this->db->prepare("UPDATE course_maintenance SET task_type=?, area=?, description=?, assigned_to=?, scheduled_date=?, due_date=?, estimated_cost=?, priority=?, status=? WHERE id=?");
        $stmt->execute([
            $data['task_type'], $data['area'], $data['description'], $data['assigned_to'] ?? null, $data['scheduled_date'], $data['due_date'] ?? null, $data['estimated_cost'] ?? 0, $data['priority'] ?? 'medium', $data['status'] ?? 'scheduled', $id
        ]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Task updated']);
    }

    private function completeTask($id) {
        Auth::requireRole('admin', 'super_admin', 'course_manager');
        $data = $this->getJsonInput();
        $cost = (float)($data['actual_cost'] ?? 0.00);

        $stmt = $this->db->prepare("UPDATE course_maintenance SET status = 'completed', completed_date = CURDATE(), actual_cost = ? WHERE id = ?");
        $stmt->execute([$cost, $id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Task marked completed']);
    }

    private function deleteTask($id) {
        Auth::requireRole('admin', 'super_admin', 'course_manager');
        $stmt = $this->db->prepare("DELETE FROM course_maintenance WHERE id = ?");
        $stmt->execute([$id]);
        $this->sendResponse(200, ['success' => true, 'message' => 'Task deleted']);
    }

    private function getOverdue() {
        $stmt = $this->db->prepare("SELECT * FROM course_maintenance WHERE due_date < CURDATE() AND status != 'completed'");
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
