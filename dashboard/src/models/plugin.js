window.Discotron.Plugin = class extends window.Discotron.PluginModel {
    /**
     * Ctor
     * @param {string} pluginId Id of the plugin 
     */
    constructor(pluginId, name, description, version, prefix, commands, defaultPermission, enabled, logs) {
        super(pluginId, name, description, version, prefix, commands, defaultPermission, enabled, logs);
        Discotron.Plugin._plugins[pluginId] = this;
    }

    /**
     * Returns all the plugins of the bot
     * @returns {object} Associative array {pluginId => Plugin} 
     */
    static getAll() {
        return new Promise((resolve, reject) => {
            if (Object.keys(Discotron.Plugin._plugins).length === 0) {
                Discotron.WebAPI.queryBot("discotron-dashboard", "get-plugins").then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        const plugin = data[i];
                        new Discotron.Plugin(plugin.id, plugin.name, plugin.description, plugin.version, plugin.prefix,
                            plugin.commands, plugin.defaultPermission, plugin.enabled, plugin.logs);
                    }
                    resolve(Discotron.Plugin._plugins);
                });
            } else {
                resolve(Discotron.Plugin._plugins);
            }
        });
    }

    /**
     * Reload all the plugins
     */
    static clearCache() {
        Discotron.Plugin._plugins = {};
    }

    /**
     * Update prefix for this plugin in the database (owner only)
     * @param {string} prefix 
     */
    set prefix(prefix) {
        this._prefix = prefix;
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-plugin-prefix", {
            prefix: prefix,
            pluginId: this._id
        });
    }

    get prefix() {
        return super.prefix;
    }

    /**
     * Update enabled for this plugin in the database (owner only)
     * @param {boolean} enabled True if the plugin is to be enabled
     */
    set enabled(enabled) {
        this._enabled = enabled;
        Discotron.WebAPI.queryBot("discotron-dashboard", "set-enabled", {
            enabled: enabled,
            pluginId: this._id
        });
    }

    get enabled() {
        return super.enabled;
    }

    set logs(logs) {
        this._logs = logs;
    }

    get logs() {
        return super.logs;
    }
};

window.Discotron.Plugin._plugins = {};