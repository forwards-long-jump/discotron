/**
 * Represents a guild, dashboard side
 */
window.discotron.Guild = class extends window.discotron.GuildModel {
    /**
     * @class
     * @param {string} discordId Id of the guild
     * @param {string} name Name of the guild
     * @param {string} iconURL Icon of the guild
     * @param {string} acronym Server acronym, used in case no icon is defined
     * @param {string} commandPrefix Command prefix
     * @param {Array} allowedChannelIds Array of channel ids on which the bot is allowed
     * @param {Array} enabledPlugins Array of plugin ids that are enabled
     * @param {Array} admins Array of UserRole who have admin privilege on the bot
     * @param {object} permissions Object binding pluginsIds to userRole array
     */
    constructor(discordId, name, iconURL, acronym, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions) {
        super(discordId, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions);

        this._name = name;
        this._iconURL = (iconURL === null) ? discotron.utils.generateAcronymIcon(acronym, "#fff", "#4e4e4e") : iconURL;

        // Will be loaded as needed
        this._members = {}; // Id: User
        this._roles = {}; // Id: Role
        this._channels = {}; // Id: Channel

        discotron.Guild._guilds[discordId] = this;
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
        return discotron.WebAPI.queryBot("discotron-dashboard", "get-members", {}, this.discordId).then((users) => {
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                this._members[user.discordId] = new discotron.User(user.name, user.discordId, user.avatar, user.discriminator);
            }
        });
    }

    /**
     * Load roles using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadRoles() {
        return discotron.WebAPI.queryBot("discotron-dashboard", "get-roles", {}, this.discordId).then((roles) => {
            for (let i = 0; i < roles.length; i++) {
                const role = roles[i];
                this._roles[role.discordId] = new discotron.Role(role.name, role.discordId, role.color);
            }
        });
    }

    /**
     * Load channels using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadChannels() {
        return discotron.WebAPI.queryBot("discotron-dashboard", "get-channels", {}, this.discordId).then((channels) => {
            for (let discordId in channels) {
                const channel = channels[discordId];
                this._channels[discordId] = new discotron.Channel(channel.name, channel.discordId, channel.type);
            }
        });
    }

    /**
     * Load guilds using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    static _loadAll() {
        return discotron.WebAPI.queryBot("discotron-dashboard", "get-guilds-where-is-admin").then((guilds) => {
            for (const discordGuildId in guilds) {
                let guild = guilds[discordGuildId];

                let admins = new Set(guild.admins.map((admin) => {
                    return new discotron.UserRole(admin.discordUserId, admin.discordRoleId, guild.discordId);
                }));

                let permissions = {};
                for (const pluginId in guild.permissions) {
                    const permission = guild.permissions[pluginId];
                    let usersRoles = permission.map((userRole) => {
                        return new discotron.UserRole(userRole.discordUserId, userRole.discordRoleId);
                    });
                    permissions[pluginId] = new discotron.Permission(this.discordId, pluginId, usersRoles);
                }

                // Guilds register themselves in window.discotron.Guild._guilds
                new discotron.Guild(guild.discordId, guild.name, guild.image, guild.nameAcronym,
                    guild.prefix, new Set(guild.allowedChannelIds), new Set(guild.enabledPluginIds), new Set(admins), permissions);
            }
        });
    }

    /**
     * Get all guilds the user has access to, load them if necessary
     * @static
     * @returns {Promise} resolve(guilds {array}) guilds: Array of Guild, reject()
     */
    static getAll() {
        return discotron.utils.getOrLoad(discotron.Guild._guilds, () => {
            return discotron.Guild._loadAll();
        });
    }

    /**
     * @returns {Promise} resolve(channels {array}) channels: Array of Channel, reject()
     */
    getChannels() {
        return discotron.utils.getOrLoad(this._channels, () => {
            return this._loadChannels();
        });
    }

    /**
     * @returns {Promise} resolve(roles {array}) roles: Array of Role, reject()
     */
    getRoles() {
        return discotron.utils.getOrLoad(this._roles, () => {
            return this._loadRoles();
        });
    }

    /**
     * @returns {Promise} resolve(members {array}) User: Array of members Ids, reject()
     */
    getMembers() {
        return discotron.utils.getOrLoad(this._members, () => {
            return this._loadMembers();
        });
    }
    /**
     * Clear cache, this will force a reload when guilds are queried again
     * @static
     */
    static clearCache() {
        discotron.Guild._guilds = {};
    }

    /**
     * Gives dashboard privileges to a user or role
     * @param {Array} admins Array of users or roles which will be given admin privileges
     */
    set admins(admins) {
        this._admins = new Set(admins);
        discotron.WebAPI.queryBot("discotron-dashboard", "set-admins", {
            admins: admins
        }, this.discordId);
    }

    /**
     * @returns {Array} Array of userRole with admin privileges
     */
    get admins() {
        return super.admins;
    }

    /**
     * @param {string} prefix New prefix for guild commands
     */
    set prefix(prefix) {
        this._commandPrefix = prefix;
        discotron.WebAPI.queryBot("discotron-dashboard", "set-guild-prefix", {
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
     * @param {Array} allowedChannelIds Array of allowed channel ids
     */
    set allowedChannelIds(allowedChannelIds) {
        this._allowedChannelIds = allowedChannelIds;
        discotron.WebAPI.queryBot("discotron-dashboard", "set-allowed-channels", {
            allowedChannelIds: allowedChannelIds
        }, this.discordId);
    }

    /**
     * @returns {Array} array of allowed channel ids
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
                discotron.Plugin.getAll().then((plugins) => {
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

        discotron.WebAPI.queryBot("discotron-dashboard", "set-plugin-enabled", {
            pluginId: pluginId,
            enabled: enabled
        }, this.discordId);
    }

    /**
     * Set the users/roles allowed to use the plugin
     * @param {string} pluginId Id of the plugin
     * @param {Array} usersRoles Array of UserRoles 
     */
    setPluginPermission(pluginId, usersRoles) {
        this._permissions[pluginId] = new discotron.Permission(this.discordId, pluginId, usersRoles);

        discotron.WebAPI.queryBot("discotron-dashboard", "set-plugin-permission", {
            pluginId: pluginId,
            userRoles: usersRoles
        }, this.discordId);
    }

    /**
     * Get the users/roles allowed to use the plugin
     * @param {string} pluginId ID of the plugin
     * @returns {Array} array of UserRoles
     */
    getPluginPermission(pluginId) {
        let perm = this.permissions[pluginId];
        return perm === undefined ? [] : perm;
    }
};

window.discotron.Guild._guilds = {};