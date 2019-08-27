class Plugin extends PluginModel {
    constructor(devname) {
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

Plugin.prototype._plugins = [];