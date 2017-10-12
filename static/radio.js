$(function () {

    let radio = new Radio(streamUrl);
    $("#radio-toggle-play").click(function() {
        if (radio.isPlaying()) {
            radio.stop();
        }
        else {
            radio.play();
            $(this).addClass("radio-stream-loading");
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

            if ("songDetails" in info && "album" in info["songDetails"]) {
                $("#radio-album").text(info["songDetails"]["album"]["title"]);
                $("#radio-album-image")
                    .removeClass("no-album-image")
                    .attr("src", info["songDetails"]["album"]["image"]);
            }
            else {
                $("#radio-album").text("-");
                $("#radio-album-image")
                    .addClass("no-album-image").attr("src", "");
            }

            if ("songDetails" in info && "duration" in info["songDetails"]) {
                $("#radio-song-duration").text(formatDuration(info["songDetails"]["duration"]));
            }
            else {
                $("#radio-song-duration").text("-");
            }

            if ("songDetails" in info) {
                let tags = $("#radio-song-tags").html('');
                info["songDetails"]["tags"].forEach(function (tag) {
                    tags.append($("<div></div>")
                        .addClass("radio-tag")
                        .text(tag))
                });
            }
            else {
                $("#radio-song-tags").html('');
            }
       });
    }
});

class Radio {

    constructor(streamUrl) {
        this.stream = document.getElementById('radio-stream');
        this.url = streamUrl;
    }

    play() {
        this.stream.src = this.url;
        this.stream.load();
        this.stream.play().catch(function(e) {
            // Nothing
        });
    }

    stop() {
        this.stream.pause();
        this.stream.currentTime = 0;
        this.stream.src = '';
        this.stream.onpause(); // bug?
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