<?php
/**
 * Member Controller
 * Handles member management operations
 */

class MemberController {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';
        
        // Check authentication for all member operations
        if (!$this->isAuthenticated()) {
            $this->sendResponse(401, ['error' => 'Authentication required']);
        }
        
        if ($action === 'search') {
            if ($method === 'GET') {
                $this->searchMembers();
            } else {
                $this->methodNotAllowed();
            }
            return;
        }
        
        if (empty($action)) {
            // /api/members - list all members or create new
            if ($method === 'GET') {
                $this->listMembers();
            } elseif ($method === 'POST') {
                $this->createMember();
            } else {
                $this->methodNotAllowed();
            }
        } else {
            // /api/members/:id - specific member operations
            $memberId = $action;
            $subAction = $parts[1] ?? '';
            
            if ($subAction === 'payments') {
                // Get member payments
                if ($method === 'GET') {
                    $this->getMemberPayments($memberId);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'status') {
                // Update member status (activate/suspend)
                if ($method === 'PUT') {
                    $this->updateMemberStatus($memberId);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'cpd-points') {
                // Award CPD points
                if ($method === 'POST') {
                    $this->awardCPDPoints($memberId);
                } elseif ($method === 'GET') {
                    $this->getCPDPointsHistory($memberId);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'license') {
                // Update license information
                if ($method === 'PUT') {
                    $this->updateLicense($memberId);
                } else {
                    $this->methodNotAllowed();
                }
            } else {
                switch ($method) {
                    case 'GET':
                        $this->getMember($memberId);
                        break;
                    case 'PUT':
                        $this->updateMember($memberId);
                        break;
                    case 'DELETE':
                        $this->deleteMember($memberId);
                        break;
                    case 'POST':
                         if ($memberId === 'import') {
                             $this->importMembers();
                         } else {
                             $this->methodNotAllowed();
                         }
                         break;
                    default:
                        $this->methodNotAllowed();
                }
            }
        }
    }

    private function createMember() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $data = $this->getJsonInput();
        
        // Basic validation
        if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email'])) {
            $this->sendResponse(400, ['error' => 'First Name, Last Name, and Email are required']);
        }

        // Check if email exists
        $email = trim($data['email']);
        $stmt = $this->db->prepare("SELECT id FROM members WHERE email = ? AND deleted_at IS NULL");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            $this->sendResponse(409, ['error' => 'Email already exists']);
        }

