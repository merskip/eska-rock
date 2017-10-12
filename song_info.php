<?php
require_once "src/EskaRock.php";
require_once "src/LastFM.php";

define('LAST_FM_API_KEY', "6afdf0e4de1911f77203f9b28ca17168");
define('ESKA_ROCK_NO_SONG', "EskaROCK");

$eskaRock = new EskaRock();
$metadata = $eskaRock->requestStreamMetadata();

$result = [
    "rawSongTitle" => $metadata->songTitle,
    "listeners" => $metadata->listeners 
];

if ($metadata->songTitle != ESKA_ROCK_NO_SONG) {
    $lastFm = new LastFM(LAST_FM_API_KEY);
    $songDetails = $lastFm->getCachedSongDetails($metadata->songTitle);
    if ($songDetails != null) {
        $result["songDetails"] = $songDetails;
    }
}

header("Content-Type: application/json");
echo json_encode($result, JSON_PRETTY_PRINT);