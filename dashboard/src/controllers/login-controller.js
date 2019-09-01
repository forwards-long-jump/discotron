window.Discotron.LoginController = class /* does not extends Controller because it is not a logged in page*/ {
    /**
     * Login and claim ownership
     */
    static claimOwnership() {
        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");
        let ownerSecret = document.querySelector("#owner-ship-token").value;

        console.log(code, ownerSecret);

        Discotron.WebAPI.queryBot("discotron-dashboard", "claim-ownership", {
            "code": code,
            "ownerSecret": ownerSecret
        }).then((data) => {
            console.log(data);

            switch (data.status) {
                case "error":
                    Discotron.LoginController._displayContainer("claim-ownership");
                    document.querySelector("#claim-error").style.display = "block";
                    break;
                case "success":
                    localStorage.setItem("appToken", data.token);
                    window.location.replace("/dashboard");
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
        document.querySelector("#auth-link").href = Discotron.config.oauthURL;

        let url = new URL(window.location.href);
        let code = url.searchParams.get("code");

        // Code is set, user is trying to log in
        if (code !== null) {
            Discotron.LoginController._displayContainer("logging-in");

            Discotron.WebAPI.queryBot("discotron-dashboard", "login", {
                "code": code
            }).then((data) => {
                console.log(data);

                switch (data.status) {
                    case "error":
                        Discotron.LoginController._displayContainer("login");
                        document.querySelector("#login-error").style.display = "block";
                        break;
                    case "success":
                        localStorage.setItem("appToken", data.token);
                        window.location.replace("/dashboard");
                        break;
                    case "first-launch":
                        Discotron.LoginController._displayContainer("claim-ownership");
                        break;
                }
            });

        }
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

    }
};

Discotron.LoginController.handleOwnershipClaim();
Discotron.LoginController.initPage();
Discotron.LoginController.addEvents();