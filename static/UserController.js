
let GAPI_SCOPE = "https://www.googleapis.com/auth/userinfo.profile";

class UserController {

    constructor(userUI) {
        this.ui = userUI;
        this.auth = undefined;

        this._setupUIEvents();

        gapi.load('client:auth2', () => {
            gapi.client.init({
                clientId: $("head meta[name='google-signin-client_id']").attr("content"),
                scope: GAPI_SCOPE
            }).then(() => {
                this.auth = gapi.auth2.getAuthInstance();
                this.auth.isSignedIn.listen(() => {
                    this.refreshUserState();
                });
                this.refreshUserState();
            });
        });
    }

    _setupUIEvents() {
        this.ui.didSelectSignIn = this.didSelectSignIn.bind(this);
        this.ui.didSelectLogout = this.didSelectLogout.bind(this);
    }

    didSelectSignIn() {
        this.auth.signIn();
    }

    didSelectLogout() {
        this.auth.signOut().then(() => {
            this.auth.disconnect();
            this.auth.currentUser.get().reloadAuthResponse();
            this._revokeToken();
        });
    }

    refreshUserState() {
        let user = this.auth.currentUser.get();
        let isAuthorized = user.hasGrantedScopes(GAPI_SCOPE);

        if (isAuthorized) {
            let tokenId = user.getAuthResponse().id_token;

            this._authorizeTokenId(tokenId, () => {

                let profile = this.auth.currentUser.get().getBasicProfile();
                this.ui.setUserPanelVisibility(true, {
                    name: profile.getName(),
                    email: profile.getEmail(),
                    imageUrl: profile.getImageUrl()
                });
                this.ui.setSignInButtonVisibility(false);

            }, (response) => {
                console.error("Failed authorize: ", response);
            })
        }
        else {
            this.ui.setUserPanelVisibility(false);
            this.ui.setSignInButtonVisibility(true);
        }
    }

    _authorizeTokenId(tokenId, onSuccess, onFailed) {
        $.ajax({
            method: "POST",
            url: "api/user/oauth2_authorize",
            data: {
                tokenId: tokenId
            },
            success: () =>  {
                onSuccess();
            },
            error: (xhr) => {
                onFailed(xhr.responseText)
            }
        });
    }

    _revokeToken() {
        $.ajax({
            method: "POST",
            url: "api/user/oauth2_revoke",
        });
    }
}