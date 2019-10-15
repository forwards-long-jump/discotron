/**
 * Permission storing its plugin and allowed usersRoles
 */
class PermissionModel {
    /**
     * @constructor
     * @param {string} guildId Discord ID of the guild
     * @param {string} pluginId Id associated to the plugin
     * @param {array} usersRoles Array of user roles allowed to use the plugin
     */
    constructor(guildId = "", pluginId = undefined, usersRoles = []) {
        this._guildId = guildId;
        this._pluginId = pluginId;
        this._usersRoles = usersRoles;
    }


    /**
     * @returns {string} Guild Id
     */
    get guildId() {
        return this._guildId;
    }
    /**
     * @returns {string} Plugin Id
     */
    get pluginId() {
        return this._pluginId;
    }
    /**
     * @returns {array} Array of UserRoles
     */
    get usersRoles() {
        return this._usersRoles;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = PermissionModel;
} else {
    window.Discotron.PermissionModel = PermissionModel;
}