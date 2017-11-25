<?php
require_once '../src/OAuth2.php';

isset($_POST['tokenId']) or  die("Parameter tokenId no exists");
$tokenId = $_POST['tokenId'];

if (OAuth2::getInstance()->verifyAndSaveInSessionTokenId($tokenId)) {
    http_response_code(200);
}
else {
    http_response_code(400);
}
