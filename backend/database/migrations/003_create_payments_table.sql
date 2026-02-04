CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    payment_method ENUM('cash', 'mpesa', 'bank_transfer', 'card', 'other') NOT NULL,
    
    -- Transaction Information
    transaction_reference VARCHAR(100) UNIQUE,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    
    -- Purpose
    payment_type ENUM('membership', 'event', 'donation', 'other') DEFAULT 'membership',
    description TEXT,
    
    -- Invoice Details
    invoice_number VARCHAR(50) UNIQUE,
    invoice_date DATE,
    
    -- Related Records
    membership_type_id INT,
    event_id INT,
    
    -- Payment Date
    payment_date TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_member_id (member_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_reference (transaction_reference),
    INDEX idx_invoice_number (invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
