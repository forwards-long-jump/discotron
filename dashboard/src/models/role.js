/**
 * Represents a role, dashboard side
 */
window.discotron.Role = class {
    /**
     * @class
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
};