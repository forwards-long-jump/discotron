/**
 * Permission storing its plugin and allowed usersRoles
 */
class PermissionModel {
    /**
     * @class
     * @param {string} discordGuildId Discord ID of the guild
     * @param {string} pluginId Id associated to the plugin
     * @param {Array} usersRoles Array of user roles allowed to use the plugin
     */
    constructor(discordGuildId = "", pluginId = undefined, usersRoles = []) {
        this._guildDiscordId = discordGuildId;
        this._pluginId = pluginId;
        this._usersRoles = usersRoles;
    }


    /**
     * @returns {string} Guild Id
     */
    get guildDiscordId() {
        return this._guildDiscordId;
    }
    /**
     * @returns {string} Plugin Id
     */
    get pluginId() {
        return this._pluginId;
    }
    /**
     * @returns {Array} Array of UserRoles
     */
    get usersRoles() {
        return this._usersRoles;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = PermissionModel;
} else {
    window.discotron.PermissionModel = PermissionModel;
}