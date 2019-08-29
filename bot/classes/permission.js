const PermissionModel = require(__dirname + "/../models/permission.js");

class Permission extends PermissionModel {
    /**
     * Ctor
     * @param {array} userRoles Array of user roles allowed to use 
     * @param {string} pluginId 
     */
    constructor(userRoles, pluginId) {
        super(userRoles, pluginId);
    }

    /**
     * Returns whether the user has the right to use the given plugin
     * @param {string} discordUserId
     */
    allows(discordUserId) {
        // TODO: correct this
        /*if (this._userIds.contains(user.id)) return true;
        for (let i = 0; i < this._roleIds.length; ++i) {
            if (user.hasRole(this._roleIds[i])) return true;
        }
        return false;*/
    }
}

module.exports = Permission;