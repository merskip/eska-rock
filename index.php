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
        let streamUrl = "<?= $streamUrl ?>";
    </script>
    <title><?= $streamTitle ?></title>
</head>
<body>
    <?php
    require_once __DIR__ . '/src/Google.php';
    $userInfo = getUserInfo();
    if ($userInfo == null): ?>
        <a href="sign_in.php" class="btn-sign-in-google"></a>
    <?php else: ?>
        <div class="user-panel">
            <div class="row">
                <img src="<?= $userInfo->picture ?>" class="row-item user-avatar">
                <div class="row-item">
                    <div class="user-name"><?= $userInfo->name ?></div>
                    <div class="user-email"><?= $userInfo->email ?></div>

                </div>
            </div>
            <div class="user-actions">
                <a href="favorites.php" class="btn-link">Ulubione</a>
                <span class="btn-link-separator">|</span>
                <a href="logout.php" class="btn-link">Wyloguj</a>
            </div>
        </div>
    <?php endif; ?>
    <img src="static/eska-rock-horizontal-logo.png" class="logo">
    <div class="radio-panel radio-panel-collapsed">
    <audio id="radio-stream">
    </audio>
    <div id="radio-stream-title" class="radio-panel-title"><?= $streamTitle ?></div>
    <button id="radio-toggle-play" class="radio-panel-button radio-toggle-play radio-play-btn">
        <span class="radio-toggle-play-icon"></span>
    </button>
    <div class="radio-panel-content">
        <img id="radio-album-image" class="radio-panel-album-image no-album-image" src="">
        <?php if ($userInfo != null): ?>
            <form action="favorites_add.php" method="post">
                <input id="favorites-add-song-title" type="hidden" name="songTitle">
                <button type="submit" class="btn-link">Dodaj do ulubionych</button>
            </form>
        <?php endif; ?>

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
