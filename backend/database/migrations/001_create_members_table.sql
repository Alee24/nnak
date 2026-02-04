CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Kenya',
    
    -- Membership Information
    membership_type_id INT,
    status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',
    join_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Additional Information
    occupation VARCHAR(100),
    organization VARCHAR(255),
    profile_photo VARCHAR(255),
    
    -- Role and Permissions
    role ENUM('member', 'admin', 'super_admin') DEFAULT 'member',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_member_id (member_id),
    INDEX idx_status (status),
    INDEX idx_membership_type (membership_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
