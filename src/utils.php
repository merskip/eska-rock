<?php

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