const { Client } = require("discord.js");

/**
 * Error thrown when the Discord client cannot reach the discord API
 */
class DiscordAPIConnectionError extends Error {
    /**
     * @class
     * @param {string} message Error message
     */
    constructor(message) {
        super(message);
        this.name = "DiscordAPIConnectionError";
    }
}

/**
 * The DiscordClientProvider provides the Discord.Client object and must be required in all files that want to access it
 */
class DiscordClientProvider {

    /**
     * @class
     */
    constructor() {
        // TODO: Check if it is testing environment and use mock
        this._client = new Client();
    }

    /**
     * Retrieve the current DiscordClient object.
     * Do not keep a "global" reference to the object as it would bypass online checks
     * 
     * @param {object} [param={}] Param object
     * @param {boolean} [param.allowOffline=false] If set to true, does not throw if the client is offline or undefined
     * @returns {DiscordJS.Client} Client associated to the bot
     */
    get({ allowOffline = false} = {}) {
        // TODO: Add better online check here
        if (!allowOffline && this._client.uptime === null) {
            throw new DiscordAPIConnectionError();
        }
        
        return this._client;
    }
}

module.exports = new DiscordClientProvider();