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
            self::$instance = new Database("mongodb://localhost:27017", "eskarockdb");
        }
        return self::$instance;
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

    public function insert($collection, $data) {
        $bulk = new MongoDB\Driver\BulkWrite;
        $bulk->insert(array_merge(['_id' => new MongoDB\BSON\ObjectId], $data));

        $this->manager->executeBulkWrite($this->resolveCollection($collection), $bulk);
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