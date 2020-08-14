/**
 * Controller for the login page
 */
window.discotron.LoginController = class /* does not extends Controller because it is not a logged in page */ {
    /**
     * Login and claim ownership
     * @static
     */
    static async claimOwnership() {
        const secret = document.querySelector("#owner-ship-token").value;

        try {
            await discotron.WebApi.post("login/ownership", { secret: secret });

            // User is now the bot owner!
            window.location.replace("/dashboard");
        } catch (err) {
            discotron.WebApiError.handleErrors(err, {"wrong-secret": () => {
                discotron.LoginController._displayContainer("claim-ownership");
                document.querySelector("#claim-error").style.display = "block";
            }, "has-bot-owner": () => {
                // TODO: Show error message so the user knows what is happening
                // This should not happen, the bot is already owned, so just continue since we're logged in already
                window.location.replace("/dashboard");
            }});
        }
    }

    static async tryLogin() {
        const url = new URL(window.location.href);
        const authToken = url.searchParams.get("code");

        // Code is set, user is trying to log in
        if (authToken !== null) {
            discotron.LoginController._displayContainer("logging-in");

            try {
                const loginStatus = await discotron.WebApi.post("login", { authToken: authToken });

                // Login was successful
                discotron.LoginController._handleSuccess(loginStatus);

                // Check for ownership status
                discotron.LoginController.checkOwnership();
            } catch (err) {
                // We did not successfully login
                discotron.WebApiError.handleErrors(err, { "login-error": () => {
                    discotron.LoginController._displayContainer("login");
                    document.querySelector("#login-error").style.display = "block";
                }});
            }
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

    static validateConfig() {
        if (discotron.config === undefined || discotron.config.oauthURL === undefined || discotron.config.inviteLink === undefined) {
            document.querySelector("h1").style.display = "none";
            document.querySelector("#login-text").textContent = "Bot installation is not complete, please check the installation " +
                "guide and create the missing configuration file.";

            document.querySelector(".widget-buttons").style.display = "none";
            document.querySelector("#login-error").style.display = "block";
            document.querySelector("#login-error").innerHTML = "Could not load <b>dashboard.js</b>";
            return false;
        }
        return true;
    }
    
    static checkLoginState() {
        if (localStorage.getItem("appToken") === null) {
            // Is not logged in
            discotron.LoginController.tryLogin();
        } else {
            // Check if valid appToken, and redirect accordingly
            discotron.LoginController.checkOwnership();
        }
    }

    static async checkOwnership() {
        // If we are not logged in, web api is gonna notice that and log out properly
        const isBotOwned = await discotron.WebApi.get("login/ownership");
        if (isBotOwned) {
            // Redirect to good dashboard
            document.location.replace("/dashboard");
        } else {
            // Ask user to claim ownership
            discotron.LoginController._displayContainer("claim-ownership");
        }
    }
};

if (discotron.LoginController.validateConfig()) {
    document.querySelector("#auth-link").href = discotron.config.oauthURL;

    discotron.LoginController.checkLoginState();
    discotron.LoginController.addEvents();
}
