const sqlite = require("sqlite3");
const migrations = require("../utils/database-migrations.js");
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
 * Open sqlite database from its file. If it does not exist, it will be created.
 */
module.exports.openDatabase = () => {
    database = new sqlite.Database(databasePath, sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE, (err) => {
        if (err) {
            Logger.log("Could not open database", "error");
            Logger.log(err, "err");
        }
    });
};

/** 
 * @returns {sqlite.Database} Sqlite database
 */
module.exports.getDatabase = () => {
    return database;
};

/**
 * Run all database migrations so that we reach the requested version.
 * @param {string|undefined} version Which version to migrate to. If undefined, the latest version is chosen.
 * @param {boolean} allowDown If true, allow downgrading database version. Otherwise (default), we throw an error.
 */
module.exports.doDatabaseMigrations = async (version = undefined, allowDown = false) => {
    if (!version) {
        version = migrations.latestMigration();
    }

    function exec(statements) {
        return new Promise((resolve, reject) => {
            module.exports.getDatabase().exec(statements, (err) => {
                if (err) {
                    Logger.log("Exec in database failed : " + statements, "err");
                    reject(err);
                }
                resolve();
            });
        });
    }

    const diffList = migrations.listDiff(await migrations.current(), version);
    for (let diff of diffList) {
        if (diff[1] === "down" && (allowDown === false || allowDown === undefined)) {
            throw new Error("May not downgrade without allowDown set to true.");
        } else {
            const statements = require(__dirname + "/../migrations/" + diff[0])[diff[1]]();
            await exec(statements);
        }
    }

    // Write the new current version to the database
    await exec(`INSERT OR REPLACE INTO _Migrations(name, value) VALUES('version', '${version}');`);
};
