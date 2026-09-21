-- Migration 016: Add expenses table for FinanceController
-- MMS Golf Club Management System

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `expense_date` DATE NOT NULL,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Other',
  `description` TEXT NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `payment_method` ENUM('cash','bank_transfer','cheque','mpesa','card') DEFAULT 'cash',
  `reference` VARCHAR(100) DEFAULT NULL,
  `vendor` VARCHAR(255) DEFAULT NULL,
  `receipt_number` VARCHAR(100) DEFAULT NULL,
  `recorded_by` INT DEFAULT NULL,
  `approved_by` INT DEFAULT NULL,
  `approval_status` ENUM('pending','approved','rejected') DEFAULT 'approved',
  `notes` TEXT DEFAULT NULL,
  `deleted_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`recorded_by`) REFERENCES `members`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`approved_by`) REFERENCES `members`(`id`) ON DELETE SET NULL,
  INDEX `idx_expense_date` (`expense_date`),
  INDEX `idx_expense_category` (`category`),
  INDEX `idx_expense_deleted` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Budget tracking table
CREATE TABLE IF NOT EXISTS `budget_lines` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fiscal_year` YEAR NOT NULL,
  `month` TINYINT NOT NULL DEFAULT 0 COMMENT '0 = annual, 1-12 = monthly',
  `category` VARCHAR(100) NOT NULL,
  `budgeted_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_budget_line` (`fiscal_year`, `month`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed some sample expenses for demo
INSERT IGNORE INTO `expenses` (`expense_date`, `category`, `description`, `amount`, `payment_method`, `vendor`, `approval_status`) VALUES
('2025-09-01', 'Maintenance', 'Fairway mowing and trimming - September', 85000.00, 'bank_transfer', 'Greenworks Ltd', 'approved'),
('2025-09-03', 'Utilities', 'Electricity bill - August', 42000.00, 'bank_transfer', 'KPLC', 'approved'),
('2025-09-05', 'Salaries', 'Caddy wages - August', 120000.00, 'bank_transfer', NULL, 'approved'),
('2025-09-07', 'Equipment', 'Golf cart battery replacement x4', 56000.00, 'cash', 'Battery World Kenya', 'approved'),
('2025-09-10', 'Food & Beverage', 'Clubhouse kitchen supplies', 28000.00, 'mpesa', 'Fresh Supplies Co.', 'approved'),
('2025-09-12', 'Marketing', 'Tournament promotional materials', 15000.00, 'cash', 'Print Masters', 'approved'),
('2025-09-15', 'Maintenance', 'Irrigation system repair - holes 7-9', 67000.00, 'bank_transfer', 'AquaFix Systems', 'approved'),
('2025-09-18', 'Utilities', 'Water bill - August', 18000.00, 'bank_transfer', 'Nairobi Water', 'approved'),
('2025-09-20', 'Equipment', 'Pro shop display units', 35000.00, 'bank_transfer', 'Display Fixtures Ltd', 'approved'),
('2025-09-22', 'Salaries', 'Groundskeeper overtime', 22000.00, 'bank_transfer', NULL, 'approved');
