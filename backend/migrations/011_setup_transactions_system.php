<?php
/**
 * Migration: Setup Transactions System
 * Updates payment_method enum and backfills payments for imported members
 */

echo "Starting Transactions System setup...\n";

try {
    // 1. Update ENUM to support all gateways and imports
    echo "Updating payment_method enum...\n";
    $pdo->exec("ALTER TABLE payments MODIFY COLUMN payment_method ENUM('cash', 'mpesa', 'bank_transfer', 'card', 'paypal', 'stripe', 'import', 'other') NOT NULL");
    echo "Payment method enum updated.\n";

    // 2. Backfill payments for active members who have no records (imported members)
    echo "Backfilling payments for active members...\n";
    $stmt = $pdo->query("
        SELECT m.id, m.created_at, m.membership_type_id, mt.price, mt.name as type_name
        FROM members m
        LEFT JOIN payments p ON m.id = p.member_id
        LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
        WHERE m.status = 'active' AND p.id IS NULL
    ");
    $members = $stmt->fetchAll();
    
    if (count($members) > 0) {
        $insertStmt = $pdo->prepare("
            INSERT INTO payments (
                member_id, amount, currency, payment_method, 
                payment_status, payment_type, description, 
                invoice_number, invoice_date, membership_type_id, 
                payment_date, created_at
            ) VALUES (?, ?, 'KES', 'import', 'completed', 'membership', ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($members as $m) {
            $invoiceNum = "MIG-" . str_pad($m['id'], 6, '0', STR_PAD_LEFT);
            $date = substr($m['created_at'], 0, 10);
            $desc = "Legacy payment from imported member (" . ($m['type_name'] ?? 'Membership') . ")";
            
            $insertStmt->execute([
                $m['id'],
                $m['price'] ?? 0,
                $desc,
                $invoiceNum,
                $date,
                $m['membership_type_id'],
                $m['created_at'],
                $m['created_at']
            ]);
        }
        echo "Successfully backfilled " . count($members) . " payments.\n";
    } else {
        echo "No members require backfilling.\n";
    }

    echo "Transactions System setup complete.\n";

} catch (PDOException $e) {
    echo "Migration Error: " . $e->getMessage() . "\n";
}
