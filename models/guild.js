/**
 * Represents a discord guild stored in Discotron
 */
class GuildModel {
    /**
     * @class
     * @param  {string} discordId DiscordId of the guild
     * @param  {string} commandPrefix Prefix of the bot, "!" by default
     * @param  {Set} allowedChannelIds Array of the channel DiscordIds where the bot is allowed
     * @param  {Set} enabledPlugins Set of the plugin Ids the bot is allowed to use in the guild
     * @param  {Set} admins Array of users/roles allowed to change the bot settings in the guild
     * @param  {object} permissions {plugin Id => permissions} describing for each plugin who has the right tu use it
     */
    constructor(discordId = undefined, commandPrefix = "!", allowedChannelIds = new Set([]), enabledPlugins = new Set([]), admins = new Set([]), permissions = {}) {
        this._discordId = discordId;
        this._commandPrefix = commandPrefix;
        this._allowedChannelIds = allowedChannelIds;
        this._enabledPlugins = enabledPlugins;
        this._admins = admins;
        this._permissions = permissions;
    }

    /**
     * @returns {string} guild discord id
     */
    get discordId() {
        return this._discordId;
    }

    /**
     * @returns {string} command prefix for the guild
     */
    get commandPrefix() {
        return this._commandPrefix;
    }

    /**
     * @returns {Array} list of allowed channel ids
     */
    get allowedChannelIds() {
        return this._allowedChannelIds;
    }

    /**
     * @returns {Array} list of enabled plugin ids
     */
    get enabledPlugins() {
        return this._enabledPlugins;
    }

    /**
     * @returns {Array} list of UserRole
     */
    get admins() {
        return this._admins;
    }

    /**
     * @returns {Array} list of Permissions
     */
    get permissions() {
        return this._permissions;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = GuildModel;
} else {
    window.discotron.GuildModel = GuildModel;
}