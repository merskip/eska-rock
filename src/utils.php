<?php

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