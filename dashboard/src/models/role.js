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
     * Get name
     */
    get name() {
        return this._name;
    }

    /**
     * Get ID
     */
    get id() {
        return this._id;
    }

    /**
     * Get color
     */
    get color() {
        return this._color;
    }

    /**
     * Returns the roles of a guild, loads it if needed
     * @param {string} discordGuildId 
     */
    static getGuildRoles(discordGuildId) {
        return new Promise((resolve, reject) => {
            Discotron.WebAPI.queryBot("discotron-dashboard", "get-roles", {}, discordGuildId).then((roles) => {
                
                let roleList = [];
                for (let i = 0; i < roles.length; i++) {
                    const role = roles[i];
                    roleList.push(new Discotron.Role(role.name, role. id, role.color));
                }

                resolve(roleList);
            });
        });
    }
};
