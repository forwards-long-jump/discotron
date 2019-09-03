/**
 * Stores plugin informations
 */
class PluginModel {
    /**
     * Ctor
     * @param {string} id Id of the plugin
     * @param {string} name Displayed name of the plugin
     * @param {string} description Short description of the plugin
     * @param {string} version Version of the plugin (format x.y.z)
     * @param {string} prefix Prefix set by the owner for all servers
     * @param {object} commands Object containing arrays of Command objects, grouped by trigger type
     * @param {string} defaultPermission Who can access the command if no permissions are set by the server owner, can be *everyone*, *admin*
     * @param {boolean} enabled True if plugin is enabled by the bot owner
     */
    constructor(id = "", name = "", description = "", version = "", prefix = "", commands = {}, defaultPermission = "everyone", enabled = true) {
        this._name = name;
        this._id = id;
        this._description = description;
        this._version = version;
        this._prefix = prefix;
        this._commands = commands;
        this._defaultPermission = defaultPermission;
        this._enabled = enabled;
        this._logs = []; // TODO
    }

    get name() {
        return this._name;
    }
    get id() {
        return this._id;
    }
    get description() {
        return this._description;
    }
    get version() {
        return this._version;
    }
    get prefix() {
        return this._prefix;
    }
    get commands() {
        return this._commands;
    }
    get defaultPermission() {
        return this._defaultPermission;
    }
    get enabled() {
        return this._enabled;
    }
    get logs() {
        return this._logs;
    }
}

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = PluginModel;
} else {
    window.Discotron.PluginModel = PluginModel;
}