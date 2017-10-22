<?php
require_once 'Cache.php';

class TekstowoPL {

    const SONG_URL_PREFIX = "http://www.tekstowo.pl/piosenka";
    const SONG_URL_SEPARATOR = ",";
    const SONG_URL_SUFFIX = ".hml";
    const CACHE_LYRICS_URL_FILENAME = "tekstowo-pl-lyrics-url";

    function getCachedLyricsUrl($songTitle) {
        $cachedLyricsUrl = Cache::getInstance()->getJson(TekstowoPL::CACHE_LYRICS_URL_FILENAME);
        if ($cachedLyricsUrl != null && $cachedLyricsUrl->id == $songTitle) {
            return $cachedLyricsUrl->url;
        }
        else {
            return $this->getLyricsUrl($songTitle);
        }
    }

    function getLyricsUrl($songTitle) {
        $expectedLyricsUrl = $this->generateLyricsUrl($songTitle);
        if ($this->checkHttpStatusIsOk($expectedLyricsUrl)) {
            Cache::getInstance()->putJson(TekstowoPL::CACHE_LYRICS_URL_FILENAME, [
                "id" => $songTitle,
                "url" => $expectedLyricsUrl
            ]);
            return $expectedLyricsUrl;
        }
        else {
            return null;
        }
    }

    private function generateLyricsUrl($songTitle) {
        $arguments = explode("-", $songTitle, 2);
        $arguments = array_map(function ($value) {
            return $this->convertToUrl($value);
        }, $arguments);

        return TekstowoPL::SONG_URL_PREFIX
            . TekstowoPL::SONG_URL_SEPARATOR
            . implode(TekstowoPL::SONG_URL_SEPARATOR, $arguments)
            . TekstowoPL::SONG_URL_SUFFIX;
    }

    private function checkHttpStatusIsOk($url) {
        $headers = get_headers($url, 1);
        $httpStatus = $headers[0];
        return strpos($httpStatus, '200') !== false;
    }

    private function convertToUrl($text) {
        $text = trim($text);
        $text = strtolower($text);
        $text = str_replace(" ", "_", $text);
        $text = str_replace("/", "_", $text);
        $text = str_replace("?", "_", $text);
        $text = str_replace(",", "_", $text);
        $text = iconv('UTF-8', 'ASCII//TRANSLIT', $text);
        return $text;
    }

}