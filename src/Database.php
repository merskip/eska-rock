<?php

class Database {

    const COLLECTION_PREFIX = "db.";

    private static $instance;
    private $manager;
    private $dbName;

    private function __construct($url, $dbName) {
        $this->manager = new MongoDB\Driver\Manager($url);
        $this->dbName = $dbName;
    }

    public static function getInstance() {
        if (self::$instance === null) {
            global $config;
            self::$instance = new Database($config->mongodb->url, $config->mongodb->dbname);
        }
        return self::$instance;
    }

    public function findOne($collection, $filter = [], $fields = []) {
        $rows = $this->find($collection, $filter, $fields);
        return array_pop($rows); // TODO: Add limit 1 to query
    }

    public function find($collection, $filter = [], $fields = []) {
        $options = [];
        $options["projection"] = $fields;

        $query = new MongoDB\Driver\Query($filter, $options);
        $cursor = $this->manager->executeQuery($this->resolveCollection($collection), $query);

        $rows = [];
        foreach ($cursor as $row) {
            if (isset($row->_id)) { // Replacing type MongoDB\BSON\ObjectId to simple string
                $row->_id = (string)$row->_id;
            }
            $rows[] = $row;
        }
        return $rows;
    }

    public function insert($collection, $document) {
        $document = array_merge(['_id' => new MongoDB\BSON\ObjectId], $document);
        $bulk = new MongoDB\Driver\BulkWrite;
        $bulk->insert($document);

        $result = $this->manager->executeBulkWrite($this->resolveCollection($collection), $bulk);
        if ($result->getInsertedCount() > 0) {
            return (string)$document['_id'];
        }
        else {
            return null;
        }
    }

    public function updateSetOne($collection, $filter, $document) {
        return $this->updateOne($collection, $filter, [
            '$set' => $document
        ]);
    }

    public function updateOne($collection, $filter, $document) {
        count($filter) > 0 or die("For update query you must set non-empty filter");
        if (isset($filter["_id"]) && is_string($filter["_id"])) {
            $filter["_id"] = new MongoDB\BSON\ObjectID($filter["_id"]);
        }
        $document = (array)$document;
        if (isset($document["_id"]) && is_string($document["_id"])) {
            $document["_id"] = new MongoDB\BSON\ObjectID($document["_id"]);
        }

        $bulk = new MongoDB\Driver\BulkWrite;
        $bulk->update($filter, $document, ['limit' => 1]);

        $result = $this->manager->executeBulkWrite($this->resolveCollection($collection), $bulk);
        return $result->getMatchedCount() > 0;
    }

    public function deleteOne($collection, $filter) {
        count($filter) > 0 or die("For delete query you must set non-empty filter");
        if ($filter["_id"] && is_string($filter["_id"])) {
            $filter["_id"] = new MongoDB\BSON\ObjectID($filter["_id"]);
        }

        $bulk = new MongoDB\Driver\BulkWrite;
        $bulk->delete($filter, ['limit' => 1]);

        $result = $this->manager->executeBulkWrite($this->resolveCollection($collection), $bulk);
        return $result->getDeletedCount() > 0;
    }

    private function resolveCollection($collection) {
        if (strpos($collection, Database::COLLECTION_PREFIX) === 0) {
            return substr_replace($collection, $this->dbName . ".", 0, strlen(Database::COLLECTION_PREFIX));
        }
        else {
            die("Collection name must starts with \"" . Database::COLLECTION_PREFIX . "\"");
        }
    }

}