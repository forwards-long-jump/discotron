/**
 * Controller for the login page
 */
window.discotron.LoginController = class /* does not extends Controller because it is not a logged in page */ {
    /**
     * Login and claim ownership
     * @static
     */
    static claimOwnership() {
        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");
        let ownerSecret = document.querySelector("#owner-ship-token").value;

        discotron.WebAPI.queryBot("discotron-dashboard", "claim-ownership", {
            "code": code,
            "ownerSecret": ownerSecret
        }).then((data) => {
            switch (data.status) {
                case "error":
                    discotron.LoginController._displayContainer("claim-ownership");
                    document.querySelector("#claim-error").style.display = "block";
                    break;
                case "success":
                    discotron.LoginController._handleSuccess(data);
                    break;
            }
        }).catch(console.error);

    }

    /** 
     * Set URL from config and check what to display
     * @static
     */
    static initPage() {
        if (discotron.config === undefined || discotron.config.oauthURL === undefined || discotron.config.inviteLink === undefined) {
            document.querySelector("h1").style.display = "none";
            document.querySelector("#login-text").textContent = "Bot installation is not complete, please check the installation " +
                "guide and create the missing configuration file.";

            document.querySelector(".widget-buttons").style.display = "none";
            document.querySelector("#login-error").style.display = "block";
            document.querySelector("#login-error").innerHTML = "Could not load <b>dashboard.js</b>";
            return;
        }

        document.querySelector("#auth-link").href = discotron.config.oauthURL;

        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");

        // Code is set, user is trying to log in
        if (code !== null) {
            discotron.LoginController._displayContainer("logging-in");

            discotron.WebAPI.queryBot("discotron-dashboard", "login", {
                "code": code
            }).then((data) => {
                switch (data.status) {
                    case "error":
                        discotron.LoginController._displayContainer("login");
                        document.querySelector("#login-error").style.display = "block";
                        break;
                    case "success":
                        discotron.LoginController._handleSuccess(data);
                        break;
                    case "first-launch":
                        discotron.LoginController._displayContainer("claim-ownership");
                        break;
                }
            }).catch(console.error);

        }
    }

    /**
     * Save local properties and redirect
     * @param {object} data Answer from the server, contains {token, username, discriminator, avatar, discordUserId}
     */
    static _handleSuccess(data) {
        localStorage.setItem("appToken", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("discriminator", data.discriminator);
        localStorage.setItem("avatar", data.avatar);
        localStorage.setItem("discordUserId", data.discordUserId);
        window.location.replace("/dashboard");
    }

    /**
     * Change visibility of specified container, hide the others
     * @static
     * @param {string} containerName Container id to display without #
     */
    static _displayContainer(containerName) {
        document.querySelector("#logging-in").style.display = containerName === "logging-in" ? "block" : "none";
        document.querySelector("#login").style.display = containerName === "login" ? "block" : "none";
        document.querySelector("#claim-ownership").style.display = containerName === "claim-ownership" ? "block" : "none";
    }

    /**
     * Add events to buttons
     * @static
     */
    static addEvents() {
        document.getElementById("owner-ship-token").onkeyup = (e) => {
            if (e.keyCode === 13) {
                discotron.LoginController.claimOwnership();
            }
        };
    }
};

// App token set => we have are already logged in
if (localStorage.getItem("appToken") !== null) {
    document.location.replace("/dashboard");
} else {
    discotron.LoginController.initPage();
    discotron.LoginController.addEvents();
}