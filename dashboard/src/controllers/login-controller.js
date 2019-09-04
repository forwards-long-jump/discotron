window.Discotron.LoginController = class /* does not extends Controller because it is not a logged in page*/ {
    /**
     * Login and claim ownership
     */
    static claimOwnership() {
        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");
        let ownerSecret = document.querySelector("#owner-ship-token").value;

        Discotron.WebAPI.queryBot("discotron-dashboard", "claim-ownership", {
            "code": code,
            "ownerSecret": ownerSecret
        }).then((data) => {     
            switch (data.status) {
                case "error":
                    Discotron.LoginController._displayContainer("claim-ownership");
                    document.querySelector("#claim-error").style.display = "block";
                    break;
                case "success":
                    Discotron.LoginController._handleSuccess(data);
                    break;
            }
        });

    }

    /**
     * Display secret input if no owners
     */
    static handleOwnershipClaim() {

    }

    /** 
     * Set URL from config and check what to display
     */
    static initPage() {
        if (Discotron.config === undefined || Discotron.config.oauthURL === undefined || Discotron.config.inviteLink === undefined) {
            document.querySelector("h1").style.display = "none";
            document.querySelector("#login > div > div > div > p:nth-child(2)").textContent = "Bot installation is not complete, please check the installation guide and create the missing configuration file.";
            document.querySelector(".widget-buttons").style.display = "none";
            document.querySelector("#login-error").style.display = "block";
            document.querySelector("#login-error").innerHTML = "Could not load <b>dashboard/config/config.js</b>";
            return;
        }

        document.querySelector("#auth-link").href = Discotron.config.oauthURL;

        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");

        // Code is set, user is trying to log in
        if (code !== null) {
            Discotron.LoginController._displayContainer("logging-in");

            Discotron.WebAPI.queryBot("discotron-dashboard", "login", {
                "code": code
            }).then((data) => {
                switch (data.status) {
                    case "error":
                        Discotron.LoginController._displayContainer("login");
                        document.querySelector("#login-error").style.display = "block";
                        break;
                    case "success":
                        Discotron.LoginController._handleSuccess(data);
                        break;
                    case "first-launch":
                        Discotron.LoginController._displayContainer("claim-ownership");
                        break;
                }
            });

        }
    }

    static _handleSuccess(data) {
        localStorage.setItem("appToken", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("discriminator", data.discriminator);
        localStorage.setItem("avatar", data.avatar);
        localStorage.setItem("clientId", data.clientId);
        window.location.replace("/dashboard");
    }

    static _displayContainer(containerName) {
        document.querySelector("#logging-in").style.display = containerName === "logging-in" ? "block" : "none";
        document.querySelector("#login").style.display = containerName === "login" ? "block" : "none";
        document.querySelector("#claim-ownership").style.display = containerName === "claim-ownership" ? "block" : "none";
    }

    /**
     * Add events to buttons
     */
    static addEvents() {
        document.getElementById("owner-ship-token").onkeyup = (e) => {
            if (e.keyCode === 13) {
                Discotron.LoginController.claimOwnership()
            }
        };
    }
};

// App token set => we have are already logged in
if (localStorage.getItem("appToken") !== null) {
    document.location.replace("/dashboard");
} else {
    Discotron.LoginController.handleOwnershipClaim();
    Discotron.LoginController.initPage();
    Discotron.LoginController.addEvents();
}