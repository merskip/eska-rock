<?php
require_once 'Cache.php';

class LastFM {

    const API_URL = "https://ws.audioscrobbler.com/2.0";
    const CACHE_INFO_FILENAME = "last-fm-song-info";

    private $apiKey;

    function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }

    function getCachedSongDetails($songTitle) {
        $cachedInfo = Cache::getInstance()->getJson(LastFM::CACHE_INFO_FILENAME);
        if ($cachedInfo != null && $cachedInfo->id == $songTitle) {
            unset($cachedInfo->id);
            return $cachedInfo;
        }
        else {
            return $this->getSongDetails($songTitle);
        }
    }

    function getSongDetails($songTitle) {
        $tokens = explode("-", $songTitle, 2);
        $info = $this->trackGetInfo(trim($tokens[0]), trim($tokens[1]));
        if (property_exists($info, 'error')) {
            return null;
        }

        $songInfo = new stdClass;
        $songInfo->title = $info->track->name;
        $songInfo->artist = $info->track->artist->name;
        if ($info->track->duration != 0) {
            $songInfo->duration = intval($info->track->duration / 1000.0);
        }
        if (isset($info->track->album)) {
            $songInfo->album = new stdClass();
            $songInfo->album->title = $info->track->album->title;

            $albumImageUrl = $info->track->album->image[3]->{'#text'};
            if (!empty($albumImageUrl)) {
                $songInfo->album->image = $albumImageUrl;
            }
        }

        $tagNames =  array_map(function ($tagInfo) {
            return $tagInfo->name;
        }, $info->track->toptags->tag);
        $songInfo->tags = array_values(array_filter($tagNames,
            function ($tag) use ($info) {
                return strtolower($tag) != strtolower($info->track->artist->name)
                    && $tag != "rock";
        }));

        $songInfoCache = clone($songInfo);
        $songInfoCache->id = $songTitle;
        Cache::getInstance()->putJson(LastFM::CACHE_INFO_FILENAME, $songInfoCache);
        return $songInfo;
    }


    private function trackGetInfo($artist, $track) {
        $query = http_build_query([
            "method" => "track.getInfo",
            "api_key" => $this->apiKey,
            "artist" => $artist,
            "track" => $track,
            "format" => "json"
        ]);
        return json_decode(file_get_contents(LastFM::API_URL."?".$query));
    }

}
