
class RadioController {

    constructor(radioCode, radioUI, options) {
        this.radio = radioCode;
        this.ui = radioUI;
        this.options = $.extend({
            refreshCurrentSong: {
                duration: 1000 * 2,
                tickCount: 360 * 0.2
            }
        }, options);

        this._setupRadioUIEvents();
        this._setupRadioCodeEvents();
    }

    _setupRadioUIEvents() {
        this.ui.didSelectPlay = this.didSelectPlay.bind(this);
        this.ui.didSelectStop = this.didSelectStop.bind(this);
    }

    _setupRadioCodeEvents() {
        this.radio.onStartBuffering(() => {
            console.debug("Radio was started buffering");

            this.ui.setToggleButtonIsLoading(true);
            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Stop);

            this.ui.restorePreviousDismissedPlaceholders();

            this.refreshTimer = this.startRefreshingCurrentSongDetailsInLoop();
            this._setupRefreshTimer();
        });

        this.radio.onPlay(() => {
            console.debug("Radio was started streaming");

            this.ui.setToggleButtonIsLoading(false);
            this.ui.setPanelState(RadioUI.PanelState.Extended);
        });

        this.radio.onTimeUpdate((time) => {
            this.ui.setPlayTime(time);
        });

        this.radio.onStop(() => {
            console.debug("Radio was stopped");

            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Play);
            this.ui.setPanelState(RadioUI.PanelState.Collapsed);

            if (this.refreshTimer !== undefined) {
                this.refreshTimer.invalidate();
            }
        });
    }

    _setupRefreshTimer() {
        this.refreshTimer.onBeginRequest(() => {
            this.ui.setRefreshProgressIndicator(RadioUI.InterminateTime);
        });
        this.refreshTimer.onReceivedDetails((data) => {
            this.ui.setRefreshProgressIndicator(0.0);

            let songDetails = data["songDetails"];
            let songTitle = songDetails !== undefined
                ? songDetails["artist"] + " - " + songDetails["title"]
                : data["rawSongTitle"];

            this.ui.setSongDetails({
                songTitle: songTitle,
                albumTitle: data["album"] ? data["album"]["title"] : null,
                albumImage: data["album"] ? data["album"]["image"] : null,
                songDuration: data["songDetails"] ? data["songDetails"]["duration"] : null,
                listeners: data["listeners"]
            });
            this.ui.dismissPlaceholdersIfNeeded();
        });
        this.refreshTimer.onTick((progress) => {
            this.ui.setRefreshProgressIndicator(progress);
        });
    }

    didSelectPlay() {
        this.radio.play();
    }

    didSelectStop() {
        this.radio.stop();
    }

    startRefreshingCurrentSongDetailsInLoop() {
        let timerId = null,
            beginRequestCallback = () => {},
            receivedDetailsCallback = (details) => {},
            tickCallback = (progress) => {};

        let executeRequest = () => {
            beginRequestCallback();
            this.requestCurrentSongDetails((data) => {
                receivedDetailsCallback(data);
            }, () => {
                let duration = this.options.refreshCurrentSong.duration;
                let tickCount = this.options.refreshCurrentSong.tickCount;
                timerId = this._startTimer(duration, tickCount, (progress) => {
                    tickCallback(progress);
                }, () => {
                    executeRequest();
                });
            });
        };
        executeRequest();

        return {
            onBeginRequest: (callback) => {
                beginRequestCallback = callback;
            },
            onReceivedDetails: (callback) => {
                receivedDetailsCallback = callback;
            },
            onTick: (callback) => {
                tickCallback = callback;
            },
            invalidate: () => {
                clearInterval(timerId);
            }
        };
    }

    requestCurrentSongDetails(onSuccess, onCompletion) {
        $.get("api/song_info", function (details) {
            console.debug(details);
            onSuccess(details);
        }).always(function () {
            onCompletion();
        });
    }
