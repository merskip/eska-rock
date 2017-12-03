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
                <li class="radio-favorite-item">
                    <?php if (isset($item->details->album)): ?>
                        <img src="<?= $item->details->album->image ?>" class="radio-favorite-album-image">
                    <?php endif; ?>
                    <span class="radio-favorite-song-title">
                        <?= $item->details
                            ? $item->details->artist . " - " . $item->details->title
                            : $item->songTitle ?>
                    </span>
                    <?php if (isset($item->details->album)): ?>
                        <span class="radio-favorite-album"><?= $item->details->album->title ?></span>
                    <?php endif; ?>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
</div>