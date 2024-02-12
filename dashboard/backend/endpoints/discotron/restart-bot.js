const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");
const Logger = require("../../../../core/utils/logger.js");
const WebApiError = require("../../../../shared/webapi-error.js");

module.exports.post = {
    authentication: "owner",
    action: async () => {
        Logger.debug("Restarting bot...");

        try {
            await discordClientProvider.get().destroy();
            await global.discotron._connectToDiscord();
        } catch (err) {
            Logger.err("Could not restart bot", err);
            throw new WebApiError("Restart was not successful.", "restart-error");
        }
    }
};
