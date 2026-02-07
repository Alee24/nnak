<?php
// backend/seed_dummy_users.php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

echo "Seeding dummy users...\n";

$statuses = ['active', 'inactive', 'suspended', 'pending'];
$roles = ['member'];
$firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Lisa'];
$lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
$cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Kitale', 'Malindi', 'Garissa', 'Kakamega'];

// Create 50 dummy users
for ($i = 0; $i < 50; $i++) {
    $firstName = $firstNames[array_rand($firstNames)];
    $lastName = $lastNames[array_rand($lastNames)];
    $email = strtolower($firstName . '.' . $lastName . rand(100, 999) . '@example.com');
    $phone = '+2547' . rand(10000000, 99999999);
    $status = $statuses[array_rand($statuses)];
    $city = $cities[array_rand($cities)];
    $year = date('Y');
    $memberId = "NNAK" . $year . str_pad($i + 100, 4, '0', STR_PAD_LEFT);
    $passwordHash = password_hash('password123', PASSWORD_DEFAULT);

    try {
        $stmt = $db->prepare("
            INSERT INTO members (
                member_id, email, password_hash, first_name, last_name, 
                phone, status, role, city, join_date, membership_type_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'member', ?, CURDATE(), 1)
        ");

        $stmt->execute([
            $memberId, $email, $passwordHash, $firstName, $lastName, 
            $phone, $status, $city
        ]);
        echo "Created user: $firstName $lastName ($status)\n";
    } catch (PDOException $e) {
        // Ignore dupes
        continue;
    }
}

echo "Seeding complete!\n";
?>
