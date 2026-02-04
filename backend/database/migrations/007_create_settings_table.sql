CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default M-Pesa settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('mpesa_consumer_key', '', 'M-Pesa Consumer Key'),
('mpesa_consumer_secret', '', 'M-Pesa Consumer Secret'),
('mpesa_passkey', '', 'M-Pesa Lipa Na M-Pesa Online Passkey'),
('mpesa_shortcode', '', 'M-Pesa Paybill / Till Number'),
('mpesa_env', 'sandbox', 'M-Pesa Environment (sandbox/production)'),
('mpesa_callback_url', 'http://localhost:7512/api/payment/callback', 'M-Pesa Callback URL');
