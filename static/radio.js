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
        stopRefreshSongInfo();
    };
    radio.stream.ontimeupdate = function() {
        $("#radio-time").text(formatCountdown(radio.stream.currentTime));
        if (radio.stream.currentTime !== 0) {
            $("#radio-toggle-play").removeClass("radio-stream-loading");
        }
    };

    let refreshingSongInfoId = null;
    function startRefreshSongInfo() {
       refreshStats();
       refreshingSongInfoId = setInterval(function() {
          refreshStats();
       }, 1000 * 15);
    }
 
    function stopRefreshSongInfo() {
        clearInterval(refreshingSongInfoId);
    }
 
    function refreshStats() {
        $.get("song_info.php", function(info) {
            console.debug(info);

            let fullSongTitle = "songDetails" in info
                ? info["songDetails"]["artist"] + " - " + info["songDetails"]["title"]
                : info["rawSongTitle"];

            document.title = fullSongTitle;
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

            if ("lyricsUrl" in info) {
                $("#radio-lyrics-url")
                    .removeClass("no-url")
                    .attr("href", info["lyricsUrl"]);
            }
            else {
                $("#radio-lyrics-url")
                    .addClass("no-url")
                    .attr("href", "");
            }

            if ("youtubeVideoId" in info) {
                $("#radio-youtube-url")
                    .removeClass("no-url")
                    .attr("href", "https://www.youtube.com/watch?v=" + info["youtubeVideoId"]);
            }
            else {
                $("#radio-youtube-url")
                    .addClass("no-url")
                    .attr("href", "");
            }


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