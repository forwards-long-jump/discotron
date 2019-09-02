/**
 * Represents a discord guild stored in Discotron
 */
class GuildModel {
    /**
     * Ctor
     * @param  {string} discordId DiscordId of the guild
     * @param  {string} commandPrefix Prefix of the bot, "!" by default
     * @param  {set} allowedChannelIds Array of the channel DiscordIds where the bot is allowed
     * @param  {set} enabledPlugins Set of the plugin Ids the bot is allowed to use in the guild
     * @param  {set} admins Array of users/roles allowed to change the bot settings in the guild
     * @param  {object} permissions Associative array {plugin Id => permissions} describing for each plugin who has the right tu use it
     */
    constructor(discordId = undefined, commandPrefix = "!", allowedChannelIds = [], enabledPlugins = [], admins = new Set([]), permissions = {}) {
        this._discordId = discordId;
        this._commandPrefix = commandPrefix;
        this._allowedChannelIds = allowedChannelIds;
        this._enabledPlugins = enabledPlugins;
        this._admins = admins;
        this._permissions = permissions;
    }

    get discordId() {
        return this._discordId;
    }
    get commandPrefix() {
        return this._commandPrefix;
    }
    get allowedChannelIds() {
        return this._allowedChannelIds;
    }
    get enabledPlugins() {
        return this._enabledPlugins;
    }
    get admins() {
        return this._admins;
    }
    get permissions() {
        return this._permissions;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = GuildModel;
} else {
    window.Discotron.GuildModel = GuildModel;
}