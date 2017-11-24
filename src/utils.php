<?php

function loadConfigOrDie() {
    static $savedConfig = null;
    if ($savedConfig != null) {
        return $savedConfig;
    }

    define("CONFIG_FILENAME", "/var/www/eska_rock_config.json");
    file_exists(CONFIG_FILENAME) or die("Not found file with config");
    $config = json_decode(file_get_contents(CONFIG_FILENAME));

    $savedConfig = $config;
    return $config;
}

function l($url) {
    static $isSupportFriendlyUrl = null;
    if ($isSupportFriendlyUrl === null)
        $isSupportFriendlyUrl = _isSupportFriendlyUrl();

    return $isSupportFriendlyUrl ? ($url) : ($url . ".php");
}

function _isSupportFriendlyUrl() {
    return in_array('mod_rewrite', apache_get_modules())
        && isset($_SERVER['HTACCESS']);
}

function str_find($text, $prefix, $suffix) {
    $startPos = strpos($text, $prefix);
    $endPos = strpos($text, $suffix, $startPos);
    return substr($text, $startPos + strlen($prefix),
        $endPos - $startPos - strlen($prefix));
}

function str_remove_prefix_ltrim($text, $prefix) {
    $text = ltrim($text);
    if (strpos($text, $prefix) === 0) {
        $text = substr($text, strlen($prefix)) . '';
        $text = ltrim($text);
    }
    return $text;
}

class Styles {

    private function __construct() { }

    static function displayNone() {
        return "style=\"display: none\"";
    }
}
