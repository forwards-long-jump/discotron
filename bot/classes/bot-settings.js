const BotSettingsModel = require("./../../models/bot-settings.js");
const db = require("./../apis/database-crud.js");
const Logger = require("../utils/logger.js");
const discordClientProvider = require("./../apis/discord-client-provider.js");

/**
 * Handle bot settings, server side
 */
class BotSettings extends BotSettingsModel {
    /**
     * @class
     */
    constructor() {
        super();

        // Each row in the database contains a key->setting so we have to make 3 queries
        // Everything could also be queried only once but then we have to iterate on everything to check the key
        // Both are bad, key settings should not be saved in the database like that
        Promise.all([
            db.select("BotSettings", ["value"], {
                name: "helpText"
            }),
            db.select("BotSettings", ["value"], {
                name: "maintenance"
            }),
            db.select("BotSettings", ["value"], {
                name: "presenceText"
            }),
        ]).then((results) => {
            this._helpText = results[0][0].value;
            this._maintenance = results[1][0].value === "true";
            this._presenceText = results[2][0].value;
        }).catch(Logger.err);
    }

    /**
     * @param {string} helpText help text displayed in the public dashboard and save it to the db
     */
    set helpText(helpText) {
        this._helpText = helpText;
        db.update("BotSettings", {
            value: helpText
        }, {
            name: "helpText"
        }).catch(Logger.err);
    }

    /**
     * @returns {string} Help text
     */
    get helpText() {
        return super.helpText;
    }

    /**
     * Changes the bot presence and save it to the database
     * @param {string} presenceText New presence text
     */
    set presenceText(presenceText) {
        this._presenceText = presenceText;

        db.update("BotSettings", {
            value: presenceText
        }, {
            name: "presenceText"
        }).catch(Logger.err);

        this.setBotPresence();
    }

    /**
     * @returns {string} Presence text
     */
    get presenceText() {
        return super.presenceText;
    }

    /**
     * Update the presence of the bot on Discord
     */
    setBotPresence() {
        discordClientProvider.get().user.setPresence({
            game: {
                name: this.presenceText
            },
            status: this.maintenance ? "dnd" : "online"
        }).catch(Logger.err);
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
        }).catch(Logger.err);
    }

    get maintenance() {
        return super.maintenance;
    }
}

module.exports = BotSettings;