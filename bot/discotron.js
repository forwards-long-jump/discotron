const BotSettings = require(__dirname + "/classes/bot-settings.js");

const botSettings = new BotSettings();

module.exports.onMessage = (message) => {};
module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};

module.exports.getUserInfo = (userDiscordId) => {};
module.exports.getBotInfo = () => {};