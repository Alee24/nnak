-- ============================================================
-- MMS Golf Club Management System
-- Migration: 020_create_suppliers_table.sql
-- Creates suppliers & purchase_orders tables if missing
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(200) NOT NULL,
  `name` VARCHAR(200) GENERATED ALWAYS AS (company_name) VIRTUAL,
  `code` VARCHAR(50) DEFAULT NULL,
  `contact_person` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Turf & Machinery',
  `pin_number` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active','inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `po_number` VARCHAR(50) UNIQUE NOT NULL,
  `supplier_id` INT NOT NULL,
  `order_date` DATE NOT NULL,
  `expected_delivery_date` DATE DEFAULT NULL,
  `total_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('draft','sent','approved','received','cancelled') DEFAULT 'draft',
  `notes` TEXT DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
