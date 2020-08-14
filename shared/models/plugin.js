/**
 * Stores plugin information
 */
class PluginModel {
    /**
     * @class
     * @param {object} options Args
     * @param {string} options.id Id of the plugin
     * @param {string} options.name Displayed name of the plugin
     * @param {string} options.description Short description of the plugin
     * @param {string} options.version Version of the plugin (format x.y.z)
     * @param {string} options.prefix Prefix set by the owner for all servers
     * @param {object} options.commands Object containing arrays of Command objects, grouped by trigger type
     * @param {string} options.defaultPermission Who can access the command if no permissions are set by the server owner, can be *everyone*, *admin*
     * @param {boolean} options.enabled True if plugin is enabled by the bot owner
     * @param {Array} options.logs List of logs the plugin can output to
     */
    constructor({id = "", name = "", description = "", version = "", prefix = "", commands = {}, defaultPermission = "everyone", enabled = true, logs = []} = {}) {
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
     * @returns {string} Displayed name of the plugin
     */
    get name() {
        return this._name;
    }
    /**
     * @returns {string} Id of the plugin
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {string} Short description of the plugin
     */
    get description() {
        return this._description;
    }

    /**
     * @returns {string} Version of the plugin (format x.y.z)
     */
    get version() {
        return this._version;
    }

    /**
     * @returns {string} Prefix set by the owner for all servers
     */
    get prefix() {
        return this._prefix;
    }

    /**
     * @returns {object} Object containing arrays of Command objects, grouped by trigger type
     */
    get commands() {
        return this._commands;
    }

    /**
     * @returns {string} Who can access the command if no permissions are set by the server owner, can be *everyone*, *admin*
     */
    get defaultPermission() {
        return this._defaultPermission;
    }

    /**
     * @returns {boolean} True if plugin is enabled by the bot owner
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * @returns {Array} List of logs the plugin can output to
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