-- Seed Admin and Test Accounts
-- Run this AFTER running MASTER_SCHEMA.sql

-- 1. Create Default Admin Account
-- Email: admin@nnak.org
-- Password: Digital2025
-- Hash: $2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I. (Valid bcrypt hash)

INSERT INTO `members` (
    `member_id`, `first_name`, `last_name`, `email`, `password_hash`, 
    `phone`, `role`, `status`, `membership_type_id`, `date_of_birth`, `created_at`
) VALUES (
    'ADMIN001', 'System', 'Admin', 'admin@nnak.org', 
    '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 
    '+254700000000', 'admin', 'active', 1, '1980-01-01', NOW()
) ON DUPLICATE KEY UPDATE 
    `password_hash` = VALUES(`password_hash`), 
    `role` = 'admin', 
    `status` = 'active';

-- 2. Create User Account (Metto Alex)
-- Email: mettoalex@gmail.com
-- Password: Digital2025
INSERT INTO `members` (
    `member_id`, `first_name`, `last_name`, `email`, `password_hash`, 
    `phone`, `role`, `status`, `membership_type_id`, `date_of_birth`, `created_at`
) VALUES (
    'NNAK2026001', 'Metto', 'Alex', 'mettoalex@gmail.com', 
    '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 
    '+254700000001', 'admin', 'active', 1, '1990-01-01', NOW()
) ON DUPLICATE KEY UPDATE 
    `password_hash` = VALUES(`password_hash`), 
    `role` = 'admin', 
    `status` = 'active';

-- 3. Create Test User
-- Email: test@nnak.org
-- Password: Digital2025
INSERT INTO `members` (
    `member_id`, `first_name`, `last_name`, `email`, `password_hash`, 
    `phone`, `role`, `status`, `membership_type_id`, `date_of_birth`, `created_at`
) VALUES (
    'TEST001', 'Test', 'Member', 'test@nnak.org', 
    '$2y$10$2DUaT62SrD9zQgz3nvdO2egAGYFdbhQQlIQs4aafFGQABh45Uh2I.', 
    '+254711000000', 'member', 'active', 1, '1995-05-15', NOW()
) ON DUPLICATE KEY UPDATE 
    `password_hash` = VALUES(`password_hash`), 
    `status` = 'active';
