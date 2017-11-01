$(function () {

    let radio = new Radio(streamUrl);
    $("#radio-toggle-play").click(function() {
        if (radio.isPlaying()) {
            radio.stop();
        }
        else {
            radio.playIfAvailable();
            $(this).addClass("radio-stream-loading");

            $("#radio-toggle-play").removeClass("radio-play-btn").addClass("radio-stop-btn");
            $(".radio-panel").removeClass("radio-panel-collapsed").addClass("radio-panel-extended");
        }
    });

    radio.stream.onplay = function() {
        $("#radio-toggle-play").removeClass("radio-play-btn").addClass("radio-stop-btn");
        $(".radio-panel").removeClass("radio-panel-collapsed").addClass("radio-panel-extended");
        startRefreshSongInfo();
    };
    radio.stream.onpause = function() {
        $("#radio-toggle-play")
            .removeClass("radio-stop-btn")
            .removeClass("radio-stream-loading")
            .addClass("radio-play-btn");
        $(".radio-panel").removeClass("radio-panel-extended").addClass("radio-panel-collapsed");
        $(".radio-panel-lyrics").addClass("collapsed");
        stopRefreshSongInfo();
    };
    radio.stream.ontimeupdate = function() {
        $("#radio-time").text(formatCountdown(radio.stream.currentTime))
            .removeClass("radio-placeholder");
        $("#radio-time-title").removeClass("radio-placeholder");
        if (radio.stream.currentTime !== 0) {
            $("#radio-toggle-play").removeClass("radio-stream-loading");
        }
    };

    $("#radio-lyrics-show").click(function () {
       let lyricsContent = $(".radio-panel-lyrics");
       if (lyricsContent.hasClass("collapsed")) {
           lyricsContent.removeClass("collapsed");
       }
       else {
           lyricsContent.addClass("collapsed");
       }
    });

    let refreshingDuration = 1000 * 15; // in millis
    let refreshingSongInfoId = null;
    let timer = $("#radio-refreshing-countdown-timer");

    function startRefreshSongInfo() {
        timer.addClass("radio-pie-indeterminate");
        refreshStats(function () {
            timer.removeClass("radio-pie-indeterminate");

            $(".radio-placeholder").removeClass("radio-placeholder");
            $(".radio-pie-placeholder").removeClass("radio-pie-placeholder");

            refreshingSongInfoId = startTimer(refreshingDuration, 360 * 0.2, function (progress) {
                setRadioRefreshTimerProgress(progress);
            }, function () {
                startRefreshSongInfo();
            });
        });
    }

    function stopRefreshSongInfo() {
        clearInterval(refreshingSongInfoId);
        setRadioRefreshTimerProgress(0.0);
    }

    function setRadioRefreshTimerProgress(progress) {
        timer.find(".radio-pie-spinner").css("transform", "rotate(" + (progress * 360) + "deg)");
        timer.find(".radio-pie-filler").css("opacity", progress < 0.5 ? 0 : 1);
        timer.find(".radio-pie-mask").css("opacity", progress >= 0.5 ? 0 : 1);
    }

    function startTimer(duration, tickCount, onTick, onFinish) {
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
    }
 
    function refreshStats(onCompletion) {
        $.get("api/song_info", function(info) {
            console.debug(info);

            let fullSongTitle = "songDetails" in info
                ? info["songDetails"]["artist"] + " - " + info["songDetails"]["title"]
                : info["rawSongTitle"];

            document.title = fullSongTitle;

            $("#favorites-add-song-title").val(info["rawSongTitle"]);
            $("#radio-song-title").text(fullSongTitle);
            $("#radio-listeners").text(info["listeners"]);

            if ("album" in info) {
                $("#radio-album").text(info["album"]["title"]);

                if ("image" in info["album"]) {
                    $("#radio-album-image")
                        .removeClass("no-album-image")
                        .attr("src", info["album"]["image"]);
                }
                else {
                    $("#radio-album-image").addClass("no-album-image").attr("src", "");
                }
            }
            else {
                $("#radio-album").text("-");
                $("#radio-album-image").addClass("no-album-image").attr("src", "");
            }

            if ("songDetails" in info && "duration" in info["songDetails"]) {
                $("#radio-song-duration").text(formatDuration(info["songDetails"]["duration"]));
            }
            else {
                $("#radio-song-duration").text("-");
            }

            if ("tags" in info) {
                let tags = $("#radio-song-tags").html('');
                info["tags"].forEach(function (tag) {
                    tags.append($("<div></div>")
                        .addClass("radio-tag")
                        .text(tag))
                });
            }
            else {
                $("#radio-song-tags").html('');
            }

            if ("lyrics" in info) {
                $("#radio-lyrics-url")
                    .removeClass("no-url")
                    .attr("href", info["lyrics"]["url"]);
                $("#radio-lyrics-show").removeClass("no-url");
                $("#radio-lyrics-original").html(info["lyrics"]["original"].split("\n").join("<br />"));
                $("#radio-lyrics-translation").html(info["lyrics"]["translation"].split("\n").join("<br />"));
            }
            else {
                $("#radio-lyrics-url").addClass("no-url").attr("href", "");
                $("#radio-lyrics-show").addClass("no-url");
                $(".radio-panel-lyrics").addClass("collapsed");
                $("#radio-lyrics-original").html("");
                $("#radio-lyrics-translation").html("");
            }

            if ("youtube" in info) {
                $("#radio-youtube-url")
                    .removeClass("no-url")
                    .attr("href", "https://www.youtube.com/watch?v=" + info["youtube"]["videoId"]);
            }
            else {
                $("#radio-youtube-url").addClass("no-url").attr("href", "");
            }
        }).always(function () {
            onCompletion();
        });
    }
});

class Radio {

    constructor(streamUrl) {
        this.stream = document.getElementById('radio-stream');
        this.url = streamUrl;
    }

    playIfAvailable() {
        let self = this;
        this.checkHttpIsOk(this.url, function () {
            self.play();
        }, function () {

        });
    }

    play() {
        this.stream.muted = true;
        this.stream.src = this.url;
        this.stream.load();
        this.stream.play().catch(function (e) {
            // Nothing
        });
    }

    stop() {
        this.stream.pause();
        this.stream.currentTime = 0;
        this.stream.src = '';
        this.stream.onpause(); // bug?
    }

    checkHttpIsOk(url, onSuccess, onFailed) {
        let req = new XMLHttpRequest();

        req.onreadystatechange = function () {
            if (req.readyState === 2) {
                let isOk = req.status === 200;
                req.abort();
                isOk ? onSuccess() : onFailed();
            }
        };

        req.open('GET', url, true);
        req.send(null);
    }

    isPlaying() {
        return !this.stream.paused;
    }
}

function _pad(n) {
    return (n < 10 ? "0" + n : n);
}


function formatCountdown(secs) {
    let h = Math.floor(secs / 3600);
    let m = Math.floor(secs / 60) - (h * 60);
    let s = Math.floor(secs - h * 3600 - m * 60);
    return _pad(h) + ":" + _pad(m) + ":" + _pad(s);
 }

function formatDuration(secs) {
    let m = Math.floor(secs / 60);
    let s = Math.floor(secs - m * 60);
    return m + ":" + _pad(s);
}