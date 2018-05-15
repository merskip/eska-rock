<?php

class Build {

    const BUILD_FILENAME = "build-version.json";
    const DATETIME_FORMAT = "Y-m-d H:i:s O";

    private $version;
    private $revision;
    private $date;

    /**
     * @param String $version
     * @param String $revision
     * @param DateTime $date
     */
    public function __construct($version, $revision, $date) {
        $this->version = $version;
        $this->revision = $revision;
        $this->date = $date;
    }

    /**
     * Automatically retrieves build information
     * @return Build
     */
    public static function fromFileOrGitRepository() {
        $build = self::fromJsonFile(Build::BUILD_FILENAME);
        if ($build === null) {
            $build = self::fromGitRepository();
        }
        if ($build === null) {
            $build = new UnknownBuild();
        }
        return $build;
    }

    public static function fromJsonFile($filename) {
        if (!file_exists($filename))
            return null;
        $content = file_get_contents($filename);
        if ($content === false)
            return null;
        return self::fromJson($content);
    }

    public static function fromJson($content) {
        $json = json_decode($content);
        return new Build($json->version, $json->revision, DateTime::createFromFormat(Build::DATETIME_FORMAT, $json->date));
    }

    public static function fromGitRepository($directory = ".git") {
        if (!file_exists($directory))
            return null;

        $gitDir = "--git-dir=" . escapeshellarg($directory);
        $commitHash = exec("git $gitDir rev-parse --short HEAD");
        $lastVersionTag = exec("git $gitDir describe --tags --abbrev=0 --match v*");
        $version = ltrim($lastVersionTag, "v");

        return new Build($version, $commitHash, new DateTime());
    }

    public function toFileContent() {
        return json_encode([
            "version" => $this->version,
            "revision" => $this->revision,
            "date" => $this->getFormattedDate()
        ], JSON_PRETTY_PRINT);
    }

    public function getPrettyVersion() {
        return "v{$this->version}-{$this->revision} ({$this->getFormattedDate()})";
    }

    public function getVersion(): String {
        return $this->version;
    }

    public function getRevision(): String {
        return $this->revision;
    }

    public function getDate(): DateTime {
        return $this->date;
    }

    public function getFormattedDate(): String {
        return $this->date->format(Build::DATETIME_FORMAT);
    }
}

class UnknownBuild extends Build {

    function __construct() {
        parent::__construct("?.?.?", "??????", new DateTime());
    }
}
