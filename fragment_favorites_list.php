<?php
require_once "src/OAuth2.php";
require_once "src/Favorites.php";
require_once "src/utils.php";

$oauth2 = OAuth2::getInstance();
$oauth2->isSignIn() or die("You must be sign in");
$favorites = new Favorites(Database::getInstance(), $oauth2->getUser());
?>
<div class="radio-modal">
    <div class="radio-modal-content">
        <button class="radio-modal-close"></button>
        <h2>Favorties</h2>
        <ul>
            <?php foreach ($favorites->findAllFavoritesSongs() as $item): ?>
                <li><?= $item->songTitle ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
</div>