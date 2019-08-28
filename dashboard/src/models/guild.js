window.Discotron.Guild = class extends window.Discotron.GuildModel {
    constructor(discordId, name, iconURL, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions) {
        super(discordId, commandPrefix, allowedChannelIds, enabledPlugins, admins, permissions);

        this._name = name;
        this._iconURL = iconURL;

        // Load as needed
        this._members = []; // ids
        this._roles = {}; // id: Role
        this._channels = {};

        window.Discotron.Guild._guilds[discordId] = this;

    }

    static loadAll() {
        return new Promise((resolve, reject) => {
            // if window.Discotron.Guild._guilds is not empty
            //    resolve();
            // else
            // WebApi.queryBot("get-guilds").then((guildsToObject'ed) => {
            //    foreach guild new Guild(guild.id, )
            // });
        });
    }

    static getAll() {
        return window.Discotron.Guild._guilds;
    }

    static reload() {
        window.Discotron.Guild._guilds = {};
        // loadAll()
    }

    getChannels() {
        return new Promise((resolve, reject) => {
            // if this.channel is not empty
            //    resolve();
            // else
            // channels.push(Channel.getGuildChannels(this._id))
            // resolve()
            // });
        });
    }

    getRoles() {
        return new Promise((resolve, reject) => {
            // if this.channel is not empty
            //    resolve();
            // else
            // channels.push(Channel.getGuildChannels(this._id))
            // resolve()
            // });
        });
    }

    getMembers() {
        return new Promise((resolve, reject) => {
            // if this.channel is not empty
            //    resolve();
            // else
            // members.push(Channel.getGuildChannels(this._id)) // stores only IDs, Members are saved in Member.getAll()
            // resolve()
            // });
        });
    }

    loadUserRoles() {
        return new Promise((resolve, reject) => {

        });
    }

    addAdmin(userRole) {

    }

    deleteAdmin(userRole) {
        // webapi.querybot("delete-admin-couz");
    }

    set prefix(prefix) {
        // TODO: update db 
    }

    set allowedChannelIds(allowedChannelIds) {
        // TODO: update db
    }

    setPluginEnabled(pluginId, enabled) {
        // TODO: update db
    }

    setPluginPermission(pluginId, usersRoles) {
        // TODO: update db
    }
};

window.Discotron.Guild.prototype._guilds = {};