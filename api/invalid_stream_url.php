<?php
$_SERVER['REQUEST_METHOD'] === "POST" or die("Supported only POST method");

require_once "../src/EskaRock.php";
$eskaRock = new EskaRock();
$streamUrl = $eskaRock->getStreamAccUrl();

header("Content-Type: application/json");
echo json_encode([
    "new_url" => $streamUrl
], JSON_PRETTY_PRINT);
