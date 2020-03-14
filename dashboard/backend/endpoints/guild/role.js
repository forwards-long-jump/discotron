const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");

webAPI.registerAction("get-roles", (data, reply, discordUserId, discordGuildId) => {
    const guild = discordClientProvider.get().guilds.get(discordGuildId);
    reply(guild.roles.map((role) => {
        return {
            discordId: role.id,
            name: role.name,
            color: role.hexColor
        };
    }));
}, "guildAdmin");