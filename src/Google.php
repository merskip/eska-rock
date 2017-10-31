<?php
require_once __DIR__ . '/../google-api-php-client-2.2.0/vendor/autoload.php';

global /** @var stdClass $userInfo */
$userInfo;

$client = new Google_Client();
$client->setAuthConfig('/var/www/client_secret.json');
$client->setAccessType("offline");
$client->setIncludeGrantedScopes(true);
$client->addScope(Google_Service_People::USERINFO_EMAIL);
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/oauth2callback.php');

session_start();
if (isset($_SESSION['access_token'])) {
    $client->setAccessToken($_SESSION['access_token']);
}

function getUserInfo() {
    global $client;
    if ($client->getAccessToken() == null) {
        return null;
    }

    $oauth2 = new \Google_Service_Oauth2($client);
    $userInfo = $oauth2->userinfo->get();
    return (object) $userInfo;
}