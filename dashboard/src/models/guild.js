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
    _loadMembers() {
        return new Promise((resolve, reject) => {
            Discotron.User.loadGuildMembers(this.discordId).then((users) => {
                this._members = users;
                resolve();
            });
        });
    }

    /**
     * Load roles using WebAPI
     * @returns {Promise}
     */
    _loadRoles() {
        return new Promise((resolve, reject) => {
            Discotron.Role.getGuildRoles(this.discordId).then((roles) => {
                for (let i = 0; i < roles.length; ++i) {
                    const role = roles[i];
                    this._roles[role.id] = role;
                }
                resolve();
            });
        });
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

                        let guild = new Discotron.Guild(obj.id, obj.name, obj.image, obj.prefix, new Set(obj.allowedChannelIds), new Set(obj.enabledPluginIds), new Set(admins), permissions);
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
     * @param {array} admins Array of users or roles which will be given admin privileges
     */
    set admins(admins) {
        this._admins = new Set(admins);
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-admins", {
            admins: admins
        }, this.discordId);
    }

    /**
     * Returns the users and roles that have admin privileges
     */
    get admins() {
        return super.admins;
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
        // si le set vide => tous activé
        // => on call disabled
        if (this._enabledPlugins.size === 0) {
            if (!enabled) {
                Discotron.Plugin.getAll().then((plugins) => {
                    for (let pluginId_ in plugins) {
                        const plugin = plugins[pluginId];
                        if (pluginId_ !== pluginId) {
                            this._enabledPlugins.add(pluginId_);
                        }
                    }
                });
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
     */
    getPluginPermission(pluginId) {
        let perm = this.permissions[pluginId];
        return perm === undefined ? [] : perm;
    }
};

window.Discotron.Guild._guilds = {};