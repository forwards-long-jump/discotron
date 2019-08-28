window.Discotron.Role = class {
    constructor(name, id, color) {
        this._name = name;
        this._id = id;
        this._color = color;
    }

    static getGuildRoles(discordGuildId) {
        return new Promise((resolve, reject) => {
            // Query API
            // new Role();
            // resolve([Role]);
        });
    }
};