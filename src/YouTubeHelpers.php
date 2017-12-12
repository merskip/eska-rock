<?php


class YouTubeHelpers {

    private function __construct() {
    }

    static function getShortedVideoUrl($videoId) {
        return "https://youtu.be/" . $videoId;
    }

    static function getVideoUrl($videoId) {
        return "https://www.youtube.com/watch?v=" . $videoId;
    }

    static function getAnonymousPlaylistUrlForVideos($videosIds) {
        return "http://www.youtube.com/watch_videos?video_ids=" . implode(",", $videosIds);
    }

}