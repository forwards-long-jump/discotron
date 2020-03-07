const fs = require("fs");
const db = require("../database/crud.js");

/**
 * Get a full list of available migrations, ordered from oldest to newest version.
 * {@link https://github.com/forwards-long-jump/discotron/wiki/Database-migrations|More info on writing migrations.}
 * @returns {Array<string>} List of migrations, formatted like yyyy-mm-dd-name.js
 */
module.exports.listMigrations = () => {
    return fs.readdirSync(__dirname + "/migrations/")
        .filter((migration) => /^\d{4}-\d{2}-\d{2}-\w+\.js$/.test(migration))
        .sort();
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
module.exports.current = async () => {
    const tableCountResult = await db.select("sqlite_master", ["count(*)"]);

    if (tableCountResult[0]["count(*)"] !== 0) {
        const migrationVersionResult = await db.select("_Migrations", ["value"], { name: "version" });

        if (migrationVersionResult.length === 0) {
            // Table does not contain a version key-value
            return null;
        } else {
            return migrationVersionResult[0].value;
        }
    } else {
        return null;
    }
};

/**
 * Gets the differences required to get from one version to another.
 * @param {string|null} oldVersion Full name of old version. If null, "no" version is used (index -1).
 * @param {string|null} newVersion Full name of new version. If null, latest version is used.
 * @returns {{names: string[], type: string}} List of diff data,
 *  or an object with an empty names list if there is no version change.
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
        if (oldIndex < 0) {
            throw new Error("oldVersion specifies an unknown version.");
        }
    }

    let newIndex;
    if (newVersion === null) {
        newIndex = migrations.length - 1;
    } else {
        newIndex = migrations.indexOf(newVersion);
        if (newIndex < 0) {
            throw new Error("newVersion specifies an unknown version.");
        }
    }

    // What are the differences?
    if (oldIndex === newIndex) {
        return { names: [], type: "" };
    }

    if (newIndex > oldIndex) {
        // Upgrade (from oldIndex + 1 to newIndex, incrementing)
        return { names: migrations.slice(oldIndex + 1, newIndex + 1), type: "up" };
    } else {
        // Downgrade (from oldIndex to newIndex + 1, decrementing)
        return { names: migrations.slice(newIndex + 1, oldIndex + 1).reverse(), type: "down" };
    }
};