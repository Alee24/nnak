-- ============================================================
-- MMS Golf Club Management System - Foundation Migration
-- Migration: 013_gcms_foundation.sql
-- Description: Extend existing tables for Golf Club Management
-- IMPORTANT: This migration is purely additive - no DROP TABLE
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Extend membership_types into full membership categories
-- --------------------------------------------------------
ALTER TABLE `membership_types`
  ADD COLUMN IF NOT EXISTS `code` VARCHAR(20) DEFAULT NULL AFTER `name`,
  ADD COLUMN IF NOT EXISTS `joining_fee` DECIMAL(12,2) DEFAULT 0.00 AFTER `price`,
  ADD COLUMN IF NOT EXISTS `annual_fee` DECIMAL(12,2) DEFAULT 0.00 AFTER `joining_fee`,
  ADD COLUMN IF NOT EXISTS `monthly_fee` DECIMAL(12,2) DEFAULT 0.00 AFTER `annual_fee`,
  ADD COLUMN IF NOT EXISTS `privileges` TEXT DEFAULT NULL AFTER `monthly_fee`,
  ADD COLUMN IF NOT EXISTS `max_dependants` INT DEFAULT 0 AFTER `privileges`,
  ADD COLUMN IF NOT EXISTS `color` VARCHAR(20) DEFAULT '#059669' AFTER `max_dependants`,
  ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) DEFAULT 1 AFTER `color`,
  ADD COLUMN IF NOT EXISTS `sort_order` INT DEFAULT 0 AFTER `is_active`,
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;

-- Update existing membership types with golf-relevant defaults
UPDATE `membership_types` SET
  `code` = 'FULL',
  `joining_fee` = 50000.00,
  `annual_fee` = 60000.00,
  `monthly_fee` = 5000.00,
  `privileges` = 'Full golfing rights, restaurant, bar, locker room, all competitions',
  `max_dependants` = 4,
  `color` = '#059669',
  `sort_order` = 1
WHERE `name` = 'Full Member';

UPDATE `membership_types` SET
  `code` = 'ASSOC',
  `joining_fee` = 20000.00,
  `annual_fee` = 30000.00,
  `monthly_fee` = 2500.00,
  `privileges` = 'Golf rights on weekdays, limited competition entry',
  `max_dependants` = 2,
  `color` = '#0ea5e9',
  `sort_order` = 2
WHERE `name` = 'Associate Member';

UPDATE `membership_types` SET
  `code` = 'LIFE',
  `joining_fee` = 0.00,
  `annual_fee` = 0.00,
  `monthly_fee` = 0.00,
  `privileges` = 'Full lifetime golfing rights, all privileges, no annual fees',
  `max_dependants` = 4,
  `color` = '#7c3aed',
  `sort_order` = 3
WHERE `name` = 'Life Member';

-- Add new golf club membership categories
INSERT IGNORE INTO `membership_types` (`name`, `code`, `price`, `joining_fee`, `annual_fee`, `monthly_fee`, `description`, `privileges`, `max_dependants`, `color`, `sort_order`) VALUES
('Country Member', 'COUNTRY', 30000.00, 25000.00, 30000.00, 2500.00, 'For members residing outside Nairobi', 'Golf rights, limited social events', 2, '#f59e0b', 4),
('Junior Member', 'JUNIOR', 15000.00, 10000.00, 15000.00, 1250.00, 'For members under 25 years', 'Golf rights on junior tees, junior competitions', 0, '#10b981', 5),
('Corporate Member', 'CORP', 200000.00, 100000.00, 200000.00, 0.00, 'Corporate golf membership', 'Full corporate golfing package, 4 player slots', 4, '#3b82f6', 6),
('Social Member', 'SOCIAL', 20000.00, 15000.00, 20000.00, 1667.00, 'Non-golfing social membership', 'Restaurant, bar, social events', 2, '#ec4899', 7),
('Honorary Member', 'HON', 0.00, 0.00, 0.00, 0.00, 'Honorary membership granted by committee', 'Full honorary privileges', 2, '#6366f1', 8),
('Guest Member', 'GUEST', 5000.00, 0.00, 0.00, 0.00, 'Temporary guest membership', 'Single visit golfing rights', 0, '#94a3b8', 9),
('Student Member', 'STUDENT', 10000.00, 5000.00, 10000.00, 833.00, 'For full-time students', 'Golf rights, limited competitions', 0, '#14b8a6', 10);

