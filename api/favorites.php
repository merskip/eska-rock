<?php
require_once "../src/Authorization.php";
require_once "../src/Favorites.php";

$auth->isAuthorized() or die("You must be sign in");

$favorites = new Favorites(Database::getInstance(), $auth->getUserInfo());

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'GET') {

    header("Content-Type: application/json");
    echo json_encode($favorites->getFavoritesSongs(), JSON_PRETTY_PRINT);
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    isset($_POST["songTitle"]) or die("Argument songTitle is required");

    $songTitle = $_POST["songTitle"];
    $favorites->addFavoriteSong($songTitle);
}
else {
    die("Unknown http method: " . $method);
}