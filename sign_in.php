<?php
require_once __DIR__ . '/src/Google.php';

$auth_url = $client->createAuthUrl();
header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));