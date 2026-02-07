<?php
// Force error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/html');
echo "<h1>Debug List Members</h1>";

try {
    $db = Database::getInstance()->getConnection();
    echo "<p>Connected to database successfully.</p>";

    // Build query (Same as MemberController except pagination for now)
    $where = ["m.deleted_at IS NULL"];
    $whereClause = implode(' AND ', $where);

    // 1. Get total count
    $countSql = "SELECT COUNT(*) FROM members m WHERE $whereClause";
    echo "<h3>Count Query:</h3><pre>$countSql</pre>";
    $countStmt = $db->prepare($countSql);
    $countStmt->execute([]);
    $total = $countStmt->fetchColumn();
    echo "<p>Total count: $total</p>";

    // 2. Get members
    echo "<h3>Attempting Main Query:</h3>";
    $sql = "
        SELECT m.id, m.member_id, m.email, m.first_name, m.last_name, 
               m.phone, m.status, m.role,
               m.created_at,
               m.registration_number, 'Member' as membership_type_name
        FROM members m
        WHERE $whereClause
        ORDER BY m.created_at DESC
        LIMIT 20 OFFSET 0
    ";
    echo "<pre>" . htmlspecialchars($sql) . "</pre>";
    
    $stmt = $db->prepare($sql);
    $stmt->execute([]);
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "<h3>Success!</h3>";
    echo "<p>Found " . count($members) . " members.</p>";
    
    // 3. Test JSON Encode
    $json = json_encode($members);
    if ($json === false) {
        throw new Exception("JSON Encode Failed: " . json_last_error_msg());
    }
    echo "<p>JSON Check: passed (" . strlen($json) . " bytes)</p>";
    
    if (count($members) > 0) {
        echo "<pre>" . print_r($members[0], true) . "</pre>";
    }

} catch (PDOException $e) {
    echo "<h3 style='color:red'>PDO Exception:</h3>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
} catch (Exception $e) {
    echo "<h3 style='color:red'>General Exception:</h3>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}
