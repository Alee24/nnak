CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed defaults
INSERT INTO settings (setting_key, setting_value) VALUES 
('company_name', 'National Nurses Association of Kenya'),
('company_tagline', 'Voice of the Nursing Profession'),
('company_address', 'P.O. Box 49422-00100 Nairobi'),
('company_logo', '/uploads/logos/default_logo.png')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
