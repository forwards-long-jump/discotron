const GuildModel = require("./../../models/guild.js");
const webAPI = require("./../apis/web-api.js").getWebAPI("discotron-dashboard");

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
        // TODO: Check user role and check if it has admin permission
        for (let i = 0; i < this._admins.length; ++i) {
            if (this._admins[i].describes(clientId)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns whether the given user is a bot admin on the given guild
     * @param {string} clientId ID of the client
     * @param {string} guildId ID of the guild
     * @returns {boolean} True if the client is bot admin on the guild
     */
    static isGuildAdmin(clientId, guildId) {
        return Guild.get(guildId).isAdmin(clientId);
    }

    /**
     * Adds a bot admin to the guild
     * @param {array} usersRoles Array of UserRole 
     */
    setAdmins(usersRoles) {

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

    static registerActions() {
        webAPI.registerAction("get-guilds", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("get-members", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("get-roles", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("get-channels", (data, reply) => {}, "guildAdmin");

        webAPI.registerAction("get-allowed-channels", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("set-allowed-channels", (data, reply) => {}, "guildAdmin");

        webAPI.registerAction("get-plugin-enabled", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("set-plugin-enabled", (data, reply) => {}, "guildAdmin");

        webAPI.registerAction("get-plugin-permission", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("set-plugin-permission", (data, reply) => {}, "guildAdmin");

        webAPI.registerAction("get-prefix", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("set-prefix", (data, reply) => {}, "guildAdmin");

        webAPI.registerAction("get-admins", (data, reply) => {}, "guildAdmin");
        webAPI.registerAction("set-admins", (data, reply) => {}, "guildAdmin");
    }
}

Guild._guilds = {};

module.exports = Guild;