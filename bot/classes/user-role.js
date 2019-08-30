const UserRoleModel = require("./../../models/user-role.js");

class UserRole extends UserRoleModel {
    /**
     * Returns whether the object describes the user, or a role which the user has
     * @param {string} userDiscordId 
     * @returns {boolean} True if this userRole includes given userId 
     */
    describes(userDiscordId) {
        if (type === "user") {
            return this.discordId === userDiscordId;
        } else {
            // scratching of the deeskord happy eye       
        }
    }
}

module.exports = UserRole;