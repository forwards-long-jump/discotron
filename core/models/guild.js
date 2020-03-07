const GuildModel = require("./../../shared-models/guild.js");
const UserRole = require("./user-role.js");
const Permission = require("./permission.js");
const webAPI = require("../../dashboard/backend/api.js").getWebAPI("discotron-dashboard");
const Plugin = require("./plugin.js");
const db = require("./../database/crud.js");
const Logger = require("../utils/logger.js");
const discordClientProvider = require("./../utils/discord-client-provider.js");

/**
 * Discotron guild containing info related to a Discord guild
 */
class Guild extends GuildModel {
    /**
     * @class
     * @param {string} discordId Discord guild id
     */
    constructor(discordId) {
        super(discordId);

        global.discotron.on("plugin-loaded", (pluginId) => {
            this.onPluginLoaded(pluginId);
        });

        global.discotron.on("plugin-deleted", (pluginId) => {
            this.onPluginDeleted(pluginId);
        });

        this._tryAdd().then(() => {
            return this._loadGuildSettings();
        }).then(() => {
            return this._loadAdminsFromDatabase();
        }).then(() => {
            return this._loadAllowedChannels();
        }).then(() => {
            return this._loadEnabledPlugins();
        }).catch(Logger.err);

        Guild._guilds[discordId] = this;
    }

    /**
     * @static
     * @param {string} discordId Discord guild id
     * @returns {Guild} Discotron guild with the given discord guild id
     */
    static get(discordId) {
        return Guild._guilds[discordId];
    }

    /**
     * @static
     * @returns {Array} Array of Guild
     */
    static getAll() {
        return Guild._guilds;
    }

    /**
     * @returns {object} Object containing {id, prefix, name, nameAcronym, image, allowedChannelIds, enabledPluginIds, admins, permissions}
     */
    toObject() {
        let guild = discordClientProvider.get().guilds.get(this.discordId);
        let permissions = {};
        for (const pluginId in this.permissions) {
            const permission = this.permissions[pluginId];
            permissions[pluginId] = permission.toObject();
        }
        return {
            discordId: this.discordId,
            prefix: this.commandPrefix,
            name: guild.name,
            nameAcronym: guild.nameAcronym,
            image: guild.iconURL,
            allowedChannelIds: Array.from(this.allowedChannelIds),
            enabledPluginIds: Array.from(this.enabledPlugins),
            admins: Array.from(this._admins).map((userRole) => {
                return userRole.toObject();
            }),
            permissions: permissions
        };
    }

    /**
     * @param {string} discordUserId Discord user id
     * @returns {boolean} Whether the given user id is a bot admin on the guild
     */
    isAdmin(discordUserId) {
        let isAdmin = false;
        this._admins.forEach((admin) => {
            if (admin.describes(discordUserId)) {
                isAdmin = true;
                return false;
            }
        });

        if (isAdmin) {
            // Can quit early
            return true;
        }

        this._discordAdmins.forEach((admin) => {
            if (admin.describes(discordUserId)) {
                isAdmin = true;
                return false;
            }
        });
        return isAdmin;
    }

    /**
     * @static
     * @param {string} discordUserId Discord user id
     * @param {string} discordGuildId Discord gulid id
     * @returns {boolean} True if the user is bot admin on the guild
     */
    static isGuildAdmin(discordUserId, discordGuildId) {
        return Guild.get(discordGuildId).isAdmin(discordUserId);
    }

    /**
     * Adds a bot admin to the guild
     * @param {Array} usersRoles Array of UserRole 
     */
    set admins(usersRoles) {
        // TODO: Handle role validity
        // Note : the users / roles we receive come from the dashboard, and as such do not have the discordGuildId attribute set
        usersRoles = usersRoles.map((ur) => {
            return new UserRole(ur._discordUserId, ur._discordRoleId, this.discordId);
        });
        for (let i = 0; i < usersRoles.length; i++) {
            const userRole = usersRoles[i];
            usersRoles[i] = new UserRole(userRole._discordUserId, userRole._discordRoleId, this.discordId);
        }

        this._admins = new Set(usersRoles);

        db.delete("Admins", {
            discordGuildId: this.discordId
        }).then(() => {
            let promises = [];

            for (let i = 0; i < usersRoles.length; ++i) {
                const userRole = usersRoles[i];
                // TODO: Do only one query, update without deleting everything
                promises.push(userRole.getId().then((id) => {
                    return db.insert("Admins", {
                        discordGuildId: this.discordId,
                        userRoleId: id
                    });
                }));
            }

            return Promise.all(promises);
        }).catch(Logger.err);
    }

