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

    /**
     * Set if the bot should be put in maintenance (=owner only) mode or not
     * @param {boolean} maintenance State of the maintenance mode of the bot
     */
    set maintenance(maintenance) {
        this._maintenance = maintenance;
        db.update("BotSettings", {
            value: maintenance
        }, {
            name: "maintenance"
        });
    }
}

module.exports = BotSettings;