const GuildModel = require("./../../models/guild.js");
const UserRole = require("./user-role.js");
const Permission = require("./permission.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const db = require("./../apis/database-crud.js");

class Guild extends GuildModel {
    /**
     * Ctor
     * @param {string} discordId ID of the discord guild 
     */
    constructor(discordId) {
        super(discordId);
        
        global.discotron.on("plugin-loaded", (pluginId) => {this.onPluginLoaded(pluginId);});
        global.discotron.on("plugin-deleted", (pluginId) => {this.onPluginDeleted(pluginId);});
        
        this._loadPrefix();
        this._loadAdminsFromDatabase();
        this._loadAllowedChannels();
        this._loadEnabledPlugins();

        Guild._guilds[discordId] = this;
    }

    /**
     * Returns the Guild with the given ID
     * @param {string} discordId 
     */
    static get(discordId) {
        return Guild._guilds[discordId];
    }

    /**
     * Returns all guilds
     */
    static getAll() {
        return Guild._guilds;
    }

    /**
     * Returns whether the given client ID is a bot admin on the guild
     * @param {string} clientId 
     */
    isAdmin(clientId) {
        this.admins.forEach((admin) => {
            if (admin.describes(clientId)) {
                return true;
            }
        });
        return false;
    }

    /**
     * Returns whether the given user is a bot admin on the given guild
     * @param {string} clientId ID of the client
     * @param {string} guildId ID of the guild
     * @returns {boolean} True if the client is bot admin on the guild
     */
    static isGuildAdmin(clientId, guildId) {
        return Guild.get(guildId).isAdmin(clientId);
    }

    /**
     * Adds a bot admin to the guild
     * @param {array} usersRoles Array of UserRole 
     */
    set admins(usersRoles) {
        this._admins = new Set(usersRoles);

        db.delete("Admins", {
            discordGuildId: this.discordId
        });
        for (let i = 0; i < usersRoles.length; ++i) {
            const userRole = usersRoles[i];
            db.insert("Admins", {
                discordGuildId: this.discordId,
                userRoleId: userRole.getId()
            });
        }
    }

    /**
     * Loads members of the guild with admin privilege
     */
    loadDiscordAdmins() {
        // TODO: implement this using the discord.js api
        /*
        let admin = new UserRole(discordGuild.ownerId, "user");
        this._admins.push(admin)
        for (role in guild.roles) {
            if (role.hasPermission(admin)) {
                let role = new UserRole(role.id, "role")
                this._admins.push(role)
            }
        }
        */
    }


    /**
     * Set bot prefix on the guild
     * @param {string} prefix 
     */
    set prefix(prefix) {
        this._prefix = prefix;
        db.update("GuildSettings", {
            prefix: prefix
        }, {
            discordGuildId: this.discordId
        });
    }

    /**
     * Set allowed channels
     * @param {array} discordChannelIds 
     */
    set allowedChannels(discordChannelIds) {
        this._allowedChannelIds = new Set(discordChannelIds);
        db.delete("AllowedChannels", {
            discordGuildId: this.discordId
        });
        for (let i = 0; i < discordChannelIds.length; ++i) {
            db.insert("AllowedChannels", {
                discordGuildId: this.discordId,
                discordChannelId: discordChannelIds[i]
            });
        }
    }

    /**
     * Returns whether the plugin is enabled in this guild
     * @param {string} pluginId ID of the plugin
     * @returns {boolean} True if the plugin is enabled in the guild
     */
    isPluginEnabled(pluginId) {
        return this.enabledPlugins.has(pluginId);
    }

    /**
     * Set whether the given plugin is enabled on the guild
     * @param {string} pluginId 
     * @param {boolean} enabled 
     */
    setPluginEnabled(pluginId, enabled) {
        if (enabled) {
            this._enabledPlugins.add(pluginId);
            db.insert("GuildEnabledPlugins", {
                pluginId: pluginId,
                discordGuildId: this.discordId
            });
        } else {
            this._enabledPlugins.delete(pluginId);
            db.delete("GuildEnabledPlugins", {
                pluginId: pluginId,
                discordGuildId: this.discordId
            });
        }
    }

    /**
     * Set the set of users and roles allowed to use the given plugin
     * @param {string} pluginId 
     * @param {array} userRoles 
     */
    setPluginPermission(pluginId, userRoles) {
        this._permissions[pluginId]._usersRoles = userRoles;

        db.delete("Permissions", {
            discordGuildId: this.discordId,
            pluginId: pluginId
        });

        for (let i = 0; i < userRoles.length; ++i) {
            db.insert("Permissions", {
                discordGuildId: this.discordId,
                pluginId: pluginId,
                userRoleId: userRoles[i].getId()
            });
        }
    }

    /**
     * Called after a plugin is loaded
     * @param {string} pluginId 
     */
    onPluginLoaded(pluginId) {
        this._loadPluginPermission(pluginId);
    }

    /**
     * Called before a plugin is deleted
     * @param {string} pluginId 
     */
    onPluginDeleted(pluginId) {
        delete this.permissions[pluginId];
        this._enabledPlugins.delete(pluginId);
    }

    /**
     * Load plugin permissions from database
     * @param {string} pluginId 
     */
    _loadPluginPermission(pluginId) {
        this._permissions[pluginId] = new Permission(this.discordId, pluginId, []);
        db.select("Permissions", ["userRoleId"], {
            discordGuildId: this.discordId,
            pluginId: pluginId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                const userRole = UserRole.getById(rows[i].userRoleId);
                this._permissions[pluginId]._usersRoles.push(userRole);
            }
        });
    }

    /**
     * Load plugins enabled on this guild from database
     */
    _loadEnabledPlugins() {
        db.select("GuildEnabledPlugins", ["pluginId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._enabledPlugins.add(rows[i].pluginId);
            }
        });
    }

    /**
     * Load allowed channels from database
     */
    _loadAllowedChannels() {
        db.select("AllowedChannels", ["discordChannelId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._allowedChannelIds.add(rows[i].discordChannelId);
            }
        });
    }

    /**
     * Load prefix from database, insert default value in db if none found
     */
    _loadPrefix() {
        db.select("GuildSettings", ["prefix"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            if (rows.length > 0) {
                this._prefix = rows[0].prefix;
            } else {
                db.insert("GuildSettings", {
                    discordGuildId: this.discordId,
                    prefix: "!"
                });
            }
        });

    }

    /**
     * Loads admins from db, inserts default values if none found
     */
    _loadAdminsFromDatabase() {
        db.select("Admins", ["userRoleId"], {
            discordGuildId: this.discordId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._admins.add(UserRole.getById(rows[i].userRoleId));
            }
        });
    }

    /**
     * Removes the guild from the database
     */
    delete() {
        db.delete("Admins", {
            discordGuildId: this.discordId
        });
        db.delete("AllowedChannels", {
            discordGuildId: this.discordId
        });
        db.delete("GuildSettings", {
            discordGuildId: this.discordId
        });
        db.delete("GuildEnabledPlugins", {
            discordGuildId: this.discordId
        });
        db.delete("Permissions", {
            discordGuildId: this.discordId
        });

        delete Guild._guilds[this.discordId];
    }

    static registerActions() {
        webAPI.registerAction("get-guilds", (data, reply) => {
            reply(Guild._guilds.map(guild => guild.toObject()));
        }, "guildAdmin");
        webAPI.registerAction("get-members", (data, reply) => {
            // TODO : need to access discord API
        }, "guildAdmin");
        webAPI.registerAction("get-roles", (data, reply) => {
            // TODO : need to access discord API
        }, "guildAdmin");
        webAPI.registerAction("get-channels", (data, reply) => {
            // TODO : need to access discord API
        }, "guildAdmin");
        webAPI.registerAction("get-guild-where-is-admin", (data, reply, userId) => {
            let guilds = Guild._guilds.filter(guild => guild.isAdmin(userId));
            reply(guilds.map(guild => guild.toObject()));
        });
        
        webAPI.registerAction("get-allowed-channels", (data, reply) => {
            reply(Guild.get(data.guildId).allowedChannels);
        }, "guildAdmin");
        webAPI.registerAction("set-allowed-channels", (data, reply) => {
            Guild.get(data.guildId).allowedChannels = data.allowedChannels;
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-plugin-enabled", (data, reply) => {
            reply(Guild.get(data.guildId).isPluginEnabled(data.pluginId));
        }, "guildAdmin");
        webAPI.registerAction("set-plugin-enabled", (data, reply) => {
            Guild.get(data.guildId).setPluginEnabled(data.pluginId, data.enabled);
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-plugin-permission", (data, reply) => {
            reply(Guild.get(data.guildId).permissions[data.pluginId]);
        }, "guildAdmin");
        webAPI.registerAction("set-plugin-permission", (data, reply) => {
            Guild.get(data.guildId).setPluginPermission(data.pluginId, data.userRoles);
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-guild-prefix", (data, reply) => {
            reply(Guild.get(data.guildId).prefix);
        }, "guildAdmin");
        webAPI.registerAction("set-guild-prefix", (data, reply) => {
            Guild.get(data.guildId).prefix = data.prefix;
            reply();
        }, "guildAdmin");

        webAPI.registerAction("get-admins", (data, reply) => {
            reply(Guild.get(data.guildId).admins);
        }, "guildAdmin");
        webAPI.registerAction("set-admins", (data, reply) => {
            Guild.get(data.guildId).admins = data.admins;
            reply();
        }, "guildAdmin");
    }
}

Guild._guilds = {};

module.exports = Guild;