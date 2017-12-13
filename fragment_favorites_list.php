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
<div id="favorite-list-fragment" class="radio-modal">
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
                    <div class="row-item-fit radio-favorite-album-image-wrapper">
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
                                   href="<?= YouTubeHelpers::getShortedVideoUrl($item->details->youtube->videoId) ?>"
                                   data-youtube-link>
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
        //# sourceURL=<?= __FILE__ ?>.js

        $(function () {
            const EditFormTemplate = `
                <div class="radio-favorite-edit-form">
                    <label for="radio-favorite-edit-youtube" class="radio-favorite-edit-label">YouTube:</label>
                    <div id="radio-favorite-edit-youtube" class="radio-edit-value"
                        contenteditable spellcheck="false" data-placeholder="https://youtu.be/HereVideoId"></div>

                    <label for="radio-favorite-edit-album-image" class="radio-favorite-edit-label">Zdjęcie albumu:</label>
                    <div id="radio-favorite-edit-album-image" class="radio-edit-value"
                        contenteditable spellcheck="false" data-placeholder="https://hosting.example/path_to_image.jpg"></div>

                    <div class="row radio-favorite-edit-actions-row">
                        <div class="row-item"></div>
                        <button class="radio-btn radio-btn-secondary" data-edit-form-action="dismiss">Anuluj</button>
                        <button class="radio-btn radio-btn-primary" data-edit-form-action="submit">Zapisz</button>
                    </div>
                </div>`;
            const videoIdLength = 11;

            let favoriteEditForm;

            $(".radio-favorite-edit").click(function (e) {
                if (favoriteEditForm !== undefined) {
                    $(favoriteEditForm).remove();
                    favoriteEditForm = undefined;
                }

                let favoriteItem = $(e.target).closest(".radio-favorite-list-item");
                let editForm = $.parseHTML(EditFormTemplate);
                favoriteEditForm = editForm;

                let youtubeLink = favoriteItem.find("a[data-youtube-link]").attr("href");
                if (youtubeLink !== undefined) {
                    $(editForm).find("#radio-favorite-edit-youtube").text(youtubeLink);
                }

                let albumImageUrl = favoriteItem.find("img.radio-favorite-album-image").attr("src");
                if (albumImageUrl !== undefined) {
                    $(editForm).find("#radio-favorite-edit-album-image").text(albumImageUrl);
                }

                favoriteItem.append(editForm);

                let ytLinkElement = $(editForm).find("#radio-favorite-edit-youtube");
                formatYoutubeLink(ytLinkElement);

                ytLinkElement.on("focus", function () {
                    clearFormatYoutubeLink($(this));
                }).on("focusout", function () {
                    formatYoutubeLink($(this));
                });

                $(editForm).find(".radio-edit-value").on("focus", function () {
                    let id = $(this).attr("id");
                    $(this).parent().find(".radio-favorite-edit-label[for=" + id + "]").addClass("radio-favorite-edit-label-highlight");
                }).on("focusout", function () {
                    $(this).parent().find(".radio-favorite-edit-label").removeClass("radio-favorite-edit-label-highlight");
                });

                $(editForm).find("[data-edit-form-action=dismiss]").click(function () {
                    $(this).closest(".radio-favorite-edit-form").remove();
                    favoriteEditForm = undefined;
                });


                $(editForm).find("[data-edit-form-action=submit]").click(function () {
                    let listItem = $(this).closest(".radio-favorite-list-item");
                    let favoriteId = listItem.attr("data-favorite-id");

                    let youtubeUrl = listItem.find("#radio-favorite-edit-youtube").text();
                    let videoIdRange = findRangeOfVideoId(youtubeUrl);
                    let videoId = youtubeUrl.substringRange(videoIdRange);

                    let albumImageUrl = listItem.find("#radio-favorite-edit-album-image").text();

                    $.ajax({
                        type: "PUT",
                        url: "api/favorites",
                        data: {
                            _id: favoriteId,
                            details: {
                                album: { image: albumImageUrl },
                                youtube: { videoId: videoId }
                            }
                        },
                        success: () => {
                            loadFragment("fragments/favorites_list", (content) => {
                                $("#favorite-list-fragment").remove();
                                callbackAppendToBody(content);
                            });
                        }
                    });
                });
            });

            function clearFormatYoutubeLink(element) {
                element.text(element.text());
            }

            function formatYoutubeLink(element) {
                let text = element.text();
                let videoIdRange = findRangeOfVideoId(text);
                if (videoIdRange !== null) {
                    let videoId = text.substringRange(videoIdRange);
                    element.html(text.replaceRange(videoIdRange, wrapperVideoIdForHighlight(videoId)));
                }
                else if (text.length === videoIdLength && text.indexOf("://") === -1) {
                    element.html(generateShortYouTubeUrl(text, true));
                }
            }

            function findRangeOfVideoId(url) {
                let urlSchemas = [
                    {urlPrefix: "https://youtu.be/", prefix: "/", suffix: "?"},
                    {urlPrefix: "http://youtu.be/", prefix: "/", suffix: "?"},
                    {urlPrefix: "https://www.youtube.com/watch", prefix: "v=", suffix: "&"},
                    {urlPrefix: "http://www.youtube.com/watch", prefix: "v=", suffix: "&"}
                ];

                let resultRange = null;
                $.each(urlSchemas, function (index, schema) {
                    if (url.startsWith(schema.urlPrefix)) {
                        let range = url.findSubstringRange(schema.prefix, schema.suffix, schema.urlPrefix.length - 1);
                        if (range.length === videoIdLength) {
                            resultRange = range;
                        }
                        return false; // break loop
                    }
                });
                return resultRange;
            }

            function generateShortYouTubeUrl(videoId, highlight) {
                let videoIdPath = highlight ? wrapperVideoIdForHighlight(videoId) : videoId;
                return "https://youtu.be/" + videoIdPath;
            }

            function wrapperVideoIdForHighlight(videoId) {
                return `<span class="radio-edit-value-highlight">` + videoId + `</span>`;
            }

        });

    </script>
</div>