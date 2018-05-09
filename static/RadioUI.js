
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

    static get FavoriteButtonState() {
        return {
            Hidden: 0,
            Unavailable: 1,
            Add: 2,
            Remove: 3
        }
    }

    constructor() {
        this.panel = $("#radio-panel");
        this.togglePlayBtn = $("#radio-toggle-play");
        this.volumeIcon = $("#radio-volume-icon");
        this.volumeSlider = $("#radio-volume-slider");
        this.playingTimer = $("#radio-timer");
        this.refreshProgressIndicator = $("#radio-refreshing-countdown-timer");
        this.favoriteBtn = $("#radio-favorite");
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
        this.lyrics = {
            linkUrl: $("#radio-lyrics-url"),
            toggleBtn: $("#radio-lyrics-toggle"),
            panel: $("#radio-lyrics-panel"),
            content: {
                original: $("#radio-lyrics-original"),
                translation: $("#radio-lyrics-translation")
            }
        };
        this.youtubeUrl = $("#radio-youtube-url");

        this._setupEvents();
    }

    _setupEvents() {
        this.togglePlayBtn.click(() => {
            if (this.togglePlayBtn.hasClass("radio-play-btn")) {
                this.didSelectPlay();
            }
            else if (this.togglePlayBtn.hasClass("radio-stop-btn")) {
                this.didSelectStop();
            }
        });
        this.volumeIcon.click(() => {
            this.didSelectToggleMute();
        });
        this.volumeSlider.on("input", (e) => {
            this.didChangeVolume(e.target.value / 100);
        });
        this.favoriteBtn.click(() => {
            if (this.favoriteBtn.hasClass("btn-favorite-add")) {
                let songTitle = this.favoriteBtn.attr("data-song-title");
                if (songTitle) {
                    this.didSelectFavoriteAdd(songTitle);
                }
            }
            else if (this.favoriteBtn.hasClass("btn-favorite-remove")) {
                let favoriteId = this.favoriteBtn.attr("data-favorite-id");
                let songTitle = this.favoriteBtn.attr("data-song-title");
                if (favoriteId) {
                    this.didSelectFavoriteRemove(favoriteId, songTitle);
                }
            }
        });
        this.lyrics.toggleBtn.click(() => {
            if (this.lyrics.panel.hasClass("collapsed")) {
                this.lyrics.panel.removeClass("collapsed");
            }
            else {
                this.lyrics.panel.addClass("collapsed");
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

    setVolume(muted, volume) {
        this._setVolumeCircles(volume);
        this._setMutedWithAnimation(muted);
    }

    _setVolumeCircles(volume) {
        let innerCircle = this.volumeIcon.find(".inner-circle")[0];
        let outerCircle = this.volumeIcon.find(".outer-circle")[0];

        let innerRefValue = volume * 2;
        let outerRefValue = (volume - 0.5) * 2;

        innerCircle.setAttribute("d", describeArc(0.55, 0.5, 0.15,
            interpolateWithClip(1 - innerRefValue, 20, 90),
            interpolateWithClip(innerRefValue, 90, 160)));

        outerCircle.setAttribute("d", describeArc(0.55, 0.5, 0.3,
            interpolateWithClip(1 - outerRefValue, 10, 90),
            interpolateWithClip(outerRefValue, 90, 170)));
    }

    _setMutedWithAnimation(muted) {
        let state = this.volumeIcon.attr("data-muted-state");
        let showLine = this.volumeIcon.find("#show-first-muted-line")[0];
        let hideLine = this.volumeIcon.find("#hide-second-muted-line")[0];

        if (muted && state !== "muted") {
            this.volumeIcon.attr("data-muted-state", "muted");
            showLine.beginElement();
        }
        else if (!muted && state !== "unmuted") {
            this.volumeIcon.attr("data-muted-state", "unmuted");
            hideLine.beginElement();
        }
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

    setLyrics(a, b, c) {
        if (a !== null) {
            let url = a;
            let original = b;
            let translation = c;

            this.lyrics.linkUrl.removeClass("no-url").attr("href", url);
            this.lyrics.toggleBtn.removeClass("no-url");

            let prepareContent = (str) => {
                return str.split("\n").join("<br />")
            };
            this.lyrics.content.original.html(prepareContent(original));
            this.lyrics.content.translation.html(prepareContent(translation));
        }
        else {
            this.lyrics.linkUrl.addClass("no-url").attr("href", null);
            this.lyrics.toggleBtn.addClass("no-url");
            this.lyrics.panel.addClass("collapsed");
            this.lyrics.content.original.html('');
            this.lyrics.content.translation.html('');
        }
    }

    setYoutubeLink(videoUrl) {
        if (videoUrl !== null) {
            this.youtubeUrl.removeClass("no-url")
                .attr("href", videoUrl);
        }
        else {
            this.youtubeUrl.addClass("no-url").attr("href", null);
        }
    }

    setFavoriteButtonData(data) {
        this.favoriteBtn.attr("data-song-title", data.songTitle)
            .attr("data-favorite-id", data.favoriteId);
    }

    getFavoriteButtonData() {
        return {
            songTitle: this.favoriteBtn.attr("data-song-title"),
            favoriteId: this.favoriteBtn.attr("data-favorite-id")
        };
    }

    setFavoriteButtonState(state) {
        this.favoriteBtn
            .removeClass("btn-favorite-remove")
            .removeClass("btn-favorite-unavailable")
            .removeClass("btn-favorite-add");

        if (state === RadioUI.FavoriteButtonState.Hidden) {
            // Nothing, only clear
        }
        else if (state === RadioUI.FavoriteButtonState.Unavailable) {
            this.favoriteBtn.addClass("btn-favorite-unavailable")
                .attr("title", this.favoriteBtn.attr("data-title-unavailable"));
        }
        else if (state === RadioUI.FavoriteButtonState.Add) {
            this.favoriteBtn.addClass("btn-favorite-add")
                .attr("title", this.favoriteBtn.attr("data-title-add"));
        }
        else if (state === RadioUI.FavoriteButtonState.Remove) {
            this.favoriteBtn.addClass("btn-favorite-remove")
                .attr("title", this.favoriteBtn.attr("data-title-remove"));
        }
        else {
            console.error("Expected value kind of RadioUI.FavoriteButtonState");
        }
    }

    highlightFavoriteButton() {
        this.favoriteBtn.addClassForAnimation("btn-favorite-highlight");
    }

    showFavoriteButtonWithAnimation() {
        this.favoriteBtn.addClassForAnimation("btn-favorite-show-anim");
    }

    hideFavoriteButtonWithAnimation() {
        this.favoriteBtn.addClassForAnimation("btn-favorite-hide-anim", () => {
            this.setFavoriteButtonState(RadioUI.FavoriteButtonState.Hidden);
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
RadioUI.prototype.didSelectFavoriteAdd = (songTitle) => { };
RadioUI.prototype.didSelectFavoriteRemove = (id, songTitle) => { };
RadioUI.prototype.didSelectToggleMute = () => { };
RadioUI.prototype.didChangeVolume = (value) => { };
