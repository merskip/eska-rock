<!doctype html>
<head>
    <link rel="icon" href="static/favicon.png">
    <link rel="stylesheet" href="static/styles.css" type="text/css">
    <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script src="static/radio.js"></script>
    <!--suppress JSUnusedLocalSymbols -->
    <script>
        <?php
        require_once "src/EskaRock.php";
        $eskaRock = new EskaRock();
        $streamUrl = $eskaRock->getCachedStreamUrl();
        $streamTitle = $eskaRock->getStreamTitle($streamUrl);
        ?>
        let streamUrl = "<?php echo $streamUrl ?>";
    </script>
    <title><?php echo $streamTitle ?></title>
</head>
<body>
<?php
require_once __DIR__ . '/src/Google.php';
$userInfo = getUserInfo();
if ($userInfo == null): ?>
    <a href="sign_in.php"><button>Sign in</button></a>
<?php else: ?>
    <div style="color: white">Witaj, <?php echo $userInfo->name ?></div>
    <a href="logout.php"><button>Logout</button></a>
<?php endif; ?>
<img src="static/eska-rock-horizontal-logo.png" class="logo">
<div class="radio-panel radio-panel-collapsed">
    <audio id="radio-stream">
    </audio>
    <div id="radio-stream-title" class="radio-panel-title"><?php echo $streamTitle ?></div>
    <button id="radio-toggle-play" class="radio-panel-button radio-toggle-play radio-play-btn">
        <span class="radio-toggle-play-icon"></span>
    </button>
    <div class="radio-panel-content">
        <img id="radio-album-image" class="radio-panel-album-image no-album-image" src="">

        <div class="radio-panel-section-title">
            <div id="radio-refreshing-countdown-timer" class="radio-pie radio-pie-indeterminate radio-pie-placeholder">
                <div class="radio-pie-spinner"></div>
                <div class="radio-pie-filler"></div>
                <div class="radio-pie-mask"></div>
            </div>
            <span class="radio-pie-label radio-placeholder">
                Teraz gra
            </span>
        </div>
        <span id="radio-song-title" class="radio-placeholder placeholder-long"></span>

        <div class="radio-panel-section-title radio-placeholder">Z albumu</div>
        <span id="radio-album" class="radio-placeholder"></span>

        <div class="row">
            <div class="row-item">
                <div class="radio-panel-section-title radio-placeholder">Czas trwania</div>
                <span id="radio-song-duration" class="radio-placeholder placeholder-short"></span>
            </div>
            <div class="row-item">
                <div class="radio-panel-section-title radio-placeholder">Liczba słuchaczy</div>
                <span id="radio-listeners" class="radio-placeholder placeholder-short"></span>
            </div>
            <div class="row-item">
                <div id="radio-time-title" class="radio-panel-section-title radio-placeholder">Czas odtwarzania</div>
                <span id="radio-time" class="radio-placeholder"></span>
            </div>
        </div>

        <div id="radio-song-tags" class="radio-tags"></div>

        <a id="radio-youtube-url" class="radio-url no-url " href="" target="_blank">
            YouTube
        </a>
        <a id="radio-lyrics-url" class="radio-url no-url" href="" target="_blank">
            tekstowo.pl
        </a>
        <a id="radio-lyrics-show" class="radio-url no-url">
            tekst piosenki
        </a>
    </div>
    <div class="radio-panel-lyrics collapsed">
        <div class="radio-panel-original">
            <div class="radio-panel-lyrics-title">Tekst piosenki</div>
            <div id="radio-lyrics-original"></div>
        </div>
        <div class="radio-lyrics-translation">
            <div class="radio-panel-lyrics-title">Tłumaczenie</div>
            <div id="radio-lyrics-translation"></div>
        </div>
    </div>
</div>
<script>
</script>
</body>
