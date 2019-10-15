const PluginModel = require("./../../models/plugin.js");
const Command = require("./command.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const db = require("./../apis/database-crud.js");
const Logger = require("../utils/logger.js");
const Owner = require("./owner.js");

/**
 * Server side plugin, contains commands and plugin status info
 */
class Plugin extends PluginModel {
    /**
     * @constructor
     * @param {string} folder Folder name of the plugin in a repository 
     */
    constructor(folder) {
        super();
        this._commands = {
            "command": [],
            "words": [],
            "all": [],
            "reaction": []
        };

        this._loadFromFolder(folder);

        let oldVersion = Plugin._plugins[this.id];
        if (oldVersion !== undefined) {
            this._prefix = oldVersion._prefix;
            this._enabled = oldVersion._enabled;
        } else {
            this._loadInfoFromDatabase();
            global.discotron.triggerEvent("plugin-loaded", this.id);
        }

        if (typeof this._onLoad === "function") {
            this._onLoad(this.getApiObject());
        }
        Plugin._plugins[this.id] = this;
    }

    /**
     * @returns {object} APIs that can be used by plugins
     */
    getApiObject() {
        return {
            discotron: global.discotron,
            discordClient: global.discordClient,
            plugin: this,
            Logger: Logger
        };
    }

    /**
     * @returns {array} Array of all the plugins
     * @static
     */
    static getAll() {
        return Plugin._plugins;
    }

    /**
     * Loads the plugin from a folder located in git/...
     * @param {string} folder 
     */
    _loadFromFolder(folder) {
        delete require.cache[require.resolve(folder + "/index.js")];
        let pluginFile = require(folder + "/index.js");

        // from file
        this._name = pluginFile.config.name;
        this._id = pluginFile.config.id;
        this._description = pluginFile.config.description;
        this._defaultPermission = pluginFile.config.defaultPermission;
        this._version = pluginFile.config.version;
        this._onLoad = pluginFile.config.onLoad;
        for (let i = 0; i < pluginFile.commands.length; i++) {
            let command = new Command(pluginFile.commands[i]);
            this._commands[command.triggerType].push(command);
        }
    }

    /**
     * Loads "prefix" and "enabled" from the database, inserts default values if none found
     */
    _loadInfoFromDatabase() {
        // default values
        this._prefix = "";
        this._enabled = true;

        db.select("Plugins", ["prefix", "disabled"], {
            id: this.id
        }).then((rows) => {
            if (rows.length > 0) {
                this._prefix = rows[0].prefix;
                this._enabled = (rows[0].disabled === 0);
            } else {
                db.insert("Plugins", {
                    id: this.id,
                    prefix: "",
                    disabled: 0
                });
            }
        }).catch(Logger.err);
    }

    /**
     * Delete this plugin from the database and unload it
     */
    delete() {
        delete Plugin._plugins[this.id];

        db.delete("Plugins", {
            id: this.id
        });
        db.delete("GuildEnabledPlugins", {
            pluginId: this.id
        });
        db.delete("Permissions", {
            pluginId: this.id
        });

        global.discotron.triggerEvent("plugin-deleted", this.id);
    }

    /**
     * Convert this plugin to an object containing value displayed on the dashboard
     * @returns {object} {name, id, description, version, commands: [commands.toObject()], defaultPermission, enabled}
     */
    toObject(publicInfoOnly = false) {
        let commandObjs = [];
        for (const type in this.commands) {
            if (this.commands.hasOwnProperty(type)) {
                const commands = this.commands[type];
                for (let i = 0; i < commands.length; i++) {
                    const command = commands[i];
                    commandObjs.push(command.toObject());
                }
            }
        }

        if (publicInfoOnly) {
            return {
                name: this.name,
                id: this.id,
                description: this.description,
                version: this.version,
                commands: commandObjs,
                defaultPermission: this.defaultPermission,
                enabled: this.enabled,
                prefix: this.prefix
            };
        } else {
            return {
                name: this.name,
                id: this.id,
                description: this.description,
                version: this.version,
                commands: commandObjs,
                defaultPermission: this.defaultPermission,
                enabled: this.enabled,
                prefix: this.prefix,
                logs: this.logs
            };
        }
    }

    /**
     * Log something into the dashboard
     * @param {object} value String to log, attemps to JSON.stringify if it's an object
     */
    log(value) {
        let date = new Date();
        let displayedDate = `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`;
        if (typeof this.value === "string") {
            this._logs.push(displayedDate + " " + value);
        } else {
            try {
                this._logs.push(displayedDate + " " + JSON.stringify(value, null, 4));
            } catch (e) {
                this._logs.push(displayedDate + " " + value);
            }
        }
    }

    /**
     * Set if the plugin can be used or not
     * @param {boolean} enabled 
     */
    set enabled(enabled) {
        this._enabled = enabled;
        db.update("Plugins", {
            disabled: enabled ? 0 : 1
        }, {
            id: this.id
        });
    }

    /**
     * @returns {boolean} Plugin enabled
     */
    get enabled() {
        return super.enabled;
    }

    /**
     * Set prefix
     * @param {prefix} prefix 
     */
    set prefix(prefix) {
        this._prefix = prefix;
        db.update("Plugins", {
            prefix: prefix
        }, {
            id: this.id
        });
    }

    /**
     * @returns {string} Global prefix for this plugin
     */
    get prefix() {
        return super.prefix;
    }

    /**
     * Register webAPI actions related to plugins
     * @static
     */
    static registerActions() {
        webAPI.registerAction("get-plugin-prefix", (data, reply) => {
            if (Plugin._plugins[data.pluginId] !== undefined) {
                reply(Plugin._plugins[data.pluginId].prefix);
            } else {
                reply(false);
            }
        });

        webAPI.registerAction("get-plugin-logs", (data, reply) => {
            reply(Plugin._plugins[data.pluginId].logs);
        }, "owner");

        webAPI.registerAction("set-plugin-prefix", (data, reply) => {
            Plugin._plugins[data.pluginId].prefix = data.prefix;
            reply();
        }, "owner");

        webAPI.registerAction("get-enabled", (data, reply) => {
            if (Plugin._plugins[data.pluginId] !== undefined) {
                reply(Plugin._plugins[data.pluginId].enabled);
            } else {
                reply(false);
            }
        });

        webAPI.registerAction("set-enabled", (data, reply) => {
            Plugin._plugins[data.pluginId].enabled = data.enabled;
            reply();
        }, "owner");

        webAPI.registerAction("get-plugins", (data, reply, userDiscordId) => {
            let pluginsObjects = [];

            for (const key in Plugin.getAll()) {
                if (Plugin.getAll().hasOwnProperty(key)) {
                    pluginsObjects.push(Plugin.getAll()[key].toObject(!Owner.isOwner(userDiscordId)));
                }
            }

            reply(pluginsObjects);
        });
    }
}

Plugin._plugins = {};

module.exports = Plugin;