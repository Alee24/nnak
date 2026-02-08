-- NNAK Master Database Schema
-- Generated: 2026-02-08
-- Use this script to initialize or reset the database with the correct structure.

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Membership Types
-- --------------------------------------------------------
DROP TABLE IF EXISTS `membership_types`;
CREATE TABLE `membership_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `membership_types` (`name`, `price`, `description`) VALUES
('Full Member', 5000.00, 'Standard membership for registered nurses'),
('Associate Member', 3000.00, 'For students and health professionals'),
('Life Member', 50000.00, 'Lifetime membership access');

-- --------------------------------------------------------
-- 2. Members Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` VARCHAR(50) UNIQUE,
  `membership_number` VARCHAR(50),
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `gender` VARCHAR(20),
  `date_of_birth` DATE,
  
  -- Address / Location
  `address_line1` VARCHAR(255),
  `address_line2` VARCHAR(255),
  `city` VARCHAR(100),
  `state` VARCHAR(100),
  `postal_code` VARCHAR(20),
  `county` VARCHAR(100),
  `sub_county` VARCHAR(100),
  `chapter` VARCHAR(100),
  
  -- Identification
  `id_number` VARCHAR(50),
  `profile_photo` VARCHAR(255), -- Path storage
  `profile_picture` LONGTEXT,   -- Base64 storage (used by SignupPage.jsx)
  
  -- Professional
  `occupation` VARCHAR(100),
  `organization` VARCHAR(150),
  `designation` VARCHAR(100),
  `work_station` VARCHAR(150),
  `cadre` VARCHAR(100),
  `employment_status` VARCHAR(50),
  `qualifications` TEXT,
  `personal_number` VARCHAR(50),
  `registration_number` VARCHAR(50),
  `license_number` VARCHAR(50),
  `license_expiry_date` DATE,
  
  -- System Status
  `role` ENUM('member', 'admin', 'super_admin') DEFAULT 'member',
  `status` ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'pending',
  `membership_type_id` INT,
  `expiry_date` DATE,
  `total_cpd_points` INT DEFAULT 0,
  `join_date` DATE,
  `last_login` DATETIME,
  
  -- Enrollment Signature
  `is_signed` TINYINT(1) DEFAULT 0,
  `signature_date` DATE,
  
  -- Metadata
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Events Table
-- --------------------------------------------------------
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `event_date` DATE NOT NULL,
    `event_time` TIME,
    `location` VARCHAR(255),
    `type` VARCHAR(100) DEFAULT 'General',
    `image_url` VARCHAR(255),
    `status` VARCHAR(50) DEFAULT 'published',
    `created_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Event Attendance / Registrations
-- --------------------------------------------------------
DROP TABLE IF EXISTS `event_attendance`;
CREATE TABLE `event_attendance` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `member_id` INT NOT NULL,
    `status` ENUM('registered', 'attended', 'certificate_issued') DEFAULT 'registered',
    `points_awarded` TINYINT(1) DEFAULT 0,
    `attended_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (`event_id`, `member_id`),
    INDEX (`event_id`),
    INDEX (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. CPD Points Ledger
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cpd_points`;
CREATE TABLE `cpd_points` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `member_id` INT NOT NULL,
    `event_id` INT NULL,
    `points` INT NOT NULL,
    `activity_type` VARCHAR(100),
    `description` TEXT,
    `awarded_by` INT,
    `awarded_date` DATE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`member_id`),
    INDEX (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Payments
-- --------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `member_id` INT NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(3) DEFAULT 'KES',
    `payment_method` ENUM('cash', 'mpesa', 'bank_transfer', 'card', 'paypal', 'stripe', 'import', 'other') NOT NULL,
    `payment_status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `payment_type` ENUM('membership', 'event', 'donation', 'other') DEFAULT 'membership',
    `transaction_id` VARCHAR(100),
    `invoice_number` VARCHAR(50),
    `invoice_date` DATE,
    `membership_type_id` INT, 
    `event_id` INT,          
    `description` TEXT,
    `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`member_id`),
    INDEX (`transaction_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Settings
-- --------------------------------------------------------
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(100) UNIQUE NOT NULL,
    `setting_value` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`) VALUES
('contact_email', 'info@nnak.or.ke'),
('contact_phone', '+254 700 000 000'),
('contact_address', 'NNAK Headquarters, Nurses Complex, Nairobi, Kenya'),
('site_name', 'NNAK Portal'),
('authorised_signature', 'Start KeyBoard');

-- --------------------------------------------------------
-- 8. Contact Messages
-- --------------------------------------------------------
DROP TABLE IF EXISTS `contact_messages`;
CREATE TABLE `contact_messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Member Interactions
-- --------------------------------------------------------
DROP TABLE IF EXISTS `member_interactions`;
CREATE TABLE `member_interactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `member_id` INT NOT NULL,
    `action_type` VARCHAR(100) NOT NULL, -- e.g., 'LOGIN', 'CPD_AWARD', 'ID_GENERATED'
    `description` TEXT,
    `performed_by` INT, -- User ID of the admin
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`member_id`),
    INDEX (`action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
