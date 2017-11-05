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

    public function findAllFavoritesSongs() {
        return $this->db->find("db.favorites",
            ["userId" => $this->userId],
            ["userId" => 0]);
    }

    public function findFavoriteSong($songTitle) {
        return $this->db->findOne("db.favorites",
            ["userId" => $this->userId, "songTitle" => $songTitle],
            ["userId" => 0]);
    }

    public function insertFavoriteSong($songTitle) {
        return $this->db->insert("db.favorites", [
            "userId" => $this->userId,
            "songTitle" => $songTitle
        ]);
    }

}