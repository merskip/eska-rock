<?php
require_once 'Cache.php';
require_once 'utils.php';

class TekstowoPL {

    const SONG_URL_PREFIX = "http://www.tekstowo.pl/piosenka";
    const SONG_URL_SEPARATOR = ",";
    const SONG_URL_SUFFIX = "";
    const URL_ALLOWED_CHARS = "abcdefghijklmnopqrstuvwxyz";
    const URL_ILLEGAL_CHAR_PLACEHOLDER = "_";
    const CACHE_LYRICS_URL_FILENAME = "tekstowo-pl-lyrics-url";

    function getSongDetails($lyricsUrl) {
        $html = file_get_contents($lyricsUrl);
        $youtubeVideoId = str_find($html, "miniatura_teledysku,", ".");

        $lyricsOriginal = str_find($html, "<div class=\"song-text\">", "<p>&nbsp;</p>");
        $lyricsOriginal = str_remove_prefix_ltrim($lyricsOriginal, "<h2>Tekst piosenki:</h2><br />");
        $lyricsOriginal = rtrim($lyricsOriginal);
        $lyricsOriginal = str_replace("<br />", "", $lyricsOriginal);

        $lyricsTranslation = str_find($html, "<div id=\"translation\"", "<p>&nbsp;</p>");
        $lyricsTranslation = substr($lyricsTranslation, strpos($lyricsTranslation, ">") + 1);
        $lyricsTranslation = trim($lyricsTranslation);
        $lyricsTranslation = str_replace("<br />", "", $lyricsTranslation);

        $details = new stdClass;
        $details->youtubeVideoId = $youtubeVideoId;
        $details->lyricsOrginal = $lyricsOriginal;
        $details->lyricsTranslation = $lyricsTranslation;
        return $details;
    }

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
        var_dump($expectedLyricsUrl);
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
        $text = $this->escapedText($text);
        return $text;
    }

    private function escapedText($text) {
        $result = "";
        $characters = preg_split('//u', $text, -1, PREG_SPLIT_NO_EMPTY);
        foreach ($characters as $index => $char) {
            if (strpos(TekstowoPL::URL_ALLOWED_CHARS, $char) !== false) {
                $result .= $char;
            }
            else {
                $result .= TekstowoPL::URL_ILLEGAL_CHAR_PLACEHOLDER;
            }
        }
        return $result;
    }
}