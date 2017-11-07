
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
            let favoriteId = data["favoriteId"];
            if (favoriteId === undefined) {
                this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Hidden);
            }
            else if (favoriteId !== null) {
                let removeState = RadioUI.FavoriteButtonState.Remove;
                removeState.favoriteId = favoriteId;
                this.ui.setFavoriteButtonState(removeState);
            }
            else {
                let addState = RadioUI.FavoriteButtonState.Add;
                addState.songTitle = data["rawSongTitle"];
                this.ui.setFavoriteButtonState(addState);
            }
        });

    }

    didSelectFavoriteAdd(songTitle) {
        this.ui.highlightFavoriteButton();
        this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Remove);

        this.performFavoriteAdd(songTitle, (favoriteId) => {

            // // We must make sure that the song title didn't change
            if (this.ui.getFavoriteButtonSongTitle() === songTitle) {
                let removeState = RadioUI.FavoriteButtonState.Remove;
                removeState.favoriteId = favoriteId;
                this.ui.setFavoriteButtonState(removeState);
            }
        });
    }

    didSelectFavoriteRemove() {

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
                console.info("Successfully added a song to favorites", {_id: favoriteId, songTitle: songTitle});
                onSuccess(favoriteId);
            }
        });
    }
}