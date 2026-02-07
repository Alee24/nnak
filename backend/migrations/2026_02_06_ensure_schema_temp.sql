-- Ensure members table exists
CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE,
    membership_number VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    date_of_birth DATE,
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    occupation VARCHAR(100),
    organization VARCHAR(150),
    profile_photo VARCHAR(255),
    qualifications TEXT,
    personal_number VARCHAR(50),
    registration_number VARCHAR(50),
    chapter VARCHAR(100),
    county VARCHAR(100),
    id_number VARCHAR(50),
    membership_type_id INT,
    status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
    role ENUM('member', 'admin', 'user') DEFAULT 'member',
    expiry_date DATE,
    total_cpd_points INT DEFAULT 0,
    license_number VARCHAR(50),
    license_expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Add missing columns if they don't exist (Idempotent approach using Procedures is complex in raw SQL, 
-- but for simplicity we will rely on users running this against a potentially fresh DB or we assume warnings on duplicate columns)
-- Or better, we just use ALTER IGNORE or try to start fresh if the user allowed (User: "I need you to start afresh and make sure this application is working"). 
-- But "start afresh" might mean "clean install".
-- Let's try to ALTER TABLE to ADD COLUMN IF NOT EXISTS (MySQL 8.0+ supports logic, but simplified syntax is tricky).
-- Instead, I will write specific Modify statements that typically succeed or fail non-fatally if column exists in some setups, however standard MySQL errors on duplicate column.

-- SAFE APPROACH: Verify existence. But since I can't script logic easily in pure .sql for `run_migrations.php`, 
-- I will create a PHP migration which is smarter.
