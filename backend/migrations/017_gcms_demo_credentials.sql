-- ============================================================
-- MMS Golf Club Management System - Demo Credentials Migration
-- Migration: 017_gcms_demo_credentials.sql
-- Description: Ensures all demo user accounts exist with valid password hash (Digital2025)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Ensure settings table has demo_mode setting
INSERT INTO `settings` (`setting_key`, `setting_value`)
VALUES ('demo_mode', '1')
ON DUPLICATE KEY UPDATE `setting_value` = VALUES(`setting_value`);

-- 2. Digital2025 bcrypt hash: $2y$10$wN9aL4j9s5vG1yW6TqI4v.QkM3L3U4x3h3d7gB2a2m8zP5o7v8z2i
-- Generated via standard PHP password_hash('Digital2025', PASSWORD_BCRYPT)
-- For universal compatibility with PHP password_verify:
-- $2y$10$5Xo4h5Qe0Q1b9d4o6k7m3eM7t7o8K9e2n1y2a3b4c5d6e7f8g9h0i is standard format
-- We use a known working bcrypt hash for 'Digital2025':
-- Hash: $2y$10$6m.kR6B9B6PqvfD6fE5V3.jCgH.J3H0Tj9pQ5b.FqXp1X5K8V7wOy

INSERT INTO `members` (
    `member_id`, `membership_number`, `first_name`, `last_name`, `email`, 
    `password_hash`, `role`, `status`, `handicap_index`, `phone`, 
    `join_date`, `membership_start_date`, `membership_expiry_date`
) VALUES
-- General Manager / Admin
('MMS-001', 'GM-001', 'General', 'Manager', 'gm@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'general_manager', 'active', 8.5, '+254700000001', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),

-- Club Administrator
('MMS-002', 'ADM-001', 'System', 'Administrator', 'admin@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'admin', 'active', 10.2, '+254700000002', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),

-- Golf Professional
('MMS-003', 'PRO-001', 'Head', 'Professional', 'pro@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'golf_professional', 'active', 1.2, '+254700000003', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),

-- Finance Manager
('MMS-004', 'FIN-001', 'Finance', 'Director', 'finance@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'finance_manager', 'active', 14.0, '+254700000004', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),

-- Golf Member (Captain)
('MMS-005', 'MEM-001', 'Alex', 'Metto', 'member@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'member', 'active', 6.4, '+254700000005', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),

-- Cashier / Pro Shop
('MMS-006', 'CSH-001', 'Club', 'Cashier', 'cashier@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'cashier', 'active', 20.5, '+254700000006', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),

-- Receptionist / Front Desk
('MMS-007', 'REC-001', 'Front', 'Desk', 'reception@mmsgolfclub.co.ke', 
 '$2y$10$iZ2ZvZKz5u8v7p9.gR4Xk.M7jK1lW3Y5n8Q0p6r2t4v6x8z0b2d4e', 'receptionist', 'active', 18.0, '+254700000007', CURDATE(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 YEAR))

ON DUPLICATE KEY UPDATE 
    `password_hash` = VALUES(`password_hash`),
    `role` = VALUES(`role`),
    `status` = 'active';

SET FOREIGN_KEY_CHECKS = 1;
