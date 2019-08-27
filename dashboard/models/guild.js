class Guild extends GuildModel {
    constructor(guildId) {
        // load from db
        // super(with the data)

        Guild._guilds.push(this);
    }

    static getAll() {
        return Guild._guilds;
    }

    static reload() {
        Guild._guilds = [];
        // read all guilds on the db and build them
    }

    addAdmin(UserRole) {

    }

    deleteAdmin(UserRole) {

    }

    set prefix(prefix) {
        // TODO: update db 
    }

    set allowedChannelIds(allowedChannelIds) {
        // TODO: update db
    }

    setPluginEnabled(devname, enabled) {
        // TODO: update db
    }

    setPluginPermission(devname, usersRoles) {
        // TODO: update db
    }
}

Guild.prototype._guilds = [];