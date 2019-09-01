const PluginModel = require("./../../models/plugin.js");
const Command = require("./command.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");

class Plugin extends PluginModel {
    /**
     * Ctor
     * @param {string} folder Folder containing a plugin 
     */
    constructor(folder) {
        super();
        this._commands = {
            "command": [],
            "words" : [],
            "all": [],
            "reaction" : []
        };

        this._loadFromFolder(folder);

        // TODO: If already exists, do not load stuff from database
        //  this._loadFromDatabase()
        Plugin._plugins[this.id] = this;

        // TODO: Notify Discotron of new plugin if oldPluginVersion undefined and set prefix
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

    _loadInfoFromDatabase() {
        // TODO: read from db
        this._prefix = "";
        this._enabled = true;
    }

    delete() {
        // TODO: Delete from db
        // TODO: Emit deleted event
    }

    /**
     * Convert this plugin to an object containing value displayed on the dashboard
     * @returns {object} {name, id, description, version, commands: [commands.toObject()], defaultPermission, enabled}
     */
    toObject() {

    }

    /**
     * Set enabled
     * @param {boolean} enabled 
     */
    set enabled(enabled) {

    }

    /**
     * Set prefix
     * @param {prefix} prefix 
     */
    set prefix(prefix) {

    }

    static registerActions() {
        webAPI.registerAction("get-prefix", (data, reply) => {});
        webAPI.registerAction("set-prefix", (data, reply) => {}, "owner");

        webAPI.registerAction("get-enabled", (data, reply) => {});
        webAPI.registerAction("set-enabled", (data, reply) => {}, "owner");

        webAPI.registerAction("get-helptext", (data, reply) => {});
        webAPI.registerAction("set-helptext", (data, reply) => {}, "owner");
    }
}

Plugin._plugins = {};

module.exports = Plugin;