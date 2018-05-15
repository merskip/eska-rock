<?php
if (!extension_loaded("ssh2")) {
    echo "For using automatic deploy you need have installed ssh2 extension.\nYou can install with `$ sudo apt-get install php-ssh2`\n";
    exit(1);
}

const DEFAULT_FILENAME = ".eska-rock-deploy-defaults.json";
const ARCHIVE_BASENAME = "eska-rock";
const ROOT_PROJECT_DIR = __DIR__ . "/..";
const MAX_PASSWORD_COUNT = 3;
$defaultsPath = $_SERVER['HOME'] . "/" . DEFAULT_FILENAME;

if (file_exists($defaultsPath)) {
    $defaults = json_decode(file_get_contents($defaultsPath));
    if (!is_object($defaults)) $defaults = null;
}
else {
    $defaults = null;
}

$stdin = fopen("php://stdin", "r");

function getInput($message, $default = null, $example = null, $asInt = false) {
    if ($default != null) {
        $trailingPrompt = " [" . $default . "]: ";
    }
    else if ($example != null) {
        $trailingPrompt = " (eg. " . $example . "): ";
    }
    else {
        $trailingPrompt = ": ";
    }

    global $stdin;
    $input = null;
    do {
        echo $message . $trailingPrompt;
        $input = trim(fgets($stdin));

        if ($asInt) $input = ctype_digit($input) ? intval($input) : null;
        if (empty($input) && !empty($default)) $input = $default;

    } while (empty($input));
    return $input;
}

$host = getInput("Enter host", @$defaults->host, "example.com");
$port = getInput("Enter post", @$defaults->port, "22", true);
$user = getInput("Enter user", @$defaults->user, "user");
$remoteDirectoryPath = getInput("Enter remote path", @$defaults->remoteDirectoryPath, "/var/www/html/eska_rock");

file_put_contents($defaultsPath,
    json_encode([
        "host" => $host,
        "user" => $user,
        "port" => $port,
        "remoteDirectoryPath" => $remoteDirectoryPath
    ], JSON_PRETTY_PRINT));
echo "\n";

$searchDirectory = realpath(ROOT_PROJECT_DIR);
echo "Searching archives in $searchDirectory...\n";

$foundArchives = [];
foreach (scandir($searchDirectory) as $file) {
    if (strpos($file, ARCHIVE_BASENAME) === 0) { // starts with
        $foundArchives[] = $file;
    }
}
if (count($foundArchives) > 1) {
    echo "Found a few archives: \n";
    echo implode("\n", array_map(function ($index, $filename) {
            return " $index) $filename";
        }, array_keys($foundArchives), $foundArchives)) . "\n";

    do {
        echo "Please select one: ";
        $index = trim(fgets($stdin));
    } while (!array_key_exists($index, $foundArchives));
    $localArchivePath = $searchDirectory . "/" . $foundArchives[$index];
    echo "Selected archive $localArchivePath\n";
}
else if (count($foundArchives) == 1) {
    $localArchivePath = $searchDirectory . "/" . $foundArchives[0];
    echo "Found archive $localArchivePath\n";
}
else {
    echo "No found any archive.\n";
    exit(1);
}
echo "\n";

function performCommand($command, $args) {
    $out = null;
    $ret = null;
    $cmd = $command . " " . implode(" ", $args);
    echo "$ $cmd\n";
    exec($cmd, $out, $ret);

    if ($ret !== 0) {
        echo "Failed scp: returns code $ret.\n";
        exit(1);
    }
    return $out;
}

echo "Connecting to $user@$host:$port using SSH...\n";
$session = ssh2_connect($host, $port);
if ($session === false) {
    echo "Failed ssh2_connect.\n";
    exit(1);
}
$serverFingerprint = ssh2_fingerprint($session);
$serverPrettyFingerprint = implode(":", str_split(strtolower($serverFingerprint), 2));
echo "Server fingerprint: $serverPrettyFingerprint\n";

