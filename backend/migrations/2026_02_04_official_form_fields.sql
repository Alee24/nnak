-- Migration: Update members table to match official registration form
-- Date: 2026-02-04

ALTER TABLE members 
ADD COLUMN qualifications VARCHAR(255) DEFAULT NULL,
ADD COLUMN personal_number VARCHAR(50) DEFAULT NULL,
ADD COLUMN registration_number VARCHAR(50) DEFAULT NULL,
ADD COLUMN chapter VARCHAR(100) DEFAULT NULL,
ADD COLUMN county VARCHAR(100) DEFAULT NULL,
ADD COLUMN id_number VARCHAR(20) DEFAULT NULL;
