<?php
require_once "../src/OAuth2.php";
require_once "../src/Favorites.php";
require_once "../src/utils.php";
require_once "../src/LastFM.php";
require_once "../src/TekstowoPL.php";

define('LAST_FM_API_KEY', "6afdf0e4de1911f77203f9b28ca17168");

$oauth2 = OAuth2::getInstance();
$oauth2->isSignIn() or die("You must be sign in");

$favorites = new Favorites(Database::getInstance(), $oauth2->getUser());

$method = $_SERVER['REQUEST_METHOD'];
$url = $_SERVER['REDIRECT_URL'];
if ($method == 'GET' && str_ends_with($url, "/api/favorites")) {
    header("Content-Type: application/json");
    echo json_encode($favorites->findAllFavoritesSongs(), JSON_PRETTY_PRINT);
}
else if ($method == 'GET' && str_ends_with($url, "/api/favorites/search")) {
    isset($_GET['songTitle']) or die("Argument songTitle is required");
    $songTitle = $_GET["songTitle"];

    if ($favoriteSong = $favorites->findFavoriteSong($songTitle)) {
        header("Content-Type: application/json");
        echo json_encode($favoriteSong, JSON_PRETTY_PRINT);
    }
    else {
        http_response_code(404);
    }
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    isset($_POST["songTitle"]) or die("Argument songTitle is required");
    $songTitle = $_POST["songTitle"];

    if ($favoriteSong = $favorites->findFavoriteSong($songTitle)) {
        $id = $favoriteSong->_id;
    }
    else {
        $songDetails = [];

        $lastFm = new LastFM(LAST_FM_API_KEY);
        if ($details = $lastFm->getCachedSongDetails($songTitle)) {
            $songDetails["title"] = $details->title;
            $songDetails["artist"] = $details->artist;
            if (isset($details->album)) {
                $songDetails["album"] = $details->album;
            }
        }

        $tekstowoPl = new TekstowoPL();
        if ($lyricsUrl = $tekstowoPl->getCachedLyricsUrl($songTitle)) {
            $songDetails["lyrics"] = ["url" => $lyricsUrl];

            $details = $tekstowoPl->getCachedSongDetails($lyricsUrl);
            $songDetails["youtube"] = ["videoId" => $details->youtubeVideoId];
        }

        $songDetails = count($songDetails) > 0 ? $songDetails : null;
        $id = $favorites->insertFavoriteSongWithDetails($songTitle, $songDetails);
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