<?php
require_once "../../src/Authorization.php";

$auth->logout();
header('Location: http://' . $_SERVER['HTTP_HOST'] . "/eska_rock");