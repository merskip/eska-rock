<?php
require_once 'Cache.php';

class EskaRock {

    const PLAYER_URL = "http://www.eskago.pl/radio/eska-rock";
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
        $startPos = strpos($html, EskaRock::STREAM_LINE_PREFIX);
        $endPos = strpos($html, EskaRock::STREAM_LINE_SUFFIX, $startPos);
        $url = substr($html, $startPos + strlen(EskaRock::STREAM_LINE_PREFIX),
                    $endPos - $startPos - strlen(EskaRock::STREAM_LINE_PREFIX));

        Cache::getInstance()->put(EskaRock::CACHE_URL_FILENAME, $url);
        return $url;
    }

    function requestStreamMetadata() {
        $streamUrl = $this->getCachedStreamUrl();
        $streamUrl = substr($streamUrl, 0, strrpos($streamUrl, "?")); // Remove GET parameters
        $filename = substr($streamUrl, strrpos($streamUrl, "/") + 1); 
        $streamId = substr($filename, 0, strrpos($filename, "."));
        $statusUrl = substr($streamUrl, 0, strrpos($streamUrl, "/")) . "/status-json.xsl";
        
        $status = json_decode(file_get_contents($statusUrl));
        $sources = $status->icestats->source;
        
        $streamSources = array_values(array_filter($sources, function($source) use($streamId) {
            return strpos($source->listenurl, $streamId) !== false;
        }));
        
        $result = new stdClass;
        $result->songTitle = $streamSources[0]->title;
        $result->listeners = array_sum(array_map(function($source) {
            return $source->listeners;
        }, $streamSources));

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