
class RadioUI {

    static get ToggleButtonState() {
        return {
            Play: 0,
            Stop: 1
        };
    }

    static get PanelState() {
        return {
            Collapsed: 0,
            Extended: 1
        };
    }

    static get InterminateTime() {
        return Infinity;
    }

    constructor() {
        this.panel = $("#radio-panel");
        this.togglePlayBtn = $("#radio-toggle-play");
        this.playingTimer = $("#radio-timer");
        this.refreshProgressIndicator = $("#radio-refreshing-countdown-timer");
        this.detailsItems = {
            songTitle: $("#radio-song-title"),
            albumTitle: $("#radio-album-title"),
            albumImage: {
                target: $("#radio-album-image"),
                setValue: function(value) {
                    this.removeClass("no-album-image").attr("src", value);
                },
                setEmpty: function () {
                    this.addClass("no-album-image").attr("src", null);
                }
            },
            songDuration: {
                target: $("#radio-song-duration"),
                setValue: function(value) {
                    this.text(RadioUI._formatDuration(value));
                }
            },
            listeners: $("#radio-listeners")
        };
        this._setupToggleButton();
    }

    _setupToggleButton() {
        this.togglePlayBtn.click(() => {
            if (this.togglePlayBtn.hasClass("radio-play-btn")) {
                this.didSelectPlay();
            }
            else if (this.togglePlayBtn.hasClass("radio-stop-btn")) {
                this.didSelectStop();
            }
        });
    }

    setToggleButtonState(state) {
        if (state === RadioUI.ToggleButtonState.Play) {
            this.togglePlayBtn.removeClass("radio-stop-btn").addClass("radio-play-btn");
        }
        else if (state === RadioUI.ToggleButtonState.Stop) {
            this.togglePlayBtn.removeClass("radio-play-btn").addClass("radio-stop-btn");
        }
        else {
            console.error("Expected value kind of RadioUI.ToggleButtonState");
        }
    }

    setToggleButtonIsLoading(isLoading) {
        isLoading
            ? this.togglePlayBtn.addClass("radio-stream-loading")
            : this.togglePlayBtn.removeClass("radio-stream-loading");
    }

    setPanelState(state) {
        if (state === RadioUI.PanelState.Collapsed) {
            this.panel.removeClass("radio-panel-extended").addClass("radio-panel-collapsed");
        }
        else if (state === RadioUI.PanelState.Extended) {
            this.panel.removeClass("radio-panel-collapsed").addClass("radio-panel-extended");
        }
        else {
            console.error("Expected value kind of RadioUI.PanelState");
        }
    }

    dismissPlaceholdersIfNeeded() {
        if (this.dismissedPlaceholders !== undefined) {
            return;
        }

        let placeholders = this.panel.find(".radio-placeholder");
        if (placeholders.length > 0) {
            placeholders.removeClass("radio-placeholder");
            this.dismissedPlaceholders = placeholders;
        }
    }

    restorePreviousDismissedPlaceholders() {
        if (this.dismissedPlaceholders !== undefined) {
            this.dismissedPlaceholders.addClass("radio-placeholder");
            delete this.dismissedPlaceholders;
        }
    }

    setSongDetails(details) {
        $.each(details, (key, value) => {
            if (key in this.detailsItems) {
                let item = this.detailsItems[key];
                let target = (item instanceof jQuery ? item : item.target);
                let valueIsNull = (value === undefined || value === null);

                if (item.setValue !== undefined && !valueIsNull) {
                    item.setValue.bind(target)(value);
                }
                else if (item.setEmpty !== undefined && valueIsNull) {
                    item.setEmpty.bind(target)();
                }
                else {
                    target.text(!valueIsNull ? value : "-");
                }
            }
        });
    }

    setPlayTime(time) {
        this.playingTimer.text(RadioUI._formatTimer(time));
        this.playingTimer.closest(".row-item").find(".radio-placeholder").removeClass("radio-placeholder");
    }

    setRefreshProgressIndicator(progress) {
        let indicator = this.refreshProgressIndicator;

        if (progress === RadioUI.InterminateTime) {
            indicator.addClass("radio-pie-indeterminate");
            progress = 0.0;
        }
        else {
            indicator.removeClass("radio-pie-indeterminate");
        }

        indicator.find(".radio-pie-spinner").css("transform", "rotate(" + (progress * 360) + "deg)");
        indicator.find(".radio-pie-filler").css("opacity", progress < 0.5 ? 0 : 1);
        indicator.find(".radio-pie-mask").css("opacity", progress >= 0.5 ? 0 : 1);
    }

    static _formatTimer(secs) {
        let h = Math.floor(secs / 3600);
        let m = Math.floor(secs / 60) - (h * 60);
        let s = Math.floor(secs - h * 3600 - m * 60);
        return RadioUI._pad(h) + ":" + RadioUI._pad(m) + ":" + RadioUI._pad(s);
    }

