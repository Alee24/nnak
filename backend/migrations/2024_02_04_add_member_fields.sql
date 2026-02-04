-- Migration to add missing columns to members table
-- Executed on: 2026-02-04

ALTER TABLE members ADD COLUMN gender VARCHAR(20) DEFAULT NULL;
ALTER TABLE members ADD COLUMN occupation VARCHAR(100) DEFAULT NULL;
ALTER TABLE members ADD COLUMN organization VARCHAR(100) DEFAULT NULL;
ALTER TABLE members ADD COLUMN address_line1 VARCHAR(255) DEFAULT NULL;
-- city and license_number already existed
