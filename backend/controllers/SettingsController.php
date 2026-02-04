<?php
require_once __DIR__ . '/../config/database.php';

class SettingsController {
    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    public function getSettings() {
        $query = "SELECT setting_key, setting_value FROM settings";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // Returns ['key' => 'value']

        echo json_encode(['success' => true, 'settings' => $settings]);
    }

    public function updateSettings() {
        // Only admin should access this (middleware check assumed or added here)
        $data = json_decode(file_get_contents("php://input"), true);

        if (!empty($data)) {
            foreach ($data as $key => $value) {
                // simple sanitize
                $key = htmlspecialchars(strip_tags($key));
                $value = htmlspecialchars(strip_tags($value));

                $query = "INSERT INTO settings (setting_key, setting_value) VALUES (:key, :value) 
                          ON DUPLICATE KEY UPDATE setting_value = :value";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':key', $key);
                $stmt->bindParam(':value', $value);
                $stmt->execute();
            }
            echo json_encode(['success' => true, 'message' => 'Settings updated successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No data provided']);
        }
    }

    public function uploadLogo() {
        if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../../frontend/public/uploads/logos/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $filename = 'logo_' . time() . '_' . basename($_FILES['logo']['name']);
            $targetPath = $uploadDir . $filename;
            $publicPath = '/uploads/logos/' . $filename;

            if (move_uploaded_file($_FILES['logo']['tmp_name'], $targetPath)) {
                // Update DB
                $query = "INSERT INTO settings (setting_key, setting_value) VALUES ('company_logo', :logo) 
                          ON DUPLICATE KEY UPDATE setting_value = :logo";
                $stmt = $this->db->prepare($query);
                $stmt->bindParam(':logo', $publicPath);
                $stmt->execute();

                echo json_encode(['success' => true, 'logo_url' => $publicPath]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
        }
    }
}
?>
