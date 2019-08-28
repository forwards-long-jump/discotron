/**
 * Model for the settings of the bot
 */
class BotSettingsModel {
    /**
     * Ctor
     * @param {string} helpText Text displayed in the help of the bot
     * @param {boolean} maintenance True to only allow the owner(s) to use the bot
     */
    constructor(helpText = "", maintenance = false) {
        this._helpText = helpText;
        this._maintenance = maintenance;
    }

    /**
     * Get help text
     */
    get helpText() {
        return this._helpText;
    }

    /**
     * get maintenance mode
     */
    get maintenance() {
        return this._maintenance;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = BotSettingsModel;
} else {
    window.Discotron.BotSettingsModel = BotSettingsModel;
}