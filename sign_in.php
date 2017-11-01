<?php
require_once "src/Authorization.php";

header('Location: ' . filter_var($auth->getAuthUrl(), FILTER_SANITIZE_URL));