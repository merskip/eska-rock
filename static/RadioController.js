
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
            this.ui.setToggleButtonIsLoading(true);
            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Stop);
        });

        this.radio.onPlay(() => {
            this.ui.setToggleButtonIsLoading(false);
            this.ui.setPanelState(RadioUI.PanelState.Extended);
        });

        this.radio.onTimeUpdate((time) => {
            this.ui.setPlayTime(time);
        });

        this.radio.onStop(() => {
            this.ui.setToggleButtonState(RadioUI.ToggleButtonState.Play);
            this.ui.setPanelState(RadioUI.PanelState.Collapsed);
        });

    }

    didSelectPlay() {
        this.radio.play();
    }

    didSelectStop() {
        this.radio.stop();
    }
}