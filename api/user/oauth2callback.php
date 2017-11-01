<?php
require_once '../../src/Authorization.php';

isset($_GET['code']) or  die("Parameter code no exists");
$auth->authenticateWithCode($_GET['code']);
header('Location: http://' . $_SERVER['HTTP_HOST'] . "/eska_rock");
