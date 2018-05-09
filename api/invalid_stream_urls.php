<?php
$_SERVER['REQUEST_METHOD'] === "POST" or die("Supported only POST method");

require_once "../src/EskaRock.php";
$eskaRock = new EskaRock();
$streamUrls = $eskaRock->getStreamUrls();

header("Content-Type: application/json");
echo json_encode([
    "new_urls" => $streamUrls
], JSON_PRETTY_PRINT);
