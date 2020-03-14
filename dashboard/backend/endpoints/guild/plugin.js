const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const Guild = require("../../../../core/models/guild.js");
const UserRole = require("../../../../core/models/user-role.js");

webAPI.registerAction("get-plugin-enabled", (data, reply, discordUserId, discordGuildId) => {
    reply(Guild.get(discordGuildId).isPluginEnabled(data.pluginId));
}, "guildAdmin");

webAPI.registerAction("set-plugin-enabled", (data, reply, discordUserId, discordGuildId) => {
    Guild.get(discordGuildId).setPluginEnabled(data.pluginId, data.enabled);
    reply();
}, "guildAdmin");

webAPI.registerAction("get-plugin-permission", (data, reply, discordUserId, discordGuildId) => {
    reply(Guild.get(discordGuildId).permissions[data.pluginId].toObject());
}, "guildAdmin");

webAPI.registerAction("set-plugin-permission", (data, reply, discordUserId, discordGuildId) => {
    const usersRoles = data.userRoles.map((ur) => {
        return new UserRole(ur._discordUserId, ur._discordRoleId, discordGuildId);
    });
    Guild.get(discordGuildId).setPluginPermission(data.pluginId, usersRoles);
    reply();
}, "guildAdmin");
