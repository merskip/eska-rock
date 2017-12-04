
class FavoritesController {

    constructor(radioUI, userController, songDetailsController) {
        this.ui = radioUI;
        this.userController = userController;
        this.songDetailsController = songDetailsController;
        this._setupEvents();
    }

    _setupEvents() {
        this.ui.didSelectFavoriteAdd = this.didSelectFavoriteAdd.bind(this);
        this.ui.didSelectFavoriteRemove = this.didSelectFavoriteRemove.bind(this);

        this.userController.onSignInChange((isSignIn) => {
            if (isSignIn) {
                this._configureFavoriteButtonOnSignIn();
            }
            else {
                this.ui.hideFavoriteButtonWithAnimation();
            }
        });

        this.songDetailsController.onResponseSongDetails((data) => {
            let isValidSong = data["isValidSong"];
            if (isValidSong) {
                let songTitle = data["rawSongTitle"];
                let favoriteId = data["favoriteId"];

                this.ui.setFavoriteButtonData({
                    songTitle: songTitle,
                    favoriteId: favoriteId
                });
                if (favoriteId === undefined) {
                    this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Hidden);
                }
                else if (favoriteId !== null) {
                    this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Remove);
                }
                else {
                    this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Add);
                }
            }
            else {
                this.ui.setFavoriteButtonData({});
                this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Unavailable);
            }
        });
    }

    _configureFavoriteButtonOnSignIn() {
        let data = this.ui.getFavoriteButtonData();
        if (data.songTitle === undefined) {
            return;
        }

        this.getFavoriteDetailsWithSongTitle(data.songTitle, (favorite) => {
            this.ui.setFavoriteButtonData({
                songTitle: favorite.songTitle,
                favoriteId: favorite._id
            });
            this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Remove);
            this.ui.showFavoriteButtonWithAnimation();

        }, () => { // Not found this song in favorite
            this.ui.setFavoriteButtonData({
                songTitle: data.songTitle
            });
            this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Add);
            this.ui.showFavoriteButtonWithAnimation();
        });
    }

    didSelectFavoriteAdd(songTitle) {
        this.ui.highlightFavoriteButton();
        this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Remove);

        this.performFavoriteAdd(songTitle, (favoriteId) => {

            // // We must make sure that the song title didn't change
            let currentSongTitle = this.ui.getFavoriteButtonData().songTitle;
            if (currentSongTitle === songTitle) {
                this.ui.setFavoriteButtonData({
                    songTitle: songTitle,
                    favoriteId: favoriteId
                });
            }
        });
    }

    didSelectFavoriteRemove(favoriteId, songTitle) {
        this.ui.setFavoriteButtonData({
            songTitle: songTitle
        });
        this.ui.setFavoriteButtonState(RadioUI.FavoriteButtonState.Add);

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

    getFavoriteDetailsWithSongTitle(songTitle, onSuccess, onNotFound) {
        $.ajax({
            type: "GET",
            url: "api/favorites/search",
            data: {
                songTitle: songTitle
            },
            success: (songDetails) => {
                onSuccess(songDetails);
            },
            error: (xhr) => {
                if (xhr.status === 404) {
                    onNotFound();
                }
            }
        })
    }
}