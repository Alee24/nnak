CREATE TABLE IF NOT EXISTS event_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    member_id INT NOT NULL,
    
    -- Registration Details
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'attended', 'cancelled', 'no_show') DEFAULT 'registered',
    
    -- Payment Information (for paid events)
    payment_id INT,
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    
    -- Additional Information
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate registrations
    UNIQUE KEY unique_registration (event_id, member_id),
    
    INDEX idx_event_id (event_id),
    INDEX idx_member_id (member_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
