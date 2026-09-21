-- ============================================================
-- MMS Golf Club Management System - New Tables Migration
-- Migration: 014_gcms_tables.sql
-- Description: All new golf management tables (additive only)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Audit Logs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `user_name` VARCHAR(200) DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(100) NOT NULL,
  `record_id` INT DEFAULT NULL,
  `record_type` VARCHAR(100) DEFAULT NULL,
  `old_value` LONGTEXT DEFAULT NULL,
  `new_value` LONGTEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_action` (`action`),
  INDEX `idx_module` (`module`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Golf Courses
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `golf_courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(20) UNIQUE,
  `description` TEXT,
  `num_holes` INT DEFAULT 18,
  `par` INT DEFAULT 72,
  `course_rating` DECIMAL(5,1) DEFAULT NULL,
  `slope_rating` INT DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `course_rules` TEXT DEFAULT NULL,
  `status` ENUM('open','closed','maintenance','partially_open') DEFAULT 'open',
  `status_notes` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `golf_courses` (`name`, `code`, `num_holes`, `par`, `course_rating`, `slope_rating`, `status`) VALUES
('Main Course', 'MAIN', 18, 72, 71.5, 128, 'open');

-- --------------------------------------------------------
-- Golf Holes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `golf_holes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `hole_number` INT NOT NULL,
  `par` INT DEFAULT 4,
  `stroke_index` INT DEFAULT NULL,
  `distance_yellow` INT DEFAULT NULL COMMENT 'meters',
  `distance_white` INT DEFAULT NULL,
  `distance_red` INT DEFAULT NULL,
  `distance_blue` INT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_course_hole` (`course_id`, `hole_number`),
  INDEX `idx_course_id` (`course_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Invoices
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) UNIQUE NOT NULL,
  `member_id` INT NOT NULL,
  `invoice_date` DATE NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `subtotal` DECIMAL(12,2) DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `amount_paid` DECIMAL(12,2) DEFAULT 0.00,
  `balance` DECIMAL(12,2) DEFAULT 0.00,
  `currency` VARCHAR(3) DEFAULT 'KES',
  `status` ENUM('draft','sent','paid','partial','overdue','cancelled','void') DEFAULT 'draft',
  `notes` TEXT DEFAULT NULL,
  `terms` TEXT DEFAULT NULL,
  `reference` VARCHAR(100) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `approved_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Invoice Items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `item_type` VARCHAR(100) DEFAULT 'membership',
  `quantity` DECIMAL(10,2) DEFAULT 1.00,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `discount` DECIMAL(12,2) DEFAULT 0.00,
  `tax_rate` DECIMAL(5,2) DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL,
  `reference_type` VARCHAR(50) DEFAULT NULL,
  `reference_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_invoice_id` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Member Statements
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `member_statements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `transaction_date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `debit` DECIMAL(12,2) DEFAULT 0.00,
  `credit` DECIMAL(12,2) DEFAULT 0.00,
  `balance` DECIMAL(12,2) DEFAULT 0.00,
  `reference_type` VARCHAR(50) DEFAULT NULL COMMENT 'invoice, payment, adjustment',
  `reference_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_transaction_date` (`transaction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Member Dependants
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `member_dependants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `principal_member_id` INT NOT NULL,
  `dependant_member_id` INT DEFAULT NULL COMMENT 'If registered as full member',
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `relationship` ENUM('spouse','child','parent','sibling','other') DEFAULT 'child',
  `date_of_birth` DATE DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `id_number` VARCHAR(50) DEFAULT NULL,
  `membership_category_id` INT DEFAULT NULL,
  `status` ENUM('active','inactive','pending') DEFAULT 'active',
  `expiry_date` DATE DEFAULT NULL,
  `privileges` TEXT DEFAULT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_principal` (`principal_member_id`),
  INDEX `idx_dependant` (`dependant_member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tee Times
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tee_times` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `booking_date` DATE NOT NULL,
  `tee_time` TIME NOT NULL,
  `starting_hole` INT DEFAULT 1,
  `max_players` INT DEFAULT 4,
  `booked_players` INT DEFAULT 0,
  `status` ENUM('available','booked','blocked','reserved','completed','cancelled') DEFAULT 'available',
  `booking_type` ENUM('member','guest','tournament','reserved','blocked') DEFAULT 'member',
  `notes` TEXT DEFAULT NULL,
  `blocked_reason` VARCHAR(255) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  UNIQUE KEY `uq_tee_slot` (`course_id`, `booking_date`, `tee_time`, `starting_hole`),
  INDEX `idx_booking_date` (`booking_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Tee Time Players
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tee_time_players` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tee_time_id` INT NOT NULL,
  `member_id` INT DEFAULT NULL,
  `guest_id` INT DEFAULT NULL,
  `player_name` VARCHAR(200) DEFAULT NULL COMMENT 'For walk-ins',
  `player_type` ENUM('member','guest','visitor') DEFAULT 'member',
  `caddy_id` INT DEFAULT NULL,
  `cart_id` INT DEFAULT NULL,
  `handicap` DECIMAL(5,1) DEFAULT NULL,
  `payment_status` ENUM('pending','paid','waived','on_account') DEFAULT 'pending',
  `invoice_id` INT DEFAULT NULL,
  `checked_in` TINYINT(1) DEFAULT 0,
  `checked_in_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tee_time_id` (`tee_time_id`),
  INDEX `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Guests
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `guests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `host_member_id` INT NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `id_number` VARCHAR(50) DEFAULT NULL,
  `nationality` VARCHAR(100) DEFAULT NULL,
  `visit_date` DATE DEFAULT NULL,
  `purpose` VARCHAR(100) DEFAULT 'Golf',
  `tee_time_id` INT DEFAULT NULL,
  `guest_fee` DECIMAL(12,2) DEFAULT 0.00,
  `payment_status` ENUM('pending','paid','waived') DEFAULT 'pending',
  `payment_id` INT DEFAULT NULL,
  `invoice_id` INT DEFAULT NULL,
  `guest_pass_number` VARCHAR(50) DEFAULT NULL,
  `qr_code` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_host_member` (`host_member_id`),
  INDEX `idx_visit_date` (`visit_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Handicap History
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `handicap_history` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `old_handicap` DECIMAL(5,1) DEFAULT NULL,
  `new_handicap` DECIMAL(5,1) NOT NULL,
  `change_reason` VARCHAR(255) DEFAULT NULL COMMENT 'competition, manual, revision',
  `competition_id` INT DEFAULT NULL,
  `scorecard_id` INT DEFAULT NULL,
  `updated_by` INT DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Scorecards
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `scorecards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `course_id` INT NOT NULL,
  `competition_id` INT DEFAULT NULL,
  `tee_time_id` INT DEFAULT NULL,
  `play_date` DATE NOT NULL,
  `tee_box` ENUM('yellow','white','red','blue') DEFAULT 'yellow',
  `handicap_at_play` DECIMAL(5,1) DEFAULT NULL,
  `gross_score` INT DEFAULT NULL,
  `net_score` INT DEFAULT NULL,
  `stableford_points` INT DEFAULT NULL,
  `total_putts` INT DEFAULT NULL,
  `fairways_hit` INT DEFAULT NULL,
  `greens_in_regulation` INT DEFAULT NULL,
  `course_par` INT DEFAULT 72,
  `score_differential` DECIMAL(5,1) DEFAULT NULL,
  `status` ENUM('pending','submitted','approved','rejected') DEFAULT 'pending',
  `approved_by` INT DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_play_date` (`play_date`),
  INDEX `idx_competition_id` (`competition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Scorecard Entries (per hole)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `scorecard_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `scorecard_id` INT NOT NULL,
  `hole_number` INT NOT NULL,
  `par` INT NOT NULL,
  `stroke_index` INT DEFAULT NULL,
  `strokes` INT DEFAULT NULL,
  `putts` INT DEFAULT NULL,
  `fairway_hit` TINYINT(1) DEFAULT NULL,
  `green_in_regulation` TINYINT(1) DEFAULT NULL,
  `penalties` INT DEFAULT 0,
  `net_strokes` INT DEFAULT NULL,
  `stableford_points` INT DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  INDEX `idx_scorecard_id` (`scorecard_id`),
  UNIQUE KEY `uq_scorecard_hole` (`scorecard_id`, `hole_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Competitions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `competitions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `course_id` INT DEFAULT NULL,
  `competition_date` DATE NOT NULL,
  `registration_deadline` DATETIME DEFAULT NULL,
  `format` ENUM('stroke_play','stableford','match_play','best_ball','fourball','scramble','foursomes','other') DEFAULT 'stableford',
  `entry_fee` DECIMAL(12,2) DEFAULT 0.00,
  `sponsor` VARCHAR(150) DEFAULT NULL,
  `max_participants` INT DEFAULT NULL,
  `prizes` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `rules` TEXT DEFAULT NULL,
  `status` ENUM('draft','registration_open','registration_closed','in_progress','completed','cancelled') DEFAULT 'draft',
  `results_published` TINYINT(1) DEFAULT 0,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_competition_date` (`competition_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Competition Registrations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `competition_registrations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `competition_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `registration_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `handicap_at_registration` DECIMAL(5,1) DEFAULT NULL,
  `tee_box` ENUM('yellow','white','red','blue') DEFAULT 'yellow',
  `starting_hole` INT DEFAULT 1,
  `tee_time` TIME DEFAULT NULL,
  `flight` VARCHAR(20) DEFAULT NULL,
  `payment_status` ENUM('pending','paid','waived') DEFAULT 'pending',
  `invoice_id` INT DEFAULT NULL,
  `status` ENUM('registered','confirmed','played','withdrew','disqualified') DEFAULT 'registered',
  `scorecard_id` INT DEFAULT NULL,
  `final_position` INT DEFAULT NULL,
  `prize_awarded` VARCHAR(255) DEFAULT NULL,
  `prize_amount` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_comp_member` (`competition_id`, `member_id`),
  INDEX `idx_competition_id` (`competition_id`),
  INDEX `idx_member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Facilities
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facilities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(20) UNIQUE DEFAULT NULL,
  `type` VARCHAR(100) DEFAULT NULL COMMENT 'conference_room, function_room, swimming_pool, tennis_court, gym, restaurant, event_space',
  `description` TEXT DEFAULT NULL,
  `capacity` INT DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `hourly_rate` DECIMAL(12,2) DEFAULT 0.00,
  `daily_rate` DECIMAL(12,2) DEFAULT 0.00,
  `member_hourly_rate` DECIMAL(12,2) DEFAULT 0.00,
  `member_daily_rate` DECIMAL(12,2) DEFAULT 0.00,
  `min_booking_hours` INT DEFAULT 1,
  `max_booking_hours` INT DEFAULT 24,
  `advance_booking_days` INT DEFAULT 30,
  `rules` TEXT DEFAULT NULL,
  `amenities` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('available','maintenance','unavailable') DEFAULT 'available',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `facilities` (`name`, `code`, `type`, `capacity`, `hourly_rate`, `member_hourly_rate`, `daily_rate`, `member_daily_rate`) VALUES
('Conference Room A', 'CONF-A', 'conference_room', 30, 5000.00, 3500.00, 35000.00, 25000.00),
('Conference Room B', 'CONF-B', 'conference_room', 15, 3000.00, 2000.00, 20000.00, 14000.00),
('Main Function Room', 'FUNC-MAIN', 'function_room', 200, 50000.00, 35000.00, 150000.00, 100000.00),
('Swimming Pool', 'POOL', 'swimming_pool', 50, 500.00, 200.00, 3000.00, 1500.00),
('Tennis Court 1', 'TENNIS-1', 'tennis_court', 4, 1000.00, 500.00, 8000.00, 4000.00),
('Gym', 'GYM', 'gym', 30, 500.00, 200.00, 2000.00, 1000.00);

-- --------------------------------------------------------
-- Facility Bookings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facility_bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facility_id` INT NOT NULL,
  `member_id` INT NOT NULL,
  `booking_date` DATE NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `duration_hours` DECIMAL(5,2) DEFAULT NULL,
  `purpose` VARCHAR(255) DEFAULT NULL,
  `attendees_count` INT DEFAULT NULL,
  `setup_requirements` TEXT DEFAULT NULL,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `payment_status` ENUM('pending','paid','waived','on_account') DEFAULT 'pending',
  `invoice_id` INT DEFAULT NULL,
  `status` ENUM('pending','confirmed','in_progress','completed','cancelled','no_show') DEFAULT 'pending',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_facility_id` (`facility_id`),
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_booking_date` (`booking_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Caddies
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `caddies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `caddy_number` VARCHAR(20) UNIQUE NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `id_number` VARCHAR(50) DEFAULT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('available','assigned','off_duty','inactive','suspended') DEFAULT 'available',
  `training_level` ENUM('trainee','certified','senior','master') DEFAULT 'certified',
  `experience_years` INT DEFAULT 0,
  `languages` VARCHAR(255) DEFAULT NULL,
  `rating` DECIMAL(3,1) DEFAULT NULL,
  `standard_fee` DECIMAL(12,2) DEFAULT 1500.00,
  `notes` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `hired_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Golf Carts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `golf_carts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_number` VARCHAR(20) UNIQUE NOT NULL,
  `asset_number` VARCHAR(50) DEFAULT NULL,
  `make` VARCHAR(100) DEFAULT NULL,
  `model` VARCHAR(100) DEFAULT NULL,
  `year` INT DEFAULT NULL,
  `type` ENUM('electric','petrol','diesel') DEFAULT 'electric',
  `capacity` INT DEFAULT 2,
  `status` ENUM('available','in_use','maintenance','charging','retired') DEFAULT 'available',
  `battery_level` INT DEFAULT NULL COMMENT 'Percentage for electric',
  `fuel_level` INT DEFAULT NULL COMMENT 'Percentage for petrol/diesel',
  `last_maintenance_date` DATE DEFAULT NULL,
  `next_maintenance_date` DATE DEFAULT NULL,
  `daily_rate` DECIMAL(12,2) DEFAULT 2000.00,
  `round_rate` DECIMAL(12,2) DEFAULT 1000.00,
  `notes` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Cart Bookings
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart_bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT NOT NULL,
  `tee_time_id` INT DEFAULT NULL,
  `member_id` INT NOT NULL,
  `booking_date` DATE NOT NULL,
  `return_time` DATETIME DEFAULT NULL,
  `amount_charged` DECIMAL(12,2) DEFAULT 0.00,
  `payment_status` ENUM('pending','paid','waived') DEFAULT 'pending',
  `invoice_id` INT DEFAULT NULL,
  `damage_reported` TINYINT(1) DEFAULT 0,
  `damage_notes` TEXT DEFAULT NULL,
  `status` ENUM('booked','in_use','returned','cancelled') DEFAULT 'booked',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cart_id` (`cart_id`),
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_booking_date` (`booking_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Product Categories
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) DEFAULT NULL,
  `parent_id` INT DEFAULT NULL,
  `type` ENUM('golf_shop','restaurant','bar','general') DEFAULT 'golf_shop',
  `description` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `product_categories` (`name`, `code`, `type`, `sort_order`) VALUES
('Golf Clubs', 'CLUBS', 'golf_shop', 1),
('Golf Balls', 'BALLS', 'golf_shop', 2),
('Golf Clothing', 'CLOTHING', 'golf_shop', 3),
('Golf Shoes', 'SHOES', 'golf_shop', 4),
('Golf Accessories', 'ACCESSORIES', 'golf_shop', 5),
('Golf Bags', 'BAGS', 'golf_shop', 6),
('Equipment Rentals', 'RENTALS', 'golf_shop', 7),
('Food', 'FOOD', 'restaurant', 1),
('Beverages', 'BEVERAGES', 'restaurant', 2),
('Alcoholic Drinks', 'ALCOHOL', 'bar', 1),
('Soft Drinks', 'SOFT_DRINKS', 'bar', 2);

-- --------------------------------------------------------
-- Products (Golf Shop + Restaurant/Bar)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(50) UNIQUE DEFAULT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `unit` VARCHAR(50) DEFAULT 'each',
  `selling_price` DECIMAL(12,2) NOT NULL,
  `cost_price` DECIMAL(12,2) DEFAULT 0.00,
  `member_price` DECIMAL(12,2) DEFAULT NULL COMMENT 'Special member price if applicable',
  `stock_quantity` DECIMAL(12,2) DEFAULT 0.00,
  `minimum_stock` DECIMAL(12,2) DEFAULT 0.00,
  `reorder_quantity` DECIMAL(12,2) DEFAULT 0.00,
  `is_rentable` TINYINT(1) DEFAULT 0,
  `rental_rate` DECIMAL(12,2) DEFAULT 0.00,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_category_id` (`category_id`),
  INDEX `idx_sku` (`sku`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Inventory Movements
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `movement_type` ENUM('purchase','sale','adjustment','return','rental','damage','transfer') NOT NULL,
  `quantity` DECIMAL(12,2) NOT NULL,
  `unit_cost` DECIMAL(12,2) DEFAULT 0.00,
  `reference_type` VARCHAR(50) DEFAULT NULL,
  `reference_id` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `balance_after` DECIMAL(12,2) DEFAULT NULL,
  `performed_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_product_id` (`product_id`),
  INDEX `idx_movement_type` (`movement_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Suppliers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(200) NOT NULL,
  `code` VARCHAR(20) UNIQUE DEFAULT NULL,
  `contact_person` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `pin_number` VARCHAR(50) DEFAULT NULL COMMENT 'KRA PIN',
  `payment_terms` VARCHAR(100) DEFAULT NULL,
  `credit_limit` DECIMAL(12,2) DEFAULT 0.00,
  `current_balance` DECIMAL(12,2) DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `status` ENUM('active','inactive','blacklisted') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Purchase Orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `po_number` VARCHAR(50) UNIQUE NOT NULL,
  `supplier_id` INT NOT NULL,
  `order_date` DATE NOT NULL,
  `expected_delivery_date` DATE DEFAULT NULL,
  `delivered_date` DATE DEFAULT NULL,
  `subtotal` DECIMAL(12,2) DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `amount_paid` DECIMAL(12,2) DEFAULT 0.00,
  `balance` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('draft','submitted','approved','ordered','partial_delivery','delivered','invoiced','paid','cancelled') DEFAULT 'draft',
  `notes` TEXT DEFAULT NULL,
  `approved_by` INT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_supplier_id` (`supplier_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Purchase Order Items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `po_id` INT NOT NULL,
  `product_id` INT DEFAULT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantity` DECIMAL(12,2) NOT NULL,
  `unit_cost` DECIMAL(12,2) NOT NULL,
  `received_quantity` DECIMAL(12,2) DEFAULT 0.00,
  `total` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_po_id` (`po_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Assets
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_number` VARCHAR(50) UNIQUE NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'golf_cart, computer, furniture, machinery, kitchen, vehicle, course_equipment',
  `description` TEXT DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `serial_number` VARCHAR(100) DEFAULT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `model` VARCHAR(100) DEFAULT NULL,
  `purchase_date` DATE DEFAULT NULL,
  `purchase_cost` DECIMAL(12,2) DEFAULT 0.00,
  `supplier_id` INT DEFAULT NULL,
  `warranty_expiry` DATE DEFAULT NULL,
  `condition` ENUM('excellent','good','fair','poor','written_off') DEFAULT 'good',
  `status` ENUM('in_service','maintenance','retired','disposed') DEFAULT 'in_service',
  `current_value` DECIMAL(12,2) DEFAULT NULL,
  `depreciation_rate` DECIMAL(5,2) DEFAULT NULL COMMENT 'Annual % rate',
  `notes` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Asset Maintenance
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `asset_maintenance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `asset_id` INT NOT NULL,
  `maintenance_type` VARCHAR(100) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `scheduled_date` DATE DEFAULT NULL,
  `completed_date` DATE DEFAULT NULL,
  `cost` DECIMAL(12,2) DEFAULT 0.00,
  `performed_by` VARCHAR(200) DEFAULT NULL,
  `status` ENUM('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_asset_id` (`asset_id`),
  INDEX `idx_scheduled_date` (`scheduled_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Course Maintenance Tasks
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `course_maintenance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT DEFAULT NULL,
  `task_type` VARCHAR(100) NOT NULL COMMENT 'mowing, irrigation, fertilization, pest_control, landscaping, repairs, bunkers, greens, tees, fairways',
  `area` VARCHAR(100) DEFAULT NULL COMMENT 'Specific area of course',
  `description` TEXT NOT NULL,
  `assigned_to` INT DEFAULT NULL,
  `scheduled_date` DATE NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `completed_date` DATE DEFAULT NULL,
  `estimated_cost` DECIMAL(12,2) DEFAULT 0.00,
  `actual_cost` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('scheduled','in_progress','completed','delayed','cancelled') DEFAULT 'scheduled',
  `priority` ENUM('low','medium','high','urgent') DEFAULT 'medium',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_course_id` (`course_id`),
  INDEX `idx_scheduled_date` (`scheduled_date`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Staff Profiles (extends members table)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `staff_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT UNIQUE NOT NULL,
  `employee_number` VARCHAR(50) UNIQUE DEFAULT NULL,
  `department` VARCHAR(100) NOT NULL COMMENT 'administration, finance, golf, grounds, restaurant, security, ict, membership, maintenance',
  `position` VARCHAR(150) DEFAULT NULL,
  `employment_type` ENUM('permanent','contract','part_time','casual') DEFAULT 'permanent',
  `employment_start_date` DATE DEFAULT NULL,
  `employment_end_date` DATE DEFAULT NULL,
  `salary` DECIMAL(12,2) DEFAULT NULL,
  `bank_name` VARCHAR(100) DEFAULT NULL,
  `bank_account` VARCHAR(50) DEFAULT NULL,
  `nssf_number` VARCHAR(50) DEFAULT NULL,
  `nhif_number` VARCHAR(50) DEFAULT NULL,
  `kra_pin` VARCHAR(50) DEFAULT NULL,
  `emergency_contact` VARCHAR(150) DEFAULT NULL,
  `emergency_phone` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('active','on_leave','suspended','terminated') DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Restaurant Tables
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurant_tables` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `table_number` VARCHAR(20) UNIQUE NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `capacity` INT DEFAULT 4,
  `section` VARCHAR(100) DEFAULT NULL COMMENT 'indoor, outdoor, bar, private',
  `status` ENUM('available','occupied','reserved','cleaning') DEFAULT 'available',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Restaurant Orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurant_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `table_id` INT DEFAULT NULL,
  `member_id` INT DEFAULT NULL COMMENT 'If member order',
  `guest_name` VARCHAR(200) DEFAULT NULL COMMENT 'If non-member',
  `order_type` ENUM('dine_in','takeaway','member_charge','bar') DEFAULT 'dine_in',
  `status` ENUM('pending','confirmed','preparing','ready','served','paid','cancelled') DEFAULT 'pending',
  `subtotal` DECIMAL(12,2) DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `payment_status` ENUM('pending','paid','charged_to_account') DEFAULT 'pending',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `invoice_id` INT DEFAULT NULL,
  `waiter_id` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Restaurant Order Items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `restaurant_order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `quantity` DECIMAL(10,2) DEFAULT 1.00,
  `unit_price` DECIMAL(12,2) NOT NULL,
  `total` DECIMAL(12,2) NOT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('pending','preparing','ready','served','cancelled') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Check-Ins
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `check_ins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT NOT NULL,
  `check_in_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `check_out_time` DATETIME DEFAULT NULL,
  `purpose` VARCHAR(100) DEFAULT 'Golf' COMMENT 'Golf, Restaurant, Event, Gym, Meeting, General',
  `location` VARCHAR(100) DEFAULT NULL,
  `tee_time_id` INT DEFAULT NULL,
  `guest_count` INT DEFAULT 0,
  `notes` VARCHAR(255) DEFAULT NULL,
  `recorded_by` INT DEFAULT NULL,
  `check_in_method` ENUM('manual','qr_code','membership_card','system') DEFAULT 'manual',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_check_in_time` (`check_in_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT DEFAULT NULL COMMENT 'NULL = broadcast to all',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(100) DEFAULT 'info' COMMENT 'info, warning, success, error, reminder',
  `category` VARCHAR(100) DEFAULT NULL COMMENT 'membership, payment, tee_time, competition, event, facility, general',
  `reference_type` VARCHAR(50) DEFAULT NULL,
  `reference_id` INT DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `read_at` DATETIME DEFAULT NULL,
  `send_email` TINYINT(1) DEFAULT 0,
  `send_sms` TINYINT(1) DEFAULT 0,
  `email_sent` TINYINT(1) DEFAULT 0,
  `sms_sent` TINYINT(1) DEFAULT 0,
  `scheduled_at` DATETIME DEFAULT NULL,
  `sent_at` DATETIME DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_member_id` (`member_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Communication Templates
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `communication_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `type` ENUM('email','sms','notification') DEFAULT 'email',
  `subject` VARCHAR(255) DEFAULT NULL,
  `body` TEXT NOT NULL,
  `variables` TEXT DEFAULT NULL COMMENT 'JSON list of available variables',
  `category` VARCHAR(100) DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO `communication_templates` (`name`, `code`, `type`, `subject`, `body`, `category`) VALUES
('Membership Welcome', 'MEMBERSHIP_WELCOME', 'email', 'Welcome to {{club_name}}!',
 'Dear {{member_name}},\n\nWelcome to {{club_name}}! Your membership has been activated.\n\nMembership Number: {{membership_number}}\nCategory: {{membership_category}}\nExpiry Date: {{expiry_date}}\n\nBest regards,\nThe Club Team', 'membership'),
('Membership Expiry Reminder', 'MEMBERSHIP_EXPIRY', 'email', 'Your membership expires soon — {{club_name}}',
 'Dear {{member_name}},\n\nThis is a reminder that your membership expires on {{expiry_date}}.\n\nPlease renew your membership to continue enjoying club privileges.\n\nBalance Due: KES {{balance_due}}\n\nBest regards,\n{{club_name}}', 'membership'),
('Payment Received', 'PAYMENT_RECEIVED', 'email', 'Payment Confirmation — {{club_name}}',
 'Dear {{member_name}},\n\nWe have received your payment of KES {{amount}} on {{payment_date}}.\n\nReceipt Number: {{receipt_number}}\nPayment Method: {{payment_method}}\n\nThank you,\n{{club_name}}', 'payment'),
('Tee Time Confirmation', 'TEE_TIME_CONFIRMATION', 'sms',
 NULL, 'MMS Golf: Your tee time on {{date}} at {{time}}, {{course}} is confirmed. Ref: {{booking_ref}}', 'tee_time'),
('Competition Registration', 'COMPETITION_REGISTRATION', 'email', 'Competition Registration Confirmed — {{competition_name}}',
 'Dear {{member_name}},\n\nYour registration for {{competition_name}} on {{date}} is confirmed.\n\nEntry Fee: KES {{entry_fee}}\nFormat: {{format}}\n\nGood luck!\n{{club_name}}', 'competition');

SET FOREIGN_KEY_CHECKS = 1;
