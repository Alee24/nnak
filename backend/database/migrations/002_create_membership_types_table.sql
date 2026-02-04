CREATE TABLE IF NOT EXISTS membership_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Pricing Information
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'KES',
    
    -- Duration
    duration_type ENUM('annual', 'lifetime', 'monthly', 'custom') DEFAULT 'annual',
    duration_months INT DEFAULT 12,
    
    -- Benefits and Features
    benefits TEXT,
    max_events INT DEFAULT NULL COMMENT 'Max events per period, NULL for unlimited',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default membership types
INSERT INTO membership_types (name, description, price, duration_type, duration_months, benefits, display_order) VALUES
('Student', 'For students and recent graduates', 500.00, 'annual', 12, 'Access to events, networking opportunities, student resources', 1),
('Regular', 'Standard membership for professionals', 2000.00, 'annual', 12, 'Full access to events, voting rights, member directory', 2),
('Corporate', 'For organizations and companies', 10000.00, 'annual', 12, 'Multiple member slots, corporate branding, priority event access', 3),
('Lifetime', 'One-time payment for lifetime access', 50000.00, 'lifetime', NULL, 'All benefits for life, legacy member status', 4);
