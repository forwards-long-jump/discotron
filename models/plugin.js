/**
 * Stores plugin information
 */
class PluginModel {
    /**
     * @class
     * @param {string} id Id of the plugin
     * @param {string} name Displayed name of the plugin
     * @param {string} description Short description of the plugin
     * @param {string} version Version of the plugin (format x.y.z)
     * @param {string} prefix Prefix set by the owner for all servers
     * @param {object} commands Object containing arrays of Command objects, grouped by trigger type
     * @param {string} defaultPermission Who can access the command if no permissions are set by the server owner, can be *everyone*, *admin*
     * @param {boolean} enabled True if plugin is enabled by the bot owner
     * @param {Array} logs List of logs the plugin can output to
     */
    constructor(id = "", name = "", description = "", version = "", prefix = "", commands = {}, defaultPermission = "everyone", enabled = true, logs = []) {
        this._name = name;
        this._id = id;
        this._description = description;
        this._version = version;
        this._prefix = prefix;
        this._commands = commands;
        this._defaultPermission = defaultPermission;
        this._enabled = enabled;
        this._logs = logs;
    }

    /**
     * @returns {string} Name
     */
    get name() {
        return this._name;
    }
    /**
     * @returns {string} Id
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {string} Description
     */
    get description() {
        return this._description;
    }

    /**
     * @returns {string} Version
     */
    get version() {
        return this._version;
    }

    /**
     * @returns {string} Prefix
     */
    get prefix() {
        return this._prefix;
    }

    /**
     * @returns {Array} Array of Command 
     */
    get commands() {
        return this._commands;
    }

    /**
     * @returns {string} Default permission (*everyone* or *admin*)
     */
    get defaultPermission() {
        return this._defaultPermission;
    }

    /**
     * @returns {boolean} Enabled
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * @returns {Array} Array of string
     */
    get logs() {
        return this._logs;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = PluginModel;
} else {
    window.discotron.PluginModel = PluginModel;
}