window.Discotron.Channel = class {
    /**
     * Ctor
     * @param {string} name Name of the channel
     * @param {string} id Discord channel id
     * @param {string} type Type of the channel (dm, group, voice, etc.)
     */
    constructor(name, id, type) {
        this._name = name;
        this._id = id;
        this._type = type;
    }

    get name() {
        return this._name;
    }

    get id() {
        return this._id;
    }
    
    get type() {
        return this._type;
    }

    /**
     * Returns all the channels of a given guild
     * @param {string} discordGuildId Discord id of the guild
     */
    static getGuildChannels(discordGuildId) {
        return new Promise((resolve, reject) => {
            // Query API
            // new Channel();
            // resolve([Channel]);
        });
    }
};