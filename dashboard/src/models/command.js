/**
 * Represents a command, dashboard side
 */
window.Discotron.Command = class extends window.Discotron.CommandModel {
    /**
     * @constructor
     * @param {object} settings Settings
     */
    constructor(settings) {
        super(settings);
    }

    /**
     * @returns {string} <plugin-prefix><command>
     */
    getCommandText(prefix) {
        // build: prefix + plugin prefix + command
    }
};