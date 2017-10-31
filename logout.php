<?php
require_once __DIR__ . '/src/Google.php';

if ($client->getAccessToken() != null) {
    $client->revokeToken();
}
session_destroy();
header('Location: http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']));