window.Discotron.Channel = class {
    constructor(name, id, type) {
        this._name = name;
        this._id = id;
        this._color = type;
    }

    static getGuildChannels(discordGuildId) {
        return new Promise((resolve, reject) => {
            // Query API
            // new Role();
            // resolve([Channel]);
        });
    }
};