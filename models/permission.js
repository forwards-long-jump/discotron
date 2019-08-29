/**
 * Permission storing its plugin and allowed usersRoles
 */
class PermissionModel {
    /**
     * Ctor
     * @param {string} pluginId Id associated to the plugin
     * @param {array} usersRoles Array of user roles allowed to use the plugin
     */
    constructor(pluginId = undefined, usersRoles = []) {
        this._pluginId = pluginId;
        this._usersRoles = usersRoles;
    }

    get pluginId() {
        return this._pluginId;
    }
    get usersRoles() {
        return this._usersRoles;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = PermissionModel;
} else {
    window.Discotron.PermissionModel = PermissionModel;
}