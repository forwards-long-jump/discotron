window.Discotron.Guild = class extends window.Discotron.GuildModel {
    /**
     * Ctor
     * @param {string} discordId Id of the guild
     * @param {string} name Name of the guild
     * @param {string} iconURL Icon of the guild
     * @param {string} commandPrefix Command prefix
     * @param {array} allowedChannelIds Array of channel ids on which the bot is allowed
     * @param {array} enabledPluginIds Array of plugin ids that are enabled
     * @param {array} admins Array of UserRole who have admin priviledge on the bot
     * @param {object} permissions Associative object binding pluginsIds to userRole array
     */
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

    /**
     * Load all the guilds where user is admin (and bot is present) basic informations 
     * @returns {Promise}
     */
    static _loadAll() {
        return new Promise((resolve, reject) => {
            // WebApi.queryBot("get-guilds").then((guildsToObject'ed) => {
            //    foreach guild
            //          create permissions
            //          new Guild(guild.id, )
            // });
        });
    }

    /**
     * Load channels using WebAPI
     * @returns {Promise}
     */
    static _loadChannels() {
        // Trigger Roles.getGuildChannels
    }

    /**
     * Load members using WebAPI
     * @returns {Promise}
     */
    static _loadMembers() {}

    /**
     * Load roles using WebAPI
     * @returns {Promise}
     */
    static _loadRoles() {
        // Trigger Roles.getGuildRoles
    }
    
    
    /**
     * Check if guilds are loaded and return them in a promise
     */
    static getAll() {
        // TODO
        return new Promise();
    }

    /**
     * Returns the channels of the guild
     * @returns {array} Array of Channels
     */
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

    /**
     * Returns the roles of the guild
     * @returns {array} Array of Roles
     */
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

    /**
     * Returns the members of the guild
     * @returns {array} Array of Users
     */
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

    /**
     * Reloads the guilds
     */
    static reload() {
        window.Discotron.Guild._guilds = {};
        // loadAll()
    }

    /**
     * Gives dashboard privileges to a user or role
     * @param {UserRole} userRole User or role id which will be given admin privileges
     */
    addAdmin(userRole) {

    }

    /**
     * Removes dashboard privileges to a user or role
     * @param {UserRole} userRole 
     */
    deleteAdmin(userRole) {
        // webapi.querybot("delete-admin-couz");
    }
    
    /**
     * Set prefix for guild command
     * @param {string} prefix 
     */
    set prefix(prefix) {
        // TODO: update db 
    }

    get prefix() {
        return super.prefix;
    }

    /**
     * Set allowed channels
     */
    set allowedChannelIds(allowedChannelIds) {
        // TODO: update db
    }

    get allowedChannelIds() {
        return super.allowedChannelIds;
    }

    /**
     * Enable or disable the given plugin
     * @param {string} pluginId Id of the plugin to enable/disable
     * @param {boolean} enabled True if the plugin is to be enabled
     */
    setPluginEnabled(pluginId, enabled) {
        // TODO: update db
    }

    /**
     * Set the users/roles allowed to use the plugin
     * @param {string} pluginId Id of the plugin
     * @param {array} usersRoles Array of UserRoles 
     */
    setPluginPermission(pluginId, usersRoles) {
        // Create new Permission()
        // this._permissions[pluginId] = permission;
        // TODO: query web api
    }
};

window.Discotron.Guild.prototype._guilds = {};