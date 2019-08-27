let owners = [];
let guilds = [];
let repositories = [];
let botSettings = new BotSettings();

module.exports.onMessage = (message) => {};
module.exports.onReaction = (reaction) => {};
module.exports.onJoinGuild = (guild) => {};

module.exports.removeGuild = (guild) => {};
module.exports.removeRepository = (repository) => {};
module.exports.addRepository = (url) => {};

module.exports.getRepositories = () => {};
module.exports.getPlugins = () => {};
module.exports.getUserInfo = (userDiscordId) => {};
module.exports.getBotInfo = () => {};
module.exports.getGuilds = () => {};
module.exports.deleteOwner = (userDiscordId) => {};
module.exports.addOwner = (userDiscordId) => {};

function _loadGuilds() {}
function _loadRepositories() {}