
class SongDetailsController {

    constructor(radio, radioUI, options) {
        this.radio = radio;
        this.ui = radioUI;
        this.options = $.extend({
            refreshCurrentSong: {
                duration: 1000,
                tickCount: 360
            }
        }, options);

        this.radio.onStartBuffering(() => {
            this.ui.restorePreviousDismissedPlaceholders();

            this.refreshTimer = this.createTimerForRefreshingCurrentSong();
            this.refreshTimer.startLoop();
        });

        this.radio.onStop(() => {
            if (this.refreshTimer !== undefined) {
                this.refreshTimer.invalidate();
            }
        });

        this.onResponseSongDetails((data) => {

            this.setSongDetails(data);
            this.ui.dismissPlaceholdersIfNeeded();
        });
    }

    setSongDetails(data) {
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
        this.ui.setSongTags(data["tags"] ? data["tags"] : []);

        if (data["lyrics"]) {
            this.ui.setLyrics(data["lyrics"]["url"],
                data["lyrics"]["original"],
                data["lyrics"]["translation"]);
        }
        else {
            this.ui.setLyrics(null);
        }
        this.ui.setYoutubeLink(data["youtube"] ? data["youtube"]["videoId"] : null);
    }

    createTimerForRefreshingCurrentSong() {
        let options = this.options.refreshCurrentSong;
        return new Timer(options.duration, options.tickCount)
            .onTick((progress) => {
                this.ui.setRefreshProgressIndicator(progress);
            })
            .onBeforeAction(() => {
                this.ui.setRefreshProgressIndicator(RadioUI.IndeterminateTime);
            })
            .setAsyncAction((onCompletion) => {
                this.requestCurrentSongDetails((data) => {

                    this.ui.setRefreshProgressIndicator(0.0);
                    this.onResponseSongDetails(data);

                }, onCompletion);
            });
    }

    requestCurrentSongDetails(onSuccess, onCompletion) {
        $.get("api/song_info", function (details) {
            console.debug(details);
            onSuccess(details);
        }).always(function () {
            onCompletion();
        });
    }
}

SongDetailsController.prototype.onResponseSongDetails = function(a) {
    if (typeof a === "object") {
        $(this).trigger("on_response_song_details", a);
    }
    else if (typeof a === "function") {
        let callback = a;
        $(this).on("on_response_song_details", (event, data) => {
            callback(data);
        });
    }
    else {
        console.error("Excepted 1 parameter function or object");
    }
};
