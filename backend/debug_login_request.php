<?php
// backend/debug_login_request.php
$url = 'http://localhost:5526/index.php?request=api/auth/login';
$data = ['email' => 'admin@nnak.org', 'password' => 'admin123'];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true // Fetch content even on 500 status
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "=== RAW RESPONSE START ===\n";
echo $result;
echo "\n=== RAW RESPONSE END ===\n";
?>
