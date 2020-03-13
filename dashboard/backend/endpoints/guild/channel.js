const webAPI = require("../../api.js").getWebAPI("discotron-dashboard");
const Guild = require("../../../../core/models/guild.js");
const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");

webAPI.registerAction("get-channels", (data, reply, discordUserId, discordGuildId) => {
    const guild = discordClientProvider.get().guilds.get(discordGuildId);
    reply(guild.channels.map((channel) => {
        return {
            discordId: channel.id,
            name: channel.name,
            type: channel.type
        };
    }));
}, "guildAdmin");

webAPI.registerAction("get-allowed-channels", (data, reply, discordUserId, discordGuildId) => {
    reply(Guild.get(discordGuildId).allowedChannelIds);
}, "guildAdmin");

webAPI.registerAction("set-allowed-channels", (data, reply, discordUserId, discordGuildId) => {
    Guild.get(discordGuildId).allowedChannelIds = data.allowedChannelIds;
    reply();
}, "guildAdmin");
