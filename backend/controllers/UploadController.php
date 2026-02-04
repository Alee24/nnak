<?php
/**
 * Upload Controller
 * Handles CSV file uploads for bulk member import
 */

class UploadController {
    private $db;
    
    public function __construct() {
        $database = Database::getInstance();
        $this->db = $database->getConnection();
    }
    
    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';
        
        switch ($action) {
            case 'members':
                if ($method === 'POST') {
                    $this->uploadMembers();
                } else {
                    $this->sendResponse(405, ['error' => 'Method not allowed']);
                }
                break;
                
            case 'template':
                if ($method === 'GET') {
                    $this->downloadTemplate();
                } else {
                    $this->sendResponse(405, ['error' => 'Method not allowed']);
                }
                break;
                
            case 'image':
                if ($method === 'POST') {
                    $this->uploadImage();
                } else {
                    $this->sendResponse(405, ['error' => 'Method not allowed']);
                }
                break;
                
            default:
                $this->sendResponse(404, ['error' => 'Endpoint not found']);
        }
    }

    /**
     * Upload profile image
     */
    private function uploadImage() {
        // Check if user is authenticated
        if (!isset($_SESSION['user_id'])) {
            $this->sendResponse(401, ['error' => 'Authentication required']);
            return;
        }

        if (!isset($_FILES['image'])) {
            $this->sendResponse(400, ['error' => 'No image file uploaded']);
            return;
        }

        $file = $_FILES['image'];
        
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $this->sendResponse(400, ['error' => 'File upload error']);
            return;
        }

        // Validate extension
        $validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($ext, $validExts)) {
            $this->sendResponse(400, ['error' => 'Invalid image format. Allowed: ' . implode(', ', $validExts)]);
            return;
        }

        // Validate size (e.g. 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            $this->sendResponse(400, ['error' => 'Image too large. Max 2MB.']);
            return;
        }

        // Create directory
        $uploadDir = __DIR__ . '/../../frontend/public/uploads/profiles/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Generate filename
        $filename = 'profile_' . $_SESSION['user_id'] . '_' . time() . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        
        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $publicUrl = '/uploads/profiles/' . $filename;
            
            // Auto update user profile with new photo URL
            try {
                $stmt = $this->db->prepare("UPDATE members SET profile_photo = ? WHERE id = ?");
                $stmt->execute([$publicUrl, $_SESSION['user_id']]);
                
                $this->sendResponse(200, [
                    'success' => true,
                    'message' => 'Profile photo updated',
                    'url' => $publicUrl
                ]);
            } catch (Exception $e) {
                // Determine if we should delete file if DB update fails? For now keep it.
                $this->sendResponse(500, ['error' => 'Database update failed']);
            }
        } else {
            $this->sendResponse(500, ['error' => 'Failed to save file']);
        }
    }
    
    /**
     * Upload and process CSV file with member data
     */
    private function uploadMembers() {
        try {
            // Check if user is admin
            if (!isset($_SESSION['user']) || ($_SESSION['user']['role'] !== 'admin' && $_SESSION['user']['role'] !== 'super_admin')) {
                $this->sendResponse(403, ['error' => 'Admin access required']);
                return;
            }
            
            // Check if file was uploaded
            if (!isset($_FILES['csv_file'])) {
                $this->sendResponse(400, ['error' => 'No file uploaded']);
                return;
            }
            
            $file = $_FILES['csv_file'];
            
            // Validate file
            if ($file['error'] !== UPLOAD_ERR_OK) {
                $this->sendResponse(400, ['error' => 'File upload error']);
                return;
            }
            
            // Check file extension
            $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if ($fileExt !== 'csv') {
                $this->sendResponse(400, ['error' => 'Only CSV files are allowed']);
                return;
            }
            
            // Parse CSV
            $csvData = $this->parseCSV($file['tmp_name']);
            
            if (empty($csvData)) {
                $this->sendResponse(400, ['error' => 'CSV file is empty or invalid']);
                return;
            }
            
            // Validate and insert members
            $result = $this->processMembers($csvData);
            
            $this->sendResponse(200, [
                'success' => true,
                'message' => 'CSV processed successfully',
                'stats' => $result
            ]);
            
        } catch (Exception $e) {
            $this->sendResponse(500, [
                'error' => 'Failed to process CSV',
                'message' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Parse CSV file and return array of data
     */
    private function parseCSV($filePath) {
        $data = [];
        $headers = [];
        
        if (($handle = fopen($filePath, 'r')) !== false) {
            // Read header row
            $headers = fgetcsv($handle);
            
            if (!$headers) {
                fclose($handle);
                return [];
            }
            
            // Trim headers
            $headers = array_map('trim', $headers);
            
            // Read data rows
            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) === count($headers)) {
                    $data[] = array_combine($headers, $row);
                }
            }
            
            fclose($handle);
        }
        
        return $data;
    }
    
    /**
     * Process and insert members from CSV data
     */
    private function processMembers($csvData) {
        $inserted = 0;
        $updated = 0;
        $errors = [];
        $rowNumber = 1; // Start from 1 (header is row 0)
        
        // Start transaction
        $this->db->beginTransaction();
        
        try {
            foreach ($csvData as $row) {
                $rowNumber++;
                
                // Validate required fields
                $validation = $this->validateRow($row, $rowNumber);
                
                if (!$validation['valid']) {
                    $errors[] = $validation['error'];
                    continue;
                }
                
                // Check if member exists
                $email = trim($row['email']);
                $existingMember = $this->getMemberByEmail($email);
                
                if ($existingMember) {
                    // Update existing member
                    if ($this->updateMember($existingMember['id'], $row)) {
                        $updated++;
                    } else {
                        $errors[] = [
                            'row' => $rowNumber,
                            'email' => $email,
                            'error' => 'Failed to update member'
                        ];
                    }
                } else {
                    // Insert new member
                    if ($this->insertMember($row)) {
                        $inserted++;
                    } else {
                        $errors[] = [
                            'row' => $rowNumber,
                            'email' => $email,
                            'error' => 'Failed to insert member'
                        ];
                    }
                }
            }
            
            // Commit transaction
            $this->db->commit();
            
            return [
                'total_rows' => count($csvData),
                'inserted' => $inserted,
                'updated' => $updated,
                'errors' => $errors,
                'error_count' => count($errors)
            ];
            
        } catch (Exception $e) {
            // Rollback on error
            $this->db->rollBack();
            throw $e;
        }
    }
    
    /**
     * Validate CSV row data
     */
    private function validateRow($row, $rowNumber) {
        $required = ['email', 'first_name', 'last_name'];
        
        foreach ($required as $field) {
            if (empty($row[$field])) {
                return [
                    'valid' => false,
                    'error' => [
                        'row' => $rowNumber,
                        'field' => $field,
                        'error' => "Required field '$field' is missing"
                    ]
                ];
            }
        }
        
        // Validate email format
        if (!filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
            return [
                'valid' => false,
                'error' => [
                    'row' => $rowNumber,
                    'field' => 'email',
                    'error' => 'Invalid email format'
                ]
            ];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Get member by email
     */
    private function getMemberByEmail($email) {
        $query = "SELECT id, email FROM members WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Insert new member
     */
    private function insertMember($data) {
        // Generate member ID
        $memberId = 'NNAK' . date('Y') . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        
        // Generate random password
        $password = bin2hex(random_bytes(8));
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $query = "INSERT INTO members (
            member_id, email, password_hash, first_name, last_name,
            phone, date_of_birth, gender, address_line1, city, country,
            membership_type_id, occupation, organization, status, join_date, role
        ) VALUES (
            :member_id, :email, :password_hash, :first_name, :last_name,
            :phone, :date_of_birth, :gender, :address_line1, :city, :country,
            :membership_type_id, :occupation, :organization, 'pending', CURDATE(), 'member'
        )";
        
        $stmt = $this->db->prepare($query);
        
        $stmt->bindParam(':member_id', $memberId);
        $stmt->bindParam(':email', $data['email']);
        $stmt->bindParam(':password_hash', $passwordHash);
        $stmt->bindParam(':first_name', $data['first_name']);
        $stmt->bindParam(':last_name', $data['last_name']);
        
        $phone = $data['phone'] ?? null;
        $dob = $data['date_of_birth'] ?? null;
        $gender = $data['gender'] ?? null;
        $address = $data['address_line1'] ?? null;
        $city = $data['city'] ?? null;
        $country = $data['country'] ?? 'Kenya';
        $membershipTypeId = $data['membership_type_id'] ?? null;
        $occupation = $data['occupation'] ?? null;
        $organization = $data['organization'] ?? null;
        
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':date_of_birth', $dob);
        $stmt->bindParam(':gender', $gender);
        $stmt->bindParam(':address_line1', $address);
        $stmt->bindParam(':city', $city);
        $stmt->bindParam(':country', $country);
        $stmt->bindParam(':membership_type_id', $membershipTypeId);
        $stmt->bindParam(':occupation', $occupation);
        $stmt->bindParam(':organization', $organization);
        
        return $stmt->execute();
    }
    
    /**
     * Update existing member
     */
    private function updateMember($id, $data) {
        $query = "UPDATE members SET
            first_name = :first_name,
            last_name = :last_name,
            phone = :phone,
            date_of_birth = :date_of_birth,
            gender = :gender,
            address_line1 = :address_line1,
            city = :city,
            country = :country,
            membership_type_id = :membership_type_id,
            occupation = :occupation,
            organization = :organization,
            updated_at = NOW()
        WHERE id = :id";
        
        $stmt = $this->db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':first_name', $data['first_name']);
        $stmt->bindParam(':last_name', $data['last_name']);
        
        $phone = $data['phone'] ?? null;
        $dob = $data['date_of_birth'] ?? null;
        $gender = $data['gender'] ?? null;
        $address = $data['address_line1'] ?? null;
        $city = $data['city'] ?? null;
        $country = $data['country'] ?? 'Kenya';
        $membershipTypeId = $data['membership_type_id'] ?? null;
        $occupation = $data['occupation'] ?? null;
        $organization = $data['organization'] ?? null;
        
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':date_of_birth', $dob);
        $stmt->bindParam(':gender', $gender);
        $stmt->bindParam(':address_line1', $address);
        $stmt->bindParam(':city', $city);
        $stmt->bindParam(':country', $country);
        $stmt->bindParam(':membership_type_id', $membershipTypeId);
        $stmt->bindParam(':occupation', $occupation);
        $stmt->bindParam(':organization', $organization);
        
        return $stmt->execute();
    }
    
    /**
     * Download CSV template
     */
    private function downloadTemplate() {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="member_upload_template.csv"');
        
        $headers = [
            'email',
            'first_name',
            'last_name',
            'phone',
            'date_of_birth',
            'gender',
            'address_line1',
            'city',
            'country',
            'membership_type_id',
            'occupation',
            'organization'
        ];
        
        $sampleData = [
            'john.doe@example.com',
            'John',
            'Doe',
            '+254712345678',
            '1990-01-15',
            'male',
            '123 Main Street',
            'Nairobi',
            'Kenya',
            '1',
            'Registered Nurse',
            'Nairobi Hospital'
        ];
        
        $output = fopen('php://output', 'w');
        fputcsv($output, $headers);
        fputcsv($output, $sampleData);
        fclose($output);
        exit;
    }
    
    /**
     * Send JSON response
     */
    private function sendResponse($statusCode, $data) {
        http_response_code($statusCode);
        echo json_encode($data);
        exit;
    }
}
