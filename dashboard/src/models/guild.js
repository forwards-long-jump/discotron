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
        this._members = []; // Array of discord user id
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
     * @returns {array} array of members ids
     */
    get members() {
        return this._members;
    }

    /**
     * @returns {object} {roleId: Role, ...}
     */
    get roles() {
        return this._roles;
    }

    /**
     * @returns {object} {channelId: Channel, ...}
     */
    get channels() {
        return this._channels;
    }

    /**
     * @returns {Promise} resolve(channels {array}) channels: Array of Channel, reject()
     */
    getChannels() {
        return new Promise((resolve, reject) => {
            if (Object.keys(this._channels).length === 0) {
                this._loadChannels().then(() => {
                    resolve(this._channels);
                }).catch(console.error);
            } else {
                resolve(this._channels);
            }
        });
    }

    /**
     * Load members using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadMembers() {
        return new Promise((resolve, reject) => {
            return Discotron.User.loadGuildMembers(this.discordId).then((users) => {
                this._members = users;
                resolve();
            });
        });
    }

    /**
     * Load roles using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadRoles() {
        return new Promise((resolve, reject) => {
            return Discotron.Role.getGuildRoles(this.discordId).then((roles) => {
                for (let i = 0; i < roles.length; ++i) {
                    const role = roles[i];
                    this._roles[role.id] = role;
                }
                resolve();
            });
        });
    }

    /**
     * Load channels using the WebAPI
     * @returns {Promise} resolve(), reject()
     */
    _loadChannels() {
        return new Promise((resolve, reject) => {
            return Discotron.WebAPI.queryBot("discotron-dashboard", "get-channels", {}, this.discordId).then((serializedChannels) => {
                for (let i = 0; i < serializedChannels.length; i++) {
                    const channel = serializedChannels[i];
                    this._channels[channel.id] = new Discotron.Channel(channel.name, channel.id, channel.type);
                }
                resolve();
            });
        });
    }


    /**
     * Get all guilds, load them if necessary
     * @static
     * @returns {Promise} resolve(guilds {array}) guilds: Array of Guild, reject()
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            if (Object.keys(Discotron.Guild._guilds).length === 0) {
                return Discotron.WebAPI.queryBot("discotron-dashboard", "get-guilds-where-is-admin").then((guilds) => {
                    for (const discordGuildId in guilds) {
                        let obj = guilds[discordGuildId];

                        let admins = new Set(obj.admins.map((admin) => {
                            return new Discotron.UserRole(admin.id, admin.type);
                        }));

                        let permissions = {};
                        for (const pluginId in obj.permissions) {
                            const permission = obj.permissions[pluginId];
                            let usersRoles = permission.map((ur) => {
                                return new Discotron.UserRole(ur.id, ur.type);
                            });
                            permissions[pluginId] = new Discotron.Permission(this.discordId, pluginId, usersRoles);
                        }

                        new Discotron.Guild(obj.id, obj.name, obj.image, obj.nameAcronym, obj.prefix, new Set(obj.allowedChannelIds), new Set(obj.enabledPluginIds), new Set(admins), permissions);
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