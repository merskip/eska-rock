<?php
require_once "src/EskaRock.php";
require_once "src/LastFM.php";
require_once "src/TekstowoPL.php";

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
        $result["youtube"] = ["videoId" => $details->youtubeVideoId];
        $result["lyrics"]["original"] = $details->lyricsOrginal;
        $result["lyrics"]["translation"] = $details->lyricsTranslation;
    }
}

header("Content-Type: application/json");
echo json_encode($result, JSON_PRETTY_PRINT);