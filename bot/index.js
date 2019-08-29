const Logger = require(__dirname + "/utils/logger.js");

const config = require(__dirname + "/config/config.json");
const webserver = require(__dirname + "/webserver.js");

Logger.setSeverity("debug");

webserver.serveDashboard();

// TODO: Discord.js init
// TODO: Load db?