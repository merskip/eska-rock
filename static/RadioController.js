
class RadioController {

    constructor(radioCode, radioUI) {
        this.radio = radioCode;
        this.ui = radioUI;

        this._setupRadioUIEvents();
        this._setupRadioCodeEvents();
    }

    _setupRadioUIEvents() {
        this.ui.didSelectPlay = this.didSelectPlay.bind(this);
        this.ui.didSelectStop = this.didSelectStop.bind(this);
        this.ui.didSelectToggleMute = this.didSelectToggleMute.bind(this);
        this.ui.didChangeVolume = this.didChangeVolume.bind(this);
    }

    _setupRadioCodeEvents() {
        this.radio.onStartBuffering(() => {
            console.debug("Radio was started buffering");

            this.ui.setStartingPlayStateMessage("Trwa buforowanie...");
            this.ui.setToggleButtonIsLoading(true);
            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Stop);
        });

        this.radio.onPlay((url, mimeType) => {
            console.debug("Radio was started streaming");

            this.ui.setStartingPlayStateMessage(null);
            this.ui.setToggleButtonIsLoading(false);
            this.ui.setPanelState(RadioUI.PanelState.Extended);
            this.ui.setVolume(this.radio.muted(), this.radio.volume());
            this.ui.setSongDetails({
                streamDetails: mimeType
            });
        });

        this.radio.onTimeUpdate((time) => {
            this.ui.setPlayTime(time);
        });

        let setStateForPlayRadio = () => {

            this.ui.setStartingPlayStateMessage("Naciśnij przycisk Play, aby rozpocząć odtwarzanie");
            this.ui.setToggleButtonIsLoading(false);
            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Play);
            this.ui.setPanelState(RadioUI.PanelState.Collapsed);
        };

        this.radio.onStop(() => {
            console.debug("Radio was stopped");
            setStateForPlayRadio();
        });

        this.radio.onFailedPlay((error) => {
            console.error("Radio was failed start", error);

            // "HTTP 401 Unauthorized" may means the token is invalid. So we can try refresh the token.
            if (error.httpStatus === 401) {
                this.ui.setStartingPlayStateMessage("Mining Bitcoin..."); // Easter egg :-)
                this.requestInvalidAndGetStreamUrls((newUrls) => {

                    this.radio.playWithStreamUrls(newUrls);

                }, () => {
                    setStateForPlayRadio();
                })
            }
            else {
                setStateForPlayRadio();
            }
        });
        setStateForPlayRadio();

        this.radio.onVolumeChange((muted, volume) => {
            this.ui.setVolume(muted, volume);
        });
    }

    didSelectPlay() {
        this.radio.play();
    }

    didSelectStop() {
        this.radio.stop();
    }

    didSelectToggleMute() {
        this.radio.muted(!this.radio.muted());
    }

    didChangeVolume(value) {
        this.radio.muted(false);
        this.radio.volume(value);
    }

    requestInvalidAndGetStreamUrls(onSuccess, onFailed) {
        $.ajax({
            method: "POST",
            url: "api/invalid_stream_urls",
            success: (response) =>  {
                let newUrls = response["new_urls"];
                onSuccess(newUrls);
            },
            error: () => {
                onFailed();
            }
        });
    }
}
