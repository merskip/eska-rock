
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

            this.refreshTimer = this.createTimerForRefreshingCurrentSong();
            this.refreshTimer.startLoop();
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

    didSelectPlay() {
        this.radio.play();
    }

    didSelectStop() {
        this.radio.stop();
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

                    this.ui.dismissPlaceholdersIfNeeded();
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

class Timer {

    constructor(duration, tickCount) {
        this.duration = duration;
        this.tickCount = tickCount;

        this.tickCallback = (progress) => {};
        this.beforeActionCallback = () => {};
        this.asyncActionCallback = (onCompletion) => {};
    }

    startLoop() {
        let executeAction = () => {
            this.beforeActionCallback();
            this.asyncActionCallback(() => {

                this._startOne(() => {
                    executeAction();
                });
            });
        };
        executeAction();
    }

    _startOne(onFinishCallback) {
        let deadline = Date.now() + this.duration;
        this.timerId = setInterval(() => {

            let remainingTime = deadline - Date.now();
            let progress = (this.duration - remainingTime) / this.duration;
            progress = Math.max(Math.min(progress, 1.0), 0.0);
            this.tickCallback(progress);

            if (remainingTime <= 0) {
                onFinishCallback();
                clearInterval(this.timerId);
            }
        }, this.duration / this.tickCount);
    }

    invalidate() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
}

Timer.prototype.onTick = function(callback) {
    this.tickCallback = callback;
    return this;
};
Timer.prototype.onBeforeAction = function(callback) {
    this.beforeActionCallback = callback;
    return this;
};
Timer.prototype.setAsyncAction = function(callback) {
    this.asyncActionCallback = callback;
    return this;
};