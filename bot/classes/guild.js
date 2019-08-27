class Guild extends GuildModel {
    constructor(id) {
        super(id);
    }

    isAdmin(userRole) {

    }

    addAdmin(userRole) {

    }

    deleteAdmin(userRole) {

    }

    set prefix() {

    }

    set allowedChannels(discordChannelIds) {

    }

    setPluginEnabled(devname, enabled) {

    }

    setPluginPermission(devname, userRoles) {

    }

    onPlugingLoaded(devname) {

    }

    onPluginDeleted(devname) {
        
    }

    _loadPluginPermission(devname) {

    }

    _loadEnabledPlugins() {

    }

    _loadAllowedChannels() {

    }

    _loadPrefix() {

    }

}

module.exports = Guild;