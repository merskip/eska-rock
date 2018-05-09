
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

            this.ui.setToggleButtonIsLoading(true);
            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Stop);
        });

        this.radio.onPlay(() => {
            console.debug("Radio was started streaming");

            this.ui.setToggleButtonIsLoading(false);
            this.ui.setPanelState(RadioUI.PanelState.Extended);
            this.ui.setVolume(this.radio.muted(), this.radio.volume());
        });

        this.radio.onTimeUpdate((time) => {
            this.ui.setPlayTime(time);
        });

        let setStateForPlayRadio = () => {

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
                this.requestInvalidAndGetRadioUrl((newUrl) => {

                    this.radio.playWithStreamUrl(newUrl);

                }, () => {
                    setStateForPlayRadio();
                })
            }
            else {
                setStateForPlayRadio();
            }
        });

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

    requestInvalidAndGetRadioUrl(onSuccess, onFailed) {
        $.ajax({
            method: "POST",
            url: "api/invalid_stream_url",
            success: (response) =>  {
                let newUrl = response["new_url"];
                onSuccess(newUrl);
            },
            error: () => {
                onFailed();
            }
        });
    }
}
