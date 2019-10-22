window.discotron.BotStatusController = class extends window.discotron.Controller {
    /**
     * @class
     */
    constructor() {
        super("owner/bot-status.html", () => {
            this._displayStatus();
            this._addEvents();
        });
    }

    /**
     * Display current status of the bot
     */
    _displayStatus() {
        // TODO: Use WebAPI auto caching (advanced feature, not implemented yet)
        if (discotron.BotStatusController.tag === undefined) {
            discotron.WebAPI.queryBot("discotron-dashboard", "get-bot-info").then((data) => {
                document.querySelector("#bot-avatar").src = data.avatar;
                document.querySelector("#bot-name").textContent = data.tag;

                discotron.BotStatusController.tag = data.tag;
                discotron.BotStatusController.avatar = data.avatar;
            }).catch(console.error);
        } else {
            document.querySelector("#bot-avatar").src = discotron.BotStatusController.avatar;
            document.querySelector("#bot-name").textContent = discotron.BotStatusController.tag;
        }

        discotron.WebAPI.queryBot("discotron-dashboard", "get-bot-config").then((data) => {
            let status, classStatus;

            if (data.status === 0) {
                status = "Online";
                classStatus = "green-text";
            } else {
                status = "Offline (Status: " + data.status + ")";
                classStatus = "red-text";
            }

            document.getElementById("bot-name").innerHTML += "<span class=\"bot-status " + classStatus + "\">" + status + "</span>";
            document.getElementById("bot-presence").value = data.presenceText;
            document.getElementById("maintenance-enabled").checked = data.maintenance;
        }).catch(console.error);
    }

    /**
     * Reloads the data on the page
     */
    _onReloadClick() {
        // TODO?
    }

    /**
     * Add events to open widgets and change variables, change the save button status
     */
    _addEvents() {
        let saveSettingsButton = document.getElementById("save-settings");
        let restartButton = document.getElementById("restart-bot");

        document.getElementById("bot-presence").onkeyup = () => {
            saveSettingsButton.disabled = false;
        };

        document.getElementById("maintenance-enabled").onchange = () => {
            saveSettingsButton.disabled = false;
        };

        saveSettingsButton.onclick = () => {
            saveSettingsButton.disabled = true;

            discotron.WebAPI.queryBot("discotron-dashboard", "set-bot-config", {
                presenceText: document.getElementById("bot-presence").value,
                maintenance: document.getElementById("maintenance-enabled").checked
            }).catch(console.error);
        };

        restartButton.onclick = () => {
            restartButton.disabled = true;
            restartButton.value = "Restarting...";
            discotron.WebAPI.queryBot("discotron-dashboard", "restart-bot").then((data) => {
                if (data === true) {
                    restartButton.value = "Restart";
                    restartButton.disabled = false;
                }
            }).catch(console.error);
        };

        document.getElementById("owners-selector").onclick = () => {
            discotron.WebAPI.queryBot("discotron-dashboard", "get-owner-ids").then((owners) => {
                let userRoles = owners.map((owner) => {
                    return new discotron.UserRole(owner, null);
                });
                new discotron.UserRoleWidgetController(undefined, userRoles, (newOwners) => {
                    return discotron.WebAPI.queryBot("discotron-dashboard", "set-owners", {
                        discordUserIds: newOwners.map((userRole) => {
                            return userRole.discordUserId;
                        })
                    });
                }, false, "Owner list", false, [], () => { }, "Please paste the Discord id of the user you want to add");
            }).catch(console.error);
        };
    }
};

discotron.BotStatusController.avatar = undefined;
discotron.BotStatusController.tag = undefined;