<?php
/**
 * Migration Script: Normalize Member Data
 * Converts existing member names to Title Case and other fields to Sentence Case
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';
require_once __DIR__ . '/utils/Normalization.php';

try {
    $db = Database::getInstance()->getConnection();
    
    echo "Starting member data normalization...\n";
    
    // Fetch all members
    $stmt = $db->query("SELECT * FROM members WHERE deleted_at IS NULL");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $count = 0;
    foreach ($members as $member) {
        $data = [
            'first_name' => $member['first_name'],
            'last_name' => $member['last_name'],
            'city' => $member['city'],
            'occupation' => $member['occupation'],
            'organization' => $member['organization'],
            'designation' => $member['designation'],
            'work_station' => $member['work_station'],
            'cadre' => $member['cadre']
        ];
        
        $originalData = $data;
        Normalization::normalizeMemberData($data);
        
        // Only update if something changed
        if ($data !== $originalData) {
            $updateStmt = $db->prepare("
                UPDATE members SET 
                    first_name = ?, last_name = ?, city = ?, 
                    occupation = ?, organization = ?, designation = ?, 
                    work_station = ?, cadre = ?
                WHERE id = ?
            ");
            
            $updateStmt->execute([
                $data['first_name'], $data['last_name'], $data['city'],
                $data['occupation'], $data['organization'], $data['designation'],
                $data['work_station'], $data['cadre'],
                $member['id']
            ]);
            $count++;
        }
    }
    
    echo "Successfully normalized $count members.\n";
    
} catch (Exception $e) {
    die("Normalization failed: " . $e->getMessage() . "\n");
}
