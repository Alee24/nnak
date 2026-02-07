<?php
// backend/debug_dashboard.php
$url = 'http://localhost:5526/index.php?request=api/dashboard';

$options = [
    'http' => [
        'method'  => 'GET',
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo $result;
?>
