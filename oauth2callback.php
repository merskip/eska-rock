<?php
require_once __DIR__ . '/src/Google.php';

isset($_GET['code']) or  die("Parameter code no exists");

session_start();
$token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
$_SESSION['access_token'] = $token;
header('Location: http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']));
