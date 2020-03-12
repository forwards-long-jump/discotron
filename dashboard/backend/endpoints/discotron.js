const webAPI = require("../api.js").getWebAPI("discotron-dashboard");
const Logger = require("../../../core/utils/logger.js");
const discordClientProvider = require("../../../core/utils/discord-client-provider.js");
const { getBotSettings, getUserInfo } = require("../../../core/discotron.js");

webAPI.registerAction("set-bot-config", (data, reply) => {
    if (data === undefined) {
        reply(false);
        return;
    }

    const botSettings = getBotSettings();

    if (data.helpText !== undefined) {
        botSettings.helpText = data.helpText;
    }

    if (data.maintenance !== undefined) {
        botSettings.maintenance = data.maintenance;
    }

    if (data.presenceText !== undefined) {
        botSettings.presenceText = data.presenceText;
    }

    reply();
}, "owner");

webAPI.registerAction("get-bot-config", (data, reply) => {
    const botSettings = getBotSettings();

    reply({
        helpText: botSettings.helpText,
        presenceText: botSettings.presenceText,
        maintenance: botSettings.maintenance,
        status: discordClientProvider.get().status
    });
}, "owner");

webAPI.registerAction("restart-bot", (data, reply) => {
    Logger.log("Restarting bot...");
    discordClientProvider.get().destroy().then(() => {
        return global.discotron._connectToDiscord().then(() => {
            reply(true);
        });
    }).catch(Logger.err);
}, "owner");

webAPI.registerAction("get-bot-info", (data, reply) => {
    const discordClient = discordClientProvider.get();
    if (discordClient.user !== null) {
        reply({
            avatar: discordClient.user.displayAvatarURL,
            tag: discordClient.user.tag
        });
    } else {
        reply({
            avatar: "/dashboard/images/outage.png",
            tag: "Bot offline"
        });
    }
}, "everyone");

webAPI.registerAction("get-user-info", (data, reply) => {
    getUserInfo(data.discordId).then((info) => {
        reply(info);
    }).catch(Logger.err);
});