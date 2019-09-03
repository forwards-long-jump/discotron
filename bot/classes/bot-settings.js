const BotSettingsModel = require("./../../models/bot-settings.js");
const db = require("./../apis/database-crud.js");

class BotSettings extends BotSettingsModel {
    constructor() {
        super();

        db.select("BotSettings", ["value"], {
            name: "helpText"
        }).then((rows) => {
            this._helpText = rows[0].value;
        });
        db.select("BotSettings", ["value"], {
            name: "maintenance"
        }).then((rows) => {
            this._maintenance = rows[0].value === "true";
        });
        db.select("BotSettings", ["value"], {
            name: "botStatus"
        }).then((rows) => {
            this._statusText = rows[0].value;
        });
    }

    /**
     * Changes the help text displayed by the bot
     * @param {string} helpText New help text
     */
    set helpText(helpText) {
        this._helpText = helpText;
        db.update("BotSettings", {
            value: helpText
        }, {
            name: "helpText"
        });
    }

    setBotPresence() {
        global.discordClient.user.setPresence({
            game: {
                name: this.statusText
            },
            status: this.maintenance ? "dnd" : "online"
        }).then().catch();
    }

    get helpText() {
        return super.helpText;
    }

    /**
     * Changes the status text displayed by the bot
     * @param {string} statusText New status text
     */
    set statusText(statusText) {
        this._statusText = statusText;
        db.update("BotSettings", {
            value: statusText
        }, {
            name: "botStatus"
        });
        this.setBotPresence();
    }

    get statusText() {
        return super.statusText;
    }

    /**
     * Set if the bot should be put in maintenance (=owner only) mode or not
     * @param {boolean} maintenance State of the maintenance mode of the bot
     */
    set maintenance(maintenance) {
        this._maintenance = maintenance;
        db.update("BotSettings", {
            value: maintenance ? "true" : "false"
        }, {
            name: "maintenance"
        });
    }

    get maintenance() {
        return super.maintenance;
    }
}

module.exports = BotSettings;