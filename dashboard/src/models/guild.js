window.Discotron.Guild = class extends window.Discotron.GuildModel {
    /**
     * Ctor
     * @param {string} discordId Id of the guild
     * @param {string} name Name of the guild
     * @param {string} iconURL Icon of the guild
     * @param {string} commandPrefix Command prefix
     * @param {array} allowedChannelIds Array of channel ids on which the bot is allowed
     * @param {array} enabledPluginIds Array of plugin ids that are enabled
     * @param {array} admins Array of UserRole who have admin priviledge on the bot
     * @param {object} permissions Associative object binding pluginsIds to userRole array
     */
    constructor(discordId, name, iconURL, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions) {
        super(discordId, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions);

        this._name = name;
        this._iconURL = (iconURL === null) ? "/dashboard/images/outage.png" : iconURL;

        // Load as needed
        this._members = []; // ids
        this._roles = {}; // id: Role
        this._channels = {};

        Discotron.Guild._guilds[discordId] = this;
    }

    /**
     * Get name
     */
    get name() {
        return this._name;
    }

    /**
     * Get icon URL
     */
    get iconURL() {
        return this._iconURL;
    }

    /**
     * Get members
     */
    get members() {
        return this._members;
    }

    /**
     * Get roles
     */
    get roles() {
        return this._roles;
    }

    /**
     * Get channels
     * @returns {Promise}
     */
    getChannels() {
        return new Promise((resolve, reject) => {
            if (Object.keys(this._channels).length === 0) {
                Discotron.Channel.getGuildChannels(this.discordId).then((channels) => {
                    for (let i = 0; i < channels.length; i++) {
                        const channel = channels[i];
                        this._channels[channel.id] = channel;
                    }
                    resolve(this._channels);
                });
            } else {
                resolve(this._channels);
            }
        });
    }

    /**
     * Load members using WebAPI
     * @returns {Promise}
     */
    static _loadMembers() {}

    /**
     * Load roles using WebAPI
     * @returns {Promise}
     */
    static _loadRoles() {
        // Trigger Roles.getGuildRoles
    }


    /**
     * Check if guilds are loaded and return them in a promise
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            if (Object.keys(Discotron.Guild._guilds).length === 0) {
                Discotron.WebAPI.queryBot("discotron-dashboard", "get-guilds-where-is-admin").then((guilds) => {
                    for (const guildId in guilds) {
                        let obj = guilds[guildId];
                        new Discotron.Guild(obj.id, obj.name, obj.image, obj.prefix, new Set(obj.allowedChannelIds), new Set(obj.enabledPluginIds), new Set([]), {});
                    }
                    resolve(Discotron.Guild._guilds);
                });
            } else {
                resolve(Discotron.Guild._guilds);
            }
        });
    }

    /**
     * Returns the roles of the guild
     * @returns {array} Array of Roles
     */
    getRoles() {
        return new Promise((resolve, reject) => {
            // if this.channel is not empty
            //    resolve();
            // else
            // channels.push(Channel.getGuildChannels(this._id))
            // resolve()
            // });
        });
    }

    /**
     * Returns the members of the guild
     * @returns {array} Array of Users
     */
    getMembers() {
        return new Promise((resolve, reject) => {
            // if this.channel is not empty
            //    resolve();
            // else
            // members.push(Channel.getGuildChannels(this._id)) // stores only IDs, Members are saved in Member.getAll()
            // resolve()
            // });
        });
    }

    /**
     * Reloads the guilds
     */
    static clearCache() {
        Discotron.Guild._guilds = {};
    }

    /**
     * Gives dashboard privileges to a user or role
     * @param {UserRole} userRole User or role id which will be given admin privileges
     */
    addAdmin(userRole) {

    }

    /**
     * Removes dashboard privileges to a user or role
     * @param {UserRole} userRole 
     */
    deleteAdmin(userRole) {
        // webapi.querybot("delete-admin-couz");
    }

    /**
     * Set prefix for guild command
     * @param {string} prefix 
     */
    set prefix(prefix) {
        this._commandPrefix = prefix;
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-guild-prefix", {
            prefix: prefix
        }, this.discordId).then(() => {});
    }

    get prefix() {
        return super.commandPrefix;
    }

    /**
     * Set allowed channels
     */
    set allowedChannelIds(allowedChannelIds) {
        this._allowedChannelIds = allowedChannelIds;
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-allowed-channels", {
            allowedChannelIds: allowedChannelIds
        }, this.discordId);
    }

    get allowedChannelIds() {
        return super.allowedChannelIds;
    }

    /**
     * Enable or disable the given plugin
     * @param {string} pluginId Id of the plugin to enable/disable
     * @param {boolean} enabled True if the plugin is to be enabled
     */
    setPluginEnabled(pluginId, enabled) {
        // TODO: update db
    }

    /**
     * Set the users/roles allowed to use the plugin
     * @param {string} pluginId Id of the plugin
     * @param {array} usersRoles Array of UserRoles 
     */
    setPluginPermission(pluginId, usersRoles) {
        // Create new Permission()
        // this._permissions[pluginId] = permission;
        // TODO: query web api
    }
};

window.Discotron.Guild._guilds = {};