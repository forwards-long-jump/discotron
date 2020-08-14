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
    async _displayStatus() {
        const botInfo = await discotron.WebApi.get("discotron/bot-info");
        document.querySelector("#bot-avatar").src = botInfo.avatar;
        document.querySelector("#bot-name").textContent = botInfo.tag;

        const botConfig = await discotron.WebApi.get("discotron/bot-config");
        let status, classStatus;
        if (botConfig.status === 0) {
            status = "Online";
            classStatus = "bot-status-online";
        } else {
            status = "Offline (Status: " + botConfig.status + ")";
            classStatus = "bot-status-offline";
        }

        document.getElementById("bot-name").innerHTML += "<span class=\"bot-status " + classStatus + "\">" + status + "</span>";
        document.getElementById("bot-presence").value = botConfig.presenceText;
        document.getElementById("maintenance-enabled").checked = botConfig.maintenance;
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
        const saveSettingsButton = document.getElementById("save-settings");
        const restartButton = document.getElementById("restart-bot");

        document.getElementById("bot-presence").onkeyup = () => {
            saveSettingsButton.disabled = false;
        };

        document.getElementById("maintenance-enabled").onchange = () => {
            saveSettingsButton.disabled = false;
        };

        saveSettingsButton.onclick = () => {
            saveSettingsButton.disabled = true;

            discotron.WebApi.put("discotron/bot-config", {
                presenceText: document.getElementById("bot-presence").value,
                maintenance: document.getElementById("maintenance-enabled").checked
            });
        };

        restartButton.onclick = async () => {
            restartButton.disabled = true;
            restartButton.value = "Restarting...";
            
            await discotron.WebApi.post("discotron/restart-bot"); 

            restartButton.value = "Restart";
            restartButton.disabled = false;
        };

        document.getElementById("owners-selector").onclick = () => {
            discotron.WebAPI.queryBot("discotron-dashboard", "get-owner-ids").then((owners) => {
                const userRoles = owners.map((owner) => {
                    return new discotron.UserRole(owner, null);
                });
                new discotron.UserRoleWidgetController({
                    usersRoles: userRoles,
                    onUserRoleSave: (newOwners) => {
                        return discotron.WebAPI.queryBot("discotron-dashboard", "set-owners", {
                            discordUserIds: newOwners.map((userRole) => {
                                return userRole.discordUserId;
                            })
                        });
                    },
                    displayRoles: false,
                    headerText: "Owner list",
                    inputHelp: "Please paste the Discord id of the user you want to add"
                });
            }).catch(console.error);
        };
    }
};

discotron.BotStatusController.avatar = undefined;
discotron.BotStatusController.tag = undefined;
