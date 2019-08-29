const GuildModel = require(__dirname + "/../models/guild.js");

class Guild extends GuildModel {
    /**
     * Ctor
     * @param {string} discordId ID of the discord guild 
     */
    constructor(discordId) {
        super(discordId);
        this._loadPrefix();
        this._loadAllowedChannels();
        this._loadEnabledPlugins();

        Guild._guilds[discordId] = this;
        // discotron.registerEvent(this.onPluginLoaded);
    }

    /**
     * Returns the Guild with the given ID
     * @param {string} discordId 
     */
    static get(discordId) {
        return Guild._guilds[discordId];
    }

    /**
     * Returns whether the given client ID is a bot admin on the guild
     * @param {string} clientId 
     */
    isAdmin(clientId) {
        for (let i = 0; i < this._admins.length; ++i) {
            if (this._admins[i].describes(clientId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Adds a bot admin to the guild
     * @param {UserRole} userRole 
     */
    addAdmin(userRole) {

    }

    /**
     * Removes a bot admin to the guild (note, guild admins are automatically bot admins too)
     * @param {UserRole} userRole 
     */
    deleteAdmin(userRole) {

    }


    /**
     * Set bot prefix on the guild
     * @param {string} prefix 
     */
    set prefix(prefix) {

    }

    /**
     * Set allowed channels
     * @param {array} discordChannelIds 
     */
    set allowedChannels(discordChannelIds) {

    }

    /**
     * Set whether the given plugin is enabled on the guild
     * @param {string} pluginId 
     * @param {boolean} enabled 
     */
    setPluginEnabled(pluginId, enabled) {

    }

    /**
     * Set the set of users and roles allowed to use the given plugin
     * @param {string} pluginId 
     * @param {array} userRoles 
     */
    setPluginPermission(pluginId, userRoles) {

    }

    /**
     * Called after a plugin is loaded
     * @param {string} pluginId 
     */
    onPlugingLoaded(pluginId) {
        this._loadPluginPermission(pluginId);
    }

    /**
     * Called before a plugin is deleted
     * @param {string} pluginId 
     */
    onPluginDeleted(pluginId) {
        
    }

    /**
     * Load plugin permissions from database
     * @param {string} pluginId 
     */
    _loadPluginPermission(pluginId) {

    }

    /**
     * Load plugins enabled on this guild from database
     */
    _loadEnabledPlugins() {

    }

    /**
     * Load allowed channels from database
     */
    _loadAllowedChannels() {

    }

    /**
     * Load prefixes from database
     */
    _loadPrefix() {

    }

    /**
     * Removes the guild from the database
     */
    delete() {
        // Do not forget to remove from the static list
    }

}

Guild.prototype._guilds = {};

module.exports = Guild;