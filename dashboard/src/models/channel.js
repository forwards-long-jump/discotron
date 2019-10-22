/**
 * Represents a channel, dashboard side
 */
window.discotron.Channel = class {
    /**
     * @class
     * @param {string} name Name of the channel
     * @param {string} discordId Discord channel id
     * @param {string} type Type of the channel. See discord.js documentation (dm, group, text, voice, category, news, store)
     */
    constructor(name, discordId, type) {
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