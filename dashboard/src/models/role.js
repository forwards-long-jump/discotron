window.Discotron.Role = class {
    /**
     * Ctor
     * @param {string} name Name of the role
     * @param {string} id Id of the role
     * @param {string} color Color of the role 
     */
    constructor(name, id, color) {
        this._name = name;
        this._id = id;
        this._color = color;
    }

    /**
     * Returns the roles of a guild, loads it if needed
     * @param {string} discordGuildId 
     */
    static getGuildRoles(discordGuildId) {
        return new Promise((resolve, reject) => {
            // Query API
            // new Role();
            // resolve([Role]);
        });
    }
};