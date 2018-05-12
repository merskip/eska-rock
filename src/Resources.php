<?php
require_once 'Build.php';

interface Resources {

    /**
     * Generates a new URL based on $baseUrl.
     * The new URL can have append query like unique data eq. version
     * @param $baseUrl String
     * @return String Transformed passed the URL
     */
    function get($baseUrl);

}

class ResourcesBasedOnBuildVersion implements Resources {

    private $build;

    /**
     * ResourcesBasedOnBuildVersion constructor.
     * @param $build Build
     */
    public function __construct($build) {
        $this->build = $build;
    }

    function get($baseUrl) {
        $query = "v=" . $this->build->getRevision();
        $separator = strpos($baseUrl, "?") === false ? "?" : "&"; // Checking if URL contains already query
        return join($separator, [$baseUrl, $query]);
    }
}
