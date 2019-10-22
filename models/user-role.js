/**
 * Represents either a discord user or a role
 */
class UserRoleModel {
    /**
     * @class
     * @param {string} discordUserId Discord user id
     * @param {string} discordRoleId Discord role id
     */
    constructor(discordUserId = undefined, discordRoleId = undefined) {
        this._discordUserId = discordUserId;
        this._discordRoleId = discordRoleId;
    }

    /**
     * @returns {string} Discord user id
     */
    get discordUserId() {
        return this._discordUserId;
    }

    /**
     * @returns {string} Discord role id
     */
    get discordRoleId() {
        return this._discordRoleId;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = UserRoleModel;
} else {
    window.discotron.UserRoleModel = UserRoleModel;
}