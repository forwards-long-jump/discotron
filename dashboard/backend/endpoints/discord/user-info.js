const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");
const WebApiError = require("../../../../shared/webapi-error.js");

module.exports.get = {
    authentication: "loggedIn", // TODO: used to be set to "everyone" implicitly
    timeToLive: 30,
    action: async (userData) => {
        try {
            const user = await discordClientProvider.get().fetchUser(userData.discordId);
            return {
                discordId: user.id,
                name: user.username,
                tag: user.tag,
                discriminator: user.discriminator,
                avatarURL: user.displayAvatarURL
            };
        } catch (err) {
            throw new WebApiError("Could not retrieve user infos.", "discord-api-error");
        }
    }
};
