<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

header('Content-Type: text/html');
echo "<h1>Admin Account Setup</h1>";

try {
    $db = Database::getInstance()->getConnection();
    echo "<p>Connected to database successfully.</p>";

    // Admin user details
    $email = 'mettoalex@gmail.com';
    $password = 'Digital2025';
    $firstName = 'Metto';
    $lastName = 'Alex';

    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM members WHERE email = ?");
    $stmt->execute([$email]);
    $existing = $stmt->fetch();

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    if ($existing) {
        // Update existing user
        $stmt = $db->prepare("UPDATE members SET password_hash = ?, role = 'admin', status = 'active' WHERE id = ?");
        $stmt->execute([$passwordHash, $existing['id']]);
        echo "<p style='color:green'>Updated existing user <strong>$email</strong> to admin with new password.</p>";
    } else {
        // Create new user
        $year = date('Y');
        // Find next ID
        $prefix = "NNAK-$year-";
        $stmt = $db->prepare("SELECT member_id FROM members WHERE member_id LIKE ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$prefix . '%']);
        $lastId = $stmt->fetchColumn();
        $num = $lastId ? intval(substr($lastId, strrpos($lastId, '-') + 1)) + 1 : 1;
        $memberId = $prefix . str_pad($num, 4, '0', STR_PAD_LEFT);

        $stmt = $db->prepare("
            INSERT INTO members (
                member_id, email, password_hash, first_name, last_name,
                status, role, created_at, join_date
            ) VALUES (?, ?, ?, ?, ?, 'active', 'admin', NOW(), CURDATE())
        ");
        
        $stmt->execute([
            $memberId,
            $email,
            $passwordHash,
            $firstName,
            $lastName
        ]);
        echo "<p style='color:green'>Created new admin user <strong>$email</strong> with Member ID: $memberId</p>";
    }

    echo "<p>Setup Complete. <a href='/'>Go to Login</a></p>";

} catch (Exception $e) {
    echo "<p style='color:red'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}
