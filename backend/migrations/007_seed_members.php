<?php
/**
 * Seeder: Add 30 Test Members
 */
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

$db = Database::getInstance()->getConnection();

try {
    echo "Seeding 30 test members...\n";

    $firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 'Robert', 'Lisa', 'William', 'Ashley', 'Joseph', 'Mary', 'Charles', 'Amanda', 'Thomas', 'Jennifer', 'Daniel', 'Elizabeth', 'Matthew', 'Linda', 'Anthony', 'Barbara', 'Donald', 'Patricia', 'Mark', 'Susan', 'Paul', 'Karen'];
    $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
    $cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru', 'Nyeri', 'Thika', 'Machakos', 'Malindi', 'Kitale'];
    $statuses = ['active', 'active', 'active', 'pending', 'pending', 'suspended']; // Weighted towards active
    $roles = ['member', 'member', 'member', 'member', 'admin'];

    $sql = "INSERT INTO members (member_id, first_name, last_name, email, password_hash, phone, city, status, role, join_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $db->prepare($sql);

    for ($i = 0; $i < 30; $i++) {
        $firstName = $firstNames[array_rand($firstNames)];
        $lastName = $lastNames[array_rand($lastNames)];
        $email = strtolower($firstName . '.' . $lastName . rand(100, 999) . '@example.com');
        $city = $cities[array_rand($cities)];
        $status = $statuses[array_rand($statuses)];
        $role = ($i === 0) ? 'super_admin' : $roles[array_rand($roles)]; // Ensure one super admin? Or just random.
        
        $year = date('Y');
        $memberId = "NNAK-$year-" . str_pad($i + 1000, 4, '0', STR_PAD_LEFT);
        
        // Ensure email uniqueness for this batch run
        // In a real seeder we might check DB, but for test we just randomize
        
        $stmt->execute([
            $memberId,
            $firstName,
            $lastName,
            $email,
            password_hash('password123', PASSWORD_BCRYPT),
            '0700' . rand(100000, 999999),
            $city,
            $status,
            $role,
            date('Y-m-d', strtotime('-' . rand(1, 365) . ' days'))
        ]);
        
        echo "Created member: $firstName $lastName ($city) - $status\n";
    }

    echo "Seeding completed successfully.\n";

} catch (PDOException $e) {
    die("Seeding failed: " . $e->getMessage() . "\n");
}
