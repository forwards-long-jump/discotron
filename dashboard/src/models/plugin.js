window.Discotron.Plugin = class extends window.Discotron.PluginModel {
    /**
     * Ctor
     * @param {string} pluginId Id of the plugin 
     */
    constructor(pluginId) {
        window.Discotron.Plugin._plugins[pluginId] = this;
    }

    /**
     * Returns all the plugins of the bot
     * @returns {object} Associative array {pluginId => Plugin} 
     */
    static getAll() {
        return window.Discotron.Plugin._plugins;
    }

    /**
     * Reload all the plugins
     */
    static reload() {
        window.Discotron.Plugin._plugins = [];
        // read all plugins from db
    }

    /**
     * Update prefix for this plugin in the database (owner only)
     * @param {string} prefix 
     */
    set prefix(prefix) {
        // update in web api, owner only
    }

    get prefix() {
        return super.prefix;
    }
    
    /**
     * Update enabled for this plugin in the database (owner only)
     * @param {boolean} enabled True if the plugin is to be enabled
     */
    set enabled(enabled) {
        
    }

    get enabled() {
        return super.enabled;
    }
};

window.Discotron.Plugin.prototype._plugins = {};