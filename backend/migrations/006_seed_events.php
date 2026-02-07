<?php
/**
 * Seeder: Add Test Events
 */
if (!defined('DB_HOST')) {
    require_once __DIR__ . '/../config/config.php';
}
if (!class_exists('Database')) {
    require_once __DIR__ . '/../config/Database.php';
}

$db = Database::getInstance()->getConnection();

try {
    $events = [
        [
            'title' => 'Annual General Meeting 2026',
            'description' => 'Join us for the annual strategic planning and member networking session at the ICC. Keynote speakers include the Minister of Health.',
            'date' => '2026-08-24',
            'time' => '09:00:00',
            'location' => 'Nairobi ICC, Kenya',
            'type' => 'Conference',
            'created_by' => 1
        ],
        [
            'title' => 'Clinical Nursing Skills Workshop',
            'description' => 'Hands-on training session for advanced clinical procedures, patient care, and emergency response updates.',
            'date' => '2026-09-12',
            'time' => '10:00:00',
            'location' => 'NNAK HQ Training Hall',
            'type' => 'Workshop',
            'created_by' => 1
        ],
        [
            'title' => 'Leadership in Healthcare Course',
            'description' => 'A comprehensive 4-week course designed for nurse managers and leaders. Covers conflict resolution, budgeting, and team management.',
            'date' => '2026-10-05',
            'time' => '14:00:00',
            'location' => 'Online (Zoom)',
            'type' => 'Webinar',
            'created_by' => 1
        ]
    ];

    $sql = "INSERT INTO events (title, description, event_date, event_time, location, type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);

    foreach ($events as $event) {
        $stmt->execute([
            $event['title'],
            $event['description'],
            $event['date'],
            $event['time'],
            $event['location'],
            $event['type'],
            $event['created_by']
        ]);
        echo "Created event: " . $event['title'] . "\n";
    }

    echo "Seeding completed successfully.\n";

} catch (PDOException $e) {
    die("Seeding failed: " . $e->getMessage() . "\n");
}
