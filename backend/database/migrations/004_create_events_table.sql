CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Event Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('conference', 'workshop', 'seminar', 'networking', 'training', 'other') DEFAULT 'other',
    
    -- Date and Time
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    
    -- Location
    location VARCHAR(255),
    venue VARCHAR(255),
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link VARCHAR(500),
    
    -- Capacity
    max_capacity INT,
    current_registrations INT DEFAULT 0,
    
    -- Pricing
    is_paid BOOLEAN DEFAULT FALSE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'KES',
    
    -- Registration
    registration_deadline DATETIME,
    allow_registration BOOLEAN DEFAULT TRUE,
    
    -- Status
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    
    -- Additional Information
    banner_image VARCHAR(255),
    organizer VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_start_date (start_date),
    INDEX idx_status (status),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
