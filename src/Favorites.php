<?php
require_once 'Database.php';

class Favorites {

    private $db;
    private $userId;

    /**
     * @param Database $database
     * @param stdClass $user
     */
    public function __construct($database, $user) {
        $this->db = $database;
        $this->userId = $user->id;
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

    public function deleteFavoriteSong($id) {
        return $this->db->deleteOne("db.favorites", [
            "_id" => $id,
            "userId" => $this->userId,
        ]);
    }
}