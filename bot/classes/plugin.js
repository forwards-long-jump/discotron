const PluginModel = require(__dirname + "/../models/plugin.js");

class Plugin extends PluginModel {
    /**
     * Ctor
     * @param {string} folder Folder containing a plugin 
     */
    constructor(folder) {
        super();
        this._loadFromFolder(folder);

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
        /*
        this._name = name;
        this._id = id;
        this._description = description;
        this._version = version;
        this._prefix = prefix;
        this._commands = commands;
        this._defaultPermission = defaultPermission;
        this._enabled = enabled;
        */
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
}

Plugin.prototype._plugins = {};

module.exports = Plugin;
