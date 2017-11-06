
class RadioUI {

    static get ToggleButtonState() {
        return {
            Play: 0,
            Stop: 1
        };
    }

    static get PanelState() {
        return {
            Collapsed: 0,
            Extended: 1
        };
    }

    static get IndeterminateTime() {
        return Infinity;
    }

    constructor() {
        this.panel = $("#radio-panel");
        this.togglePlayBtn = $("#radio-toggle-play");
        this.playingTimer = $("#radio-timer");
        this.refreshProgressIndicator = $("#radio-refreshing-countdown-timer");
        this.detailsItems = {
            songTitle: $("#radio-song-title"),
            albumTitle: $("#radio-album-title"),
            albumImage: {
                target: $("#radio-album-image"),
                setValue: function(value) {
                    this.removeClass("no-album-image").attr("src", value);
                },
                setEmpty: function () {
                    this.addClass("no-album-image").attr("src", null);
                }
            },
            songDuration: {
                target: $("#radio-song-duration"),
                setValue: function(value) {
                    this.text(RadioUI._formatDuration(value));
                }
            },
            listeners: $("#radio-listeners")
        };
        this.tags = $("#radio-song-tags");

        this._setupToggleButton();
    }

    _setupToggleButton() {
        this.togglePlayBtn.click(() => {
            if (this.togglePlayBtn.hasClass("radio-play-btn")) {
                this.didSelectPlay();
            }
            else if (this.togglePlayBtn.hasClass("radio-stop-btn")) {
                this.didSelectStop();
            }
        });
    }

    setToggleButtonState(state) {
        if (state === RadioUI.ToggleButtonState.Play) {
            this.togglePlayBtn.removeClass("radio-stop-btn").addClass("radio-play-btn");
        }
        else if (state === RadioUI.ToggleButtonState.Stop) {
            this.togglePlayBtn.removeClass("radio-play-btn").addClass("radio-stop-btn");
        }
        else {
            console.error("Expected value kind of RadioUI.ToggleButtonState");
        }
    }

    setToggleButtonIsLoading(isLoading) {
        isLoading
            ? this.togglePlayBtn.addClass("radio-stream-loading")
            : this.togglePlayBtn.removeClass("radio-stream-loading");
    }

    setPanelState(state) {
        if (state === RadioUI.PanelState.Collapsed) {
            this.panel.removeClass("radio-panel-extended").addClass("radio-panel-collapsed");
        }
        else if (state === RadioUI.PanelState.Extended) {
            this.panel.removeClass("radio-panel-collapsed").addClass("radio-panel-extended");
        }
        else {
            console.error("Expected value kind of RadioUI.PanelState");
        }
    }

    dismissPlaceholdersIfNeeded() {
        if (this.dismissedPlaceholders !== undefined) {
            return;
        }

        let placeholders = this.panel.find(".radio-placeholder");
        if (placeholders.length > 0) {
            placeholders.removeClass("radio-placeholder");
            this.dismissedPlaceholders = placeholders;
        }
    }

    restorePreviousDismissedPlaceholders() {
        if (this.dismissedPlaceholders !== undefined) {
            this.dismissedPlaceholders.addClass("radio-placeholder");
            delete this.dismissedPlaceholders;
        }
    }

    setSongDetails(details) {
        $.each(details, (key, value) => {
            if (key in this.detailsItems) {
                let item = this.detailsItems[key];
                let target = (item instanceof jQuery ? item : item.target);
                let valueIsNull = (value === undefined || value === null);

                if (item.setValue !== undefined && !valueIsNull) {
                    item.setValue.bind(target)(value);
                }
                else if (item.setEmpty !== undefined && valueIsNull) {
                    item.setEmpty.bind(target)();
                }
                else {
                    target.text(!valueIsNull ? value : "-");
                }
            }
        });
    }

    setPlayTime(time) {
        this.playingTimer.text(RadioUI._formatTimer(time));
        this.playingTimer.closest(".row-item").find(".radio-placeholder").removeClass("radio-placeholder");
    }

    setRefreshProgressIndicator(progress) {
        let indicator = this.refreshProgressIndicator;

        if (progress === RadioUI.IndeterminateTime) {
            indicator.addClass("radio-pie-indeterminate");
            progress = 0.0;
        }
        else {
            indicator.removeClass("radio-pie-indeterminate");
        }

        indicator.find(".radio-pie-spinner").css("transform", "rotate(" + (progress * 360) + "deg)");
        indicator.find(".radio-pie-filler").css("opacity", progress < 0.5 ? 0 : 1);
        indicator.find(".radio-pie-mask").css("opacity", progress >= 0.5 ? 0 : 1);
    }

    setSongTags(tags) {
        this.tags.html('');
        tags.forEach((tag) => {
            $("<div></div>")
                .addClass("radio-tag")
                .text(tag)
                .appendTo(this.tags);
        });
    }

    static _formatTimer(secs) {
        let h = Math.floor(secs / 3600);
        let m = Math.floor(secs / 60) - (h * 60);
        let s = Math.floor(secs - h * 3600 - m * 60);
        return RadioUI._pad(h) + ":" + RadioUI._pad(m) + ":" + RadioUI._pad(s);
    }

    static _formatDuration(secs) {
        let m = Math.floor(secs / 60);
        let s = Math.floor(secs - m * 60);
        return m + ":" + RadioUI._pad(s);
    }

    static _pad(n) {
        return (n < 10 ? "0" + n : n);
    }
}

// Events

RadioUI.prototype.didSelectPlay = () => { };
RadioUI.prototype.didSelectStop = () => { };
