<?php
require_once 'Cache.php';
require_once 'utils.php';
$config = loadConfigOrDie();

class EskaRock {

    const PLAYER_URL = "https://www.eskago.pl/radio/eska-rock";
    const STREAM_LINE_PREFIX = "var streamUrl = '";
    const STREAM_LINE_SUFFIX = "'.replace('.aac', '.mp3');";
    const STREAM_DEFAULT_EXTENSION = ".aac";
    const STREAM_SUPPORTED_EXTENSIONS = [".aac", ".mp3"];
    const CACHE_URLS_FILENAME = "eska-rock-url";

    private $lastStreamUrl;
    private $lastStreamHeaders;

    function getCachedStreamUrls() {
        $cachedUrls = Cache::getInstance()->getJson(EskaRock::CACHE_URLS_FILENAME);
        if ($cachedUrls != null && $this->checkHttpStatusIsOk(reset($cachedUrls))) {
            return $cachedUrls;
        }
        else {
            return $this->getStreamUrls();
        }
    }

    function getStreamContentType($url) {
        $headers = $this->getStreamHeaders($url);
        return $headers["Content-Type"];
    }
    
    function getStreamTitle($url) {
        if (is_array($url)) {
            $url = reset($url);
        }
        $headers = $this->getStreamHeaders($url);
        return $headers["icy-name"];
    }

    function getStreamUrls() {
        $html = file_get_contents(EskaRock::PLAYER_URL);
        $aacUrl = str_find($html, EskaRock::STREAM_LINE_PREFIX, EskaRock::STREAM_LINE_SUFFIX);

        $urls = array_map(function ($extension) use ($aacUrl) {
            return str_replace(EskaRock::STREAM_DEFAULT_EXTENSION, $extension, $aacUrl);
        }, EskaRock::STREAM_SUPPORTED_EXTENSIONS);

        Cache::getInstance()->putJson(EskaRock::CACHE_URLS_FILENAME, $urls);
        return $urls;
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