        try {
            // Prepare data
            $memberId = $this->generateMemberId();
            $memberData = [
                'member_id' => $memberId,
                'first_name' => trim($data['first_name']),
                'last_name' => trim($data['last_name']),
                'email' => $email,
                'password_hash' => password_hash('password123', PASSWORD_BCRYPT), // Default password
                'phone' => $data['phone'] ?? null,
                'gender' => $data['gender'] ?? 'other',
                'occupation' => $data['occupation'] ?? null,
                'organization' => $data['organization'] ?? null,
                'membership_type_id' => intval($data['membership_type_id'] ?? 1),
                'status' => 'pending',
                'role' => 'member',
                'role' => 'member',
                'registration_date' => date('Y-m-d')
            ];

            $this->create($memberData);
            
            $this->sendResponse(201, [
                'success' => true, 
                'message' => 'Member created successfully',
                'member_id' => $memberId
            ]);

        } catch (Exception $e) {
            error_log("Create member error: " . $e->getMessage());
            // Return detailed error for debugging
            $this->sendResponse(500, ['error' => 'Failed to create member: ' . $e->getMessage()]);
        }
    }
    
    private function listMembers() {
        // Only admins can list all members
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        try {
            // Get query parameters for filtering
            $status = $_GET['status'] ?? null;
            $membershipType = $_GET['membership_type'] ?? null;
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(100, max(10, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;
            
            // Build query
            $where = ["m.deleted_at IS NULL"];
            $params = [];
            
            if ($status) {
                $where[] = "m.status = ?";
                $params[] = $status;
            }
            
            if ($membershipType) {
                $where[] = "m.membership_type_id = ?";
                $params[] = $membershipType;
            }
            
            $whereClause = implode(' AND ', $where);
            
            // Get total count
            $countStmt = $this->db->prepare("
                SELECT COUNT(*) FROM members m WHERE $whereClause
            ");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            // Get members (removed LEFT JOIN temporarily due to missing membership_types table)
            $stmt = $this->db->prepare("
                SELECT m.id, m.member_id, m.email, m.first_name, m.last_name, 
                       m.phone, m.status, m.registration_date, m.expiry_date, m.role,
                       'Member' as membership_type_name
                FROM members m
                WHERE $whereClause
                ORDER BY m.created_at DESC
                LIMIT $limit OFFSET $offset
            ");
            $stmt->execute($params);
            $members = $stmt->fetchAll();
            
            $this->sendResponse(200, [
                'members' => $members,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log("List members error: " . $e->getMessage());
            
            // Provide detailed error in development, generic in production
            $errorResponse = ['error' => 'Failed to retrieve members'];
            
            if (APP_ENV === 'development') {
                $errorResponse['details'] = $e->getMessage();
                $errorResponse['code'] = $e->getCode();
            }
            
            $this->sendResponse(500, $errorResponse);
        }
    }
    
    private function getMember($id) {
        // Users can view their own profile, admins can view any
        if (!$this->isAdmin() && $_SESSION['user_id'] != $id) {
            $this->sendResponse(403, ['error' => 'Access denied']);
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT m.*, mt.name as membership_type_name, mt.price as membership_price
                FROM members m
                LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
                WHERE m.id = ? AND m.deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            $member = $stmt->fetch();
            
            if (!$member) {
                $this->sendResponse(404, ['error' => 'Member not found']);
            }
            
            unset($member['password_hash']);
            
            $this->sendResponse(200, ['member' => $member]);
            
        } catch (PDOException $e) {
            error_log("Get member error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve member']);
        }
    }
    
    private function updateMember($id) {
        // Users can update their own profile, admins can update any
        if (!$this->isAdmin() && $_SESSION['user_id'] != $id) {
            $this->sendResponse(403, ['error' => 'Access denied']);
        }
        
        $data = $this->getJsonInput();
        
        try {
            // Build update query dynamically based on provided fields
            $allowedFields = [
                'first_name', 'last_name', 'phone', 'date_of_birth', 'gender',
                'address_line1', 'address_line2', 'city', 'state', 'postal_code',
                'occupation', 'organization', 'profile_photo'
            ];
            
            // Admins can also update these fields
            if ($this->isAdmin()) {
                $allowedFields = array_merge($allowedFields, [
                    'membership_type_id', 'status', 'expiry_date', 'role'
                ]);
            }
            
            $updates = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($updates)) {
                $this->sendResponse(400, ['error' => 'No valid fields to update']);
            }
            
            $params[] = $id;
            $updateClause = implode(', ', $updates);
            
            $stmt = $this->db->prepare("
                UPDATE members 
                SET $updateClause, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute($params);
            
            if ($stmt->rowCount() === 0) {
                $this->sendResponse(404, ['error' => 'Member not found or no changes made']);
            }
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Member updated successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log("Update member error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update member']);
        }
    }
    
    private function deleteMember($id) {
        // Only admins can delete members
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        try {
            // Soft delete
            $stmt = $this->db->prepare("
                UPDATE members 
                SET deleted_at = CURRENT_TIMESTAMP, status = 'inactive'
                WHERE id = ? AND deleted_at IS NULL
            ");
            $stmt->execute([$id]);
            
            if ($stmt->rowCount() === 0) {
                $this->sendResponse(404, ['error' => 'Member not found']);
            }
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Member deactivated successfully'
            ]);
            
        } catch (PDOException $e) {
            error_log("Delete member error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to deactivate member']);
        }
    }
    
    private function searchMembers() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }
        
        $query = $_GET['q'] ?? '';
        
        if (strlen($query) < 2) {
            $this->sendResponse(400, ['error' => 'Search query must be at least 2 characters']);
        }
        
        try {
            $searchTerm = "%$query%";
            $stmt = $this->db->prepare("
                SELECT m.id, m.member_id, m.email, m.first_name, m.last_name, 
                       m.phone, m.status, mt.name as membership_type_name
                FROM members m
                LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
                WHERE m.deleted_at IS NULL
                  AND (m.first_name LIKE ? OR m.last_name LIKE ? 
                       OR m.email LIKE ? OR m.member_id LIKE ? OR m.phone LIKE ?)
                ORDER BY m.first_name, m.last_name
                LIMIT 50
            ");
            $stmt->execute([$searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm]);
            $members = $stmt->fetchAll();
            
            $this->sendResponse(200, ['members' => $members]);
            
        } catch (PDOException $e) {
            error_log("Search members error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Search failed']);
        }
    }
    
    private function getMemberPayments($memberId) {
        // Users can view their own payments, admins can view any
        if (!$this->isAdmin() && $_SESSION['user_id'] != $memberId) {
            $this->sendResponse(403, ['error' => 'Access denied']);
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT p.*, mt.name as membership_type_name
                FROM payments p
                LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
                WHERE p.member_id = ?
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([$memberId]);
            $payments = $stmt->fetchAll();
            
            $this->sendResponse(200, ['payments' => $payments]);
            
        } catch (PDOException $e) {
            error_log("Get member payments error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve payments']);
        }
    }
    


    private function importMembers() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $input = $this->getJsonInput();
        $data = $input['members'] ?? [];
        
        if (empty($data)) {
            $this->sendResponse(400, ['error' => 'No data provided']);
        }

        $successCount = 0;
        $errors = [];

        foreach ($data as $index => $row) {
            try {
                // Validation (Frontend key mapping)
                if (empty($row['First Name']) || empty($row['Last Name']) || empty($row['Email'])) {
                    throw new Exception("Missing required fields (First Name, Last Name, Email)");
                }

                $email = trim($row['Email']);
                
                // Check exists
                $stmt = $this->db->prepare("SELECT id FROM members WHERE email = ?");
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    throw new Exception("Email already exists: " . $email);
                }

                // Generate Member ID if missing
                $memberId = !empty($row['Member ID']) ? $row['Member ID'] : $this->generateMemberId();

                $memberData = [
                    'member_id' => $memberId,
                    'first_name' => trim($row['First Name']),
                    'last_name' => trim($row['Last Name']),
                    'email' => $email,
                    // Default password: 'password123' - In production use a robust default or email triggers
                    'password_hash' => password_hash('password123', PASSWORD_BCRYPT),
                    'phone' => $row['Phone'] ?? null,
                    'license_number' => $row['License Number'] ?? null,
                    'gender' => strtolower($row['Gender'] ?? 'other'),
                    'address_line1' => $row['Address'] ?? null,
                    'city' => $row['City'] ?? null,
                    'occupation' => $row['Occupation'] ?? null,
                    'organization' => $row['Organization'] ?? null,
                    'membership_type_id' => intval($row['Membership Type ID'] ?? 1),
                    'status' => strtolower($row['Status'] ?? 'pending'),
                    'role' => 'member', // Default role
                    'registration_date' => date('Y-m-d')
                ];

                $this->create($memberData);
                $successCount++;

            } catch (Exception $e) {
                $errors[] = "Row " . ($index + 1) . ": " . $e->getMessage();
            }
        }

        $this->sendResponse(200, [
            'success' => true,
            'imported_count' => $successCount,
            'errors' => $errors
        ]);
    }

    private function create($data) {
        $fields = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO members ($fields, created_at) VALUES ($placeholders, CURRENT_TIMESTAMP)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($data));
    }

    private function generateMemberId() {
        $year = date('Y');
        $prefix = "NNAK-$year-";
        $stmt = $this->db->prepare("SELECT member_id FROM members WHERE member_id LIKE ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$prefix . '%']);
        $lastId = $stmt->fetchColumn();
        $num = $lastId ? intval(substr($lastId, strrpos($lastId, '-') + 1)) + 1 : 1;
        return $prefix . str_pad($num, 4, '0', STR_PAD_LEFT);
    }
    
    /**
     * Update Member Status (Activate/Suspend)
     */
    private function updateMemberStatus($memberId) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $data = $this->getJsonInput();
        
        if (empty($data['status'])) {
            $this->sendResponse(400, ['error' => 'Status is required']);
        }

        $validStatuses = ['active', 'suspended', 'pending', 'inactive'];
        if (!in_array($data['status'], $validStatuses)) {
            $this->sendResponse(400, ['error' => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses)]);
        }

        try {
            $stmt = $this->db->prepare("UPDATE members SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$data['status'], $memberId]);

            if ($stmt->rowCount() === 0) {
                $this->sendResponse(404, ['error' => 'Member not found']);
            }

            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Member status updated successfully',
                'status' => $data['status']
            ]);

        } catch (PDOException $e) {
            error_log("Update member status error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update member status']);
        }
    }

    /**
     * Award CPD Points to Member
     */
    private function awardCPDPoints($memberId) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $data = $this->getJsonInput();
        
        if (empty($data['points']) || !is_numeric($data['points'])) {
            $this->sendResponse(400, ['error' => 'Valid points value is required']);
        }

        $points = intval($data['points']);
        if ($points <= 0) {
            $this->sendResponse(400, ['error' => 'Points must be greater than 0']);
        }

        try {
            // Start transaction
            $this->db->beginTransaction();

            // Insert CPD points record
            $stmt = $this->db->prepare("
                INSERT INTO cpd_points (member_id, points, activity_type, description, awarded_by, awarded_date)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $memberId,
                $points,
                $data['activity_type'] ?? 'Manual Award',
                $data['description'] ?? '',
                $_SESSION['user_id'],
                $data['awarded_date'] ?? date('Y-m-d')
            ]);

            // Update total CPD points in members table
            $stmt = $this->db->prepare("
                UPDATE members 
                SET total_cpd_points = COALESCE(total_cpd_points, 0) + ?,
                    updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([$points, $memberId]);

            if ($stmt->rowCount() === 0) {
                throw new Exception('Member not found');
            }

            // Get updated total
            $stmt = $this->db->prepare("SELECT total_cpd_points FROM members WHERE id = ?");
            $stmt->execute([$memberId]);
            $member = $stmt->fetch();

            $this->db->commit();

            $this->sendResponse(200, [
                'success' => true,
                'message' => "$points CPD points awarded successfully",
                'total_cpd_points' => $member['total_cpd_points']
            ]);

        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Award CPD points error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to award CPD points']);
        }
    }

    /**
     * Get CPD Points History for Member
     */
    private function getCPDPointsHistory($memberId) {
        try {
            $stmt = $this->db->prepare("
                SELECT cp.*, 
                       m.first_name as awarded_by_name,
                       m.last_name as awarded_by_last_name
                FROM cpd_points cp
                LEFT JOIN members m ON cp.awarded_by = m.id
                WHERE cp.member_id = ?
                ORDER BY cp.awarded_date DESC, cp.created_at DESC
            ");
            $stmt->execute([$memberId]);
            $history = $stmt->fetchAll();

            // Get member total
            $stmt = $this->db->prepare("SELECT total_cpd_points FROM members WHERE id = ?");
            $stmt->execute([$memberId]);
            $member = $stmt->fetch();

            $this->sendResponse(200, [
                'success' => true,
                'total_points' => $member['total_cpd_points'] ?? 0,
                'history' => $history
            ]);

        } catch (PDOException $e) {
            error_log("Get CPD points history error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve CPD points history']);
        }
    }

    /**
     * Update License Information
     */
    private function updateLicense($memberId) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        $data = $this->getJsonInput();

        try {
            $updates = [];
            $params = [];

            if (isset($data['license_number'])) {
                $updates[] = "license_number = ?";
                $params[] = trim($data['license_number']);
            }

            if (isset($data['license_expiry_date'])) {
                $updates[] = "license_expiry_date = ?";
                $params[] = $data['license_expiry_date'];
            }

            if (isset($data['license_status'])) {
                $validStatuses = ['active', 'expired', 'suspended', 'not_set'];
                if (!in_array($data['license_status'], $validStatuses)) {
                    $this->sendResponse(400, ['error' => 'Invalid license status']);
                }
                $updates[] = "license_status = ?";
                $params[] = $data['license_status'];
            }

            if (empty($updates)) {
                $this->sendResponse(400, ['error' => 'No license data provided to update']);
            }

            $updates[] = "updated_at = NOW()";
            $params[] = $memberId;

            $sql = "UPDATE members SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            if ($stmt->rowCount() === 0) {
                $this->sendResponse(404, ['error' => 'Member not found']);
            }

            $this->sendResponse(200, [
                'success' => true,
                'message' => 'License information updated successfully'
            ]);

        } catch (PDOException $e) {
            error_log("Update license error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to update license information']);
        }
    }
    
    // Helper methods
    
    private function isAuthenticated() {
        return isset($_SESSION['user_id']);
    }
    
    private function isAdmin() {
        return isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin']);
    }
    
    private function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }
    
    private function sendResponse($code, $data) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    private function methodNotAllowed() {
        $this->sendResponse(405, ['error' => 'Method not allowed']);
    }
}
