<?php
require_once "utils.php";
$config = loadConfigOrDie();

class OAuth2 {

    const COOKIE_SESSION_ID_NAME = "session_id";
    const GAPI_TOKEN_INFO_URL_PREFIX = "https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=";

    private static $instance;
    private $gapiClientId;

    private $tokenInfo;

    private function __construct($clientId) {
        $this->gapiClientId = $clientId;
        $this->loadTokenFromSessionIfExists();
    }

    public static function getInstance() {
        if (self::$instance === null) {
            global $config;
            self::$instance = new OAuth2($config->gapi->client_id);
        }
        return self::$instance;
    }

    public function isSignIn() {
        return $this->tokenInfo;
    }

    public function getUserId() {
        if ($this->tokenInfo == null)
            return null;

        return $this->tokenInfo->sub;
    }

    public function getUser() {
        if ($this->tokenInfo == null)
            return null;

        return (object) [
            'id' => $this->tokenInfo->sub,
            'name' => $this->tokenInfo->name,
            'email' => $this->tokenInfo->email
        ];
    }

    public function verifyAndSaveInSessionTokenId($tokenId) {
        $tokenInfo = $this->verifyTokenId($tokenId);
        if ($tokenInfo !== false) {
            $this->tokenInfo = $tokenInfo;
            $this->saveTokenToSession();
            return true;
        }
        else {
            return false;
        }
    }

    private function verifyTokenId($tokenId) {
        // From https://developers.google.com/identity/sign-in/web/backend-auth
        // Chapter "Calling the tokeninfo endpoint"
        $tokenInfoUrl = $this->resolveTokenInfoUrl($tokenId);
        $content = file_get_contents($tokenInfoUrl);
        if ($content === false) { // Invalid token or http status others that 200 OK
            return false;
        }

        $tokenInfo = json_decode($content);
        if ($this->verifyTokenInfo($tokenInfo)) {
            return $tokenInfo;
        }
        else {
            return false;
        }
    }

    private function verifyTokenInfo($tokenInfo) {
        if ($tokenInfo->aud != $this->gapiClientId) {
            return false;
        }

        return true;
    }

    private function loadTokenFromSessionIfExists() {
        $this->startSessionIfNeeded();
        if (isset($_SESSION['token_info'])) {
            $tokenInfo = $_SESSION['token_info'];
            if ($this->verifyTokenInfo($tokenInfo)) {
                $this->tokenInfo = $tokenInfo;
            }
        }
    }

    private function saveTokenToSession() {
        $this->startSessionIfNeeded();
        $_SESSION['token_info'] = $this->tokenInfo;
    }

    public function revokeTokenId() {
        session_destroy();
    }

    private function startSessionIfNeeded() {
        if (session_status() == PHP_SESSION_NONE) {
            session_name(OAuth2::COOKIE_SESSION_ID_NAME);
            session_start();
        }
    }

    private function resolveTokenInfoUrl($tokenId) {
        return OAuth2::GAPI_TOKEN_INFO_URL_PREFIX . $tokenId;
    }
}
