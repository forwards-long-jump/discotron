const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const Guild = require("../../../../core/models/guild.js");

webAPI.registerAction("get-guild-prefix", (data, reply, discordUserId, discordGuildId) => {
    reply(Guild.get(discordGuildId).commandPrefix);
}, "guildAdmin");

webAPI.registerAction("set-guild-prefix", (data, reply, discordUserId, discordGuildId) => {
    Guild.get(discordGuildId).commandPrefix = data.prefix;
    reply();
}, "guildAdmin");
