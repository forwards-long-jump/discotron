const sqlite = require("sqlite3");
const fs = require("fs");
const config = require("../config/config.json");
const databasePath = global.discotronConfigPath + "/" + config.database.saveName;

const Logger = require("../utils/logger.js");

let database;

/**
 * @returns {boolean} True if a database file already exists
 */
module.exports.databaseExists = () => {
    return fs.existsSync(databasePath);
};

/**
 * Copy template as a normal database
 * TODO: Use migrations! This is going to hit us in the face at some point
 */
module.exports.createDatabase = () => {
    fs.copyFileSync(config.database.templatePath, databasePath);
};

/**
 * Delete database
 * I'm not sure why this exists
 */
module.exports.deleteDatabase = () => {
    fs.unlink(databasePath, (err) => {
        if (err) {
            Logger.log("Could not delete database", "error");
        }
    });
};

/**
 * Open sqlite database from its file
 */
module.exports.openDatabase = () => {
    database = new sqlite.Database(databasePath, sqlite.OPEN_READWRITE, (err) => {
        if (err) {
            Logger.log("Could not open database", "error");
            Logger.log(err, "err");
        }
    });
};

/** 
 * @returns {sqlite3.Database} Sqlite database
 */
module.exports.getDatabase = () => {
    return database;
};