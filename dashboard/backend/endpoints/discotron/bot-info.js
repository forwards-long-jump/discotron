const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");

module.exports.get = {
    authentication: "everyone",
    timeToLive: 2,
    action: () => {
        const discordClient = discordClientProvider.get();
        if (discordClient.user !== null) {
            return {
                avatar: discordClient.user.displayAvatarURL,
                tag: discordClient.user.tag
            };
        } else {
            return {
                avatar: "/dashboard/images/outage.png",
                tag: "Bot offline"
            };
        }
    }
};
