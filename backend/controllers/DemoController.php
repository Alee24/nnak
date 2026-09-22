<?php
/**
 * Demo Controller
 * Handles Demo Data Population, Database Clearing, and Demo Mode Switch
 */

class DemoController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function handleRequest($method, $parts) {
        $action = $parts[0] ?? '';

        // populate and status are public (no auth needed — allow seeding before login)
        // clear and toggle require an authenticated admin session
        switch ($action) {
            case 'populate':
                if ($method === 'POST') {
                    $this->populateDemoData();
                } else {
                    $this->methodNotAllowed();
                }
                break;

            case 'clear':
                if ($method === 'POST') {
                    if (!isset($_SESSION['user_id'])) {
                        $this->sendResponse(401, ['error' => 'Authentication required']);
                        return;
                    }
                    $this->clearDemoData();
                } else {
                    $this->methodNotAllowed();
                }
                break;

            case 'toggle':
                if ($method === 'POST') {
                    if (!isset($_SESSION['user_id'])) {
                        $this->sendResponse(401, ['error' => 'Authentication required']);
                        return;
                    }
                    $this->toggleDemoMode();
                } else {
                    $this->methodNotAllowed();
                }
                break;

            case 'status':
                if ($method === 'GET') {
                    $this->getStatus();
                } else {
                    $this->methodNotAllowed();
                }
                break;

            default:
                $this->sendResponse(404, ['error' => 'Action not found']);
        }
    }

    private function getStatus() {
        $stmt = $this->db->prepare("SELECT setting_value FROM settings WHERE setting_key = 'demo_mode'");
        $stmt->execute();
        $val = $stmt->fetchColumn();
        $isDemo = ($val === '1' || $val === 'true');

        $this->sendResponse(200, [
            'success' => true,
            'demo_mode' => $isDemo
        ]);
    }

    private function toggleDemoMode() {
        $input = $this->getJsonInput();
        $enabled = isset($input['enabled']) ? ($input['enabled'] ? '1' : '0') : '1';

        $stmt = $this->db->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('demo_mode', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
        $stmt->execute([$enabled, $enabled]);

        $this->sendResponse(200, [
            'success' => true,
            'demo_mode' => $enabled === '1',
            'message' => $enabled === '1' ? 'Demo Mode enabled' : 'Demo Mode disabled (Live Mode Active)'
        ]);
    }

    private function populateDemoData() {
        try {
            $this->db->beginTransaction();

            $passwordHash = password_hash('Digital2025', PASSWORD_DEFAULT);

            // 1. Seed Staff & Demo Users
            $demoUsers = [
                ['MMS-001', 'GM-001', 'General', 'Manager', 'gm@mmsgolfclub.co.ke', 'general_manager', 'active', 8.5, '+254700000001'],
                ['MMS-002', 'ADM-001', 'System', 'Administrator', 'admin@mmsgolfclub.co.ke', 'admin', 'active', 10.2, '+254700000002'],
                ['MMS-003', 'PRO-001', 'Head', 'Professional', 'pro@mmsgolfclub.co.ke', 'golf_professional', 'active', 1.2, '+254700000003'],
                ['MMS-004', 'FIN-001', 'Finance', 'Director', 'finance@mmsgolfclub.co.ke', 'finance_manager', 'active', 14.0, '+254700000004'],
                ['MMS-005', 'MEM-001', 'Alex', 'Metto', 'member@mmsgolfclub.co.ke', 'member', 'active', 6.4, '+254700000005'],
                ['MMS-006', 'CSH-001', 'Club', 'Cashier', 'cashier@mmsgolfclub.co.ke', 'cashier', 'active', 20.5, '+254700000006'],
                ['MMS-007', 'REC-001', 'Front', 'Desk', 'reception@mmsgolfclub.co.ke', 'receptionist', 'active', 18.0, '+254700000007'],
                ['MMS-008', 'MEM-002', 'Dr. Arthur', 'Mwangi', 'arthur.mwangi@example.com', 'member', 'active', 8.4, '+254711000008'],
                ['MMS-009', 'MEM-003', 'Sarah', 'Wanjiku', 'sarah.wanjiku@example.com', 'member', 'active', 14.2, '+254722000009'],
                ['MMS-010', 'MEM-004', 'Kevin', 'Omondi', 'kevin.omondi@example.com', 'member', 'active', 11.0, '+254733000010'],
                ['MMS-011', 'MEM-005', 'Hon. Joseph', 'Ndegwa', 'joseph.ndegwa@example.com', 'member', 'active', 16.8, '+254744000011'],
                ['MMS-012', 'MEM-006', 'George', 'Otieno', 'george.otieno@example.com', 'member', 'active', 3.2, '+254755000012']
            ];

            $mStmt = $this->db->prepare("
                INSERT INTO members (member_id, membership_number, first_name, last_name, email, password_hash, role, status, handicap_index, phone, join_date, membership_start_date, membership_expiry_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR))
                ON DUPLICATE KEY UPDATE 
                    password_hash = VALUES(password_hash),
                    role = VALUES(role),
                    status = 'active',
                    handicap_index = VALUES(handicap_index)
            ");

            foreach ($demoUsers as $u) {
                $mStmt->execute([$u[0], $u[1], $u[2], $u[3], $u[4], $passwordHash, $u[5], $u[6], $u[7], $u[8]]);
            }

            // 2. Seed Golf Courses
            $this->db->exec("
                INSERT INTO golf_courses (id, name, code, num_holes, par, course_rating, slope_rating, status, is_active)
                VALUES 
                (1, 'Championship 18-Hole Course', 'CHAMP18', 18, 72, 72.8, 134, 'open', 1),
                (2, 'Executive 9-Hole Course', 'EXEC9', 9, 36, 35.4, 118, 'open', 1)
                ON DUPLICATE KEY UPDATE name=VALUES(name), status='open';
            ");

            // 3. Seed Tee Times for Today & Tomorrow
            $today = date('Y-m-d');
            $tomorrow = date('Y-m-d', strtotime('+1 day'));
            $slotTimes = ['06:30:00', '07:00:00', '07:30:00', '08:00:00', '08:30:00', '09:00:00', '13:00:00', '14:00:00', '15:00:00'];

            $ttStmt = $this->db->prepare("
                INSERT IGNORE INTO tee_times (booking_date, tee_time, course_id, max_players, booked_players, status)
                VALUES (?, ?, 1, 4, 0, 'available')
            ");

            foreach ([$today, $tomorrow] as $d) {
                foreach ($slotTimes as $t) {
                    $ttStmt->execute([$d, $t]);
                }
            }

            // 4. Seed Competitions
            $this->db->exec("
                INSERT INTO competitions (id, name, competition_date, format, course_id, holes, entry_fee, max_participants, status, sponsor, description)
                VALUES 
                (1, 'MMS Monthly Mug — September', DATE_ADD(CURDATE(), INTERVAL 6 DAY), 'Medal / Stroke Play', 1, 18, 3500.00, 120, 'upcoming', 'Kenya Breweries Limited', 'Monthly stroke play championship for all club members.'),
                (2, 'Captains Invitational Trophy 2025', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'Individual Stableford', 1, 18, 5000.00, 140, 'upcoming', 'Safaricom & KCB Bank', 'Flagship tournament hosted by the Club Captain.')
                ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status);
            ");

            // 5. Seed Restaurant Tables, Menu & Sample Orders
            $this->db->exec("
                INSERT INTO restaurant_tables (id, table_number, table_name, capacity, section, status)
                VALUES 
                (1, 'T-01', 'Veranda Table 1', 4, 'Veranda', 'available'),
                (2, 'T-02', 'Veranda Table 2', 4, 'Veranda', 'available'),
                (3, 'T-03', 'Fairway Terrace 1', 6, 'Terrace', 'available'),
                (4, 'T-04', 'Fairway Terrace 2', 6, 'Terrace', 'occupied'),
                (5, 'T-05', 'Members Lounge VIP', 8, 'VIP Lounge', 'reserved'),
                (6, 'T-06', '19th Hole Bar High 1', 2, 'Bar', 'available'),
                (7, 'T-07', '19th Hole Bar High 2', 2, 'Bar', 'available')
                ON DUPLICATE KEY UPDATE status=VALUES(status);
            ");

            // 6. Seed Golf Shop & Restaurant Products
            $this->db->exec("
                INSERT INTO products (id, code, name, category, department, cost_price, selling_price, stock_quantity, min_stock_alert, is_active)
                VALUES
                (1, 'BALL-PROV1', 'Titleist Pro V1 Golf Balls (Dozen)', 'Golf Balls', 'golf_shop', 5000.00, 7200.00, 48, 10, 1),
                (2, 'GLV-CAB1', 'FootJoy CabrettaSof Glove (Men M)', 'Gloves', 'golf_shop', 1800.00, 2600.00, 35, 8, 1),
                (3, 'CAP-MMS', 'MMS Championship Embroidered Cap', 'Apparel', 'golf_shop', 1200.00, 2000.00, 80, 15, 1),
                (4, 'POLO-NIK', 'Nike Dri-FIT MMS Club Polo Shirt', 'Apparel', 'golf_shop', 4500.00, 6800.00, 28, 5, 1),
                (5, 'TEE-WOOD', 'Pride Professional Wooden Tees (Pack 100)', 'Accessories', 'golf_shop', 400.00, 750.00, 120, 20, 1),
                (6, 'FD-STEAK', 'Prime Aged Black Angus Ribeye 300g', 'Main Course', 'restaurant', 1800.00, 3200.00, 50, 10, 1),
                (7, 'FD-BURGER', 'MMS Signature Fairway Wagyu Burger', 'Burgers', 'restaurant', 950.00, 1850.00, 60, 15, 1),
                (8, 'DRK-BEER', 'Tusker Malt Premium Lager 500ml', 'Beverages', 'restaurant', 200.00, 400.00, 240, 48, 1),
                (9, 'DRK-COF', 'Single Origin Kenyan Barista Cappuccino', 'Hot Drinks', 'restaurant', 120.00, 350.00, 300, 50, 1)
                ON DUPLICATE KEY UPDATE selling_price=VALUES(selling_price), stock_quantity=VALUES(stock_quantity);
            ");

            // 7. Seed Caddies
            $this->db->exec("
                INSERT INTO caddies (id, caddy_number, first_name, last_name, phone, handicap_rating, experience_years, status)
                VALUES
                (1, 'CAD-001', 'Kiprotich', 'Bett', '+254711100001', 'Class A', 6, 'available'),
                (2, 'CAD-002', 'Emmanuel', 'Omondi', '+254711100002', 'Class A', 8, 'available'),
                (3, 'CAD-003', 'Dennis', 'Kiplagat', '+254711100003', 'Class B', 4, 'available'),
                (4, 'CAD-004', 'Brian', 'Wanyonyi', '+254711100004', 'Class B', 3, 'available'),
                (5, 'CAD-005', 'Kevin', 'Mutua', '+254711100005', 'Class A', 7, 'available'),
                (6, 'CAD-006', 'Samuel', 'Korir', '+254711100006', 'Class C', 2, 'available')
                ON DUPLICATE KEY UPDATE status='available';
            ");

            // 8. Seed Golf Carts
            $this->db->exec("
                INSERT INTO golf_carts (id, cart_number, make, model, type, round_rate, status, battery_level)
                VALUES
                (1, 'CART-01', 'Club Car', 'Tempo Li-Ion', 'electric', 3000.00, 'available', 98),
                (2, 'CART-02', 'Club Car', 'Tempo Li-Ion', 'electric', 3000.00, 'available', 95),
                (3, 'CART-03', 'Yamaha', 'Drive2 AC', 'electric', 3000.00, 'available', 88),
                (4, 'CART-04', 'Yamaha', 'Drive2 AC', 'electric', 3000.00, 'available', 92),
                (5, 'CART-05', 'Club Car', 'Tempo Li-Ion', 'electric', 3000.00, 'available', 100),
                (6, 'CART-06', 'Yamaha', 'Drive2 EFI', 'petrol', 3500.00, 'available', 85)
                ON DUPLICATE KEY UPDATE status='available';
            ");

            // 9. Seed Club Assets
            $this->db->exec("
                INSERT INTO assets (id, asset_number, name, category, purchase_date, purchase_cost, serial_number, condition_status)
                VALUES
                (1, 'AST-001', 'Toro Reelmaster 3100-D Fairway Mower', 'Course Machinery', '2023-03-15', 3800000.00, 'TORO-3100-8841', 'good'),
                (2, 'AST-002', 'John Deere ProGator 2030A Utility Vehicle', 'Course Machinery', '2023-06-20', 2600000.00, 'JD-2030-9942', 'good'),
                (3, 'AST-003', 'Foresight GCQuad Golf Launch Monitor', 'Pro Shop & Range', '2024-01-10', 1450000.00, 'GCQ-44912', 'excellent'),
                (4, 'AST-004', 'Clubhouse Standby Diesel Generator 250kVA', 'Infrastructure', '2022-11-05', 4200000.00, 'CAT-GEN-250-99', 'good'),
                (5, 'AST-005', 'Rain Bird Central Irrigation Controller', 'Irrigation', '2023-08-14', 1900000.00, 'RB-CIR-550', 'excellent')
                ON DUPLICATE KEY UPDATE condition_status=VALUES(condition_status);
            ");

            // 10. Seed Suppliers
            $this->db->exec("
                INSERT INTO suppliers (id, company_name, contact_person, email, phone, category, status)
                VALUES
                (1, 'Toro Turf Equipment East Africa', 'Peter Njoroge', 'sales@toroeastafrica.co.ke', '+254722110022', 'Turf & Machinery', 'active'),
                (2, 'Titleist & FootJoy Kenya Imports', 'Sarah Gitau', 'orders@titleistkenya.com', '+254733445566', 'Pro Shop Inventory', 'active'),
                (3, 'Farmers Choice Fresh Cuts Ltd', 'James Mutiso', 'supplies@farmerschoice.co.ke', '+254720998877', 'Food & Beverage', 'active'),
                (4, 'Kenya Breweries Distributors', 'Caroline Chebet', 'orders@kbl.co.ke', '+254711882233', 'Beverages', 'active')
                ON DUPLICATE KEY UPDATE status='active';
            ");

            // 11. Seed Staff Profiles (joined to members 1 to 7)
            $this->db->exec("
                INSERT INTO staff_profiles (id, member_id, department, designation, salary, employment_status, join_date)
                VALUES
                (1, 1, 'Executive', 'General Manager', 350000.00, 'full_time', '2022-01-15'),
                (2, 2, 'Administration', 'IT & Systems Administrator', 180000.00, 'full_time', '2022-03-01'),
                (3, 3, 'Golf', 'Head PGA Professional', 220000.00, 'full_time', '2021-08-01'),
                (4, 4, 'Finance', 'Finance Director', 280000.00, 'full_time', '2022-02-01'),
                (5, 6, 'Finance', 'Club Cashier & Storekeeper', 95000.00, 'full_time', '2023-05-15'),
                (6, 7, 'Operations', 'Reception & Front Desk Lead', 85000.00, 'full_time', '2023-06-01')
                ON DUPLICATE KEY UPDATE department=VALUES(department), designation=VALUES(designation);
            ");

            // 12. Seed CPD Points Ledger
            $this->db->exec("
                INSERT INTO cpd_records (id, member_id, activity_name, category, points, activity_date, approved_by, status)
                VALUES
                (1, 5, 'R&A Rules of Golf Level 2 Certification', 'Rules & Governance', 15, '2025-08-10', 1, 'approved'),
                (2, 5, 'Club Pace of Play Workshop & Seminar', 'Course Management', 10, '2025-08-25', 1, 'approved'),
                (3, 8, 'Junior Golf Development Coaching Clinic', 'Coaching & Mentorship', 20, '2025-09-02', 1, 'approved'),
                (4, 9, 'Kenya Golf Union Handicapping Rules Seminar', 'Rules & Governance', 15, '2025-09-12', 1, 'approved')
                ON DUPLICATE KEY UPDATE status='approved';
            ");

            // 13. Seed Facilities
            $this->db->exec("
                INSERT INTO facilities (id, name, category, capacity, hourly_rate, description, is_active)
                VALUES
                (1, 'The Simba Ballroom & Banquet Hall', 'Function Hall', 250, 15000.00, 'Grand banquet hall for tournament dinners and galas.', 1),
                (2, 'Executive Boardroom', 'Meeting Room', 16, 5000.00, 'High-end boardroom equipped with conference video facilities.', 1),
                (3, 'Championship Floodlit Tennis Courts (x4)', 'Sports', 8, 2000.00, 'All-weather hard tennis courts with evening floodlights.', 1),
                (4, 'Olympic Size Swimming Pool & Deck', 'Aquatics', 50, 1500.00, 'Heated outdoor swimming pool with private sun deck.', 1),
                (5, 'Covered Driving Range Bays (x20)', 'Practice', 20, 1000.00, 'Full automated ball feed driving range with TrackMan bays.', 1)
                ON DUPLICATE KEY UPDATE hourly_rate=VALUES(hourly_rate);
            ");

            // 14. Ensure demo_mode is ON
            $this->db->exec("INSERT INTO settings (setting_key, setting_value) VALUES ('demo_mode', '1') ON DUPLICATE KEY UPDATE setting_value = '1'");

            $this->db->commit();

            $this->sendResponse(200, [
                'success' => true,
                'message' => 'Demo data populated successfully across all tables.'
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $this->sendResponse(500, [
                'error' => 'Failed to populate demo data: ' . $e->getMessage()
            ]);
        }
    }

    private function clearDemoData() {
        try {
            $this->db->beginTransaction();

            // Safely clear transactional/operational tables while keeping schema and admin users
            $tablesToClear = [
                'tee_times',
                'competitions',
                'competition_registrations',
                'scorecards',
                'scorecard_entries',
                'guest_passes',
                'invoices',
                'invoice_items',
                'payments',
                'facility_bookings',
                'restaurant_orders',
                'restaurant_order_items',
                'purchase_orders',
                'purchase_order_items',
                'course_maintenance',
                'cpd_records'
            ];

            $this->db->exec("SET FOREIGN_KEY_CHECKS = 0;");
            foreach ($tablesToClear as $tbl) {
                // Check if table exists before truncating
                $check = $this->db->prepare("SHOW TABLES LIKE ?");
                $check->execute([$tbl]);
                if ($check->fetch()) {
                    $this->db->exec("TRUNCATE TABLE `$tbl`");
                }
            }
            $this->db->exec("SET FOREIGN_KEY_CHECKS = 1;");

            // Reset table statuses in restaurant & carts
            $this->db->exec("UPDATE restaurant_tables SET status = 'available'");
            $this->db->exec("UPDATE golf_carts SET status = 'available'");
            $this->db->exec("UPDATE caddies SET status = 'available'");

            $this->db->commit();

            $this->sendResponse(200, [
                'success' => true,
                'message' => 'All transactional and operational data cleared cleanly. System is ready for live operations.'
            ]);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            $this->sendResponse(500, [
                'error' => 'Failed to clear data: ' . $e->getMessage()
            ]);
        }
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
