<?php
require_once "src/init.php";

require_once "src/utils.php";
require_once "src/Build.php";
require_once "src/Resources.php";
$config = loadConfigOrDie();
$build = Build::fromFileOrGitRepository();
$res = new ResourcesBasedOnBuildVersion($build);
?>
<!doctype html>
<head lang="pl">
    <meta name="google-signin-client_id" content="<?= $config->gapi->client_id ?>">
    <meta name="radio-build-version" content="<?= $build->getVersion() ?>">
    <meta name="radio-build-revision" content="<?= $build->getRevision() ?>">
    <meta name="radio-build-date" content="<?= $build->getFormattedDate() ?>">

    <link rel="icon" href="<?= $res->get("static/favicon.png") ?>">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&amp;subset=latin-ext" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="stylesheet" href="<?= $res->get("static/styles.css") ?>" type="text/css">

    <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
    <script src="https://apis.google.com/js/platform.js"></script>
    <script src="https://apis.google.com/js/api.js"></script>
    <script src="<?= $res->get("static/Utils.js") ?>"></script>
    <script src="<?= $res->get("static/RadioCore.js") ?>"></script>
    <script src="<?= $res->get("static/RadioUI.js") ?>"></script>
    <script src="<?= $res->get("static/Timer.js") ?>"></script>
    <script src="<?= $res->get("static/RadioController.js") ?>"></script>
    <script src="<?= $res->get("static/SongDetailsController.js") ?>"></script>
    <script src="<?= $res->get("static/FavoritesController.js") ?>"></script>
    <script src="<?= $res->get("static/UserUI.js") ?>"></script>
    <script src="<?= $res->get("static/UserController.js") ?>"></script>
    <script src="<?= $res->get("static/DropdownMenu.js") ?>"></script>
    <script src="<?= $res->get("static/Modal.js") ?>"></script>
    <script src="<?= $res->get("static/Fragments.js") ?>"></script>

    <?php
    require_once "src/EskaRock.php";
    $eskaRock = new EskaRock();
    $streamUrls = $eskaRock->getCachedStreamUrls();
    $streamTitle = $eskaRock->getStreamTitle($streamUrls);
    ?>
    <title><?= $streamTitle ?></title>
</head>
<body>

<div class="user-container">
    <?php
    require_once "src/OAuth2.php";
    $user = OAuth2::getInstance()->getUser();
    ?>
    <div id="user-signin" class="g-signin2" <?= $user != null ? Styles::displayNone() : "" ?>></div>

    <div id="user-panel" <?= $user == null ? Styles::displayNone() : "" ?>>
        <div class="row">
            <div class="row-item">
                <img src="<?= $user->picture ?? $res->get("static/no-image.png") ?>" class="user-image" alt="Awatar użytkownika">
            </div>
            <div class="row-item">
                <div class="user-name"><?= $user->name ?? "" ?></div>
                <div class="user-email"><?= $user->email ?? "" ?></div>
            </div>
        </div>
        <div class="user-actions">
            <a id="user-favorites-list" class="btn-link"
               data-fragment-url="<?= l("fragments/favorites_list") ?>">Ulubione</a>
            <span class="btn-link-separator">|</span>
            <a id="user-logout" class="btn-link">Wyloguj</a>
        </div>
    </div>
</div>

