const webAPI = require("../api.js").getWebAPI("discotron-dashboard");
const Guild = require("../../../core/models/guild.js");

webAPI.registerAction("get-guilds", (data, reply, discordUserId, discordGuildId) => {
    let guilds = {};
    for (const discordGuildId in Guild.getAll()) {
        guilds[discordGuildId] = Guild.get(discordGuildId).toObject();
    }
    reply(guilds);
}, "guildAdmin");

webAPI.registerAction("get-guilds-where-is-admin", (data, reply, discordUserId) => {
    let guilds = [];
    for (const discordGuildId in Guild._guilds) {
        const guild = Guild.get(discordGuildId);
        if (guild.isAdmin(discordUserId)) {
            guilds.push(guild.toObject());
        }
    }
    reply(guilds);
});
