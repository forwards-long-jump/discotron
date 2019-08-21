class Plugin {
    constructor(name, devName, description, version, onLoad, permissions, commands = []) {
        this._name = name;
        this._devName = devName;
        this._desc =  description;
        this._version =  version;
        this._onLoad = onLoad;

        this._commands = commands;
    }
}

module.exports = Plugin;
