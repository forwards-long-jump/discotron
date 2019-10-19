/**
 * Represents a guild, dashboard side
 */
window.Discotron.Guild = class extends window.Discotron.GuildModel {
    /**
     * @constructor
     * @param {string} discordId Id of the guild
     * @param {string} name Name of the guild
     * @param {string} iconURL Icon of the guild
     * @param {string} acronym Server acronym, used in case no icon is defined
     * @param {string} commandPrefix Command prefix
     * @param {array} allowedChannelIds Array of channel ids on which the bot is allowed
     * @param {array} enabledPluginIds Array of plugin ids that are enabled
     * @param {array} admins Array of UserRole who have admin privilege on the bot
     * @param {object} permissions Object binding pluginsIds to userRole array
     */
    constructor(discordId, name, iconURL, acronym, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions) {
        super(discordId, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions);

        this._name = name;
        this._iconURL = (iconURL === null) ? Discotron.utils.generateAcronymIcon(acronym, "#fff", "#4e4e4e") : iconURL;

        // Will be loaded as needed
        this._members = {}; // Id: User
        this._roles = {}; // Id: Role
        this._channels = {}; // Id: Channel

        Discotron.Guild._guilds[discordId] = this;
    }

    /**
     * @returns {string} name
     */
    get name() {
        return this._name;
    }

    /**
     * @returns {string} iconURL
     */
    get iconURL() {
        return this._iconURL;
    }

    /**
     * Load members using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadMembers() {
        return Discotron.WebAPI.queryBot("discotron-dashboard", "get-members", {}, this.discordId).then((users) => {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                this._members[user.discordId] = new Discotron.User(user.name, user.discordId, user.avatar, user.discriminator);
            }
        });
    }

    /**
     * Load roles using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadRoles() {
        return Discotron.WebAPI.queryBot("discotron-dashboard", "get-roles", {}, this.discordId).then((roles) => {
            for (let i = 0; i < roles.length; i++) {
                const role = roles[i];
                this._roles[role.discordId] = new Discotron.Role(role.name, role.discordId, role.color);
            }
        });
    }
    
    /**
     * Load channels using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadChannels() {
        return Discotron.WebAPI.queryBot("discotron-dashboard", "get-channels", {}, this.discordId).then((channels) => {
            for (let discordId in channels) {
                const channel = channels[discordId];
                this._channels[discordId] = new Discotron.Channel(channel.name, channel.discordId, channel.type);
            }
        });
    }

    /**
     * Load guilds using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    static _loadAll() {
        return Discotron.WebAPI.queryBot("discotron-dashboard", "get-guilds-where-is-admin").then((guilds) => {
            for (const discordGuildId in guilds) {
                let obj = guilds[discordGuildId];

                let admins = new Set(obj.admins.map((admin) => {
                    return new Discotron.UserRole(admin.discordId, admin.type);
                }));

                let permissions = {};
                for (const pluginId in obj.permissions) {
                    const permission = obj.permissions[pluginId];
                    let usersRoles = permission.map((userRole) => {
                        return new Discotron.UserRole(userRole.discordId, userRole.type);
                    });
                    permissions[pluginId] = new Discotron.Permission(this.discordId, pluginId, usersRoles);
                }

                // Guilds register themselves in window.Discotron.Guild._guilds
                new Discotron.Guild(obj.discordId, obj.name, obj.image, obj.nameAcronym,
                    obj.prefix, new Set(obj.allowedChannelIds), new Set(obj.enabledPluginIds), new Set(admins), permissions);
            }
        });
    }

    /**
     * Get all guilds the user has access to, load them if necessary
     * @static
     * @returns {Promise} resolve(guilds {array}) guilds: Array of Guild, reject()
     */
    static getAll() {
        return Discotron.utils.getOrLoad(Discotron.Guild._guilds, () => {
            return Discotron.Guild._loadAll();
        });
    }

    /**
     * @returns {Promise} resolve(channels {array}) channels: Array of Channel, reject()
     */
    getChannels() {
        return Discotron.utils.getOrLoad(this._channels, () => {
            return this._loadChannels();
        });
    }

    /**
     * @returns {Promise} resolve(roles {array}) roles: Array of Role, reject()
     */
    getRoles() {
        return Discotron.utils.getOrLoad(this._roles, () => {
            return this._loadRoles();
        });
    }

    /**
     * @returns {Promise} resolve(members {array}) User: Array of members Ids, reject()
     */
    getMembers() {
        return Discotron.utils.getOrLoad(this._members, () => {
            return this._loadMembers();
        });
    }
    /**
     * Clear cache, this will force a reload when guilds are queried again
     * @static
     */
    static clearCache() {
        Discotron.Guild._guilds = {};
    }

    /**
     * Gives dashboard privileges to a user or role
     * @param {array} admins Array of users or roles which will be given admin privileges
     */
    set admins(admins) {
        this._admins = new Set(admins);
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-admins", {
            admins: admins
        }, this.discordId);
    }

    /**
     * @returns {array} Array of userRole with admin privileges
     */
    get admins() {
        return super.admins;
    }

    /**
     * @param {string} prefix New prefix for guild commands
     */
    set prefix(prefix) {
        this._commandPrefix = prefix;
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-guild-prefix", {
            prefix: prefix
        }, this.discordId).catch(console.error);
    }

    /**
     * @returns {string} command prefix
     */
    get prefix() {
        return super.commandPrefix;
    }

    /**
     * Set allowed channels
     * @param {array} allowedChannelIds Array of allowed channel ids
     */
    set allowedChannelIds(allowedChannelIds) {
        this._allowedChannelIds = allowedChannelIds;
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-allowed-channels", {
            allowedChannelIds: allowedChannelIds
        }, this.discordId);
    }

    /**
     * @returns {array} array of allowed channel ids
     */
    get allowedChannelIds() {
        return super.allowedChannelIds;
    }

    /**
     * Enable or disable the given plugin
     * @param {string} pluginId Id of the plugin to enable/disable
     * @param {boolean} enabled True if the plugin is to be enabled
     */
    setPluginEnabled(pluginId, enabled) {
        if (this._enabledPlugins.size === 0) {
            if (!enabled) {
                Discotron.Plugin.getAll().then((plugins) => {
                    for (let pluginId_ in plugins) {
                        if (pluginId_ !== pluginId) {
                            this._enabledPlugins.add(pluginId_);
                        }
                    }
                }).catch(console.error);
            } else {
                // should not happen
            }
        } else {
            if (enabled) {
                this._enabledPlugins.add(pluginId);
            } else {
                this._enabledPlugins.delete(pluginId);
            }
        }

        Discotron.WebAPI.queryBot("discotron-dashboard", "set-plugin-enabled", {
            pluginId: pluginId,
            enabled: enabled
        }, this.discordId);
    }

    /**
     * Set the users/roles allowed to use the plugin
     * @param {string} pluginId Id of the plugin
     * @param {array} usersRoles Array of UserRoles 
     */
    setPluginPermission(pluginId, usersRoles) {
        let permission = new Discotron.Permission(this.discordId, pluginId, usersRoles);
        this._permissions[pluginId] = permission;

        Discotron.WebAPI.queryBot("discotron-dashboard", "set-plugin-permission", {
            pluginId: pluginId,
            userRoles: usersRoles
        }, this.discordId);
    }

    /**
     * Get the users/roles allowed to use the plugin
     * @param {string} pluginId ID of the plugin
     * @returns {array} array of UserRoles
     */
    getPluginPermission(pluginId) {
        let perm = this.permissions[pluginId];
        return perm === undefined ? [] : perm;
    }
};

window.Discotron.Guild._guilds = {};