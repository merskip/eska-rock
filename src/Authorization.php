<?php
require_once __DIR__ . "/google-api-php-client-2.2.0/vendor/autoload.php";

class Authorization {

    private static $instance;
    private $client;

    private function __construct() {
        $client = new Google_Client();
        $client->setAuthConfig('/var/www/client_secret.json');
        $client->setAccessType("offline");
        $client->setIncludeGrantedScopes(true);
        $client->addScope(Google_Service_People::USERINFO_EMAIL);
        $client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']) . '/oauth2callback.php');
        $this->client = $client;
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Authorization();
        }
        return self::$instance;
    }

    public function setAccessToken($token) {
        $this->client->setAccessToken($token);
    }

    public function getAuthUrl() {
        return $this->client->createAuthUrl();
    }

    public function authenticateWithCode($code) {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);
        $_SESSION['access_token'] = $token;
    }

    public function logout() {
        if ($this->client->getAccessToken() != null) {
            $this->client->revokeToken();
        }
        session_destroy();
    }

    public function isAuthorized() {
        return $this->client->getAccessToken() != null
            && !$this->client->isAccessTokenExpired();
    }

    public function getUserInfo() {
        if (!$this->isAuthorized()) {
            return null;
        }

        $oauth2 = new \Google_Service_Oauth2($this->client);
        $userInfo = $oauth2->userinfo->get();
        return (object) $userInfo;
    }
}

// Global authorization support
session_start();
$auth = Authorization::getInstance();
if (isset($_SESSION['access_token'])) {
    $auth->setAccessToken($_SESSION['access_token']);
}
