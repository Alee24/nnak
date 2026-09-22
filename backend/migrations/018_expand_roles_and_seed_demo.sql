-- ============================================================
-- MMS Golf Club Management System
-- Migration: 018_expand_roles_and_seed_demo.sql
-- Expands role ENUM and seeds all demo accounts
-- Password for all accounts: Digital2025
-- Hash: $2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Expand role ENUM to include all staff roles
ALTER TABLE `members`
MODIFY COLUMN `role` ENUM(
    'member', 'admin', 'super_admin', 'user',
    'general_manager', 'finance_manager', 'golf_manager',
    'golf_professional', 'cashier', 'receptionist', 'auditor'
) DEFAULT 'member';

-- 2. Add membership columns if missing
ALTER TABLE `members`
ADD COLUMN IF NOT EXISTS `membership_start_date` DATE NULL,
ADD COLUMN IF NOT EXISTS `membership_expiry_date` DATE NULL,
ADD COLUMN IF NOT EXISTS `membership_number` VARCHAR(50) NULL;

-- 3. Seed all demo accounts with a valid bcrypt hash for password "Digital2025"
INSERT INTO `members` (
    `member_id`, `membership_number`, `first_name`, `last_name`, `email`,
    `password_hash`, `role`, `status`, `handicap_index`, `phone`,
    `join_date`, `membership_start_date`, `membership_expiry_date`
) VALUES
('MMS-001', 'GM-001', 'General', 'Manager', 'gm@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'general_manager', 'active', 8.5, '+254700000001',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('MMS-002', 'ADM-001', 'System', 'Administrator', 'admin@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'admin', 'active', 10.2, '+254700000002',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('MMS-003', 'PRO-001', 'Head', 'Professional', 'pro@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'golf_professional', 'active', 1.2, '+254700000003',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('MMS-004', 'FIN-001', 'Finance', 'Director', 'finance@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'finance_manager', 'active', 14.0, '+254700000004',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('MMS-005', 'MEM-001', 'Alex', 'Metto', 'member@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'member', 'active', 6.4, '+254700000005',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('MMS-006', 'CSH-001', 'Club', 'Cashier', 'cashier@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'cashier', 'active', 20.5, '+254700000006',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('MMS-007', 'REC-001', 'Front', 'Desk', 'reception@mmsgolfclub.co.ke',
 '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 'receptionist', 'active', 18.0, '+254700000007',
 CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR))
ON DUPLICATE KEY UPDATE
    `password_hash` = VALUES(`password_hash`),
    `role` = VALUES(`role`),
    `status` = 'active',
    `membership_number` = VALUES(`membership_number`),
    `handicap_index` = VALUES(`handicap_index`);

-- 4. Ensure demo_mode is enabled in settings
INSERT INTO `settings` (`setting_key`, `setting_value`)
VALUES ('demo_mode', '1')
ON DUPLICATE KEY UPDATE `setting_value` = '1';

SET FOREIGN_KEY_CHECKS = 1;
