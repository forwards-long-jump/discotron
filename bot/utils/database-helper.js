const sqlite = require("sqlite3");
const fs = require("fs");
const config = require(__dirname + "/../config/config.json");

const Logger = require(__dirname + "/../utils/logger.js");

let database;

module.exports.databaseExists = () => {
    return fs.existsSync(config.database.savePath);
};

module.exports.createDatabase = () => {
    fs.copyFileSync(config.database.templatePath, config.database.savePath);
};

module.exports.deleteDatabase = () => {
    fs.unlink(config.database.savePath, (err) => {
        if (err) {
            Logger.log("Could not delete database", "error");
        }
    });
};

module.exports.openDatabase = () => {
    database = new sqlite.Database(config.database.savePath, sqlite.OPEN_READWRITE, (err) => {
        if (err) {
            Logger.log("Could not open database", "error");
        }
    });
};

module.exports.getDatabase = () => {
    return database;
};