<?php
// backend/debug_login_final.php
$url = 'http://localhost:5526/index.php?request=api/auth/login';
$data = ['email' => 'admin@nnak.org', 'password' => 'admin123'];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;
?>
