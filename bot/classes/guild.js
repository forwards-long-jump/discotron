class Guild {
    constructor(id) {
        this._id = id;
        this._allowedChannelIds = [];
        this._enabledPlugins = [];
        this._admins = [];

        this._permissions = permissions; // [plugin => permission]
    }
}

module.exports = Guild;