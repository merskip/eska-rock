<?php
require_once 'Cache.php';
require_once 'utils.php';
$config = loadConfigOrDie();

class EskaRock {

    const PLAYER_URL = "https://www.eskago.pl/radio/eska-rock";
    const STREAM_LINE_PREFIX = "var streamUrl = '";
    const STREAM_LINE_SUFFIX = "'.replace('.aac', '.mp3');";
    const CACHE_URL_FILENAME = "eska-rock-url";

    private $lastStreamUrl;
    private $lastStreamHeaders;

    function getCachedStreamUrl() {
        $cachedUrl = Cache::getInstance()->get(EskaRock::CACHE_URL_FILENAME);
        if ($cachedUrl != null && $this->checkHttpStatusIsOk($cachedUrl)) {
            return $cachedUrl;
        }
        else {
            return $this->getStreamAccUrl();
        }
    }

    function getStreamContentType($url) {
        $headers = $this->getStreamHeaders($url);
        return $headers["Content-Type"];
    }
    
    function getStreamTitle($url) {
        $headers = $this->getStreamHeaders($url);
        return $headers["icy-name"];
    }

    function getStreamAccUrl() {
        $html = file_get_contents(EskaRock::PLAYER_URL);
        $url = str_find($html, EskaRock::STREAM_LINE_PREFIX, EskaRock::STREAM_LINE_SUFFIX);

        Cache::getInstance()->put(EskaRock::CACHE_URL_FILENAME, $url);
        return $url;
    }

    function requestStreamMetadata() {
        global $config;
        $jsonp_url = $config->eska_rock->jsonp->url;

        $jsonp = file_get_contents($jsonp_url);
        $json = json_decode(str_find($jsonp, $config->eska_rock->jsonp->func_prefix, $config->eska_rock->jsonp->func_suffix));
        
        $result = new stdClass;
        $result->songTitle = $json[0]->artists[0]->name . " - " . $json[0]->name;
        $result->listeners = intval($json[0]->listenCount);

        return $result;
    }

    private function checkHttpStatusIsOk($url) {
        $headers = $this->getStreamHeaders($url);
        $httpStatus = $headers[0];
        return strpos($httpStatus, '200') !== false;
    }

    private function getStreamHeaders($url) {
        if ($this->lastStreamUrl == $url && $this->lastStreamHeaders != null) {
            return $this->lastStreamHeaders;
        }
        else {
            $this->lastStreamHeaders = get_headers($url, 1);
            $this->lastStreamUrl = $url;
            return $this->lastStreamHeaders;
        }
    }
}
