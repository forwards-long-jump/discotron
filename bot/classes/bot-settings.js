const BotSettingsModel = require("./../../models/bot-settings.js");
const db = require("./../apis/database-crud.js");

/**
 * Handle bot settings, server side
 */
class BotSettings extends BotSettingsModel {
    /**
     * @constructor
     */
    constructor() {
        super();

        // Each row in the database contains a key->setting so we have to make 3 queries
        // Everything could also be queried only once but then we have to iterate on everything to check the key
        // Both are bad, key settings should not be saved in the database like that
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
     * Change help text displayed in the public dashboard and save it to the db
     * @param {string} helpText
     */
    set helpText(helpText) {
        this._helpText = helpText;
        db.update("BotSettings", {
            value: helpText
        }, {
            name: "helpText"
        });
    }

    /**
     * @returns {string} Help text
     */
    get helpText() {
        return super.helpText;
    }

    /**
     * Changes the bot presence and save it to the database
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

    /**
     * @returns {string} Status text
     */
    get statusText() {
        return super.statusText;
    }

    /**
     * Update the presence of the bot on Discord
     */
    setBotPresence() {
        global.discordClient.user.setPresence({
            game: {
                name: this.statusText
            },
            status: this.maintenance ? "dnd" : "online"
        }).then().catch();
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