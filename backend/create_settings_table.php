<?php
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/Database.php';

try {
    $db = Database::getInstance()->getConnection();

    // Create settings table
    $sql = "CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    $db->exec($sql);
    echo "Settings table created or already exists.\n";

    // Initialize branding keys
    $keys = [
        ['system_logo', NULL],
        ['authorised_signature', NULL],
        ['association_name', 'Nurses and Midwives Association of Kenya'],
        ['association_tagline', 'Voice of the Nursing Profession']
    ];

    $stmt = $db->prepare("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)");
    foreach ($keys as $key) {
        $stmt->execute($key);
    }
    echo "Default settings initialized.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