    /**
     * @returns {Array} List of admins for this guild
     */
    get admins() {
        return super.admins;
    }

    /**
     * Load guild admins from Discord
     */
    loadDiscordAdmins() {
        // TODO: Refresh that when it changes on Discord
        this._discordAdmins = new Set([]);

        let guild = discordClientProvider.get().guilds.get(this.discordId);
        let admin = new UserRole(guild.ownerID, null, this.discordId);
        this._discordAdmins.add(admin);

        let roles = guild.roles.array();
        for (let i = 0; i < roles.length; ++i) {
            const role = roles[i];
            if (role.hasPermission("ADMINISTRATOR")) {
                let userRole = new UserRole(null, role.id, this.discordId);
                this._discordAdmins.add(userRole);
            }
        }
    }


    /**
     * @param {string} prefix prefix for a guild, save it in the database
     */
    set commandPrefix(prefix) {
        this._commandPrefix = prefix;
        db.update("GuildSettings", {
            prefix: prefix
        }, {
            discordGuildId: this.discordId
        }).catch(Logger.err);
    }

    /**
     * @returns {string} Command prefix
     */
    get commandPrefix() {
        return super.commandPrefix;
    }

    /**
     * Set allowed channels
     * @param {Array} discordChannelIds List of Discord channel ids
     */
    set allowedChannelIds(discordChannelIds) {
        this._allowedChannelIds = new Set(discordChannelIds);

        db.delete("AllowedChannels", {
            discordGuildId: this.discordId
        }).then(() => {
            for (let i = 0; i < discordChannelIds.length; ++i) {
                return db.insert("AllowedChannels", {
                    discordGuildId: this.discordId,
                    discordChannelId: discordChannelIds[i]
                });
            }
        }).catch(Logger.err);
    }

    /**
     * @returns {Array} List of Discord channel ids
     */
    get allowedChannelIds() {
        return super.allowedChannelIds;
    }

    /**
     * @param {string} pluginId ID of the plugin
     * @returns {boolean} True if the plugin is enabled in the guild
     */
    isPluginEnabled(pluginId) {
        return this.enabledPlugins.has(pluginId);
    }

