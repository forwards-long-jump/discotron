/**
 * Represents a role, dashboard side
 */
window.Discotron.Role = class {
    /**
     * @constructor
     * @param {string} name Name of the role
     * @param {string} discordId Id of the role
     * @param {string} color Color of the role 
     */
    constructor(name, discordId, color) {
        this._name = name;
        this._discordId = discordId;
        this._color = color;
    }

    /**
     * @returns {string} role name
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string} role discord id
     */
    get discordId() {
        return this._discordId;
    }

    /**
     * @returns {string} hexadecimal role color
     */
    get color() {
        return this._color;
    }

    /**
     * Returns the roles of a guild, loads it if needed
     * @static
     * @param {string} discordGuildId 
     * @returns {Promise} resolve(roleList {array}) roleList: Array of Role, reject()
     */
    static getGuildRoles(discordGuildId) {
        return new Promise((resolve, reject) => {
            return Discotron.WebAPI.queryBot("discotron-dashboard", "get-roles", {}, discordGuildId).then((roles) => {

                let roleList = [];
                for (let i = 0; i < roles.length; i++) {
                    const role = roles[i];
                    roleList.push(new Discotron.Role(role.name, role.id, role.color));
                }

                resolve(roleList);
            });
        });
    }
};