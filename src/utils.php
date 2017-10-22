<?php

function str_find($text, $prefix, $suffix) {
    $startPos = strpos($text, $prefix);
    $endPos = strpos($text, $suffix, $startPos);
    return substr($text, $startPos + strlen($prefix),
        $endPos - $startPos - strlen($prefix));
}