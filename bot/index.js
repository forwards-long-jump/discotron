const Logger = require(__dirname + "/utils/logger.js");

const config = require(__dirname + "/config/config.json");
const databaseHelper = require(__dirname + "/utils/database-helper.js");
const webserver = require(__dirname + "/webserver.js");

Logger.setSeverity("debug");

if (!databaseHelper.databaseExists()) {
    databaseHelper.createDatabase();
}
databaseHelper.openDatabase();

webserver.serveDashboard();

// TODO: Discord.js init
// TODO: Load db?