-- --------------------------------------------------------
-- Extend members table with golf fields
-- --------------------------------------------------------
ALTER TABLE `members`
  -- Golf specific
  ADD COLUMN IF NOT EXISTS `handicap_index` DECIMAL(5,1) DEFAULT NULL AFTER `total_cpd_points`,
  ADD COLUMN IF NOT EXISTS `home_club` VARCHAR(150) DEFAULT NULL AFTER `handicap_index`,
  ADD COLUMN IF NOT EXISTS `sponsor_id` INT DEFAULT NULL AFTER `home_club`,
  ADD COLUMN IF NOT EXISTS `principal_member_id` INT DEFAULT NULL AFTER `sponsor_id`,
  ADD COLUMN IF NOT EXISTS `family_relationship` VARCHAR(50) DEFAULT NULL AFTER `principal_member_id`,
  -- Extended membership
  ADD COLUMN IF NOT EXISTS `membership_start_date` DATE DEFAULT NULL AFTER `join_date`,
  ADD COLUMN IF NOT EXISTS `membership_expiry_date` DATE DEFAULT NULL AFTER `membership_start_date`,
  ADD COLUMN IF NOT EXISTS `renewal_date` DATE DEFAULT NULL AFTER `membership_expiry_date`,
  -- Personal extended
  ADD COLUMN IF NOT EXISTS `nationality` VARCHAR(100) DEFAULT 'Kenyan' AFTER `gender`,
  ADD COLUMN IF NOT EXISTS `passport_number` VARCHAR(50) DEFAULT NULL AFTER `nationality`,
  ADD COLUMN IF NOT EXISTS `postal_address` VARCHAR(255) DEFAULT NULL AFTER `address_line2`,
  ADD COLUMN IF NOT EXISTS `emergency_contact_name` VARCHAR(150) DEFAULT NULL AFTER `postal_address`,
  ADD COLUMN IF NOT EXISTS `emergency_contact_phone` VARCHAR(20) DEFAULT NULL AFTER `emergency_contact_name`,
  ADD COLUMN IF NOT EXISTS `emergency_contact_relationship` VARCHAR(50) DEFAULT NULL AFTER `emergency_contact_phone`,
  -- Role extension for new staff roles
  MODIFY COLUMN `role` ENUM(
    'member','admin','super_admin',
    'general_manager','finance_manager','membership_officer',
    'golf_manager','golf_professional','receptionist',
    'cashier','restaurant_manager','store_manager',
    'course_manager','staff','auditor'
  ) DEFAULT 'member';

-- --------------------------------------------------------
-- Extend payments table with golf payment types
-- --------------------------------------------------------
ALTER TABLE `payments`
  ADD COLUMN IF NOT EXISTS `invoice_id` INT DEFAULT NULL AFTER `event_id`,
  ADD COLUMN IF NOT EXISTS `receipt_number` VARCHAR(50) DEFAULT NULL AFTER `invoice_number`,
  ADD COLUMN IF NOT EXISTS `cheque_number` VARCHAR(50) DEFAULT NULL AFTER `receipt_number`,
  ADD COLUMN IF NOT EXISTS `bank_reference` VARCHAR(100) DEFAULT NULL AFTER `cheque_number`,
  ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL AFTER `description`,
  ADD COLUMN IF NOT EXISTS `processed_by` INT DEFAULT NULL AFTER `notes`,
  MODIFY COLUMN `payment_type` ENUM(
    'membership','membership_renewal','joining_fee','event','donation',
    'tee_fee','competition_fee','guest_fee','caddy_fee','cart_fee',
    'restaurant','bar','golf_shop','facility_booking','penalty','other'
  ) DEFAULT 'membership',
  MODIFY COLUMN `payment_method` ENUM(
    'cash','mpesa','bank_transfer','card','paypal','stripe',
    'cheque','credit_note','import','other'
  ) NOT NULL;

