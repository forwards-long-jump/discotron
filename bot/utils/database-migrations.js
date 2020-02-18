const fs = require("fs");
const db = require("../apis/database-crud.js");
const Logger = require("./logger.js");

/**
 * Get a full list of available migrations, ordered from oldest to newest version.
 * @returns {Array<string>} List of migrations, formatted like yyyy-mm-dd-name.js
 */
module.exports.listMigrations = () => {
    // TODO: Is this ordering reliable on all OSes and all configurations?
    return fs.readdirSync(__dirname + "/../migrations/");
};

/**
 * Gets the latest migration version.
 * @returns {string} Full name of latest migration version.
 */
module.exports.latestMigration = () => {
    const list = this.listMigrations();
    return list[list.length - 1];
};

/**
 * Gets the currently applied migration.
 * @returns {Promise<string>} Promise resolving to the current migration's full name.
 */
module.exports.current = () => {
    return db.select("_Migrations", ["value"], {
        name: "version"
    }).then(results => {
        if (results.length === 0) {
            // Table does not contain a version key-value
            return null;
        } else {
            return results[0].value;
        }
    }).catch((err) => {
        if (err.errno === 1) {
            // Assume "no such table" error (has no more specific code than that)
            // TODO: Can we rely on the error message -> filter string
            return null;
        } else {
            Logger.err(err);
        }
    });
};

/**
 * Gets the differences required to get from one version to another.
 * @param {string|null} oldVersion Full name of old version. If null, "no" version is used (index -1).
 * @param {string|null} newVersion Full name of new version. If null, latest version is used.
 * @returns {Array<Array<string>>} List of diff data, structured like [migrationName, "up"|"down"]
 */
module.exports.listDiff = (oldVersion, newVersion) => {
    if (oldVersion === undefined || newVersion === undefined) {
        throw new Error("oldVersion and newVersion may not be undefined.");
    }

    const migrations = this.listMigrations();

    // Figure out the indices
    let oldIndex;
    if (oldVersion === null) {
        oldIndex = -1;
    } else {
        oldIndex = migrations.indexOf(oldVersion);
    }

    let newIndex;
    if (newVersion === null) {
        newIndex = migrations.length - 1;
    } else {
        newIndex = migrations.indexOf(newVersion);
    }

    // What are the differences?
    if (oldIndex === newIndex) {
        return [];
    }

    if (newIndex > oldIndex) {
        // Upgrade (from oldIndex + 1 to newIndex, incrementing)
        return migrations.slice(oldIndex + 1, newIndex + 1).map(m => [m, "up"]);
    } else {
        // Downgrade (from oldIndex to newIndex + 1, decrementing)
        return migrations.slice(newIndex + 1, oldIndex + 1).reverse().map(m => [m, "down"]);
    }
};