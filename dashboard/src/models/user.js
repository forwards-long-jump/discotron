window.Discotron.User = class {
    /**
     * Ctor
     * @param {string} name Name of the user
     * @param {string} id Id of the user
     * @param {string} avatarURL Avatar of the user
     */
    constructor(name, id, avatarURL) {
        this._name = name;
        this._id = id;
        this._avatarURL = avatarURL;

        window.Discotron.User.prototype._users[id] = this;
    }

    /**
     * Load the members of a given guild
     * @param {string} discordGuildId 
     */
    static loadGuildMembers(discordGuildId) {
        return new Promise((resolve, reject) => {
            // Query API
            // resolve([ids]); 
            // new User();
        });
    }
    
    /**
     * Get a user from its id (or load it?)
     * @param {string} id 
     */
    static get(id) {
        return window.Discotron.User._users[id];
    }

    /**
     * Get all loaded users
     */
    static getAll() {
        return window.Discotron.User._users;
    }
};

window.Discotron.User.prototype._users = {}; // id: User