-- --------------------------------------------------------
-- Extend events table with golf event fields
-- --------------------------------------------------------
ALTER TABLE `events`
  ADD COLUMN IF NOT EXISTS `event_type` VARCHAR(50) DEFAULT 'General' AFTER `type`,
  ADD COLUMN IF NOT EXISTS `max_participants` INT DEFAULT NULL AFTER `event_type`,
  ADD COLUMN IF NOT EXISTS `registration_deadline` DATETIME DEFAULT NULL AFTER `max_participants`,
  ADD COLUMN IF NOT EXISTS `venue` VARCHAR(255) DEFAULT NULL AFTER `registration_deadline`,
  ADD COLUMN IF NOT EXISTS `sponsor` VARCHAR(150) DEFAULT NULL AFTER `venue`,
  ADD COLUMN IF NOT EXISTS `is_public` TINYINT(1) DEFAULT 1 AFTER `sponsor`,
  ADD COLUMN IF NOT EXISTS `requires_payment` TINYINT(1) DEFAULT 0 AFTER `is_public`,
  ADD COLUMN IF NOT EXISTS `catering` TEXT DEFAULT NULL AFTER `requires_payment`;

-- --------------------------------------------------------
-- Extend settings with MMS / Golf Club defaults
-- --------------------------------------------------------
INSERT IGNORE INTO `settings` (`setting_key`, `setting_value`) VALUES
('club_name', 'MMS Golf Club'),
('club_short_name', 'MMS'),
('club_motto', 'Play. Connect. Excel.'),
('club_logo', ''),
('club_address', 'Golf Club Road, Nairobi, Kenya'),
('club_phone', '+254 700 000 000'),
('club_email', 'info@mmsgolfclub.co.ke'),
('club_website', 'https://mmsgolfclub.co.ke'),
('club_county', 'Nairobi'),
('currency', 'KES'),
('currency_symbol', 'KES'),
('currency_decimal_places', '2'),
('vat_rate', '16'),
('vat_enabled', '0'),
('financial_year_start', '01-01'),
('membership_renewal_reminder_days', '30,14,7'),
('tee_time_interval_minutes', '10'),
('tee_time_start_hour', '06:00'),
('tee_time_end_hour', '17:30'),
('max_players_per_tee_time', '4'),
('booking_advance_days', '14'),
('guest_fee_standard', '2500'),
('caddy_fee_standard', '1500'),
('cart_fee_standard', '2000'),
('green_fee_standard', '3000'),
('mpesa_enabled', '0'),
('mpesa_consumer_key', ''),
('mpesa_consumer_secret', ''),
('mpesa_shortcode', ''),
('mpesa_passkey', ''),
('mpesa_env', 'sandbox'),
('sms_enabled', '0'),
('sms_provider', 'africastalking'),
('sms_api_key', ''),
('sms_sender_id', 'MMS'),
('email_enabled', '0'),
('smtp_host', ''),
('smtp_port', '587'),
('smtp_username', ''),
('smtp_password', ''),
('smtp_from_name', 'MMS Golf Club'),
('smtp_from_email', 'noreply@mmsgolfclub.co.ke'),
('app_name', 'MMS — Golf Club Management System'),
('app_version', '2.0.0'),
('system_timezone', 'Africa/Nairobi');

SET FOREIGN_KEY_CHECKS = 1;
