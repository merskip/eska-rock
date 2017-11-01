<?php
require_once "src/Authorization.php";

$auth->logout();
header('Location: http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']));