const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const Guild = require("../../../../core/models/guild.js");

webAPI.registerAction("get-admins", (data, reply, discordUserId, discordGuildId) => {
    reply(Array.from(Guild.get(discordGuildId).admins));
}, "guildAdmin");

webAPI.registerAction("set-admins", (data, reply, discordUserId, discordGuildId) => {
    Guild.get(discordGuildId).admins = data.admins;
    reply();
}, "guildAdmin");
