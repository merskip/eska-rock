<?php
require_once __DIR__ . '/src/Google.php';
require_once __DIR__ . '/src/Favorites.php';

$favorites = new Favorites(Database::getInstance(), getUserInfo());
?>
<ul>
    <?php foreach ($favorites->getFavoritesSongs() as $song): ?>
        <li><?= $song->songTitle ?></li>
    <?php endforeach; ?>
</ul>
