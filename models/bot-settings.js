/**
 * Model for the settings of the bot
 */
class BotSettingsModel {
    /**
     * @constructor
     * @param {string} [helpText=""] Text displayed in the help of the bot
     * @param {boolean} [maintenance=false] True to only allow the owner(s) to use the bot
     * @param {string} [statusText=""] Bot presence text
     */
    constructor(helpText = "", maintenance = false, statusText = "") {
        this._helpText = helpText;
        this._statusText = statusText;
        this._maintenance = maintenance;
    }

    /**
     * @returns {string} help text (unused)
     */
    get helpText() {
        return this._helpText;
    }
    
    /**
     * @returns {string} presence text
     */
    get statusText() {
        return this._statusText;
    }
    
    /**
     * @returns {boolean} maintenance mode
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