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
        
        if (empty($action) || $action === 'list') {
            // /api/members or /api/members/list - list all members or create new
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
            } elseif ($action === 'cpd-ledger') {
                if ($method === 'GET') {
                    $this->getCPDLedger();
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
            } elseif ($subAction === 'generate-id') {
                // Generate ID for individual member
                if ($method === 'POST') {
                    $this->generateIndividualId($memberId);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($subAction === 'profile') {
                // Get full premium profile data
                if ($method === 'GET') {
                    $this->getProfile($memberId);
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($action === 'pending-count') {
                if ($method === 'GET') {
                    $this->getPendingCount();
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($action === 'dashboard-stats') {
                if ($method === 'GET') {
                    $this->getDashboardStats();
                } else {
                    $this->methodNotAllowed();
                }
            } elseif ($action === 'applications') {
                if ($method === 'GET') {
                    $this->getPendingApplications();
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
                         } elseif ($memberId === 'generate-ids') {
                             $this->generateAllIds();
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
                'membership_number' => $memberId,
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
                'role' => 'member', // Default role
                'join_date' => date('Y-m-d'),
                'qualifications' => $data['qualifications'] ?? null,
                'personal_number' => $data['personal_number'] ?? null,
                'registration_number' => $data['registration_number'] ?? null,
                'chapter' => $data['chapter'] ?? null,
                'county' => $data['county'] ?? null,
                'sub_county' => $data['sub_county'] ?? null,
                'id_number' => $data['id_number'] ?? null,
                'designation' => $data['designation'] ?? null,
                'work_station' => $data['work_station'] ?? null,
                'cadre' => $data['cadre'] ?? null,
                'employment_status' => $data['employment_status'] ?? null,
                'is_signed' => isset($data['is_signed']) ? (int)$data['is_signed'] : 0,
                'signature_date' => $data['signature_date'] ?? ($data['is_signed'] ? date('Y-m-d') : null)
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
        // Log entry
        file_put_contents(__DIR__ . '/../../debug_log.txt', "Entered listMembers at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

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
            
            // Get search query
            $search = $_GET['search'] ?? $_GET['q'] ?? '';

            // Build query
            $where = ["m.deleted_at IS NULL"];
            $params = [];
            
            if ($status) {
                $where[] = "m.status = ?";
                $params[] = $status;
            }

            if (!empty($search)) {
                $where[] = "(m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ? OR m.member_id LIKE ? OR m.phone LIKE ?)";
                $term = "%$search%";
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
                $params[] = $term;
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
                       m.phone, m.status, m.role,
                       m.created_at,
                       m.registration_number, 'Member' as membership_type_name
                FROM members m
                WHERE $whereClause
                ORDER BY m.created_at DESC
                LIMIT $limit OFFSET $offset
            ");
            $stmt->execute($params);
            $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $this->sendResponse(200, [
                'members' => $members,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Throwable $e) {
            $errorMsg = "List members CRITICAL error: " . $e->getMessage() . "\nFile: " . $e->getFile() . ":" . $e->getLine() . "\nTrace: " . $e->getTraceAsString();
            error_log($errorMsg);
            file_put_contents(__DIR__ . '/../../debug_log.txt', $errorMsg . "\n", FILE_APPEND);
            
            $this->sendResponse(500, [
                'error' => 'Failed to retrieve members',
                'details' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
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
            $member = $stmt->fetch(PDO::FETCH_ASSOC);
            
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
                'occupation', 'organization', 'profile_photo',
                'qualifications', 'personal_number', 'registration_number', 
                'chapter', 'county', 'sub_county', 'id_number',
                'designation', 'work_station', 'cadre', 'employment_status',
                'is_signed', 'signature_date'
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
            $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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
            $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

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
    
    private function generateAllIds() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            // Get active members without membership number
            $sql = "SELECT id FROM members WHERE status = 'active' AND (membership_number IS NULL OR membership_number = '')";
            $stmt = $this->db->query($sql);
            $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (empty($members)) {
                 $this->sendResponse(200, ['success' => true, 'message' => 'No active members need IDs', 'count' => 0]);
            }

            $year = date('Y');
            $prefix = "NNAK-$year-";
            
            // Find last ID for current year
            $stmt = $this->db->prepare("SELECT member_id FROM members WHERE member_id LIKE ? ORDER BY id DESC LIMIT 1");
            $stmt->execute([$prefix . '%']);
            $lastId = $stmt->fetchColumn();
            $currentNum = $lastId ? intval(substr($lastId, strrpos($lastId, '-') + 1)) : 0;
            
            $updated = 0;
            $updateStmt = $this->db->prepare("UPDATE members SET member_id = ? WHERE id = ?");
            
            foreach ($members as $m) {
                $currentNum++;
                $newId = $prefix . str_pad($currentNum, 4, '0', STR_PAD_LEFT);
                $updateStmt->execute([$newId, $m['id']]);
                $updated++;
            }
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => "Successfully generated IDs for $updated members",
                'count' => $updated
            ]);

        } catch (PDOException $e) {
            error_log("Generate IDs error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to generate IDs']);
        }
    }

    private function generateIndividualId($id) {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            // Check if member exists and is active
            $stmt = $this->db->prepare("SELECT id, status, member_id FROM members WHERE id = ? AND deleted_at IS NULL");
            $stmt->execute([$id]);
            $member = $stmt->fetch();

            if (!$member) {
                $this->sendResponse(404, ['error' => 'Member not found']);
            }

            if ($member['status'] !== 'active') {
                $this->sendResponse(400, ['error' => 'Member must be active to generate an ID']);
            }

            if (!empty($member['member_id'])) {
                $this->sendResponse(400, ['error' => 'Member already has an ID']);
            }

            $year = date('Y');
            $prefix = "NNAK-$year-";

            // Find last ID for current year
            $stmt = $this->db->prepare("SELECT member_id FROM members WHERE member_id LIKE ? ORDER BY member_id DESC LIMIT 1");
            $stmt->execute([$prefix . '%']);
            $lastId = $stmt->fetchColumn();
            
            // Extract the numeric part reliably
            $currentNum = 1;
            if ($lastId) {
                $parts = explode('-', $lastId);
                $currentNum = intval(end($parts)) + 1;
            }

            $newId = $prefix . str_pad($currentNum, 4, '0', STR_PAD_LEFT);
            
            $updateStmt = $this->db->prepare("UPDATE members SET member_id = ? WHERE id = ?");
            $updateStmt->execute([$newId, $id]);

            $this->sendResponse(200, [
                'success' => true,
                'message' => "Successfully generated ID: $newId",
                'member_id' => $newId
            ]);

        } catch (PDOException $e) {
            error_log("Generate individual ID error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to generate ID: ' . $e->getMessage()]);
        }
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

            $this->addInteraction($memberId, 'STATUS_CHANGE', "Status updated to " . strtoupper($data['status']));

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
            // If internal ID is actually a membership number, resolve it
            if (!empty($data['is_membership_number'])) {
                $stmt = $this->db->prepare("SELECT id FROM members WHERE member_id = ?");
                $stmt->execute([$memberId]);
                $foundId = $stmt->fetchColumn();
                if (!$foundId) {
                    $this->sendResponse(404, ['error' => 'Member with this membership number not found']);
                }
                $memberId = $foundId;
            }

            // Start transaction
            $this->db->beginTransaction();

            // Insert CPD points record
            $stmt = $this->db->prepare("
                INSERT INTO cpd_points (member_id, event_id, points, activity_type, description, awarded_by, awarded_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $memberId,
                $data['event_id'] ?? null,
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

            $this->addInteraction($memberId, 'CPD_AWARD', "Awarded $points points: " . ($data['description'] ?? 'Manual Award'));

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
                       m.last_name as awarded_by_last_name,
                       e.title as event_name
                FROM cpd_points cp
                LEFT JOIN members m ON cp.awarded_by = m.id
                LEFT JOIN events e ON cp.event_id = e.id
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
     * Get CPD Ledger for all members (Admin only)
     */
    private function getCPDLedger() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            $stmt = $this->db->query("
                SELECT cp.*, 
                       m.first_name, m.last_name, m.member_id as membership_number,
                       e.title as event_title,
                       admin.first_name as admin_name, admin.last_name as admin_last_name
                FROM cpd_points cp
                LEFT JOIN members m ON cp.member_id = m.id
                LEFT JOIN events e ON cp.event_id = e.id
                LEFT JOIN members admin ON cp.awarded_by = admin.id
                ORDER BY cp.created_at DESC
                LIMIT 500
            ");
            $ledger = $stmt->fetchAll();

            $this->sendResponse(200, [
                'success' => true,
                'ledger' => $ledger
            ]);

        } catch (PDOException $e) {
            error_log("Get CPD ledger error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve CPD ledger']);
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
    
    /**
     * Get Full Premium Profile Data
     */
    private function getProfile($id) {
        if (!$this->isAdmin() && $_SESSION['user_id'] != $id) {
            $this->sendResponse(403, ['error' => 'Access denied']);
        }
        
        try {
            // Get Member & Membership Type
            $stmt = $this->db->prepare("
                SELECT m.*, mt.name as rank_name, mt.price as rank_price
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

            // Get Recent Interactions
            $stmt = $this->db->prepare("
                SELECT * FROM member_interactions 
                WHERE member_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            ");
            $stmt->execute([$id]);
            $interactions = $stmt->fetchAll();

            // Get CPD Summary (Total points and last award)
            $stmt = $this->db->prepare("
                SELECT SUM(points) as total, MAX(awarded_date) as last_award
                FROM cpd_points 
                WHERE member_id = ?
            ");
            $stmt->execute([$id]);
            $cpd = $stmt->fetch();

            $this->sendResponse(200, [
                'success' => true,
                'member' => $member,
                'interactions' => $interactions,
                'cpd_summary' => [
                    'total' => $cpd['total'] ?? 0,
                    'last_award' => $cpd['last_award']
                ]
            ]);
            
        } catch (PDOException $e) {
            error_log("Get profile error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve profile data']);
        }
    }

    /**
     * Add Interaction Log
     */
    private function addInteraction($memberId, $type, $desc) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO member_interactions (member_id, action_type, description, performed_by)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$memberId, $type, $desc, $_SESSION['user_id'] ?? null]);
        } catch (Exception $e) {
            error_log("Failed to log interaction: " . $e->getMessage());
        }
    }

    /**
     * Get count of pending applications
     */
    private function getPendingCount() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            $stmt = $this->db->prepare("SELECT COUNT(*) FROM members WHERE status = 'pending' AND deleted_at IS NULL");
            $stmt->execute();
            $count = (int)$stmt->fetchColumn();

            $this->sendResponse(200, ['count' => $count]);
        } catch (PDOException $e) {
            error_log("Get pending count error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to get pending count']);
        }
    }

    /**
     * Get statistics for the admin dashboard
     */
    private function getDashboardStats() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            // 1. Member Summary & Distribution
            $stmt = $this->db->query("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
                    SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
                FROM members 
                WHERE deleted_at IS NULL
            ");
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);

            // 2. System Overview
            // Events count
            $stmt = $this->db->query("SELECT COUNT(*) FROM events WHERE deleted_at IS NULL");
            $totalEvents = (int)$stmt->fetchColumn();

            // Transactions/Payments count
            $stmt = $this->db->query("SELECT COUNT(*) FROM payments");
            $totalTransactions = (int)$stmt->fetchColumn();

            // IDs Generated count (members who have a member_id assigned)
            $stmt = $this->db->query("SELECT COUNT(*) FROM members WHERE member_id IS NOT NULL AND member_id != '' AND deleted_at IS NULL");
            $totalIdsGenerated = (int)$stmt->fetchColumn();

            // 3. CPD Analytics
            $stmt = $this->db->query("SELECT COALESCE(SUM(points), 0) FROM cpd_points");
            $totalCPD = (int)$stmt->fetchColumn();
            
            // Compliance Ratio: Active members with CPD points / Total active members
            $stmt = $this->db->query("
                SELECT COUNT(DISTINCT member_id) 
                FROM cpd_points 
                WHERE member_id IN (SELECT id FROM members WHERE status = 'active' AND deleted_at IS NULL)
            ");
            $activeWithPoints = (int)$stmt->fetchColumn();
            $complianceRatio = $summary['active'] > 0 ? round(($activeWithPoints / $summary['active']) * 100) : 0;

            // 4. Last 7 Days Analytics (Registration Count)
            $analytics = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = date('Y-m-d', strtotime("-$i days"));
                $stmt = $this->db->prepare("SELECT COUNT(*) FROM members WHERE DATE(created_at) = ? AND deleted_at IS NULL");
                $stmt->execute([$date]);
                $analytics[] = [
                    'date' => $date,
                    'count' => (int)$stmt->fetchColumn(),
                    'label' => date('D', strtotime($date))
                ];
            }

            // 5. Recent Applications (Latest Pending)
            $stmt = $this->db->query("
                SELECT id, member_id, first_name, last_name, email, created_at, status
                FROM members 
                WHERE status = 'pending' AND deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT 5
            ");
            $recentApplications = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // 6. Recent Members (Overall Latest)
            $stmt = $this->db->query("
                SELECT m.id, m.member_id, m.first_name, m.last_name, m.status, m.created_at, m.role, m.profile_image
                FROM members m
                WHERE m.deleted_at IS NULL
                ORDER BY m.created_at DESC
                LIMIT 4
            ");
            $recentMembers = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->sendResponse(200, [
                'summary' => $summary,
                'system' => [
                    'events' => $totalEvents,
                    'transactions' => $totalTransactions,
                    'ids_generated' => $totalIdsGenerated
                ],
                'cpd' => [
                    'total_points' => $totalCPD,
                    'compliance_ratio' => $complianceRatio
                ],
                'analytics' => $analytics,
                'recent_applications' => $recentApplications,
                'recent_members' => $recentMembers
            ]);

        } catch (PDOException $e) {
            error_log("Dashboard stats error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve dashboard statistics']);
        }
    }

    /**
     * Get list of pending applications
     */
    private function getPendingApplications() {
        if (!$this->isAdmin()) {
            $this->sendResponse(403, ['error' => 'Admin access required']);
        }

        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = min(100, max(10, intval($_GET['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $countStmt = $this->db->prepare("SELECT COUNT(*) FROM members WHERE status = 'pending' AND deleted_at IS NULL");
            $countStmt->execute();
            $total = $countStmt->fetchColumn();

            $stmt = $this->db->prepare("
                SELECT m.id, m.member_id, m.email, m.first_name, m.last_name, 
                       m.phone, m.status, m.created_at, m.registration_number
                FROM members m
                WHERE m.status = 'pending' AND m.deleted_at IS NULL
                ORDER BY m.created_at DESC
                LIMIT $limit OFFSET $offset
            ");
            $stmt->execute();
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $this->sendResponse(200, [
                'applications' => $applications,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (PDOException $e) {
            error_log("Get pending applications error: " . $e->getMessage());
            $this->sendResponse(500, ['error' => 'Failed to retrieve applications']);
        }
    }

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
