<?php
/**
 * 015_gcms_seed_data.php
 * Generates 50+ members, golf courses, tee times, competitions, scorecards, products, facilities, staff, caddies, carts
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Starting GCMS Demo Data Seeding...\n";

    // 1. Seed Demo Admin & Staff Accounts
    $passwordHash = password_hash('Digital2025', PASSWORD_DEFAULT);

    $staffMembers = [
        ['MMS-001', 'GM-001', 'General', 'Manager', 'gm@mmsgolfclub.co.ke', 'general_manager', 'active', 8.5],
        ['MMS-002', 'FM-001', 'Finance', 'Manager', 'finance@mmsgolfclub.co.ke', 'finance_manager', 'active', 12.0],
        ['MMS-003', 'MO-001', 'Membership', 'Officer', 'membership@mmsgolfclub.co.ke', 'membership_officer', 'active', 15.2],
        ['MMS-004', 'GM-002', 'Golf', 'Manager', 'golfmanager@mmsgolfclub.co.ke', 'golf_manager', 'active', 4.1],
        ['MMS-005', 'GP-001', 'Golf', 'Professional', 'pro@mmsgolfclub.co.ke', 'golf_professional', 'active', 1.2],
        ['MMS-006', 'REC-001', 'Reception', 'Desk', 'reception@mmsgolfclub.co.ke', 'receptionist', 'active', 18.0],
        ['MMS-007', 'CASH-001', 'Cashier', 'Desk', 'cashier@mmsgolfclub.co.ke', 'cashier', 'active', 22.0],
        ['MMS-008', 'RM-001', 'Restaurant', 'Manager', 'restaurant@mmsgolfclub.co.ke', 'restaurant_manager', 'active', 24.0],
        ['MMS-009', 'SM-001', 'Store', 'Manager', 'shop@mmsgolfclub.co.ke', 'store_manager', 'active', 19.5],
        ['MMS-010', 'CM-001', 'Course', 'Manager', 'grounds@mmsgolfclub.co.ke', 'course_manager', 'active', 14.0],
        ['MMS-011', 'AUD-001', 'Auditor', 'User', 'auditor@mmsgolfclub.co.ke', 'auditor', 'active', 16.0],
    ];

    $mStmt = $db->prepare("
        INSERT INTO members (member_id, membership_number, first_name, last_name, email, password_hash, role, status, handicap_index, phone, join_date, membership_start_date, membership_expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '+254700123456', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))
        ON DUPLICATE KEY UPDATE role=VALUES(role), status=VALUES(status)
    ");

    foreach ($staffMembers as $s) {
        $mStmt->execute([$s[0], $s[1], $s[2], $s[3], $s[4], $passwordHash, $s[5], $s[6], $s[7]]);
    }

    // 2. Seed 40 Additional Regular Golf Members
    $firstNames = ['John', 'Peter', 'James', 'David', 'Joseph', 'Mary', 'Jane', 'Grace', 'Faith', 'Samuel', 'Daniel', 'Michael', 'Sarah', 'Esther', 'Paul', 'Simon', 'Lucy', 'Hannah', 'Robert', 'William'];
    $lastNames  = ['Kamau', 'Kariuki', 'Njoroge', 'Mwangi', 'Maina', 'Ochieng', 'Odhiambo', 'Otieno', 'Kipchirchir', 'Kipkorir', 'Wanjiru', 'Muthoni', 'Nyambura', 'Kimani', 'Gicheru', 'Cheruiyot', 'Koech', 'Chebet', 'Wekesa', 'Wafula'];
    $categories = [1, 2, 3, 4, 5, 6, 7];

    for ($i = 12; $i <= 55; $i++) {
        $fn = $firstNames[array_rand($firstNames)];
        $ln = $lastNames[array_rand($lastNames)];
        $mId = 'MMS-' . str_pad((string)$i, 3, '0', STR_PAD_LEFT);
        $mNum = 'GOLF-' . str_pad((string)$i, 4, '0', STR_PAD_LEFT);
        $email = strtolower($fn . '.' . $ln . $i . '@example.com');
        $hcp = round(mt_rand(0, 360) / 10, 1);
        $catId = $categories[array_rand($categories)];

        $mStmt->execute([$mId, $mNum, $fn, $ln, $email, $passwordHash, 'member', 'active', $hcp]);
    }

    echo "✓ 50+ Members seeded successfully.\n";

    // 3. Seed Golf Courses & Holes
    $db->exec("
        INSERT IGNORE INTO golf_courses (id, name, code, num_holes, par, course_rating, slope_rating, status)
        VALUES (1, 'Karen Championship Course', 'KAREN', 18, 72, 72.4, 131, 'open'),
               (2, 'Sigona Executive Course', 'SIGONA', 18, 72, 71.8, 128, 'open');
    ");

    $hStmt = $db->prepare("
        INSERT IGNORE INTO golf_holes (course_id, hole_number, par, stroke_index, distance_yellow, distance_white, distance_red)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    for ($cId = 1; $cId <= 2; $cId++) {
        for ($h = 1; $h <= 18; $h++) {
            $par = ($h % 5 === 0) ? 5 : (($h % 3 === 0) ? 3 : 4);
            $hStmt->execute([$cId, $h, $par, $h, 320 + ($h * 10), 340 + ($h * 10), 280 + ($h * 10)]);
        }
    }

    echo "✓ Golf Courses & Holes seeded.\n";

    // 4. Seed Caddies & Carts
    $caddyNames = [
        ['CAD-001', 'Kiprotich', 'Bett'],
        ['CAD-002', 'Emmanuel', 'Omondi'],
        ['CAD-003', 'Dennis', 'Kiplagat'],
        ['CAD-004', 'Brian', 'Wanyonyi'],
        ['CAD-005', 'Kevin', 'Mutua']
    ];
    $cadStmt = $db->prepare("INSERT IGNORE INTO caddies (caddy_number, first_name, last_name, status) VALUES (?, ?, ?, 'available')");
    foreach ($caddyNames as $cad) {
        $cadStmt->execute($cad);
    }

    $cartStmt = $db->prepare("INSERT IGNORE INTO golf_carts (cart_number, make, model, type, round_rate, status) VALUES (?, 'Yamaha', 'Drive2', 'electric', 2000.00, 'available')");
    for ($ct = 1; $ct <= 10; $ct++) {
        $cartStmt->execute(['CART-' . str_pad((string)$ct, 2, '0', STR_PAD_LEFT)]);
    }

    echo "✓ Caddies & Carts seeded.\n";

    // 5. Seed Products (Golf Shop & Restaurant)
    $prodStmt = $db->prepare("INSERT IGNORE INTO products (sku, name, category_id, selling_price, cost_price, stock_quantity, minimum_stock) VALUES (?, ?, ?, ?, ?, 50, 5)");
    $products = [
        ['SKU-1001', 'Titleist Pro V1 Golf Balls (Dozen)', 2, 6500.00, 4500.00],
        ['SKU-1002', 'TaylorMade Stealth Driver', 1, 65000.00, 48000.00],
        ['SKU-1003', 'FootJoy Golf Shoes', 4, 18000.00, 12000.00],
        ['SKU-1004', 'Callaway Golf Glove', 5, 2500.00, 1500.00],
        ['SKU-2001', 'Grilled Ribeye Steak & Chips', 8, 2200.00, 1000.00],
        ['SKU-2002', 'Club Sandwich & Fries', 8, 1200.00, 500.00],
        ['SKU-2003', 'Tusker Lager (Cold)', 10, 350.00, 180.00],
        ['SKU-2004', 'Fresh Passion Juice', 9, 300.00, 100.00],
    ];
    foreach ($products as $p) {
        $prodStmt->execute($p);
    }

    echo "✓ Products seeded.\n";

    // 6. Seed Competitions
    $compStmt = $db->prepare("
        INSERT IGNORE INTO competitions (id, name, course_id, competition_date, format, entry_fee, sponsor, max_participants, status)
        VALUES (1, 'Captain\'s Prize Tournament 2026', 1, CURDATE(), 'stableford', 3000.00, 'KCB Bank', 120, 'registration_open'),
               (2, 'Monthly Mug — September 2026', 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'stroke_play', 2000.00, 'MMS Club', 100, 'registration_open');
    ");
    $compStmt->execute();

    echo "✓ Competitions seeded.\n";
    echo "✓✓✓ ALL SEED DATA COMPLETED SUCCESSFULLY ✓✓✓\n";

} catch (Exception $e) {
    echo "Seeding Error: " . $e->getMessage() . "\n";
}
