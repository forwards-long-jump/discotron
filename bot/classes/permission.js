const PermissionModel = require("./../../models/permission.js");

const Plugin = require("./plugin.js");
const Guild = require("./guild.js");

class Permission extends PermissionModel {
    /**
     * Ctor
     * @param {string} guildId Discord ID of the guild
     * @param {string} pluginId ID of the plugin
     * @param {array} userRoles Array of user roles allowed to use 
     */
    constructor(guildId, pluginId, userRoles) {
        super(guildId, pluginId, userRoles);
    }

    /**
     * Returns whether the user has the right to use the given plugin
     * @param {string} discordUserId
     */
    allows(discordUserId) {
        if (this.usersRoles.length === 0) {
            if (Plugin.getAll()[this.pluginId].defaultPermission === "everyone") {
                return true;
            }
            // Else it's admins only
            return Guild.isGuildAdmin(discordUserId, this.guildId);
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