    /**
     * Set whether the given plugin is enabled on the guild
     * @param {string} pluginId plugin id
     * @param {boolean} enabled enabled
     * @returns {Promise} Promise resolves once plugin fully enabled (database operation completed).
     */
    setPluginEnabled(pluginId, enabled) {
        if (this._enabledPlugins.size === 0) {
            if (!enabled) {
                for (let pluginId_ in Plugin.getAll()) {
                    if (pluginId !== pluginId_) {
                        this._enabledPlugins.add(pluginId_);
                    }
                }
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

        return db.delete("GuildEnabledPlugins", {
            discordGuildId: this.discordId
        }).then(() => {
            let promises = [];
            this._enabledPlugins.forEach((element) => {
                promises.push(db.insert("GuildEnabledPlugins", {
                    pluginId: element,
                    discordGuildId: this.discordId
                }));
            });
            return Promise.all(promises);
        }).catch(Logger.err);
    }

    /**
     * Set the set of users and roles allowed to use the given plugin
     * @param {string} pluginId plugin id
     * @param {Array} userRoles Array of UserRole
     * @returns {Promise} Promise resolves once plugin permissions fully set (database operation completed).
     */
    setPluginPermission(pluginId, userRoles) {
        this._permissions[pluginId]._usersRoles = userRoles;

        // TODO: Do only one query, do not delete to update everything one by one
        return db.delete("Permissions", {
            discordGuildId: this.discordId,
            pluginId: pluginId
        }).then(() => {
            let promises = [];
            for (let i = 0; i < userRoles.length; ++i) {
                promises.push(userRoles[i].getId().then((id) => {
                    return db.insert("Permissions", {
                        discordGuildId: this.discordId,
                        pluginId: pluginId,
                        userRoleId: id
                    });
                }));
            }
            return Promise.all(promises);
        }).catch(Logger.err);
    }

    /**
     * Must be called after a plugin is loaded
     * @param {string} pluginId that was loaded
     */
    onPluginLoaded(pluginId) {
        this._loadPluginPermission(pluginId);
    }

    /**
     * Must be called before a plugin is deleted
     * @param {string} pluginId plugin id
     */
    onPluginDeleted(pluginId) {
        delete this.permissions[pluginId];
        this._enabledPlugins.delete(pluginId);
    }

    /**
     * Load plugin permissions from database
     * @param {string} pluginId plugin id
     * @returns {Promise} Promise resolves once plugin permissions are loaded (database operation completed).
     */
    _loadPluginPermission(pluginId) {
        this._permissions[pluginId] = new Permission(this.discordId, pluginId, []);
        // TODO: Fix n + 1 query here
        return db.select("Permissions", ["userRoleId"], {
            discordGuildId: this.discordId,
            pluginId: pluginId
        }).then((rows) => {
            let promises = [];
            const pluginPermission = this._permissions[pluginId];

            for (let i = 0; i < rows.length; ++i) {
                promises.push(UserRole.getById(rows[i].userRoleId, this.discordId).then((userRole) => {
                    pluginPermission._usersRoles.push(userRole);
                }));
            }

            return Promise.all(promises);
        });
    }

    /**
     * Load plugins enabled on this guild from database
     * @returns {Promise} Promise resolves once plugin enabled list is loaded (database operation completed).
     */
    _loadEnabledPlugins() {
        return db.select("GuildEnabledPlugins", ["pluginId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._enabledPlugins.add(rows[i].pluginId);
            }
        });
    }

    /**
     * Load allowed channels from database
     * @returns {Promise} Promise resolves once list of allowed channels is loaded (database operation completed).
     */
    _loadAllowedChannels() {
        return db.select("AllowedChannels", ["discordChannelId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._allowedChannelIds.add(rows[i].discordChannelId);
            }
        });
    }

    /**
     * Load guild settings from database
     * @returns {Promise} Promise resolves once guild settings are loaded (database operation completed).
     */
    _loadGuildSettings() {
        return db.select("GuildSettings", ["prefix"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            if (rows.length > 0) {
                this._commandPrefix = rows[0].prefix;
            } else {
                return Promise.reject(new Error("GuildSettings not found"));
            }
        });
    }

    /**
     * Loads admins from db, inserts default values if none found
     * @returns {Promise} Promise resolves once admin list is loaded (database operation completed).
     */
    _loadAdminsFromDatabase() {
        // TODO: Fix n + 1 query here
        return db.select("Admins", ["userRoleId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            let promises = [];
            for (let i = 0; i < rows.length; ++i) {
                promises.push(UserRole.getById(rows[i].userRoleId, this.discordId).then((userRole) => {
                    this._admins.add(userRole);
                }));
            }
            return Promise.all(promises);
        });
    }

    /**
     * Removes the guild from the database
     * @returns {Promise} Promise resolves once database operation completed.
     */
    delete() {
        return db.delete("Guilds", {
            discordGuildId: this.discordId
        }).then(() => {
            delete Guild._guilds[this.discordId];
        }).catch(Logger.err);
    }

