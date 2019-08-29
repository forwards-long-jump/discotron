const BotSettingsModel = require(__dirname + "/../models/bot-settings.js");

class BotSettings extends BotSettingsModel{
    /**
     * Changes the help text displayed by the bot
     * @param {string} helpText New help text
     */
    set helpText(helpText) {
        this._helpText = helpText;
        // TODO: update database
    }

    /**
     * Set if the bot should be put in maintenance (=owner only) mode or not
     * @param {boolean} maintenance State of the maintenance mode of the bot
     */
    set maintenance(maintenance) {
        this._maintenance = maintenance;
        // TODO: update database
    }
}

module.exports = BotSettings;