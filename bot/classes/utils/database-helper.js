const sqlite = require("sqlite3");
const config = require(__dirname + "/config/config.json");
let database;

function createDatabase() {
    // TODO: Copy file
}

function deleteDatabase() {
    
}

function openDatabase() {
    // Open database
    database = new sqlite.Database(config.database.savePath, (err) => {
        if (err) {
            // TODO: Copy template if file does not exists
        } else {

        }
    });
}

module.exports.getDatabase = () => {

};
