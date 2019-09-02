const PluginModel = require("./../../models/plugin.js");
const Command = require("./command.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");
const db = require("./../apis/database-crud.js");

class Plugin extends PluginModel {
    /**
     * Ctor
     * @param {string} folder Folder containing a plugin 
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
        Plugin._plugins[this.id] = this;
    }

    /**
     * Returns an array of all the plugins
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
        for (let i = 0; i < pluginFile.commands.length; i++) {
            let command = new Command(pluginFile.commands[i]);
            this._commands[command.triggerType].push(command);
        }
    }

    /**
     * Loads prefix and enabled from DB, inserts default values if none found
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
        });
    }

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

        global.discotron.trigger("plugin-deleted", this.id);
    }

    /**
     * Convert this plugin to an object containing value displayed on the dashboard
     * @returns {object} {name, id, description, version, commands: [commands.toObject()], defaultPermission, enabled}
     */
    toObject() {
        let commandObjs = [];
        for (let i = 0; i < this.commands.command; ++i) {
            commandObjs.push(this.commands.command.toObject());
        }
        for (let i = 0; i < this.commands.words; ++i) {
            commandObjs.push(this.commands.words.toObject());
        }
        for (let i = 0; i < this.commands.all; ++i) {
            commandObjs.push(this.commands.all.toObject());
        }
        for (let i = 0; i < this.commands.reaction; ++i) {
            commandObjs.push(this.commands.reaction.toObject());
        }

        return {
            name: this.name,
            id: this.id,
            description: this.description,
            version: this.version,
            commands: commandObjs,
            defaultPermission: this.defaultPermission,
            enabled: this.enabled
        };
    }

    /**
     * Set enabled
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

    get prefix() {
        return super.prefix;
    }

    static registerActions() {
        webAPI.registerAction("get-plugin-prefix", (data, reply) => {
            reply(Plugin._plugins[data.pluginId].prefix);
        });
        webAPI.registerAction("set-plugin-prefix", (data, reply) => {
            Plugin._plugins[data.pluginId].prefix = data.prefix;
            reply();
        }, "everyone");

        webAPI.registerAction("get-enabled", (data, reply) => {
            reply(Plugin._plugins[data.pluginId].enabled);
        });
        webAPI.registerAction("set-enabled", (data, reply) => {
            Plugin._plugins[data.pluginId].enabled = data.enabled;
            reply();
        }, "owner");
    }
}

Plugin._plugins = {};

module.exports = Plugin;