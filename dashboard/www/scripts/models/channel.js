/**
 * Represents a channel, dashboard side
 */
window.discotron.Channel = class {
    /**
     * @class
     * @param {object} options Args
     * @param {string} options.name Name of the channel
     * @param {string} options.discordId Discord channel id
     * @param {string} options.type Type of the channel. See discord.js documentation (dm, group, text, voice, category, news, store)
     */
    constructor({name, discordId, type}) {
        this._name = name;
        this._discordId = discordId;
        this._type = type;
    }

    /**
     * @returns {string} Channel name
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string} Channel id
     */
    get discordId() {
        return this._discordId;
    }

    /**
     * @returns {string} Type of the channel. See discord.js documentation (dm, group, text, voice, category, news, store)
     */
    get type() {
        return this._type;
    }
};