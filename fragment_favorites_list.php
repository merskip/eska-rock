<?php
require_once "src/OAuth2.php";
require_once "src/Favorites.php";
require_once "src/utils.php";
require_once "src/LastFM.php";

$oauth2 = OAuth2::getInstance();
$oauth2->isSignIn() or die("You must be sign in");
$favorites = new Favorites(Database::getInstance(), $oauth2->getUser());
?>
<div class="radio-modal">
    <div class="radio-modal-content">
        <button class="radio-modal-close"></button>
        <h2 class="radio-modal-title">Favorites</h2>
        <ul class="radio-favorites-list">
            <?php foreach ($favorites->findAllFavoritesSongs() as $item): ?>
                <li class="radio-favorite-list-item row">
                    <div>
                        <?php if (isset($item->details->album)): ?>
                            <img src="<?= $item->details->album->image ?>" class="radio-favorite-album-image">
                        <?php else: ?>
                            <div class="radio-favorite-no-album-image">
                                <i class="material-icons">album</i>
                            </div>
                        <?php endif; ?>
                    </div>
                    <div>
                        <span class="radio-favorite-song-title">
                            <?= $item->details
                                ? $item->details->artist . " - " . $item->details->title
                                : $item->songTitle ?>
                        </span>
                        <span class="radio-favorite-album">
                            <?= $item->details->album->title ?? "Bez albumu" ?>
                        </span>
                        <div class="radio-favorite-links">
                            <?php if (isset($item->details->youtube->videoId)): ?>
                                <a class="radio-url" target="_blank"
                                   href="https://www.youtube.com/watch?v=<?= $item->details->youtube->videoId ?>">
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
</div>