<?php
const ARCHIVE_BASENAME = "eska-rock";
const ROOT_PROJECT_DIR = __DIR__ . "/..";
const IGNORED_FILES_AND_DIRECTORIES = [
    ".idea",
    ".git",
    ".gitignore",
    "scripts"
];

echo "Starting packaging...\n";

require_once __DIR__ . "/../src/utils.php";
require_once __DIR__ . "/../src/Build.php";

function getFilesInDirectory($directory, $relativeToPath, $ignore = []) {
    $relativeToPath = realpath($relativeToPath);
    $result = [];
    $files = scandir($directory);

    foreach ($files as $i => $file) {
        if ($file == "." || $file == ".." || in_array($file, $ignore))
            continue;

        $filename = $directory . "/" . $file;
        if (is_dir($filename)) {
            $result = array_merge($result, getFilesInDirectory($filename, $relativeToPath));
        }
        else if (is_file($filename)) {
            $realPathname = realpath($filename);
            $result[$realPathname] = str_remove_prefix_ltrim($realPathname, $relativeToPath . "/");
        }
    }
    return $result;
}

$build = Build::fromGitRepository(__DIR__ . "/../.git")
    or die("No found build information");

echo "Found ver. {$build->getVersion()}, rev. {$build->getRevision()} ({$build->getFormattedDate()})\n";

$archive = new ZipArchive();
$archiveFilename = ARCHIVE_BASENAME . "_{$build->getVersion()}_{$build->getRevision()}.zip";
echo "Archive filename: {$archiveFilename}\n";

$archive->open($archiveFilename, ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE)
    or die("Failed open archive");

$allFiles = getFilesInDirectory(ROOT_PROJECT_DIR,ROOT_PROJECT_DIR,
    array_merge(IGNORED_FILES_AND_DIRECTORIES, [$archiveFilename]));

echo "Found total " . count($allFiles) . " files\n";
echo "Adding files...\n";
$totalOriginalSize = 0;

foreach ($allFiles as $realPathname => $filename) {
    echo " * $filename\n";
    $archive->addFile($realPathname, $filename)
        or die("Failed add " . $realPathname);
    $totalOriginalSize += filesize($realPathname);
}

echo " + " . Build::BUILD_FILENAME . "\n";
$archive->addFromString(Build::BUILD_FILENAME, $build->toFileContent());

$archive->close();
echo "Done.\n";

$archiveSize = filesize($archiveFilename);
echo "Original size: " . round($totalOriginalSize / 1024, 2) . " kB\n";
echo "Archive size: " . round($archiveSize / 1024, 2) . " kB (" . round($archiveSize / $totalOriginalSize * 100) ."%)\n";
