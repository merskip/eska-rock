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

        <div class="radio-panel-section-title">Teraz gra</div>
        <span id="radio-song-title"></span>

        <div class="radio-panel-section-title">Z albumu</div>
        <span id="radio-album"></span>

        <div class="row">
            <div class="row-item">
                <div class="radio-panel-section-title">Czas trwania</div>
                <span id="radio-song-duration"></span>
            </div>
            <div class="row-item">
                <div class="radio-panel-section-title">Liczba słuchaczy</div>
                <span id="radio-listeners"></span>
            </div>
            <div class="row-item">
                <div class="radio-panel-section-title">Czas odtwarzania</div>
                <span id="radio-time"></span>
            </div>
        </div>

        <div id="radio-song-tags" class="radio-tags"></div>

        <a id="radio-lyrics-url" class="radio-lyrics-url no-lyrics-url " href="" target="_blank">
            Tekst piosenki
        </a>
    </div>
</div>
<script>
</script>
</body>
