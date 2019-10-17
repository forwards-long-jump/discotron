/**
 * Represents a User, dashboard side
 */
window.Discotron.User = class {
    /**
     * @constructor
     * @param {string} name Name of the user
     * @param {string} id Id of the user
     * @param {string} avatarURL Avatar of the user
     * @param {string} discriminator Discriminator of the user (numbers after the #)
     */
    constructor(name, id, avatarURL, discriminator) {
        this._name = name;
        this._discriminator = discriminator;
        this._id = id;
        this._tag = name + "#" + discriminator;
        this._avatarURL = avatarURL;

        Discotron.User._users[id] = this;
    }

    /**
     * @returns {string} name
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string} returns the discriminator
     */
    get discriminator() {
        return this._discriminator;
    }

    /**
     * @returns {string} returns the tag
     */
    get tag() {
        return this._tag;
    }

    /**
     * @returns {string} returns discord user id
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {string} Avatar URL of the user
     */
    get avatarURL() {
        return this._avatarURL;
    }

    /**
     * Load the members of a given guild
     * @static
     * @param {string} discordGuildId  Discord guild id
     * @returns {Promise} resolve(users {array}) users: Array of User
     */
    static loadGuildMembers(discordGuildId) {
        return new Promise((resolve, reject) => {
            return Discotron.WebAPI.queryBot("discotron-dashboard", "get-members", {}, discordGuildId).then((users) => {
                resolve(users.map((user) => {
                    return new Discotron.User(user.name, user.id, user.avatar, user.discriminator).id;
                }));
            });
        });
    }

    /**
     * Get a user from its id (load it if necessary)
     * @static
     * @param {string} id  User id
     * @returns {Promise} resolve(user {User}), reject()
     */
    static get(id) {
        return new Promise((resolve, reject) => {
            if (Discotron.User._users[id] === undefined) {
                // Since the user should be loaded if he was in a guild, we are here trying to fetch an out-of-guild user (typically for the owner)
                return Discotron.WebAPI.queryBot("discotron-dashboard", "get-user-info", {
                    discordId: id
                }).then((userObject) => {
                    resolve(new Discotron.User(userObject.name, userObject.id, userObject.avatarURL, userObject.discriminator));
                });
            } else {
                resolve(Discotron.User._users[id]);
            }
        });
    }

    /**
     * @static
     * @returns {object} {id: user} all loaded users
     */
    static getAll() {
        return window.Discotron.User._users;
    }
};

window.Discotron.User._users = {}; // id: User