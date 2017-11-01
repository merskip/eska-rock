<?php
require_once 'Database.php';

class Favorites {

    private $db;
    private $userId;

    /**
     * @param Database $database
     * @param stdClass $userInfo
     */
    public function __construct($database, $userInfo) {
        $this->db = $database;
        $this->userId = $userInfo->id;
    }

    public function getFavoritesSongs() {
        return $this->db->find("db.favorites",
            ["userId" => $this->userId],
            ["userId" => 0]);
    }

    public function addFavoriteSong($songTitle) {
        $this->db->insert("db.favorites", [
            "userId" => $this->userId,
            "songTitle" => $songTitle
        ]);
    }

}