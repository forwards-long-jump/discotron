class GuildModel{
    constructor(id, commandPrefix, allowedChannelIds, enabledPlugins, adminIds, permissions) {
        this._id = id;
        this._commandPrefix = commandPrefix;
        this._allowedChannelIds = allowedChannelIds;
        this._enabledPlugins = enabledPlugins;
        this._adminIds = adminIds;
        this._permissions = permissions;
    }
}