<?php
/**
 * Transaction Seeder
 * Populates the payments table with realistic demo data for all members.
 */

define('APP_INIT', true);
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();
    
    // Get all members
    $stmt = $db->query("SELECT id, first_name, last_name, status FROM members WHERE deleted_at IS NULL");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($members) . " members. Starting seeding...\n";
    
    $methods = ['mpesa', 'bank_transfer', 'card', 'paypal', 'stripe'];
    $types = ['membership', 'event'];
    $statuses = ['completed', 'completed', 'completed', 'pending', 'failed']; // Weight towards completed
    
    $count = 0;
    foreach ($members as $member) {
        // Generate 1-3 transactions per member
        $numTx = rand(1, 3);
        
        for ($i = 0; $i < $numTx; $i++) {
            $amount = rand(500, 5000);
            $method = $methods[array_rand($methods)];
            $type = $types[array_rand($types)];
            $status = $statuses[array_rand($statuses)];
            
            // Random date in the last 6 months
            $daysAgo = rand(0, 180);
            $date = date('Y-m-d H:i:s', strtotime("-$daysAgo days"));
            
            $invoiceYear = date('Y', strtotime($date));
            $invoiceMonth = date('m', strtotime($date));
            $prefix = "INV{$invoiceYear}{$invoiceMonth}";
            $invoiceNumber = $prefix . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $ref = strtoupper(substr(md5(uniqid()), 0, 10));
            
            $stmt = $db->prepare("
                INSERT INTO payments (
                    member_id, amount, currency, payment_method, transaction_reference,
                    payment_status, payment_type, description, invoice_number, 
                    invoice_date, payment_date, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $member['id'],
                $amount,
                'KES',
                $method,
                $ref,
                $status,
                $type,
                ($type === 'membership' ? 'Annual Membership Dues' : 'Event Registration Fee'),
                $invoiceNumber,
                date('Y-m-d', strtotime($date)),
                $date,
                $date
            ]);
            $count++;
        }
    }
    
    echo "Successfully seeded $count transactions.\n";
    
} catch (Exception $e) {
    echo "Seeding error: " . $e->getMessage() . "\n";
}
