
let _extToMimeTypeMap = {
    ".mp3": "audio/mpeg",
    ".aac": "audio/aac"
};

class Radio {

    constructor(audioTagId, streamUrls) {
        this.stream = document.getElementById(audioTagId);
        this._setUrls(streamUrls);

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
                    let mimeType = this._getMimeTypeForUrl(this.stream.currentSrc);
                    this.onPlay(this.stream.currentSrc, mimeType);
                    this.isBufferingStream = false;
                }

                this.onTimeUpdate(this.stream.currentTime);
            }
        };
        this.stream.onvolumechange = () => {
            this.onVolumeChange(this.stream.muted, this.stream.volume);
        };
    }

    playWithStreamUrls(urls) {
        this._setUrls(urls);
        this.play();
    }

    play() {
        this.isBufferingStream = true;
        this.onStartBuffering();

        this._checkHttpIsOk(this.urls[0], () => {

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
        this._setUrls(this.urls);
        this.stream.load();
        this.stream.play().catch(e => {
            this.onFailedPlay({
                message: "Exception on play: " + e.message,
                exception: e
            });
        });
    }

    _setUrls(urls) {
        this.stream.innerHTML = ''; // Remove all children
        urls.map((url) => {
            let audioElement = document.createElement("source");
            audioElement.src = url;

            let mimeType = this._getMimeTypeForUrl(url);
            if (mimeType !== undefined) {
                audioElement.setAttribute("type", mimeType);
            }
            return audioElement;
        }).forEach((audioElement) => {
            this.stream.appendChild(audioElement);
        });
        this.urls = urls;
    }

    stop() {
        this.stream.pause();
        this.stream.currentTime = 0;
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

    _getMimeTypeForUrl(url) {
        return findFirst(_extToMimeTypeMap, (extension) => {
            return url.includes(extension);
        });
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

Radio.prototype.onPlay = function(a, b) {
    if (typeof a === "string") {
        $(this).trigger("on_play", [a, b]);
    }
    else if (typeof a === "function") {
        let callback = a;
        $(this).on("on_play", (event, url, mimeType) => {
            callback(url, mimeType);
        });
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