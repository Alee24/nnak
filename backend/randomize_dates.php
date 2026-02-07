<?php
// backend/randomize_dates.php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

echo "Randomizing member dates...\n";

try {
    // Get all member IDs
    $stmt = $db->query("SELECT id FROM members");
    $members = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $updated = 0;
    foreach ($members as $id) {
        // Random date in last 12 months
        $timestamp = mt_rand(strtotime('-12 months'), time());
        $date = date('Y-m-d', $timestamp);
        $datetime = date('Y-m-d H:i:s', $timestamp);

        $updateStmt = $db->prepare("UPDATE members SET join_date = ?, created_at = ? WHERE id = ?");
        $updateStmt->execute([$date, $datetime, $id]);
        $updated++;
    }

    echo "Successfully updated dates for $updated members.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
