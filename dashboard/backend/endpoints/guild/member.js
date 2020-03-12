const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");

webAPI.registerAction("get-members", (data, reply, discordUserId, discordGuildId) => {
    let guild = discordClientProvider.get().guilds.get(discordGuildId);
    let members = guild.members;
    reply(members.map(member => {
        return {
            discordId: member.user.id,
            name: member.user.username,
            discriminator: member.user.discriminator,
            avatar: member.user.displayAvatarURL
        };
    }));
}, "guildAdmin");
