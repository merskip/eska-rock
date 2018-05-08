
class Radio {

    constructor(audioTagId, streamUrl) {
        this.stream = document.getElementById(audioTagId);
        this.url = streamUrl;

        this._bindEvents();
    }

    _bindEvents() {
        this.stream.onpause = () => {
            this.onStop();
        };
        this.stream.ontimeupdate = () => {
            if (this.stream.currentTime !== 0) {

                // Only if currentTime is greater than zero, music is playing, buffering is done
                if (this.isBufferingStream === true) {
                    $(this).trigger("on_play");
                    this.isBufferingStream = false;
                }

                this.onTimeUpdate(this.stream.currentTime);
            }
        };
        this.stream.onvolumechange = () => {
            this.onVolumeChange(this.stream.muted, this.stream.volume);
        };
    }

    playWithStreamUrl(url) {
        this.url = url;
        this.play();
    }

    play() {
        this.isBufferingStream = true;
        this.onStartBuffering();

        this._checkHttpIsOk(this.url, () => {

            if (this.isBufferingStream) { // Is false, this means that method "stop" did called
                this._startPlayStream();
            }
        }, httpStatus => {
            this.onFailedPlay({
                message: "Initial http request ends with " + httpStatus,
                httpStatus: httpStatus
            });
        });
    }

    _startPlayStream() {
        this.stream.src = this.url;
        this.stream.load();
        this.stream.play().catch(e => {
            this.onFailedPlay({
                message: "Exception on play: " + e.message,
                exception: e
            });
        });
    }

    stop() {
        this.stream.pause();
        this.stream.currentTime = 0;
        this.stream.src = '';
        this.stream.onpause(null); // bug?
        this.isBufferingStream = false;
    }

    volume(value) {
        if (value === undefined) {
            return this.stream.volume;
        }
        else {
            this.stream.volume = value;
        }
    }

    muted(state) {
        if (state === undefined) {
            return this.stream.muted;
        }
        else {
            this.stream.muted = state;
        }
    }

    _checkHttpIsOk(url, onSuccess, onFailed) {
        let req = new XMLHttpRequest();

        req.onreadystatechange = () => {
            if (req.readyState === 2) {
                let httpStatus = req.status;
                req.abort(); // req.status after abort() is lost

                if (httpStatus === 200) {
                    onSuccess();
                }
                else {
                    onFailed(httpStatus);
                }
            }
        };

        req.open('GET', url, true);
        req.send(null);
    }
}

// Events

Radio.prototype.onStartBuffering = function(a) {
    if (a === undefined) {
        $(this).trigger("on_start_buffering");
    }
    else if (typeof a === "function") {
        $(this).on("on_start_buffering", a);
    }
    else {
        console.error("Excepted 1 parameter function or nothing");
    }
};

Radio.prototype.onPlay = function(a) {
    if (a === undefined) {
        $(this).trigger("on_play");
    }
    else if (typeof a === "function") {
        $(this).on("on_play", a);
    }
    else {
        console.error("Excepted 1 parameter function or nothing");
    }
};

Radio.prototype.onFailedPlay = function(a) {
    if (typeof a === "object") {
        $(this).trigger("on_failed_play", a);
    }
    else if (typeof a === "function") {
        let callback = a;
        $(this).on("on_failed_play", (event, data) => {
            callback(data);
        });
    }
    else {
        console.error("Excepted 1 parameter function or object");
    }
};

Radio.prototype.onTimeUpdate = function(a) {
    if (typeof a === "number") {
        $(this).trigger("on_time_update", a);
    }
    else if (typeof a === "function") {
        let callback = a;
        $(this).on("on_time_update", (event, time) => {
            callback(time);
        });
    }
    else {
        console.error("Excepted 1 parameter function or number");
    }
};

Radio.prototype.onVolumeChange = function(a, b) {
    if (typeof a === "boolean" && typeof b === "number") {
        $(this).trigger("on_volume_change", [a, b]);
    }
    else if (typeof a === "function") {
        let callback = a;
        $(this).on("on_volume_change", (event, muted, volume) => {
            callback(muted, volume);
        });
    }
    else {
        console.error("Excepted 1 parameter function or boolean with number");
    }
};

Radio.prototype.onStop = function(a) {
    if (a === undefined) {
        $(this).trigger("on_stop");
    }
    else if (typeof a === "function") {
        $(this).on("on_stop", a);
    }
    else {
        console.error("Excepted 1 parameter function or nothing");
    }
};