    /**
     * Called when guild is first discovered by Discotron and added to the database.
     * @returns {Promise} Promise resolves once database operation completed.
     */
    _tryAdd() {
        return db.select("Guilds", ["discordGuildId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            if (rows.length === 0) {
                // Newly discovered guild, add to database
                Logger.log("Discord guild with id **" + this.discordId + "** added to database.");
                return db.insert("Guilds", {
                    discordGuildId: this.discordId
                }).then(() => db.insert("GuildSettings", {
                    discordGuildId: this.discordId
                }));
            }
        });
    }

    /**
     * Register WebAPI actions related to a guild
     * @static
     */
    static registerActions() {
        webAPI.registerAction("get-guilds", (data, reply, discordUserId, discordGuildId) => {
            let guilds = {};
            for (const discordGuildId in Guild.getAll()) {
                guilds[discordGuildId] = Guild.get(discordGuildId).toObject();
            }
            reply(guilds);
        }, "guildAdmin");

        webAPI.registerAction("get-members", (data, reply, discordUserId, discordGuildId) => {
            let guild = discordClientProvider.get().guilds.get(discordGuildId);
            let members = guild.members;
            reply(members.map(member => {
                return {
                    discordId: member.user.id,
                    name: member.user.username,
                    discriminator: member.user.discriminator,
                    avatar: member.user.displayAvatarURL
                };
            }));
        }, "guildAdmin");

        webAPI.registerAction("get-roles", (data, reply, discordUserId, discordGuildId) => {
            let guild = discordClientProvider.get().guilds.get(discordGuildId);
            reply(guild.roles.map((role) => {
                return {
                    discordId: role.id,
                    name: role.name,
                    color: role.hexColor
                };
            }));
        }, "guildAdmin");

        webAPI.registerAction("get-channels", (data, reply, discordUserId, discordGuildId) => {
            let guild = discordClientProvider.get().guilds.get(discordGuildId);
            reply(guild.channels.map((channel) => {
                return {
                    discordId: channel.id,
                    name: channel.name,
                    type: channel.type
                };
            }));
        }, "guildAdmin");

        webAPI.registerAction("get-guilds-where-is-admin", (data, reply, discordUserId) => {
            let guilds = [];
            for (const discordGuildId in Guild._guilds) {
                const guild = Guild.get(discordGuildId);
                if (guild.isAdmin(discordUserId)) {
                    guilds.push(guild.toObject());
                }
            }
            reply(guilds);
        });

        webAPI.registerAction("get-allowed-channels", (data, reply, discordUserId, discordGuildId) => {
            reply(Guild.get(discordGuildId).allowedChannelIds);
        }, "guildAdmin");

        webAPI.registerAction("set-allowed-channels", (data, reply, discordUserId, discordGuildId) => {
            Guild.get(discordGuildId).allowedChannelIds = data.allowedChannelIds;
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-plugin-enabled", (data, reply, discordUserId, discordGuildId) => {
            reply(Guild.get(discordGuildId).isPluginEnabled(data.pluginId));
        }, "guildAdmin");

        webAPI.registerAction("set-plugin-enabled", (data, reply, discordUserId, discordGuildId) => {
            Guild.get(discordGuildId).setPluginEnabled(data.pluginId, data.enabled);
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-plugin-permission", (data, reply, discordUserId, discordGuildId) => {
            reply(Guild.get(discordGuildId).permissions[data.pluginId].toObject());
        }, "guildAdmin");

        webAPI.registerAction("set-plugin-permission", (data, reply, discordUserId, discordGuildId) => {
            let usersRoles = data.userRoles.map((ur) => {
                return new UserRole(ur._discordUserId, ur._discordRoleId, discordGuildId);
            });
            Guild.get(discordGuildId).setPluginPermission(data.pluginId, usersRoles);
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-guild-prefix", (data, reply, discordUserId, discordGuildId) => {
            reply(Guild.get(discordGuildId).commandPrefix);
        }, "guildAdmin");

        webAPI.registerAction("set-guild-prefix", (data, reply, discordUserId, discordGuildId) => {
            Guild.get(discordGuildId).commandPrefix = data.prefix;
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-admins", (data, reply, discordUserId, discordGuildId) => {
            reply(Array.from(Guild.get(discordGuildId).admins));
        }, "guildAdmin");

        webAPI.registerAction("set-admins", (data, reply, discordUserId, discordGuildId) => {
            Guild.get(discordGuildId).admins = data.admins;
            reply();
        }, "guildAdmin");
    }
}

Guild._guilds = {};

module.exports = Guild;