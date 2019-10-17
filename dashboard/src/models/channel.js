/**
 * Represents a channel, dashboard side
 */
window.Discotron.Channel = class {
    /**
     * @constructor
     * @param {string} name Name of the channel
     * @param {string} id Discord channel id
     * @param {string} type Type of the channel. See discord.js documentation (dm, group, text, voice, category, news, store)
     */
    constructor(name, id, type) {
        this._name = name;
        this._id = id;
        this._type = type;
    }

    /**
     * @returns {string} Channel name
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string} Channel id
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {string} Type of the channel. See discord.js documentation (dm, group, text, voice, category, news, store)
     */
    get type() {
        return this._type;
    }

    /**
     * Returns all the channels of a given guild
     * @static
     * @param {string} discordGuildId Discord id of the guild
     * @returns {Promise} resolve(channels {array}) channels: Array of Channel
     */
    static getGuildChannels(discordGuildId) {
        return new Promise((resolve, reject) => {
            Discotron.WebAPI.queryBot("discotron-dashboard", "get-channels", {}, discordGuildId).then((serializedChannels) => {
                let channels = [];
                for (let i = 0; i < serializedChannels.length; i++) {
                    const channel = serializedChannels[i];
                    channels.push(new Discotron.Channel(channel.name, channel.id, channel.type));
                }

                resolve(channels);
            }).catch(reject);
        });
    }
};