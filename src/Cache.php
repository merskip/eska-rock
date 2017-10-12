<?php

class Cache {

    private static $instance;
    private $dir;

    private function __construct() {
        $this->dir = sys_get_temp_dir() . '/eska-rock';
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Cache();
        }
        return self::$instance;
    }

    public function putJson($filename, $value) {
        $this->put($filename, json_encode($value));
    }

    public function getJson($filename) {
        $content = $this->get($filename);
        if ($content != null) {
            return json_decode($content);
        }
        else {
            return null;
        }
    }

    public function put($filename, $content) {
        $this->createCacheDirectoryIfNotExists();
        $filename = str_replace("..", "", $filename);
        if (file_put_contents("$this->dir/$filename", $content) === false)
            new Exception("Failed saved to cache file: " . $filename);
    }

    public function get($filename) {
        $filename = str_replace("..", "", $filename);
        if (file_exists("$this->dir/$filename")) {
            return file_get_contents("$this->dir/$filename");
        }
        else {
            return null;
        }
    }

    private function createCacheDirectoryIfNotExists() {
        if (!file_exists($this->dir)) {
            if (!mkdir($this->dir))
                new Exception("Failed create directory for cache: " . $this->dir);
        }
    }

}