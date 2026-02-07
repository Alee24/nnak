-- NNAK System Database Schema
-- Defines the structure for the members table and related data

-- Disable foreign key checks for easier reset
SET FOREIGN_KEY_CHECKS = 0;

-- Drop table if it exists (Clean Slate)
DROP TABLE IF EXISTS `members`;

-- Create members table
CREATE TABLE `members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` VARCHAR(50) UNIQUE NOT NULL COMMENT 'Unique system identifier',
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  
  -- Contact & Personal
  `phone` VARCHAR(20),
  `gender` ENUM('male', 'female', 'other') DEFAULT 'other',
  `id_number` VARCHAR(50) COMMENT 'National ID or Passport',
  `personal_number` VARCHAR(50) COMMENT 'Personal file number if applicable',
  
  -- Address
  `address` TEXT,
  `city` VARCHAR(100),
  `county` VARCHAR(100),
  `country` VARCHAR(100) DEFAULT 'Kenya',
  `zip_code` VARCHAR(20),
  
  -- Professional
  `registration_number` VARCHAR(50) COMMENT 'Professional Registration Number',
  `qualifications` TEXT COMMENT 'Academic/Professional Qualifications',
  `occupation` VARCHAR(100),
  `organization` VARCHAR(150) COMMENT 'Employer or Organization',
  `chapter` VARCHAR(100) COMMENT 'Local NNAK Chapter',
  
  -- Membership Status
  `role` ENUM('member', 'admin', 'super_admin') DEFAULT 'member',
  `status` ENUM('active', 'pending', 'suspended', 'inactive') DEFAULT 'pending',
  `membership_type_id` INT DEFAULT 1,
  
  -- Dates
  `join_date` DATE,
  `expiry_date` DATE,
  `last_login` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  
  -- Profile
  `profile_image` VARCHAR(255) DEFAULT NULL COMMENT 'Path to profile image'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
