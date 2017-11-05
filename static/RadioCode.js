class Radio {

    constructor(streamUrl) {
        this.stream = document.getElementById('radio-stream');
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
        }
    }

    play() {
        this.onStartBuffering();
        this._checkHttpIsOk(this.url, () => {
            this._startPlayStream();
        }, httpStatus => {
            this.onFailedPlay({
                message: "Initial http request ends with " + httpStatus,
                status: httpStatus
            });
        });
    }

    _startPlayStream() {
        this.isBufferingStream = true;
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
        this.stream.onpause(); // bug?
    }

    isPlaying() {
        return !this.stream.paused;
    }

    _checkHttpIsOk(url, onSuccess, onFailed) {
        let req = new XMLHttpRequest();

        req.onreadystatechange = () => {
            if (req.readyState === 2) {
                let isOk = (req.status === 200);
                req.abort();
                isOk ? onSuccess() : onFailed(req.status);
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