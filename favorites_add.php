<?php
isset($_POST["songTitle"]) or die("Argument songTitle is required");

require_once __DIR__ . '/src/Google.php';
require_once __DIR__ . '/src/Favorites.php';

$songTitle = $_POST["songTitle"];

$favorites = new Favorites(Database::getInstance(), getUserInfo());
$favorites->addFavoriteSong($songTitle);