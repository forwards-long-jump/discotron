class Plugin {
    constructor(name, devName, description, version, prefix, commands, defaultPermission, enabled) {
        this._name = name;
        this._devName = devName;
        this._description = description;
        this._version = version;
        this._prefix = prefix;
        this._commands = commands;
        this._defaultPermission = defaultPermission;
        this._enabled = enabled;
    }
}