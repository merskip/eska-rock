<?php
$timeStart = microtime(true);
require_once "../src/EskaRock.php";
require_once "../src/LastFM.php";
require_once "../src/TekstowoPL.php";
require_once "../src/OAuth2.php";
require_once "../src/Database.php";
require_once "../src/Favorites.php";
require_once "../src/utils.php";
require_once "../src/YouTubeHelpers.php";
$config = loadConfigOrDie();

$eskaRock = new EskaRock();
$metadata = $eskaRock->requestStreamMetadata();
$result = [
    "rawSongTitle" => $metadata->songTitle,
    "listeners" => $metadata->listeners 
];

$ETag = sha1($metadata->songTitle);
header("ETag: " . sha1($metadata->songTitle));

if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $ETag == $_SERVER['HTTP_IF_NONE_MATCH']) {
    http_response_code(304); // 304 - Not Modified
    return;
}

$isValidSong = ($metadata->songTitle != $config->eska_rock->no_song);
$result["isValidSong"] = $isValidSong;

if ($isValidSong) {
    $userInfo = OAuth2::getInstance()->getUser();
    if ($userInfo != null) {
        $favorite = new Favorites(Database::getInstance(), $userInfo);
        $favoriteSong = $favorite->findFavoriteSong($metadata->songTitle);
        $result["favoriteId"] = $favoriteSong != null ? $favoriteSong->_id : null;
    }

    $lastFm = new LastFM();
    $details = $lastFm->getCachedSongDetails($metadata->songTitle);
    if ($details != null) {
        $result["songDetails"] = [
            "title" => $details->title,
            "artist" => $details->artist
        ];
        if (isset($details->duration)) {
            $result["songDetails"]["duration"] = $details->duration;
        }
        if (isset($details->album)) {
            $result["album"] = $details->album;
        }
        $result["tags"] = $details->tags;
    }

    $tekstowoPl = new TekstowoPL();
    $lyricsUrl = $tekstowoPl->getCachedLyricsUrl($metadata->songTitle);
    if ($lyricsUrl != null) {
        $result["lyrics"] = [
            "url" => $lyricsUrl
        ];

        $details = $tekstowoPl->getCachedSongDetails($lyricsUrl);
        $result["youtube"] = [
            "videoId" => $details->youtubeVideoId,
            "url" => YouTubeHelpers::getVideoUrl($details->youtubeVideoId)
        ];
        $result["lyrics"]["original"] = $details->lyricsOrginal;
        $result["lyrics"]["translation"] = $details->lyricsTranslation;
    }
}
$timeEnd = microtime(true);
$responseTime = intval(($timeEnd - $timeStart) * 1000);
$result["prepareResponseTime"] = $responseTime;

header("Content-Type: application/json");
echo json_encode($result, JSON_PRETTY_PRINT);