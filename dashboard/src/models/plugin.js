window.Discotron.Plugin = class extends window.Discotron.PluginModel {
    constructor(pluginId) {
        // load from db
        // super(with the info from the db)

        Plugin._plugins.push(this);
    }

    static getAll() {
        return Plugin._plugins;
    }

    static reload() {
        Plugin._plugins = [];
        // read all plugins from db
    }

    toObject() {

    }
}

window.Discotron.Plugin.prototype._plugins = [];