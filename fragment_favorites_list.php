<?php
require_once "src/OAuth2.php";
require_once "src/Favorites.php";
require_once "src/utils.php";
require_once "src/LastFM.php";
require_once "src/YouTubeHelpers.php";

$oauth2 = OAuth2::getInstance();
$oauth2->isSignIn() or die("You must be sign in");
$favorites = new Favorites(Database::getInstance(), $oauth2->getUser());
?>
<div class="radio-modal">
    <div class="radio-modal-content">
        <button class="radio-modal-close"></button>
        <h2 class="radio-modal-title">Lista ulubionych utworów</h2>
        <ul class="radio-favorites-list">
            <?php
            $favoritesSongs = array_reverse($favorites->findAllFavoritesSongs());

            $songsWithYoutubeLink = array_filter($favoritesSongs, function ($favorite) {
                return isset($favorite->details->youtube);
            });
            $videosIds = array_map(function ($favorite) {
                return $favorite->details->youtube->videoId;
            }, $songsWithYoutubeLink);
            ?>
            <?php if (count($videosIds) > 0): ?>
                <a href="<?= YouTubeHelpers::getAnonymousPlaylistUrlForVideos($videosIds) ?>"
                   class="radio-url radio-favorites-open-youtube-playlist" target="_blank">
                    Otwórz jako playlista na YouTube
                </a>
            <?php endif; ?>
            <?php foreach ($favoritesSongs as $item): ?>
                <li class="radio-favorite-list-item row" data-favorite-id="<?= $item->_id ?>">
                    <div class="row-item-fit">
                        <?php if (isset($item->details->album->image)): ?>
                            <img src="<?= $item->details->album->image ?>" class="radio-favorite-album-image">
                        <?php elseif (isset($item->details->album)): ?>
                            <div class="radio-favorite-no-album-image">
                                <i class="material-icons">album</i>
                            </div>
                        <?php else: ?>
                            <div class="radio-favorite-no-album">
                                <i class="material-icons">album</i>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div class="row-item">
                        <i class="material-icons radio-dropdown-btn">more_vert</i>
                        <ul class="radio-dropdown-menu">
                            <li>
                                <a class="radio-favorite-edit">Edytuj</a>
                            </li>
                            <li class="radio-dropdown-item-remove">
                                <a href>Usuń</a>
                            </li>
                        </ul>

                        <span class="radio-favorite-song-title">
                            <?= isset($item->details)
                                ? $item->details->artist . " - " . $item->details->title
                                : $item->songTitle ?>
                        </span>
                        <span class="radio-favorite-album">
                            <?= $item->details->album->title ?? "Bez albumu" ?>
                        </span>
                        <div class="radio-favorite-links">
                            <?php if (isset($item->details->youtube->videoId)): ?>
                                <a class="radio-url" target="_blank"
                                   href="<?= YouTubeHelpers::getVideoUrl($item->details->youtube->videoId) ?>">
                                    YouTube
                                </a>
                            <?php endif; ?>
                            <?php if (isset($item->details->lyrics->url)): ?>
                                <a class="radio-url" href="<?= $item->details->lyrics->url ?>" target="_blank">
                                    tekstowo.pl
                                </a>
                            <?php endif; ?>
                        </div>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
    <script>

        const EditFormTemplate = `
            <div class="radio-favorite-edit-form">
                <label class="radio-favorite-edit-label">YouTube:</label>
                <input id="radio-favorite-edit-youtube">
            </div>
        `;

        $(".radio-favorite-edit").click(function (e) {
            let favoriteItem = $(e.target).closest(".radio-favorite-list-item");

            let editForm = $.parseHTML(EditFormTemplate);
            favoriteItem.append(editForm);
        });
    </script>
</div>