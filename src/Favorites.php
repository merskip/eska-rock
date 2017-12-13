<?php
require_once 'Database.php';

class Favorites {

    const Collection = "db.favorites";

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
        return $this->db->find(Favorites::Collection,
            ["userId" => $this->userId],
            ["userId" => 0]);
    }

    public function findFavoriteSong($songTitle) {
        return $this->db->findOne(Favorites::Collection,
            ["userId" => $this->userId, "songTitle" => $songTitle],
            ["userId" => 0]);
    }

    public function insertFavoriteSong($songTitle) {
        return $this->db->insert(Favorites::Collection, [
            "userId" => $this->userId,
            "songTitle" => $songTitle
        ]);
    }

    public function insertFavoriteSongWithDetails($songTitle, $details) {
        return $this->db->insert(Favorites::Collection, array_merge([
            "userId" => $this->userId,
            "songTitle" => $songTitle
        ], $details ? ["details" => $details] : []));
    }

    public function deleteFavoriteSong($id) {
        return $this->db->deleteOne(Favorites::Collection, [
            "_id" => $id,
            "userId" => $this->userId,
        ]);
    }

    public function updateFavoriteSong($id, $albumImageUrl, $youtubeVideoId) {
        $query = ['$set' => [], '$unset' => []];

        if ($albumImageUrl != null)
            $query['$set']["details.album.image"] = $albumImageUrl;
        else
            $query['$unset']["details.album.image"] = null;

        if ($youtubeVideoId != null)
            $query['$set']["details.youtube.videoId"] = $youtubeVideoId;
        else
            $query['$unset']["details.youtube"] = null;

        if (empty($query['$set'])) unset($query['$set']);
        if (empty($query['$unset'])) unset($query['$unset']);

        return $this->db->updateOne(Favorites::Collection, ["_id" => $id], $query);
    }
}