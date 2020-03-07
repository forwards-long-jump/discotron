const PermissionModel = require("./../../shared-models/permission.js");

const Plugin = require("./plugin.js");
const Guild = require("./guild.js");

class Permission extends PermissionModel {
    /**
     * @class
     * @param {string} discordGuildId Discord ID of the guild
     * @param {string} pluginId ID of the plugin
     * @param {Array} userRoles Array of user roles allowed to use 
     */
    constructor(discordGuildId, pluginId, userRoles) {
        super(discordGuildId, pluginId, userRoles);
    }

    /**
     * @returns {Array} [usersRoles] Array containing userRoles converted to object
     */
    toObject() {
        return this.usersRoles.map((userRole) => userRole.toObject());
    }

    /**
     * @param {string} discordUserId Discord user id
     * @returns {boolean} whether the user has the right to use the given plugin
     */
    allows(discordUserId) {
        if (this.usersRoles.length === 0) {
            if (Plugin.getAll()[this.pluginId].defaultPermission === "everyone") {
                return true;
            }
            // Else it's admins only
            return Guild.isGuildAdmin(discordUserId, this.discordGuildId);
        }

        for (let i = 0; i < this.usersRoles.length; ++i) {
            if (this.usersRoles[i].describes(discordUserId)) {
                return true;
            }
        }
        return false;
    }
}

module.exports = Permission;