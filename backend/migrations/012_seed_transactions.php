<?php
/**
 * Migration: Seed Transactions
 * Populates the payments table with diverse test data for development.
 */

echo "Starting Transactions seeding...\n";

try {
    $db = Database::getInstance()->getConnection();

    // 1. Get some active members to associate payments with
    $stmt = $db->query("SELECT id, membership_type_id FROM members WHERE status = 'active' LIMIT 50");
    $members = $stmt->fetchAll();

    if (empty($members)) {
        echo "No active members found to seed transactions for. Skipping.\n";
        return;
    }

    // 2. Clear existing test data if any (optional, but good for clean seeding)
    // $db->exec("DELETE FROM payments WHERE invoice_number LIKE 'TEST-INV-%'");

    $paymentMethods = ['mpesa', 'bank_transfer', 'card', 'cash'];
    $paymentTypes = ['membership', 'event', 'donation'];
    $statuses = ['completed', 'completed', 'completed', 'pending', 'failed']; // Weight towards completed

    $insertStmt = $db->prepare("
        INSERT INTO payments (
            member_id, amount, currency, payment_method, 
            transaction_reference, payment_status, payment_type, 
            description, invoice_number, invoice_date, 
            membership_type_id, payment_date, created_at
        ) VALUES (?, ?, 'KES', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $count = 0;
    $year = date('Y');
    
    foreach ($members as $index => $member) {
        // Generate 1-5 transactions per member
        $numTx = rand(1, 3);
        
        for ($i = 0; $i < $numTx; $i++) {
            $method = $paymentMethods[array_rand($paymentMethods)];
            $type = $paymentTypes[array_rand($paymentTypes)];
            $status = $statuses[array_rand($statuses)];
            
            $amount = ($type === 'membership') ? rand(3000, 5000) : rand(500, 2500);
            $ref = strtoupper(bin2hex(random_bytes(4)));
            $invoiceNum = "INV-" . $year . "-" . str_pad($member['id'], 4, '0', STR_PAD_LEFT) . "-" . ($i + 1);
            
            $daysAgo = rand(0, 60);
            $date = date('Y-m-d H:i:s', strtotime("-$daysAgo days"));
            $invoiceDate = substr($date, 0, 10);
            
            $desc = ($type === 'membership') ? "Annual Membership Renewal" : ($type === 'event' ? "Event Registration Fee" : "General Support Donation");

            $insertStmt->execute([
                $member['id'],
                $amount,
                $method,
                $ref,
                $status,
                $type,
                $desc,
                $invoiceNum,
                $invoiceDate,
                $type === 'membership' ? $member['membership_type_id'] : null,
                $status === 'completed' ? $date : null,
                $date
            ]);
            $count++;
        }
    }

    echo "Successfully seeded $count transactions.\n";

} catch (PDOException $e) {
    echo "Seeding Error: " . $e->getMessage() . "\n";
}
