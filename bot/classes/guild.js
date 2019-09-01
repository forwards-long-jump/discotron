const GuildModel = require("./../../models/guild.js");
const UserRole = require("./user-role.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const db = require("./../apis/database-crud.js");

class Guild extends GuildModel {
    /**
     * Ctor
     * @param {string} discordId ID of the discord guild 
     */
    constructor(discordId) {
        super(discordId);
        this._loadPrefix();
        this._loadAllowedChannels();
        this._loadEnabledPlugins();

        Guild._guilds[discordId] = this;
        // discotron.registerEvent(this.onPluginLoaded);
    }

    /**
     * Returns the Guild with the given ID
     * @param {string} discordId 
     */
    static get(discordId) {
        return Guild._guilds[discordId];
    }

    /**
     * Returns whether the given client ID is a bot admin on the guild
     * @param {string} clientId 
     */
    isAdmin(clientId) {
        // TODO: Check user role and check if it has admin permission
        for (let i = 0; i < this._admins.length; ++i) {
            if (this._admins[i].describes(clientId)) {
                return true;
            }
        }
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
    setAdmins(usersRoles) {
        this._admins = usersRoles;

        db.delete("Admins", {
            discordGuildId: this.guildId
        });
        for (let i = 0; i < usersRoles.length; ++i) {
            const userRole = usersRoles[i];
            db.insert("Admins", {
                discordGuildId: this.guildId,
                userRoleId: userRole.getId()
            });
        }
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
        this._allowedChannelIds = discordChannelIds;
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
        return this.enabledPlugins[pluginId];
    }

    /**
     * Set whether the given plugin is enabled on the guild
     * @param {string} pluginId 
     * @param {boolean} enabled 
     */
    setPluginEnabled(pluginId, enabled) {
        this._enabledPlugins[pluginId] = enabled;
        if (enabled) {
            db.insert("GuildEnabledPlugins", {
                pluginId: pluginId,
                discordGuildId: this.discordId
            });
        } else {
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
        this._permissions[pluginId] = userRoles;

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
    onPlugingLoaded(pluginId) {
        this._loadPluginPermission(pluginId);
    }

    /**
     * Called before a plugin is deleted
     * @param {string} pluginId 
     */
    onPluginDeleted(pluginId) {
        // TODO
    }

    /**
     * Load plugin permissions from database
     * @param {string} pluginId 
     */
    _loadPluginPermission(pluginId) {
        db.select("Permissions", ["userRoleId"], {
            discordGuildId: this.discordId,
            pluginId: pluginId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._permissions.push(UserRole.getById(rows[i].userRoleId));
            }
        });
    }

    /**
     * Load plugins enabled on this guild from database
     */
    _loadEnabledPlugins() {
        db.select("GuildEnabledPlugins", ["pluginId"], {
            discordGuildId: this.guildId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._enabledPlugins.push(rows[i].pluginId);
            }
        });
    }

    /**
     * Load allowed channels from database
     */
    _loadAllowedChannels() {
        db.select("AllowedChannels", ["discordChannelId"], {
            discordGuildId: this.guildId
        }).then((rows) => {
            for (let i = 0; i < rows.length; ++i) {
                this._allowedChannelIds.push(rows[i].discordChannelId);
            }
        });
    }

    /**
     * Load prefix from database
     */
    _loadPrefix() {
        db.select("GuildSettings", ["prefix"], {
            discordGuildId: this.guildId
        }).then((rows) => {
            if (rows.length > 0) {
                this._prefix = rows[0].prefix;
            }
        });
    }

    /**
     * Removes the guild from the database
     */
    delete() {
        db.delete("Admins", {
            discordGuildId: this.guildId
        });
        db.delete("AllowedChannels", {
            discordGuildId: this.guildId
        });
        db.delete("GuildSettings", {
            discordGuildId: this.guildId
        });
        db.delete("GuildEnabledPlugins", {
            discordGuildId: this.guildId
        });
        db.delete("Permissions", {
            discordGuildId: this.guildId
        });

        delete Guild._guilds[this.guildId];
    }

    static registerActions() {
        webAPI.registerAction("get-guilds", (data, reply) => {
            reply(Guild._guilds);
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

        webAPI.registerAction("get-allowed-channels", (data, reply) => {
            reply(Guild.get(data.guildId).allowedChannels);
        }, "guildAdmin");
        webAPI.registerAction("set-allowed-channels", (data, reply) => {
            Guild.get(data.guildId).allowedChannels = data.allowedChannels;
        }, "guildAdmin");

        webAPI.registerAction("get-plugin-enabled", (data, reply) => {
            reply(Guild.get(data.guildId).isPluginEnabled(data.pluginId));
        }, "guildAdmin");
        webAPI.registerAction("set-plugin-enabled", (data, reply) => {
            Guild.get(data.guildId).setPluginEnabled(data.pluginId, data.enabled);
        }, "guildAdmin");

        webAPI.registerAction("get-plugin-permission", (data, reply) => {
            reply(Guild.get(data.guildId).permissions[data.pluginId]);
        }, "guildAdmin");
        webAPI.registerAction("set-plugin-permission", (data, reply) => {
            Guild.get(data.guildId).setPluginPermission(data.pluginId, data.userRoles);
        }, "guildAdmin");

        webAPI.registerAction("get-guild-prefix", (data, reply) => {
            reply(Guild.get(data.guildId).prefix);
        }, "guildAdmin");
        webAPI.registerAction("set-guild-prefix", (data, reply) => {
            Guild.get(data.guildId).prefix = data.prefix;
        }, "guildAdmin");

        webAPI.registerAction("get-admins", (data, reply) => {
            reply(Guild.get(data.guildId).admins);
        }, "guildAdmin");
        webAPI.registerAction("set-admins", (data, reply) => {
            Guild.get(data.guildId).admins = data.admins;
        }, "guildAdmin");
    }
}

Guild._guilds = {};

module.exports = Guild;