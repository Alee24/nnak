<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/Database.php';

try {
    $db = Database::getInstance()->getConnection();

    // 1. Create contact_messages table
    $sql = "CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    $db->exec($sql);
    echo "Table 'contact_messages' created or exists.\n";

    // 2. Initialize default contact settings
    $settings = [
        // Contact Info
        ['contact_email', 'info@nnak.or.ke'],
        ['contact_phone', '+254 700 000 000'],
        ['contact_address', 'NNAK Headquarters, Nurses Complex, Nairobi, Kenya'],
        ['contact_map_url', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.819917806495!2d36.8219!3d-1.2833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMsKwMTcnMDAuMCJTIDM2wrA0OScxOC44IkU!5e0!3m2!1sen!2ske!4v1234567890'],
        
        // Social Links
        ['social_facebook', 'https://facebook.com/nnak'],
        ['social_twitter', 'https://twitter.com/nnak'],
        ['social_instagram', 'https://instagram.com/nnak'],
        ['social_linkedin', 'https://linkedin.com/company/nnak'],
        
        // Office Hours
        ['office_hours_weekdays', '8:00 AM - 5:00 PM'],
        ['office_hours_saturday', '9:00 AM - 1:00 PM'],
        ['office_hours_sunday', 'Closed']
    ];

    $stmt = $db->prepare("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)");
    
    foreach ($settings as $setting) {
        $stmt->execute($setting);
    }
    
    echo "Default contact settings seeded.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
