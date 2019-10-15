/**
 * Represents either a discord user or a role
 */
class UserRoleModel {
    /**
     * Ctor
     * @param {string} discordId Discord id
     * @param {string} type Type of the id, *user* or *role*
     */
    constructor(discordId = undefined, type = "user") {
        this._discordId = discordId;
        this._type = type;
    }

    /**
     * @returns {string} Discord id
     */
    get discordId() {
        return this._discordId;
    }

    /**
     * @returns {string} Type (*user* or *role*)
     */
    get type() {
        return this._type;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = UserRoleModel;
} else {
    window.Discotron.UserRoleModel = UserRoleModel;
}