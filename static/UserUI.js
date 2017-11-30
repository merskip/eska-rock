
class UserUI {

    constructor() {
        this.singInBtn = $("#user-signin");
        this.logoutBtn = $("#user-logout");
        let userPanel = $("#user-panel");
        this.user = {
            panel: userPanel,
            name: userPanel.find(".user-name"),
            email: userPanel.find(".user-email"),
            image: userPanel.find(".user-image"),
        };

        this._setupEvents();
    }

    _setupEvents() {
        this.singInBtn.click(() => {
            this.didSelectSignIn();

            // Ignore default handler, controller should invoking right action.
            // If button is the Google Sing In button, default handler will perform sing in with Google.
            return false;
        });
        this.logoutBtn.click(() => {
            this.didSelectLogout();
        });
    }

    setSignInButtonVisibility(visibility) {
        visibility ? this.singInBtn.show() : this.singInBtn.hide();
    }

    setUserPanelVisibility(visibility, userInfo) {
        if (visibility) {
            this.user.name.text(userInfo.name);
            this.user.email.text(userInfo.email);
            this.user.image.attr("src", userInfo.imageUrl);
            this.user.panel.fadeIn(150);
        }
        else {
            this.user.name.html('');
            this.user.email.html('');
            this.user.image.attr("src", '');
            this.user.panel.hide();
        }
    }
}

// Events

UserUI.prototype.didSelectLogout = () => { };
UserUI.prototype.didSelectSignIn = () => { };
UserUI.prototype.didSelectFavoritesList = () => { };
