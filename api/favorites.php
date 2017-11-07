<?php
require_once "../src/Authorization.php";
require_once "../src/Favorites.php";

$auth->isAuthorized() or die("You must be sign in");

$favorites = new Favorites(Database::getInstance(), $auth->getUserInfo());

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'GET') {

    header("Content-Type: application/json");
    echo json_encode($favorites->findAllFavoritesSongs(), JSON_PRETTY_PRINT);
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    isset($_POST["songTitle"]) or die("Argument songTitle is required");
    $songTitle = $_POST["songTitle"];

    if ($favoriteSong = $favorites->findFavoriteSong($songTitle)) {
        $id = $favoriteSong->_id;
    }
    else {
        $id = $favorites->insertFavoriteSong($songTitle);
        http_response_code(201); // 201 - Created
    }

    header("Content-Type: application/json");
    echo json_encode(["_id" => $id], JSON_PRETTY_PRINT);
}
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $_DELETE); // PHP not supports DELETE in default

    isset($_DELETE["_id"]) or die("Argument _id is required");
    $id = $_DELETE["_id"];

    if (!$favorites->deleteFavoriteSong($id)) {
        http_response_code(404);
    }
}
else {
    die("Unknown http method: " . $method);
}