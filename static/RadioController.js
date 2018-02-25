
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
            console.debug("Radio was failed start");

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
    }

    didSelectPlay() {
        this.radio.play();
    }

    didSelectStop() {
        this.radio.stop();
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
