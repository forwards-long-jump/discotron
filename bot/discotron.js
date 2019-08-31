const BotSettings = require(__dirname + "/classes/bot-settings.js");
const webAPI = require("./apis/web-api.js").getWebAPI("discotron-dashboard");

const botSettings = new BotSettings();

module.exports.onMessage = (message) => {};
module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};

module.exports.getUserInfo = (userDiscordId) => {};
module.exports.getBotInfo = () => {};

module.exports.registerActions = () => {
    webAPI.registerAction("set-bot-config", (data, reply) => {
        if (data === undefined) {
            return;
        }
        if (data.helpText !== undefined) {
            botSettings.helpText = data.helpText;
        }
        if (data.maintenance !== undefined) {
            botSettings.maintenance = data.maintenance;
        }
    }, "owner");
    webAPI.registerAction("get-bot-config", (data, reply) => {
        reply({
            helpText: botSettings.helpText,
            maintenance: botSettings.maintenance
        });
    }, "owner");
}