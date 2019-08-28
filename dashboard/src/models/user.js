window.Discotron.User = class {
    constructor(name, id, avatarURL) {
        this._name = name;
        this._id = id;
        this._avatarURL = avatarURL;

        window.Discotron.User.prototype._users[id] = this;
    }

    static loadGuildMembers(discordGuildId) {
        return new Promise((resolve, reject) => {
            // Query API
            // resolve([ids]); 
            // new User();
        });
    }

    static get(id) {
        return window.Discotron.User.prototype._users[id];
    }
};

window.Discotron.User.prototype._users = {}; // id: User