    static _formatDuration(secs) {
        let m = Math.floor(secs / 60);
        let s = Math.floor(secs - m * 60);
        return m + ":" + RadioUI._pad(s);
    }

    static _pad(n) {
        return (n < 10 ? "0" + n : n);
    }
}

// Events

RadioUI.prototype.didSelectPlay = () => { };
RadioUI.prototype.didSelectStop = () => { };

//
// $(function () {
//
//     let radio = new Radio(streamUrl);
//     $("#radio-toggle-play").click(function() {
//         if (radio.isPlaying()) {
//             radio.stop();
//         }
//         else {
//             radio.play();
//             $(this).addClass("radio-stream-loading");
//
//             $("#radio-toggle-play").removeClass("radio-play-btn").addClass("radio-stop-btn");
//             $(".radio-panel").removeClass("radio-panel-collapsed").addClass("radio-panel-extended");
//         }
//     });
//
//     radio.onStartBuffering(() => {
//         console.log("Start buffering");
//     });
//     radio.onPlay(() => {
//         console.log("Radio played");
//     });
//     radio.onFailedPlay(data => {
//         console.log("Radio failed play: " + data.message);
//     });
//     radio.onTimeUpdate(time => {
//         console.log("Time update: " + time);
//     });
//     radio.onStop(() => {
//         console.log("Radio stop");
//     });
//
//
//     /*
//     radio.stream.onplay = function() {
//         $("#radio-toggle-play").removeClass("radio-play-btn").addClass("radio-stop-btn");
//         $(".radio-panel").removeClass("radio-panel-collapsed").addClass("radio-panel-extended");
//         startRefreshSongInfo();
//     };
//     radio.stream.onpause = function() {
//         $("#radio-toggle-play")
//             .removeClass("radio-stop-btn")
//             .removeClass("radio-stream-loading")
//             .addClass("radio-play-btn");
//         $(".radio-panel").removeClass("radio-panel-extended").addClass("radio-panel-collapsed");
//         $(".radio-panel-lyrics").addClass("collapsed");
//         stopRefreshSongInfo();
//     };
//     radio.stream.ontimeupdate = function() {
//         $("#radio-time").text(formatCountdown(radio.stream.currentTime))
//             .removeClass("radio-placeholder");
//         $("#radio-time-title").removeClass("radio-placeholder");
//         if (radio.stream.currentTime !== 0) {
//             $("#radio-toggle-play").removeClass("radio-stream-loading");
//         }
//     };
//     */
//
//     $("#radio-lyrics-show").click(function () {
//        let lyricsContent = $(".radio-panel-lyrics");
//        if (lyricsContent.hasClass("collapsed")) {
//            lyricsContent.removeClass("collapsed");
//        }
//        else {
//            lyricsContent.addClass("collapsed");
//        }
//     });
//
//     let refreshingDuration = 1000 * 15; // in millis
//     let refreshingSongInfoId = null;
//     let timer = $("#radio-refreshing-countdown-timer");
//
//     function startRefreshSongInfo() {
//         timer.addClass("radio-pie-indeterminate");
//         refreshStats(function () {
//             timer.removeClass("radio-pie-indeterminate");
//
//             $(".radio-placeholder").removeClass("radio-placeholder");
//             $(".radio-pie-placeholder").removeClass("radio-pie-placeholder");
//
//             refreshingSongInfoId = startTimer(refreshingDuration, 360 * 0.2, function (progress) {
//                 setRadioRefreshTimerProgress(progress);
//             }, function () {
//                 startRefreshSongInfo();
//             });
//         });
//     }
//
//     function stopRefreshSongInfo() {
//         clearInterval(refreshingSongInfoId);
//         setRadioRefreshTimerProgress(0.0);
//     }
//
//     function setRadioRefreshTimerProgress(progress) {
//         timer.find(".radio-pie-spinner").css("transform", "rotate(" + (progress * 360) + "deg)");
//         timer.find(".radio-pie-filler").css("opacity", progress < 0.5 ? 0 : 1);
//         timer.find(".radio-pie-mask").css("opacity", progress >= 0.5 ? 0 : 1);
//     }
//
//     function startTimer(duration, tickCount, onTick, onFinish) {
//         let deadline = Date.now() + duration;
//         let timerId = setInterval(function () {
//
//             let remainingTime = deadline - Date.now();
//             let progress = (duration - remainingTime) / duration;
//             progress = Math.max(Math.min(progress, 1.0), 0.0);
//             onTick(progress);
//
//             if (remainingTime <= 0) {
//                 onFinish();
//                 clearInterval(timerId);
//             }
//         }, duration / tickCount);
//         return timerId;
//     }
//
//     function refreshStats(onCompletion) {
//         $.get("api/song_info", function(info) {
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
//     }
// });
//
//
//