$remainingPasswordTries = MAX_PASSWORD_COUNT;
do {
    system('stty -echo');
    echo "Enter password for $user: ";
    $password = rtrim(fgets($stdin), PHP_EOL);
    echo "\n";
    system('stty echo');

    if (@ssh2_auth_password($session, $user, $password)) {
        echo "Success authentication for $user.\n";
        break;
    }
    else {
        echo "Authentication failed for $user using entered password. ";
        $remainingPasswordTries--;

        if ($remainingPasswordTries > 0) {
            echo "Please try again.\n";
        }
        else {
            echo "Number of attempts has been exceeded.\n";
            exit(1);
        }
    }
} while (true);
echo "\n";

$remoteArchivePath = dirname($remoteDirectoryPath) . "/" . basename($localArchivePath);
echo "Uploading $localArchivePath to $host:$remoteArchivePath...\n";
if (!ssh2_scp_send($session, $localArchivePath, $remoteArchivePath)) {
    echo "Failed transfer archive to remote.\n";
    exit(1);
}

function remote_exec($cmd) {
    global $session;
    $stream = ssh2_exec($session, $cmd);
    if ($stream === null) {
        echo "Failed ssh2_exec: $cmd\n";
        exit(1);
    }

    stream_set_blocking($stream, true);
    $stream_stdout = ssh2_fetch_stream($stream, SSH2_STREAM_STDIO);
    return rtrim(stream_get_contents($stream_stdout));
}

// Searching old version
$oldBuildVersionPath = $remoteDirectoryPath . "/build-version.json";
$oldBuildVersionJson = remote_exec("[ -e '$oldBuildVersionPath' ] && cat '$oldBuildVersionPath'");
if (!empty($oldBuildVersionJson)) {
    require_once __DIR__ . "/../src/Build.php";
    $oldBuild = Build::fromJson($oldBuildVersionJson);
    echo "Found old version: {$oldBuild->getPrettyVersion()}\n";

    $backupRemoteOldBuildDirectoryPath = $remoteDirectoryPath . "_" . $oldBuild->getVersion() . "-" . $oldBuild->getRevision();
    echo "Moving to $backupRemoteOldBuildDirectoryPath...\n";
    ssh2_sftp_rename(ssh2_sftp($session), $remoteDirectoryPath, $backupRemoteOldBuildDirectoryPath);
}
else { // Not found version information inside destination directory
    function generateGUID() {
        $chars = md5(uniqid(rand(), true));
        $hyphen = chr(45); // "-"
        $uuid = chr(123) // "{"
            . substr($chars, 0, 8) . $hyphen
            . substr($chars, 8, 4) . $hyphen
            . substr($chars, 12, 4) . $hyphen
            . substr($chars, 16, 4) . $hyphen
            . substr($chars, 20, 12)
            . chr(125); // "}"
        return $uuid;
    }

    // Let's backup of remote destination path, if exists
    $backupRemoteOldDirectoryPath = $remoteDirectoryPath . "_" . generateGUID();
    $directoryMoved = remote_exec("[ -e '$remoteDirectoryPath' ] "
            . "&& mv '$remoteDirectoryPath' '$backupRemoteOldDirectoryPath' "
            . "&& echo 'moved'") == "moved";
    if ($directoryMoved) {
        echo "Moved old directory to $backupRemoteOldDirectoryPath.\n";
    }
}

echo "Unzipping archive $remoteArchivePath to $remoteDirectoryPath...\n";
$output = remote_exec("unzip -q '$remoteArchivePath' -d '$remoteDirectoryPath' && echo 'success'");
if ($output != "success") {
    echo "Failed unzip: $output\n";
    exit(1);
}
echo "Removing unzipped archive...\n";
remote_exec("rm '$remoteArchivePath'");

echo "Successfully deployed $localArchivePath.\n";
echo "Done.\n";
