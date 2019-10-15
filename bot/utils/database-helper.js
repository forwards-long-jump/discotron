const sqlite = require("sqlite3");
const fs = require("fs");
const config = require(__dirname + "/../config/config.json");

const Logger = require(__dirname + "/../utils/logger.js");

let database;

/**
 * @returns {boolean} True if a database file already exists
 */
module.exports.databaseExists = () => {
    return fs.existsSync(config.database.savePath);
};

/**
 * Copy template as a normal database
 * TODO: Use migrations! This is going to hit us in the face at some point
 */
module.exports.createDatabase = () => {
    fs.copyFileSync(config.database.templatePath, config.database.savePath);
};

/**
 * Delete database
 * I'm not sure why this exists
 */
module.exports.deleteDatabase = () => {
    fs.unlink(config.database.savePath, (err) => {
        if (err) {
            Logger.log("Could not delete database", "error");
        }
    });
};

/**
 * Open sqlite database from its file
 */
module.exports.openDatabase = () => {
    database = new sqlite.Database(config.database.savePath, sqlite.OPEN_READWRITE, (err) => {
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