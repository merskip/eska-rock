
class FavoritesController {

    constructor(radioUI, songDetailsController) {
        this.ui = radioUI;
        this.songDetailsController = songDetailsController;
        this._setupEvents();
    }

    _setupEvents() {
        this.ui.didSelectFavoriteAdd = this.didSelectFavoriteAdd.bind(this);
        this.ui.didSelectFavoriteRemove = this.didSelectFavoriteRemove.bind(this);

        this.songDetailsController.onResponseSongDetails((data) => {
            let songTitle = data["rawSongTitle"];
            let favoriteId = data["favoriteId"];

            if (favoriteId === undefined) {
                this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Hidden);
            }
            else if (favoriteId !== null) {
                let removeState = RadioUI.FavoriteButtonState.Remove;
                removeState.favoriteId = favoriteId;
                removeState.songTitle = songTitle;
                this.ui.setFavoriteButtonState(removeState);
            }
            else {
                let addState = RadioUI.FavoriteButtonState.Add;
                addState.songTitle = songTitle;
                this.ui.setFavoriteButtonState(addState);
            }
        });

    }

    didSelectFavoriteAdd(songTitle) {
        this.ui.highlightFavoriteButton();

        let removeState = RadioUI.FavoriteButtonState.Remove;
        removeState.songTitle = songTitle;
        this.ui.setFavoriteButtonState(removeState);

        this.performFavoriteAdd(songTitle, (favoriteId) => {

            // // We must make sure that the song title didn't change
            if (this.ui.getFavoriteButtonSongTitle() === songTitle) {
                removeState.favoriteId = favoriteId;
                this.ui.setFavoriteButtonState(removeState);
            }
        });
    }

    didSelectFavoriteRemove(favoriteId, songTitle) {
        let addState = RadioUI.FavoriteButtonState.Add;
        addState.songTitle = songTitle;
        this.ui.setFavoriteButtonState(addState);

        this.performFavoriteDelete(favoriteId, () => {
            // Nothing, button state was previously set
        });
    }

    performFavoriteAdd(songTitle, onSuccess) {
        $.ajax({
            method: "POST",
            url: "api/favorites",
            data: {
                songTitle: songTitle
            },
            success: (response) =>  {
                let favoriteId = response['_id'];
                console.info("Successfully was added the song to favorites", {_id: favoriteId, songTitle: songTitle});
                onSuccess(favoriteId);
            }
        });
    }

    performFavoriteDelete(favoriteId, onSuccess) {
        $.ajax({
            type: "DELETE",
            url: "api/favorites",
            data: {
                _id: favoriteId
            },
            success: () =>  {
                console.info("Successfully was delete favorite song", {_id: favoriteId});
                onSuccess();
            }
        });
    }
}