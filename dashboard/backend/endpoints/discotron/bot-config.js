const discordClientProvider = require("../../../../core/utils/discord-client-provider.js");
const { getBotSettings } = require("../../../../core/discotron.js");

module.exports.get = {
    authentication: "owner",
    action: () => {
        const botSettings = getBotSettings();

        return {
            helpText: botSettings.helpText,
            presenceText: botSettings.presenceText,
            maintenance: botSettings.maintenance,
            status: discordClientProvider.get().status
        };
    }
};

module.exports.put = {
    authentication: "owner",
    action: (userData) => {
        const botSettings = getBotSettings();
    
        if (userData.helpText !== undefined) {
            botSettings.helpText = userData.helpText;
        }
    
        if (userData.maintenance !== undefined) {
            botSettings.maintenance = userData.maintenance;
        }
    
        if (userData.presenceText !== undefined) {
            botSettings.presenceText = userData.presenceText;
        }
    }
};