<img src="<?= $res->get("static/eska-rock-horizontal-logo.png") ?>" class="logo" alt="EskaRock">
<div id="radio-panel" class="radio-panel radio-panel-collapsed">
    <audio id="radio-stream" preload="none">
    </audio>
    <div class="radio-state-message-wrapper">
        <div id="radio-starting-music-state-message" class="radio-state-message"></div>
    </div>
    <div id="radio-stream-title" class="radio-panel-title"><?= $streamTitle ?></div>
    <button id="radio-toggle-play" class="radio-panel-button radio-toggle-play radio-play-btn">
        <span class="radio-toggle-play-icon"></span>
    </button>
    <div class="radio-panel-content">
        <div class="radio-toolbar">
            <div id="radio-volume-control" class="radio-volume-control" data-title-mute="Wycisz" data-title-unmute="Wyłącz wyciszenie">
                <svg xmlns="http://www.w3.org/2000/svg" id="radio-volume-icon" class="radio-volume-icon" viewBox="0 0 1 1">
                    <polygon points="0.12 0.35, 0.30 0.35, 0.5 0.15, 0.5 0.85, 0.3 0.65, 0.12 0.65" class="cover"></polygon>
                    <path class="inner-circle" stroke="black" stroke-width="0.08" stroke-linecap="round" fill="none"></path>
                    <path class="outer-circle" stroke="black" stroke-width="0.08" stroke-linecap="round" fill="none"></path>

                    <rect x="0.25" y="0" width="0.0" height="0.08" transform="rotate(45, 0.1, 0)"
                          class="first-muted-line" fill="black">
                        <animate id="show-first-muted-line" begin="indefinite" attributeName="width" fill="freeze"
                                 from="0.0" to="1.0" dur="0.2s"></animate>
                        <animate id="hide-first-muted-line" begin="hide-second-muted-line.begin+0.1s" attributeName="width" fill="freeze"
                                 from="1.0" to="0.0" dur="0.2s"></animate>
                    </rect>
                    <rect x="0.285" y="0" width="0.0" height="0.08" transform="rotate(45, 0.21, 0)"
                          class="second-muted-line" fill="white">
                        <animate id="show-second-muted-line" begin="show-first-muted-line.begin+0.1s" attributeName="width" fill="freeze"
                                 from="0.0" to="1.0" dur="0.2s"></animate>
                        <animate id="hide-second-muted-line" begin="indefinite" attributeName="width" fill="freeze"
                                 from="1.0" to="0.0" dur="0.2s"></animate>
                    </rect>
                </svg>
                <input id="radio-volume-slider" type="range" title="" data-title="Zmień głośność" class="radio-volume-range"
                       min="0" max="1" step="0.01">
            </div>

            <button id="radio-favorite"
                    class="btn-link btn-favorite radio-placeholder"
                    data-title-unavailable="Nie można dodać tego utworu do ulubionych"
                    data-title-add="Dodaj do ulubionych"
                    data-title-remove="Usuń z ulubionych">
                <i class="material-icons"></i>
            </button>
        </div>

        <div class="row">
            <div class="row-item">
                <div class="radio-panel-section-title">
                    <div id="radio-refreshing-countdown-timer"
                         class="radio-pie radio-pie-indeterminate radio-pie-placeholder">
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
                <span id="radio-album-title" class="radio-placeholder"></span>

                <div class="row">
                    <div class="row-item">
                        <div class="radio-panel-section-title radio-placeholder">Czas trwania</div>
                        <span id="radio-song-duration" class="radio-placeholder placeholder-short"></span>
                    </div>
                    <div class="row-item">
                        <div class="radio-panel-section-title radio-placeholder">Strumień</div>
                        <span id="radio-stream-details" class="radio-placeholder placeholder-short"></span>
                    </div>
                    <div class="row-item">
                        <div class="radio-panel-section-title radio-placeholder">Czas odtwarzania</div>
                        <span id="radio-timer" class="radio-placeholder"></span>
                    </div>
                </div>

                <div id="radio-song-tags" class="radio-tags"></div>

                <a id="radio-youtube-url" class="radio-url no-url " href="" target="_blank">
                    YouTube
                </a>
                <a id="radio-lyrics-url" class="radio-url no-url" href="" target="_blank">
                    tekstowo.pl
                </a>
                <a id="radio-lyrics-toggle" class="radio-url no-url">
                    tekst piosenki
                </a>
            </div>
            <div class="row-item-fit radio-panel-right">
                <img id="radio-album-image" class="radio-panel-album-image no-album-image"
                     src="<?= $res->get("static/no-image.png") ?>" alt="Zdjęcie albumu">
            </div>
        </div>

    </div>
    <div id="radio-lyrics-panel" class="radio-panel-lyrics collapsed">
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
    let radio = new Radio('radio-stream', <?= json_encode($streamUrls, JSON_PRETTY_PRINT) ?>);
    let radioUI = new RadioUI();
    new RadioController(radio, radioUI);
    let songDetailsController = new SongDetailsController(radio, radioUI, {
        refreshCurrentSong: {
            duration: 1000 * 15,
            tickCount: 360 * 0.2
        }
    });

    let userUI = new UserUI();
    let userController = new UserController(userUI);
    new FavoritesController(radioUI, userController, songDetailsController);
</script>
<div class="radio-footer">
    &copy; 2017-2018 Piotr Merski;
    ver. <span class="radio-version"><?= $build->getVersion() ?></span>
    rev. <span class="radio-revision"><?= $build->getRevision() ?></span>
</div>
</body>