//             console.debug(info);
//
//             let fullSongTitle = "songDetails" in info
//                 ? info["songDetails"]["artist"] + " - " + info["songDetails"]["title"]
//                 : info["rawSongTitle"];
//
//             document.title = fullSongTitle;
//
//             let favoriteControl = $("#favorite-control");
//             favoriteControl.attr("data-song-title", info["rawSongTitle"]);
//             if ("favoriteId" in info) {
//                 if (info["favoriteId"] !== null) {
//                     favoriteControl
//                         .removeClass("favorite-add")
//                         .attr("data-song-title", null)
//                         .attr("data-favorite-id", info["favoriteId"])
//                         .addClass("favorite-remove")
//                         .attr("title", favoriteControl.attr("data-title-remove"));
//                 }
//                 else {
//                     favoriteControl
//                         .removeClass("favorite-remove")
//                         .attr("data-song-title", info["rawSongTitle"])
//                         .attr("data-favorite-id", null)
//                         .addClass("favorite-add")
//                         .attr("title", favoriteControl.attr("data-title-add"));
//                 }
//             }
//
//             $("#radio-song-title").text(fullSongTitle);
//             $("#radio-listeners").text(info["listeners"]);
//
//             if ("album" in info) {
//                 $("#radio-album").text(info["album"]["title"]);
//
//                 if ("image" in info["album"]) {
//                     $("#radio-album-image")
//                         .removeClass("no-album-image")
//                         .attr("src", info["album"]["image"]);
//                 }
//                 else {
//                     $("#radio-album-image").addClass("no-album-image").attr("src", "");
//                 }
//             }
//             else {
//                 $("#radio-album").text("-");
//                 $("#radio-album-image").addClass("no-album-image").attr("src", "");
//             }
//
//             if ("songDetails" in info && "duration" in info["songDetails"]) {
//                 $("#radio-song-duration").text(formatDuration(info["songDetails"]["duration"]));
//             }
//             else {
//                 $("#radio-song-duration").text("-");
//             }
//
//             if ("tags" in info) {
//                 let tags = $("#radio-song-tags").html('');
//                 info["tags"].forEach(function (tag) {
//                     tags.append($("<div></div>")
//                         .addClass("radio-tag")
//                         .text(tag))
//                 });
//             }
//             else {
//                 $("#radio-song-tags").html('');
//             }
//
//             if ("lyrics" in info) {
//                 $("#radio-lyrics-url")
//                     .removeClass("no-url")
//                     .attr("href", info["lyrics"]["url"]);
//                 $("#radio-lyrics-show").removeClass("no-url");
//                 $("#radio-lyrics-original").html(info["lyrics"]["original"].split("\n").join("<br />"));
//                 $("#radio-lyrics-translation").html(info["lyrics"]["translation"].split("\n").join("<br />"));
//             }
//             else {
//                 $("#radio-lyrics-url").addClass("no-url").attr("href", "");
//                 $("#radio-lyrics-show").addClass("no-url");
//                 $(".radio-panel-lyrics").addClass("collapsed");
//                 $("#radio-lyrics-original").html("");
//                 $("#radio-lyrics-translation").html("");
//             }
//
//             if ("youtube" in info) {
//                 $("#radio-youtube-url")
//                     .removeClass("no-url")
//                     .attr("href", "https://www.youtube.com/watch?v=" + info["youtube"]["videoId"]);
//             }
//             else {
//                 $("#radio-youtube-url").addClass("no-url").attr("href", "");
//             }
//         }).always(function () {
//             onCompletion();
//         });
}

RadioController.prototype._startTimer = function(duration, tickCount, onTick, onFinish) {
    let deadline = Date.now() + duration;
    let timerId = setInterval(function () {

        let remainingTime = deadline - Date.now();
        let progress = (duration - remainingTime) / duration;
        progress = Math.max(Math.min(progress, 1.0), 0.0);
        onTick(progress);

        if (remainingTime <= 0) {
            onFinish();
            clearInterval(timerId);
        }
    }, duration / tickCount);
    return timerId;
};
