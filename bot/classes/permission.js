const PermissionModel = require("./../../models/permission.js");

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
        for (let i = 0; i < this.usersRoles.length; ++i) {
            if (this.usersRoles[i].describes(discordUserId)) {
                return true;
            }   
        }
        return false;
    }
}

module.exports = Permission;